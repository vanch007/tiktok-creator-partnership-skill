#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { analyzeCreatorFit } from './analyze_creator_fit.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(here, '../evals/fixtures/creator-fit-cases.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const failures = [];
const results = [];

function check(condition, caseId, message) {
  if (!condition) failures.push(`${caseId}: ${message}`);
}

for (const testCase of fixture.cases) {
  const output = analyzeCreatorFit({
    subject: testCase.subject,
    product: fixture.product,
    sources: testCase.sources,
  });
  const expected = testCase.expected;
  check(output.fit.classification === expected.classification, testCase.id, `classification=${output.fit.classification}, expected ${expected.classification}`);
  check(output.source_mode === expected.source_mode, testCase.id, `source_mode=${output.source_mode}, expected ${expected.source_mode}`);
  check(output.identity.status === expected.identity_status, testCase.id, `identity=${output.identity.status}, expected ${expected.identity_status}`);
  if (expected.kalodata_required !== undefined) {
    check(output.kalodata_required === expected.kalodata_required, testCase.id, 'Kalodata must remain optional');
  }
  if (expected.minimum_coverage !== undefined) {
    check(output.fit.coverage >= expected.minimum_coverage, testCase.id, `coverage=${output.fit.coverage}, expected >= ${expected.minimum_coverage}`);
  }
  for (const field of expected.missing_fields_include ?? []) {
    check(output.fit.missing_fields.includes(field), testCase.id, `missing_fields should include ${field}`);
  }
  for (const field of expected.explicit_zero_fields ?? []) {
    check(output.evidence[field]?.selected === 0, testCase.id, `${field} explicit zero was lost or changed`);
  }
  for (const field of expected.absent_fields ?? []) {
    check(!output.evidence[field], testCase.id, `${field} should remain absent/unknown`);
  }
  const conflictFields = output.fit.conflicts.map(conflict => conflict.field);
  for (const field of expected.conflict_fields_include ?? []) {
    check(conflictFields.includes(field), testCase.id, `conflicts should include ${field}`);
  }
  for (const [field, source] of Object.entries(expected.selected_source ?? {})) {
    check(output.evidence[field]?.selected_source === source, testCase.id, `${field} selected ${output.evidence[field]?.selected_source}, expected ${source}`);
  }
  for (const gate of expected.hard_gates_include ?? []) {
    check(output.fit.hard_gates.includes(gate), testCase.id, `hard_gates should include ${gate}`);
  }
  if (expected.rejected_handle) {
    check(output.identity.rejected_sources.some(source => source.handle === expected.rejected_handle), testCase.id, `rejected_sources should include ${expected.rejected_handle}`);
  }
  if (testCase.id.includes('multi-source')) {
    check(output.evidence.followers?.observations.length === 2, testCase.id, 'both follower observations must be preserved');
    check(output.evidence.followers?.selected === 516000, testCase.id, 'affiliate follower value should be selected without averaging');
    check(output.evidence.gmv?.selected?.display === 'RM124.6K', testCase.id, 'affiliate GMV should be selected without averaging');
  }
  results.push({
    id: testCase.id,
    classification: output.fit.classification,
    score: output.fit.score,
    coverage: output.fit.coverage,
    confidence: output.fit.confidence,
    source_mode: output.source_mode,
    conflicts: conflictFields,
    missing_fields: output.fit.missing_fields,
  });
}

process.stdout.write(`${JSON.stringify({ passed: failures.length === 0, cases: results, failures }, null, 2)}\n`);
if (failures.length) process.exitCode = 1;
