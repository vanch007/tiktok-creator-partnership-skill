# Offers, rights, and briefs

## Offer tiers

| Tier | Evidence | Default exchange |
|---|---|---|
| Explore | fit exists, no brand history | sample + open commission |
| Target | strong category/content/fulfillment signal | sample + higher target commission |
| Hybrid | verified performance or paid-only | approved flat fee + commission |
| Strategic | repeated measured value | multi-content package, tiered incentive, separately priced ad rights |

Follower count alone cannot select the tier.

## Target Collaboration and sample operations

An interested creator should move through TikTok's platform flow before production planning:

1. verify the exact creator handle, shop, product, country, commission, invitation scope, and active sample availability;
2. send a Target Collaboration invite only with explicit user authority;
3. record the invitation ID/status before telling the creator it was sent;
4. have the creator accept the invitation and apply for the free sample in Creator Center;
5. keep variant selection and delivery details inside TikTok;
6. approve the sample only after stock, eligibility, and approval authority pass;
7. notify the warehouse after approval and mark `shipped` only when tracking exists.

Do not use WhatsApp to collect size or address for this flow. Do not treat creator interest as invite acceptance, invite acceptance as sample application, sample approval as warehouse handoff, or warehouse handoff as shipment.

## Fee decision

Use:

```text
expected incremental contribution = expected orders ×
  (net price - COGS - fulfillment - platform fees - commission - refund loss)
  - flat fee - sample cost - planned ad spend
```

If material inputs are unknown or the base case is negative, mark `approval_required`. Content reuse value may be considered only with an explicit valuation basis.

## Normalize a rate card

Capture:

- net fee and tax;
- number and type of videos/LIVE sessions;
- yellow cart/link and posting window;
- revision count and objective approval criteria;
- raw files and organic repost rights;
- Spark Ads, Shop Ads, GMV Max, or whitelisting mode;
- post/product/account scope, territory, duration, editing, revocation;
- category exclusivity and exact period;
- music/license responsibility;
- cancellation, refund, and payment milestones;
- reporting window.

Do not compare prices until scopes are normalized.

## Creative-control brief

Use four sections:

### Must say

Only verified product/SKU, current price or promotion, approved claims, disclosure, and correct product link.

### May say

Optional hooks, demonstrations, FAQs, size information, and source assets.

### Creator decides

Narrative, wording, pacing, camera language, and audience-native presentation.

### Must not say

Unverified sales or performance, medical/body claims, guaranteed income, guaranteed virality, undisclosed sponsorship, or prohibited sensitive content.

## Ads authorization is separate

Never treat sample delivery, commission, content publication, or a generic promise to “boost” as paid-media authorization.

For any authorization, specify:

```yaml
authorization_mode: single_video_code|affiliate_mass|spark_ads|shop_ads|gmv_max
post_ids:
product_ids:
ad_account:
territory:
start_date:
end_date:
editing_allowed:
fee_or_ads_commission:
revocation_process:
ownership_transfer: false
```

Creator ownership remains separate from limited platform permissions. Perpetual, global, off-platform, editing, or exclusivity rights always require human review and explicit compensation.
