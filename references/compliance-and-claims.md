# Compliance and claims

This is operational risk guidance, not legal advice. Country rules and platform features are time-sensitive; verify current official sources and UI.

## Channel consent

- Prefer TikTok's Target Collaboration and Creator IM for cold outreach.
- For WhatsApp, require both the phone number and explicit permission to receive messages from the named business on WhatsApp.
- Record consent source, timestamp, scope, message category, and withdrawal.
- Stop immediately on block, opt-out, refusal, or deletion request.

## Personal data minimization

Prefer TikTok's platform-managed sample application for fulfillment. When that route is available, do not request or accept shipping name, phone, address, size, or color in WhatsApp, Creator IM, or another chat; direct the creator to select the variant and enter delivery details inside TikTok. Do not copy platform-managed fulfillment data into free-text CRM notes.

If the platform cannot collect a required variant or fulfillment field, set `platform_fulfillment_blocked` and escalate. A missing platform field is not permission to switch to manual chat collection. Any exceptional manual route requires separate business authorization, explicit creator consent, a defined retention purpose, and collection of only the minimum data needed.

Do not request ID, full bank data, family information, or unrelated personal details in chat.

## Claim ledger

Every outgoing numeric or performance claim should have:

```yaml
claim_id:
claim_text:
evidence_source:
country_scope:
approved_by:
valid_from:
valid_until:
status: approved|pending|expired|rejected
```

Omit `pending`, `expired`, and `rejected` claims. This includes sales volume, price, discounts, commission, stock, ad budget, fabric tests, antibacterial, shaping, posture, and health effects.

## Disclosure

Require TikTok's commercial-content disclosure for paid, commission, sample, gift, discount, or other incentivized content. Apply any clearer local label and place disclosure where viewers can notice it. Do not rely on vague wording such as “collab” when the local regulator requires an explicit ad label.

## Underwear and sensitive content

Default allowed concepts, subject to current local policy:

- flat lay and packaging;
- fabric, seams, stretch, waistband, care, and size guide;
- mannequin or permitted product display;
- silhouette or outfit comparison while normally clothed;
- voice-over, FAQ, comfort diary, or no-face review.

Default prohibited or escalated concepts:

- person shown only in underwear/lingerie where prohibited;
- intimate body-part close-ups, dressing/undressing, or sexual suggestion;
- body shaming, fear, or promises to change anatomy permanently;
- medical, antibacterial, posture, fertility, or health claims without evidence and approval;
- minors or uncertain age in sensitive-category content.

Allow the creator to say the product did not fit or was not comfortable. Never require a false positive experience.

## Country legal flags

- Malaysia: direct-marketing objection rights; WhatsApp opt-in; content and claims must be accurate.
- Indonesia: document a lawful processing basis; recorded consent when consent is used.
- Thailand: direct-marketing objection right; English PDPA translation may be unofficial, so detailed interpretation is `pending legal review`.
- Vietnam: marketing use of personal data may require consent and specified processing details.
- Philippines: public data remains protected; legitimate-interest reliance needs applicability and balancing assessment.
- Singapore: WhatsApp may fall within DNC analysis; do not assume an individual creator number qualifies for B2B exemption.
- UK/US: apply local direct-marketing and material-connection disclosure rules.

When uncertain, use the stricter consent and disclosure baseline, label `legal_review_required`, and avoid claiming compliance certainty.
