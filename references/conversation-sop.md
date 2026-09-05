# Conversation SOP

## State map

| State | Evidence | Goal | Next action | Stop or exit |
|---|---|---|---|---|
| `research` | handle only | find a real hook and fit | inspect recent relevant content | archive if no fit |
| `ready_outreach` | evidence card passes | permission to send details | personalized opener | refusal → DNC; silence → follow-up |
| `interested` | explicit interest; a link request alone is not acceptance | prepare a verifiable platform offer | verify exact handle/shop/product/commission/sample, then create Target Collaboration if authorized | offer mismatch or no authority → hold/escalate |
| `terms` | asks fee, commission, sample, or scope | select offer structure | relevant branch | no authority → escalate |
| `target_invite_sent` | Target Collaboration invite ID or platform confirmation exists | creator accepts the invite and applies for the sample | send the exact Creator Center path and one completion request | wrong handle/shop/product → pause and correct |
| `invite_accepted` | platform shows accepted | creator submits free-sample application | point to the sample-application action in TikTok | do not collect size/address in chat |
| `sample_requested` | sample request ID is visible | approve the request and queue fulfillment | verify variant, stock, eligibility, and approval authority | missing variant/stock/authority → escalate |
| `sample_approved` | platform approval exists | hand off to warehouse | notify warehouse and record queue/order ID | do not claim shipped yet |
| `warehouse_queued` | warehouse handoff evidence exists | dispatch through platform fulfillment | wait for tracking | warehouse issue → resolve internally |
| `shipped` | tracking exists | successful delivery | tracking update | logistics issue → resolve |
| `delivered` | platform or creator confirms | resolve experience or production friction | check fit + offer choices | bad fit → no forced endorsement |
| `producing` | brief aligned | publish as agreed | value-adding support | one reasonable reschedule |
| `published` | post/LIVE ID | verify link, disclosure, and facts | thank and record data | correct only objective issues |
| `ads_candidate` | content quality/performance passes | separate authorization | defined rights request | refusal does not harm organic deal |
| `validated` | measured performance | repeat, upgrade, or pause | share verified result | no value → review/pause |
| `do_not_contact` | stop/block/refusal | stop | suppress future outreach | creator must reopen |

## First-message ingredients

Treat this as a content checklist, not a script. Keep the message in one compact chat bubble and vary the wording from the creator's actual language and content:

```text
[Preferred name], I'm [real sender] from [brand].
I watched [specific content], especially [specific observation].
We're looking for a creator to show [use case] for [product], with [one approved primary value exchange].
Want me to send the TikTok Shop product card here?
```

Do not copy this wording across creators. Remove any sentence that still works after changing only the name. Do not ask for address, phone, size, color, rate, schedule, and ad code in the opener.

## Reply branches

### Asks for link but has not accepted

Send one product card, then keep the brief to:

1. one natural content angle;
2. the approved sample/commission/fee condition;
3. video or LIVE with creator-led execution.

Ask whether they want the brand to send a Target Collaboration invite. Do not ask for content format, size, address, or schedule yet. Do not repeat the brand introduction or the full first-contact pitch.

### Explicit interest: platform invitation first

For SHENTAI Malaysia and any project using platform-managed samples:

1. verify the exact creator handle, TikTok Shop, product, country, commission, active sample availability, and invitation scope;
2. create the Target Collaboration invite only when the user authorized that external action;
3. verify the invite was sent and capture its ID or platform confirmation;
4. tell the creator to open Creator Center, accept the invitation, and complete the free-sample application there;
5. let the creator choose the available variant and enter fulfillment details in TikTok—never ask them to send size, color, phone, or address in WhatsApp;
6. after the sample request appears, verify stock/eligibility and approve only with authority;
7. notify the warehouse after approval, then wait for tracking before marking `shipped`.

If the invite has not been sent, do not tell the creator that it has. If the user has not authorized the invite, return `target_invite_pending_authorization` as the next action and keep the operational message pending.

### Free-sample question

