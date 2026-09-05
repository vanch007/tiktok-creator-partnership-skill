# TikTok Affiliate creator-fit field test — 2026-09-05

Status: **pass**  
Operator scope: **叶文奇**  
Shop: **ShenTai Shop / MY**  
Mode: read-only creator search and profile review; no invitation, message, approval, or creator-management action was sent.

## Live profiles tested

Each creator was searched by exact handle in `发现达人 → 查找达人`, then opened on the current shop's Affiliate creator detail page.

| Creator | Source mode | Fit result | Coverage | Confidence | Key evidence | Missing or constrained evidence |
|---|---|---:|---:|---|---|---|
| `@aliamuchi_` | Affiliate only | High / 80.1 | 1.00 | High | Beauty/personal care; 6,312 followers; 51.46% female; dominant 25–34; GMV `RM10K+`; 452 units; 249 videos; 48 lives; 96.62% expected post rate | Average commission and top-region values unavailable |
| `@ezahkhalid` | Affiliate only | High / 83.6 | 1.00 | High | Health + beauty/women's categories; ~180K followers; 61.77% female; dominant 25–34; GMV `RM10K+`; ~10.1K units; 470 videos; 61.74% expected post rate | Average commission and live GPM unavailable; live count is an explicit `0`, not missing |
| `@nanatjdnn` | Affiliate + Kalodata | High / 81.5 | 1.00 | Medium | Strong beauty commerce and female audience; Affiliate shows RM124.6K GMV, 6,401 units, 61.4K average video views, 6.25% engagement | Confidence reduced because source windows and several values differ; top-region values unavailable in Affiliate |

The fit labels use the 8015 test product profile in `evals/fixtures/creator-fit-cases.json`. They are an internal decision aid and do not authorize outreach or invitations.

## Mixed-source conflict test

`@nanatjdnn` exposed the intended heterogeneous-data case:

| Field | TikTok Shop Affiliate | Kalodata | Handling |
|---|---|---|---|
| Window | 2026-08-03 to 2026-09-02 | 2026-08-04 to 2026-09-02 | Preserved separately |
| Followers | ~516K | ~554K | Affiliate selected for the current Affiliate decision; both retained |
| Dominant age | 25–34 | Kalodata page summary says 18–24 | Flagged as source disagreement |
| GMV | RM124.6K | RM116K | Not averaged; both retained with source/window |
| Units | 6,401 | 5,762 | Not averaged |

## Regression coverage

`node scripts/test_creator_fit.mjs` passed 5/5 cases:

1. Affiliate-only complete profile works without Kalodata.
2. Missing values remain `unknown`, while explicit zero remains zero.
3. Affiliate and Kalodata values retain provenance and incompatible windows are not averaged.
4. A similar handle is rejected and returns `research_needed`.
5. Kalodata-only input remains supported with reduced evidence coverage.

Validation also passed:

- Node syntax checks for both scripts;
- skill-creator `quick_validate.py`;
- JSON and JSONL parsing for all modified eval files.

## Known limits

- Affiliate fields and reporting windows can change; re-observe them for live decisions.
- `RM10K+` is a lower bound, not exact GMV.
- A visible “Top 5 regions” heading without rendered values remains `unknown`.
- Source agreement does not imply identical metric definitions; the evidence card retains each definition/window rather than creating false precision.
