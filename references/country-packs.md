# Country packs

## Personalization priority

Always apply:

`creator explicit reply > public business information > recent natural content language/tone > country fallback`

Do not infer religion, ethnicity, gender, age, marriage, wealth, size, or preferred title from name, appearance, clothing, or country.

## Malaysia

- Fallback language: Bahasa Malaysia or English, chosen from the creator's content.
- Address: `Hi/Hai + preferred_name`; mirror `Kak`, `Cik`, `Puan`, or `Encik` only when self-used.
- Channel: TikTok Target/IM first; WhatsApp after explicit branded opt-in.
- Tone and length: mirror the creator's observed content and reply; light code-switching only if the creator uses it.
- Operations: verify RM price, commission active period, sample deadline, tax/e-invoice status, and content restrictions.
- Underwear: default to modest, informational presentation; see compliance reference.

Malay opener:

```text
Hi [preferred_name], saya [sender] dari [brand]. Saya tengok video [specific_content], terutama [specific_observation]. Kami sedang cari creator untuk cuba [product] dan tunjuk [product_use_case]. Tawaran kami [approved_primary_offer]. Nak saya hantar kad produk TikTok Shop di sini?
```

This is a shape, not a reusable script. Match `saya tengok/saya lihat`, `nak/boleh`, and English loanwords to the creator's observed usage.

## Indonesia

- Fallback language: Bahasa Indonesia.
- Address: `Halo + preferred_name`; use `Kak` only if the creator uses or accepts it.
- Channel: TikTok/Tokopedia-native path first; WhatsApp after explicit permission.
- Tone and length: mirror the creator's observed content and reply. A choice-based question is a general low-pressure option, not a country-derived personality assumption.
- Timing: check Ramadan and Idul Fitri schedules rather than assuming availability.
- Data: record lawful basis; when relying on consent, keep a demonstrable record.

Indonesian opener:

```text
Halo [preferred_name], saya [sender] dari [brand]. Saya lihat video [specific_content], terutama bagian [specific_observation]. Kami sedang mencari kreator untuk mencoba [product] dan menunjukkan [product_use_case]. Penawarannya [approved_primary_offer]. Boleh saya kirim kartu produk TikTok Shop di sini?
```

Choose formal or informal Indonesian from the creator's own usage; do not mix `Anda` and `kamu` by default.

## Thailand

- Fallback language: Thai; require native-language QA for production templates.
- Address: mirror the creator's self-used title and preferred name; do not add `คุณ/Khun` solely because of country.
- Polite particle follows the sender's identity (`ครับ`/`ค่ะ`), not an inferred creator gender.
- Channel: TikTok first; LINE or WhatsApp only when the creator confirms it.
- Tone and length: derive these only from the creator's observed content and reply. Do not assign indirectness, hierarchy, or conflict sensitivity from country alone.
- Compliance: direct-marketing details and platform features require current local verification.

## Vietnam

- Fallback language: Vietnamese; require native-language QA for production templates.
- Mirror the creator's observed tone. As a universal transparency control, state why the creator is being contacted early and keep one substantive request per message.
- Do not choose `Anh/Chị/Em` until the creator's usage makes the relationship clear.
- Channel: Affiliate Center first; Zalo or another business channel only after permission.
- Data: when marketing consent is required, record content, method, form, and frequency.

## Philippines

- Choose English, Filipino, or Taglish from the creator's usage. English is the business fallback.
- Mirror `po` only if the creator uses it.
- Channel: TikTok/IG/Messenger first; move to the creator's stated business channel after permission.
- Intent handling: use the universal ambiguity rule. Confirm one concrete action only when the creator's actual words are ambiguous, not because of nationality.
- Data: public-source personal data remains protected; legitimate-interest use requires a case-specific assessment.

## Singapore

- English is the operational fallback; mirror another observed language instead of inferring it from name or ethnicity.
- Tone and length: mirror the creator. State net fee and scope clearly in every market when negotiating.
- TikTok first; WhatsApp only after permission.
- Treat DNC/Spam rules as applicable unless a qualified reviewer confirms an exception. Do not automatically classify an individual creator number as B2B.

## United Kingdom and United States

- Mirror the creator's observed English register. Regardless of country, separate deliverables, compensation, disclosure, and paid-media rights.
- UK: social-media direct messages may fall under electronic-mail marketing rules; use recognized, clear ad disclosure.
- US: free products and commissions are material connections; disclosure must be clear and hard to miss.

## Adding another country

Create a verified Country Card before operational use:

```yaml
country_shop:
platform_features:
default_language:
currency_and_tax:
privacy_and_anti_spam:
commercial_disclosure:
category_restrictions:
payment_practice:
major_holidays:
official_sources:
verified_at:
legal_review_status:
```

If any critical field is `unknown`, use the strict consent baseline, omit legal certainty, and return `country_pack_pending`.