State whether it is free, refundable, or paid; state only the current country/platform obligations. Allow honest negative feedback. When the creator is interested, use the Target Collaboration invitation and TikTok sample application. Do not collect fulfillment details in chat.

### Paid-only or rate card

Normalize the card internally across net fee, deliverable, video/LIVE, yellow cart, posting window, revisions, raw files, organic repost, paid-media authorization, duration, territory, exclusivity, tax, cancellation, and payment milestone. Ask only for the first missing item that changes the decision; never paste the entire checklist into chat. Do not approve or reject before the material scope is clear.

### Price is high

Offer two real choices only if authorized: a smaller one-content pilot, or sample plus higher target commission with a verified upgrade milestone. Do not shame the creator or compare them with cheaper creators.

### Budget question

Answer with any approved range first. If no range is approved, say the amount is still under review. Then ask for the single missing scope item that most affects price; do not turn the reply into a questionnaire.

### Requests payment or sends bank details

Pause. Complete written scope and internal approval first. Do not repeat or expose sensitive account data. Escalate payment handling.

### Asks where to find the collaboration

State that the Target Collaboration will be sent from the named TikTok Shop to the exact handle and can be verified in Creator Center/Collab invites. Tell them not to act if shop or product details differ.

### Asks where to send size or address

Tell them to select the available size/variant and enter delivery details inside the TikTok free-sample application. Do not ask them to paste personal data into chat. If TikTok does not expose the required field, set `platform_fulfillment_blocked` and escalate to a human operator.

### Auto-reply, emoji, read receipt, or ambiguous yes

Do not count as qualified interest. For ambiguity, ask one concrete confirmation such as whether to send the product card now.

### Any direct creator question

Answer the question in the first sentence. Add one reason or condition only when it changes the answer, then ask one next-step question. Do not restart the sales pitch.

### Refusal or stop

If the creator explicitly opts out or says stop, send nothing else: set `message=null`, `do_not_contact=true`, suppress all channels, and stop. If they decline only this product without opting out of all contact, one brief acknowledgement may be used.

## Follow-up default

There is no proven global optimum. Beta default for unanswered cold outreach:

- Follow-up 1 after 2–3 working days: add one new useful fact, hook, or approved condition.
- Follow-up 2 around day 7: close the loop and offer a no-pressure pause.
- Then archive to a 30–90 day observation pool; do not auto-contact.

Platform or country limits override this default. Never use all messages allowed by a platform merely because they are allowed.

## Event-triggered delivery messages

- `target_invite_sent`: name the shop/product and ask the creator to accept the invite and complete the free-sample application in TikTok.
- `invite_accepted`: point to the remaining sample-application action; do not ask for size or address in chat.
- `sample_requested`: acknowledge only if useful; review stock, eligibility, and approval authority before promising fulfillment.
- `sample_approved`: notify the warehouse, record the queue/order ID, and tell the creator the request is being processed; do not call it shipped.
- `warehouse_queued`: wait for tracking; give no invented dispatch time.
- `shipped`: send tracking and arrival range; do not demand a date immediately.
- `delivered`: ask if product, size, and condition are suitable; offer two safe formats.
- `producing`: provide one optional hook or factual resource, not a mandatory script.
- `deadline_near`: ask whether they can deliver or need one reschedule; identify friction.
- `published`: thank, verify cart/link, disclosure, and factual accuracy.
- `milestone`: share a verified metric and a clear next-tier offer.

## CRM update minimum

Always propose updates for:

```text
current_state, last_inbound_intent, creator_interest_evidence, next_best_action, next_action_date,
country_shop, language_observed, permission_status, do_not_contact,
offer_tier, target_invite_id, target_invite_sent_at, invite_status,
sample_request_id, sample_status, sample_approved_at,
warehouse_notified_at, warehouse_order_id, content_due_at,
post_or_live_id, disclosure_checked, authorization_mode,
experiment_id, message_version, operator, outcome_reason
```

Do not count automated replies as valid interest. When TikTok manages the sample flow, do not collect shipping, phone, size, or color data in chat at any state.
