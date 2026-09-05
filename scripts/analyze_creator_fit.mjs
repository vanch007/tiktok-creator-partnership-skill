#!/usr/bin/env node

import fs from 'node:fs';
import process from 'node:process';

const SOURCE_PRIORITY = {
  tiktok_affiliate_detail: 40,
  tiktok_affiliate_search: 30,
  kalodata: 20,
  manual_observation: 10,
};

const FIELD_TOLERANCE = {
  followers: 0.12,
  female_share: 0.08,
  gmv: 0.20,
  units: 0.20,
  avg_video_views: 0.20,
  video_engagement: 0.20,
};

const TEMPORAL_FIELDS = new Set([
  'followers',
  'female_share',
  'age_shares',
  'dominant_age',
  'gmv',
  'units',
  'gpm',
  'average_order_value',
  'avg_video_views',
  'video_views_total',
  'video_engagement',
  'video_count',
  'video_gpm',
  'live_count',
  'avg_live_views',
  'live_engagement',
  'live_gpm',
  'expected_post_rate',
  'average_commission_rate',
  'product_count',
  'brand_collaborations',
  'sales_channels',
  'category_gmv_shares',
]);

const MISSING_MARKERS = new Set(['', '--', '-', 'n/a', 'na', 'null', 'undefined', 'unknown']);

function canonicalHandle(value) {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim().replace(/^@+/, '').toLowerCase();
  return normalized || null;
}

function isMissing(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return MISSING_MARKERS.has(value.trim().toLowerCase());
  return false;
}

function getPath(object, path) {
  return path.split('.').reduce((value, key) => (value && typeof value === 'object' ? value[key] : undefined), object);
}

function firstValue(object, paths) {
  for (const path of paths) {
    const value = getPath(object, path);
    if (!isMissing(value)) return value;
  }
  return null;
}

function parseScaledNumber(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (isMissing(raw)) return null;
  const text = String(raw).trim().replace(/[\s,，]/g, '');
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  let multiplier = 1;
  if (/亿/.test(text)) multiplier = 100_000_000;
  else if (/万/.test(text)) multiplier = 10_000;
  else if (/千/.test(text)) multiplier = 1_000;
  else if (/\d(?:\.\d+)?[jJ](?:\b|$)/.test(text)) multiplier = 1_000_000;
  else if (/\d(?:\.\d+)?[mM](?:\b|$)/.test(text)) multiplier = 1_000_000;
  else if (/\d(?:\.\d+)?[kK](?:\+|\b|$)/.test(text)) multiplier = 1_000;
  return Number(match[0]) * multiplier;
}

function parsePercent(raw) {
  if (isMissing(raw)) return null;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return null;
    return raw > 1 ? raw / 100 : raw;
  }
  const value = parseScaledNumber(raw);
  if (value === null) return null;
  return String(raw).includes('%') || value > 1 ? value / 100 : value;
}

function currencyOf(text) {
  const value = String(text ?? '').trim();
  if (/RM/i.test(value)) return 'MYR';
  if (/¥|CNY|RMB/i.test(value)) return 'CNY';
  if (/\$|USD/i.test(value)) return 'USD';
  return null;
}

function parseMoney(raw) {
  if (isMissing(raw)) return null;
  if (typeof raw === 'object' && raw.value !== undefined) return raw;
  const display = String(raw).trim();
  const currency = currencyOf(display);
  const cleaned = display.replace(/RM|MYR|CNY|RMB|USD|¥|\$/gi, '').trim();
  const range = cleaned.match(/([^\-]+)-([^\-]+)/);
  if (range) {
    const min = parseScaledNumber(range[1]);
    const max = parseScaledNumber(range[2]);
    if (min !== null && max !== null) return { display, currency, kind: 'range', min, max };
  }
  const value = parseScaledNumber(cleaned);
  if (value === null) return { display, currency, kind: 'unparsed' };
  return { display, currency, kind: cleaned.includes('+') ? 'lower_bound' : 'exact', value };
}

function moneyComparableValue(value) {
  if (!value || typeof value !== 'object') return null;
  if (value.kind === 'range') return (value.min + value.max) / 2;
  return value.value ?? null;
}

