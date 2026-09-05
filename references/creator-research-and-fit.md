# Creator research and fit

Use this reference whenever the task asks whether a creator fits a product, asks for creator-specific outreach based on profile evidence, or supplies analytics from TikTok Shop Affiliate, Kalodata, or both.

## Source selection

Kalodata is optional enrichment, never a prerequisite.

1. Prefer the current shop's TikTok Shop Affiliate creator page for platform identity, current eligibility or invitation state, and the metrics shown for the active platform window.
2. Use the public TikTok profile for current content examples, language, tone, and identity corroboration.
3. Use Kalodata when its shop, product, ad, trend, or historical detail materially improves the decision.
4. Use chat statements only as self-reported partnership evidence, not as a replacement for observed analytics.

Do not browse every source by default. Stop when the current evidence coverage is enough for the requested decision. If Affiliate data alone covers the necessary dimensions, return `source_mode=affiliate_only` and proceed without Kalodata.

## Affiliate creator-page workflow

In the current shop's Affiliate Center:

1. open `发现达人 / Find creators` and `查找达人 / Search creators`;
2. search the exact TikTok handle, preserving dots, underscores, and digits;
3. accept only the exact normalized handle; a similar result is not the creator;
4. open the creator detail page and capture the CID plus the visible metric window;
5. read only the fields that support the decision;
6. do not click `邀请`, send a message, add the creator, or change a filter with external consequences unless that action is separately authorized.

Useful Affiliate dimensions may include:

- identity: handle, nickname, CID, market, creator level, MCN, bio;
- product fit: primary and secondary categories, example commerce videos, products or brands;
- audience: followers, female/male share, age distribution, top regions when rendered;
- commerce: GMV, units, GPM, average order value, channel shares, category shares;
- content: video/live counts, average views, engagement, video/live GPM;
- reliability: expected post rate, rating, product count, brand collaborations;
- platform state: previously invited, invitation eligibility, sample or partnership state when visible.

The list/search page is valid evidence for a fast triage. The detail page is required before high-confidence outreach when the decision depends on a metric not present in the list.

## Evidence normalization

Create one evidence card per exact creator. Every observed value retains:

```yaml
field: gmv
value: RM124.6K
source_type: tiktok_affiliate_detail
observed_at: 2026-09-05T00:27:00+08:00
window:
  start: 2026-08-03
  end: 2026-09-02
  timezone: GMT+8
definition: platform-visible GMV
confidence: observed
```

Apply these rules:

- Missing, blank, `--`, or unavailable means `unknown`; never convert it to zero.
- Explicit `0` or `RM0.00` remains a real observed zero.
- Preserve ranges and lower bounds such as `RM10K+`; do not convert them to false precision.
- Never average values across different windows, currencies, or definitions.
- When sources disagree, keep both observations and name the conflict. Prefer the current first-party Affiliate value for a current Affiliate decision, but show the alternative and the selection basis.
- Do not infer audience gender share from a label such as “majority female” unless a share is visible.
- A missing optional field does not make the whole profile invalid.

Use `scripts/analyze_creator_fit.mjs` to normalize supported Affiliate-detail, Affiliate-search, Kalodata, or mixed JSON. It is a decision aid, not authorization to contact or invite a creator:

```bash
node scripts/analyze_creator_fit.mjs --input creator-fit-input.json
```

## Coverage-aware fit

Keep hard gates outside the numerical score:

- exact handle not verified → `research_needed`;
- wrong market when market is required → `low` unless the user explicitly overrides;
- DNC, refusal, policy risk, or disallowed claim → no outreach regardless of score.

Assess five weighted dimensions only from observed evidence:

| Dimension | Default weight | Typical evidence |
|---|---:|---|
| Product/category fit | 30% | category, products, examples, use case |
| Audience fit | 25% | market, gender share, age, region |
| Commerce strength | 20% | GMV, units, GPM, order value |
| Content strength | 15% | average views, engagement, video/live activity |
| Collaboration reliability | 10% | expected post rate, rating, prior brand work |

Score only dimensions with evidence, normalize across their observed weights, and always show `coverage`. A high score with low coverage is `research_needed`, not a high-fit conclusion. Default labels are:

- `high`: score at least 78 and coverage at least 0.55;
- `medium`: score 55–77.9 and sufficient coverage;
- `low`: score below 55 or a failed market gate;
- `research_needed`: exact identity missing or coverage below the minimum.

Product-specific target categories, adjacent categories, audience, content modes, and thresholds must come from the active product brief. Do not silently reuse thresholds from another product.

## Analysis output

Return:

1. `fit` label, numerical score, evidence coverage, and confidence;
2. `source_mode`: `affiliate_only`, `kalodata_only`, `multi_source`, or `no_exact_source`;
3. one short judgment tied to the product and creator;
4. dimension scores with the evidence used;
5. missing fields and source/window conflicts;
6. one next action: research, manual review, or the normal one-to-one outreach gate;
7. one or two factual creator-specific hooks for later copy, never a generic compliment.

Do not turn an analytics score into an invitation claim. Outreach, Target Collaboration, sample approval, warehouse handoff, and messaging remain separate authorization and evidence states.