function normalizeMarket(raw) {
  if (isMissing(raw)) return null;
  const text = String(raw).trim().toUpperCase();
  if (['MY', 'MALAYSIA', '马来西亚'].includes(text)) return 'MY';
  if (['TH', 'THAILAND', '泰国'].includes(text)) return 'TH';
  if (['PH', 'PHILIPPINES', '菲律宾'].includes(text)) return 'PH';
  return text;
}

function normalizeCategories(raw) {
  if (isMissing(raw)) return null;
  const values = Array.isArray(raw) ? raw : String(raw).split(/[,;；|]/);
  const clean = values.map(value => String(value).replace(/\+\d+$/, '').trim()).filter(Boolean);
  return clean.length ? [...new Set(clean)] : null;
}

function normalizeAges(raw) {
  if (isMissing(raw)) return null;
  const entries = Array.isArray(raw) ? raw.map(item => [item.name ?? item.label, item.value ?? item.share]) : Object.entries(raw);
  const result = {};
  for (const [name, value] of entries) {
    const share = parsePercent(value);
    if (!isMissing(name) && share !== null) result[String(name).replace(/\s+/g, '')] = share;
  }
  return Object.keys(result).length ? result : null;
}

function dominantAge(ageShares, explicit) {
  if (!isMissing(explicit)) return String(explicit).replace(/\s+/g, '');
  if (!ageShares) return null;
  return Object.entries(ageShares).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

function inferFemaleShare(data) {
  const direct = firstValue(data, [
    'female',
    'femaleShare',
    'followerGenderFemale',
    'followers.followerGenderFemale',
    'audience.femaleShare',
  ]);
  if (!isMissing(direct)) return parsePercent(direct);
  const dominantGender = firstValue(data, ['dominantGender', 'audience.dominantGender', 'profile.followerSex']);
  const share = parsePercent(firstValue(data, ['dominantGenderShare', 'audience.dominantGenderShare']));
  if (share === null || isMissing(dominantGender)) return null;
  const gender = String(dominantGender).toLowerCase();
  if (/female|women|woman|女性|女/.test(gender)) return share;
  if (/male|men|man|男性|男/.test(gender)) return 1 - share;
  return null;
}

function sourceTypeOf(source) {
  if (source.source_type) return source.source_type;
  const declared = String(source.source ?? '').toLowerCase();
  if (declared.includes('affiliate_detail')) return 'tiktok_affiliate_detail';
  if (declared.includes('affiliate')) return 'tiktok_affiliate_search';
  if (declared.includes('kalodata')) return 'kalodata';
  const data = source.data ?? source;
  if (data.profile || data.shopData || data.followersStatus) return 'kalodata';
  if (data.videoGpm !== undefined || data.expectedPostRate !== undefined || data.ages) return 'tiktok_affiliate_detail';
  if (data.dominantGender !== undefined || data.audienceRaw !== undefined) return 'tiktok_affiliate_search';
  return 'manual_observation';
}

function normalizeSource(source, fallbackObservedAt = null) {
  const sourceType = sourceTypeOf(source);
  const data = source.data ?? source;
  const profile = data.profile ?? {};
  const metrics = data.metrics ?? data.coreMetrics ?? data.commerce ?? {};
  const followerBlock = data.followers ?? data.audience ?? {};
  const handle = canonicalHandle(firstValue(data, ['handle', 'searchHandle', 'profile.handle', 'creator.handle']));
  const ageShares = normalizeAges(firstValue(data, ['ages', 'followers.ages', 'audience.ages']));
  const fields = {
    market: normalizeMarket(firstValue(data, ['market', 'region', 'profile.region'])),
    category: normalizeCategories(firstValue(data, ['category', 'categories', 'profile.category', 'profile.mainCategory', 'profile.main_category_names'])),
    followers: parseScaledNumber(firstValue(data, ['followersCount', 'follower_count', 'profile.fans', 'profile.follower_count']))
      ?? (typeof data.followers === 'object' ? null : parseScaledNumber(data.followers)),
    female_share: inferFemaleShare(data),
    age_shares: ageShares,
    dominant_age: dominantAge(ageShares, firstValue(data, ['dominantAge', 'followerAgeMax', 'profile.followerAgeMax'])),
    gmv: parseMoney(firstValue(data, ['gmv', 'totalRevenue', 'revenue', 'rev', 'metrics.gmv', 'metrics.totalRevenue', 'shopData.totalRevenue', 'profile.rev'])),
    units: parseScaledNumber(firstValue(data, ['units', 'sales', 'totalSale', 'metrics.units', 'metrics.sales', 'shopData.totalSale', 'profile.sales'])),
    gpm: parseMoney(firstValue(data, ['gpm', 'metrics.gpm'])),
    average_order_value: parseMoney(firstValue(data, ['averageOrderValue', 'avgPrice', 'unitPrice', 'metrics.averageOrderValue', 'metrics.avgPrice'])),
    avg_video_views: parseScaledNumber(firstValue(data, ['avgVideoViews', 'averageVideoViews', 'metrics.avgVideoViews'])),
    video_views_total: parseScaledNumber(firstValue(data, ['videoViews', 'totalVideoViews', 'metrics.videoViews', 'metrics.totalVideoViews'])),
    video_engagement: parsePercent(firstValue(data, ['videoEngagement', 'engagement', 'engagementRate', 'followers.engagementRate', 'metrics.videoEngagement'])),
    video_count: parseScaledNumber(firstValue(data, ['videoCount', 'videos', 'metrics.videoCount'])),
    video_gpm: parseMoney(firstValue(data, ['videoGpm', 'metrics.videoGpm'])),
    live_count: parseScaledNumber(firstValue(data, ['liveCount', 'lives', 'metrics.liveCount'])),
    avg_live_views: parseScaledNumber(firstValue(data, ['avgLiveViews', 'averageLiveViews', 'metrics.avgLiveViews'])),
    live_engagement: parsePercent(firstValue(data, ['liveEngagement', 'metrics.liveEngagement'])),
    live_gpm: parseMoney(firstValue(data, ['liveGpm', 'metrics.liveGpm'])),
    expected_post_rate: parsePercent(firstValue(data, ['expectedPostRate', 'metrics.expectedPostRate'])),
    average_commission_rate: parsePercent(firstValue(data, ['averageCommissionRate', 'metrics.averageCommissionRate'])),
    product_count: parseScaledNumber(firstValue(data, ['productCount', 'profile.product_count', 'metrics.productCount'])),
    brand_collaborations: parseScaledNumber(firstValue(data, ['brandCollaborations', 'metrics.brandCollaborations'])),
    rating: parseScaledNumber(firstValue(data, ['rating', 'profile.rating'])),
    top_regions: firstValue(data, ['topRegions', 'followers.topLocations', 'audience.topRegions']),
    sales_channels: firstValue(data, ['salesChannels', 'metrics.salesChannels']),
    category_gmv_shares: firstValue(data, ['categoryGmvShares', 'metrics.categoryGmvShares']),
    bio: firstValue(data, ['bio', 'signature', 'profile.signature']),
  };
  for (const [field, value] of Object.entries(fields)) {
    if (isMissing(value) || (Array.isArray(value) && value.length === 0)) delete fields[field];
  }
  return {
    source_type: sourceType,
    source_label: source.source_label ?? source.source ?? sourceType,
    observed_at: source.observed_at ?? source.collectedAt ?? fallbackObservedAt,
    window: source.window ?? (source.dateRange ? { label: source.dateRange } : null),
    handle,
    cid: firstValue(data, ['cid', 'creator.cid']),
    fields,
  };
}

function comparablePrimitive(value) {
  if (value && typeof value === 'object' && value.kind) return moneyComparableValue(value);
  if (Array.isArray(value)) return JSON.stringify([...value].map(String).sort());
  if (value && typeof value === 'object') return JSON.stringify(value);
  return value;
}

function windowsEqual(a, b) {
  if (!a && !b) return true;
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function valuesConflict(field, first, second) {
  const a = comparablePrimitive(first);
  const b = comparablePrimitive(second);
  if (a === null || b === null || a === undefined || b === undefined) return false;
  if (typeof a === 'number' && typeof b === 'number') {
    const tolerance = FIELD_TOLERANCE[field] ?? 0.05;
    const denominator = Math.max(Math.abs(a), Math.abs(b), 1e-9);
    return Math.abs(a - b) / denominator > tolerance;
  }
  return a !== b;
}

function buildEvidence(sources) {
  const fields = {};
  for (const source of sources) {
    for (const [field, value] of Object.entries(source.fields)) {
      fields[field] ??= [];
      fields[field].push({
        value,
        source_type: source.source_type,
        source_label: source.source_label,
        observed_at: source.observed_at,
        window: source.window,
      });
    }
  }
  const resolved = {};
  const conflicts = [];
  for (const [field, observations] of Object.entries(fields)) {
    observations.sort((a, b) => (SOURCE_PRIORITY[b.source_type] ?? 0) - (SOURCE_PRIORITY[a.source_type] ?? 0));
    const selected = observations[0];
    const disagreements = observations.slice(1).filter(item => valuesConflict(field, selected.value, item.value));
    const windowMismatch = TEMPORAL_FIELDS.has(field) && observations.some(item => !windowsEqual(selected.window, item.window));
    resolved[field] = {
      selected: selected.value,
      selected_source: selected.source_type,
      selection_basis: 'source_priority; values were not averaged',
      observations,
    };
    if (disagreements.length || (windowMismatch && observations.length > 1)) {
      conflicts.push({
        field,
        type: disagreements.length ? 'source_disagreement' : 'window_mismatch',
        window_mismatch: windowMismatch,
        observations,
        handling: 'preserved separately; not averaged',
      });
    }
  }
  return { resolved, conflicts };
}

function selected(evidence, field) {
  return evidence.resolved[field]?.selected ?? null;
}

function scoreThreshold(value, thresholds) {
  if (value === null || value === undefined) return null;
  const high = thresholds?.high ?? null;
  const medium = thresholds?.medium ?? null;
  if (high !== null && value >= high) return 95;
  if (medium !== null && value >= medium) return 72;
  return 38;
}

function categoryScore(evidence, product) {
  const categories = selected(evidence, 'category');
  const targets = product.target_categories ?? [];
  const adjacent = product.adjacent_categories ?? [];
  if (!categories?.length || !targets.length) return null;
  const normalized = categories.map(value => String(value).toLowerCase());
  if (targets.some(target => normalized.some(value => value.includes(String(target).toLowerCase()) || String(target).toLowerCase().includes(value)))) return 95;
  if (adjacent.some(target => normalized.some(value => value.includes(String(target).toLowerCase()) || String(target).toLowerCase().includes(value)))) return 72;
  return 25;
}

function audienceScore(evidence, product) {
  const scores = [];
  const target = product.target_audience ?? {};
  const female = selected(evidence, 'female_share');
  if (target.gender === 'female' && female !== null) {
    scores.push(female >= 0.60 ? 95 : female >= 0.45 ? 78 : female >= 0.35 ? 60 : 30);
  }
  const age = selected(evidence, 'dominant_age');
  if (target.ages?.length && age) scores.push(target.ages.map(value => String(value).replace(/\s+/g, '')).includes(String(age).replace(/\s+/g, '')) ? 90 : 45);
  const market = selected(evidence, 'market');
  if (product.target_market && market) scores.push(normalizeMarket(product.target_market) === market ? 100 : 0);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

function commerceScore(evidence, product) {
  const scores = [];
  const thresholds = product.thresholds ?? {};
  const gmvValue = moneyComparableValue(selected(evidence, 'gmv'));
  const gmvScore = scoreThreshold(gmvValue, thresholds.gmv ?? { high: 100_000, medium: 10_000 });
  if (gmvScore !== null) scores.push(gmvScore);
  const unitsScore = scoreThreshold(selected(evidence, 'units'), thresholds.units ?? { high: 3_000, medium: 300 });
  if (unitsScore !== null) scores.push(unitsScore);
  const gpmValue = moneyComparableValue(selected(evidence, 'gpm')) ?? moneyComparableValue(selected(evidence, 'video_gpm'));
  const gpmScore = scoreThreshold(gpmValue, thresholds.gpm ?? { high: 100, medium: 25 });
  if (gpmScore !== null) scores.push(gpmScore);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

function contentScore(evidence, product) {
  const scores = [];
  const thresholds = product.thresholds ?? {};
  const viewsScore = scoreThreshold(selected(evidence, 'avg_video_views'), thresholds.avg_video_views ?? { high: 10_000, medium: 1_000 });
  if (viewsScore !== null) scores.push(viewsScore);
  const engagement = selected(evidence, 'video_engagement');
  if (engagement !== null) scores.push(engagement >= 0.05 ? 95 : engagement >= 0.02 ? 72 : 38);
  const videoCount = selected(evidence, 'video_count');
  if (videoCount !== null) scores.push(videoCount >= 20 ? 90 : videoCount >= 5 ? 65 : 30);
  if ((product.preferred_content_modes ?? []).includes('live')) {
    const liveCount = selected(evidence, 'live_count');
    if (liveCount !== null) scores.push(liveCount >= 5 ? 90 : liveCount > 0 ? 65 : 25);
  }
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

function reliabilityScore(evidence) {
  const scores = [];
  const postRate = selected(evidence, 'expected_post_rate');
  if (postRate !== null) scores.push(postRate >= 0.80 ? 95 : postRate >= 0.60 ? 75 : postRate >= 0.40 ? 55 : 30);
  const rating = selected(evidence, 'rating');
  if (rating !== null) scores.push(rating >= 4.8 ? 95 : rating >= 4.0 ? 75 : 45);
  const brands = selected(evidence, 'brand_collaborations');
  if (brands !== null) scores.push(brands >= 20 ? 90 : brands >= 5 ? 70 : brands > 0 ? 55 : 25);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
}

function dimensionEvidence(evidence, fields) {
  return fields.filter(field => evidence.resolved[field]).map(field => ({ field, selected: evidence.resolved[field].selected, source: evidence.resolved[field].selected_source }));
}

export function analyzeCreatorFit(input) {
  const subjectHandle = canonicalHandle(input.subject?.handle ?? input.handle);
  const rawSources = Array.isArray(input.sources) ? input.sources : [];
  const normalizedSources = rawSources.map(source => normalizeSource(source, input.observed_at ?? null));
  const exactSources = subjectHandle ? normalizedSources.filter(source => source.handle === subjectHandle) : normalizedSources.filter(source => source.handle);
  const rejectedSources = normalizedSources.filter(source => !exactSources.includes(source)).map(source => ({ source_type: source.source_type, handle: source.handle, reason: 'handle_mismatch' }));
  const evidence = buildEvidence(exactSources);
  const product = input.product ?? {};
  const targetMarket = normalizeMarket(product.target_market);
  const observedMarket = selected(evidence, 'market');
  const hardGates = [];
  if (!subjectHandle) hardGates.push('subject_handle_missing');
  if (!exactSources.length) hardGates.push('exact_handle_not_found');
  if (targetMarket && observedMarket && targetMarket !== observedMarket) hardGates.push('market_mismatch');

  const dimensions = [
    { id: 'product_category_fit', weight: 0.30, score: categoryScore(evidence, product), fields: ['category'] },
    { id: 'audience_fit', weight: 0.25, score: audienceScore(evidence, product), fields: ['market', 'female_share', 'dominant_age', 'age_shares'] },
    { id: 'commerce_strength', weight: 0.20, score: commerceScore(evidence, product), fields: ['gmv', 'units', 'gpm', 'video_gpm'] },
    { id: 'content_strength', weight: 0.15, score: contentScore(evidence, product), fields: ['avg_video_views', 'video_views_total', 'video_engagement', 'video_count', 'live_count', 'avg_live_views', 'live_engagement'] },
    { id: 'collaboration_reliability', weight: 0.10, score: reliabilityScore(evidence), fields: ['expected_post_rate', 'rating', 'brand_collaborations'] },
  ].map(dimension => ({
    ...dimension,
    status: dimension.score === null ? 'unknown' : 'observed',
    score: dimension.score === null ? null : Math.round(dimension.score * 10) / 10,
    evidence: dimensionEvidence(evidence, dimension.fields),
  }));

  const observedDimensions = dimensions.filter(dimension => dimension.score !== null);
  const observedWeight = observedDimensions.reduce((sum, dimension) => sum + dimension.weight, 0);
  const score = observedWeight ? observedDimensions.reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0) / observedWeight : null;
  const coverage = observedWeight;
  const minCoverage = input.policy?.minimum_coverage ?? 0.55;
  let confidence = coverage >= 0.80 ? 'high' : coverage >= minCoverage ? 'medium' : 'low';
  if (evidence.conflicts.length && confidence === 'high') confidence = 'medium';
  let classification = 'research_needed';
  if (hardGates.includes('market_mismatch')) classification = 'low';
  else if (!hardGates.length && coverage >= minCoverage && score !== null) classification = score >= 78 ? 'high' : score >= 55 ? 'medium' : 'low';

  const sourceTypes = [...new Set(exactSources.map(source => source.source_type))];
  const sourceMode = !sourceTypes.length
    ? 'no_exact_source'
    : sourceTypes.every(type => type.startsWith('tiktok_affiliate'))
      ? 'affiliate_only'
      : sourceTypes.length === 1 && sourceTypes[0] === 'kalodata'
        ? 'kalodata_only'
        : 'multi_source';
  const missingDimensions = dimensions.filter(dimension => dimension.status === 'unknown').map(dimension => dimension.id);
  const missingFields = ['market', 'category', 'followers', 'female_share', 'dominant_age', 'gmv', 'units', 'avg_video_views', 'video_engagement', 'expected_post_rate']
    .filter(field => !evidence.resolved[field]);
  const nextAction = classification === 'high'
    ? 'proceed_to_creator_specific_review_and_one_to_one_outreach_gate'
    : classification === 'medium'
      ? 'manual_review_of_fit_risks_before_outreach'
      : classification === 'low'
        ? 'do_not_outreach_without_override_or_new_evidence'
        : 'research_missing_dimensions_or_verify_exact_handle';

  return {
    schema_version: '1.0',
    subject: { handle: subjectHandle ? `@${subjectHandle}` : null },
    identity: {
      status: exactSources.length ? 'exact_match' : 'not_verified',
      accepted_sources: exactSources.map(source => ({ source_type: source.source_type, handle: `@${source.handle}`, cid: source.cid ?? null, observed_at: source.observed_at, window: source.window })),
      rejected_sources: rejectedSources,
    },
    source_mode: sourceMode,
    kalodata_required: false,
    fit: {
      classification,
      score: score === null ? null : Math.round(score * 10) / 10,
      coverage: Math.round(coverage * 100) / 100,
      confidence,
      hard_gates: hardGates,
      dimensions,
      missing_dimensions: missingDimensions,
      missing_fields: missingFields,
      conflicts: evidence.conflicts,
      next_action: nextAction,
    },
    evidence: evidence.resolved,
    rules_applied: [
      'exact handle match required',
      'missing values remain unknown and are not converted to zero',
      'source values are preserved with provenance and are never averaged across incompatible windows',
      'fit score is normalized only across observed dimensions and always reports coverage',
      'first-party affiliate evidence can stand alone; Kalodata is optional enrichment',
    ],
  };
}

function readCliInput(argv) {
  const inputIndex = argv.indexOf('--input');
  if (inputIndex >= 0 && argv[inputIndex + 1]) return JSON.parse(fs.readFileSync(argv[inputIndex + 1], 'utf8'));
  const stdin = fs.readFileSync(0, 'utf8').trim();
  if (!stdin) throw new Error('Provide JSON with --input <file> or stdin.');
  return JSON.parse(stdin);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const input = readCliInput(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(analyzeCreatorFit(input), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`creator-fit error: ${error.message}\n`);
    process.exitCode = 1;
  }
}
