# Klaviyo Setup Guide — Nexo Research

Ovaj vodič pokriva kompletan Klaviyo setup za Nexo Research: account, Shopify sinkronizaciju, onsite tracking za Vercel landing page, signup form, segmente i osnovne email flowove.

## 1. Kreiranje accounta

1. Idi na [klaviyo.com](https://www.klaviyo.com).
2. Klikni `Create account`.
3. Za start koristi free plan:
   - do `500 kontakata`
   - do `500 emailova/mj`
4. Ako lista naraste, računaj na približno `20 USD/mj` za `500-1000 kontakata`.

Pri otvaranju accounta koristi brand identitet:

- Company name: `Nexo Research`
- Website: `https://nexoresearch.com`
- Country: `Croatia`
- Industry: najbliže `Health / Science / Research`

## 2. Shopify integracija

1. U Klaviyoju idi na `Integrations`.
2. Odaberi `Shopify`.
3. Klikni `Add integration`.
4. Upiši shop URL:

```text
nexoresearch.myshopify.com
```

5. Autoriziraj pristup prema Shopify accountu.
6. Uključi:
   - `Sync customers: YES`
   - `Sync orders: YES`
   - `Sync products: YES`
   - `Web tracking: YES`

To dodaje Klaviyo tracking u Shopify sloj i omogućuje flowove kao što su `Started Checkout` i `Placed Order`.

## 3. Tracking na Vercel stranici

Pošto je glavni landing page hostan na Vercelu, Klaviyo onsite tracking treba dodati i tamo.

Koraci:

1. U Klaviyoju idi na `Settings -> API Keys`.
2. Kopiraj `Public API Key` koji počinje s `pk_`.
3. U root [index.html](C:/Users/dp/Documents/Codex/2026-04-27-udi-u-githab-repo-stranica-smx/stranica-smx/index.html) u `<head>` dodaj:

```html
<script async src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=YOUR_KLAVIYO_KEY"></script>
```

4. Zamijeni `YOUR_KLAVIYO_KEY` stvarnim public keyem.

Ovo omogućuje:

- Klaviyo onsite identify
- Klaviyo onsite track eventove
- signup form integracije
- visitor behavior capture na landing pageu

Savjet: ako kasnije želiš custom eventove kao `Viewed COA` ili `RUO Confirmed`, možeš ih slati preko Klaviyo JS API-ja iz inline skripte.

## 4. Sending Domain

Za bolji deliverability obavezno dodaj branded sending domain.

Koraci:

1. U Klaviyoju idi na `Settings -> Email -> Sending domains`.
2. Klikni `Add domain`.
3. Unesi:

```text
mail.nexoresearch.com
```

4. Klaviyo će prikazati 3-4 CNAME DNS zapisa.
5. Dodaj ih u Cloudflare.
6. Nakon propagacije klikni `Verify`.
7. Kada prođe verifikacija, omogući slanje preko te domene.

Za DNS setup koristi i budući dokument `docs/domain-email-setup.md`.

## 5. Flow 1: Welcome Series

Idi na `Klaviyo -> Flows -> Create Flow -> Build from scratch`.

Naziv:

```text
Welcome Series
```

Trigger:

- `List trigger`
- List: `Newsletter Subscribers`

### Email 1 — odmah

- Delay: `0`
- Subject: `Welcome to Nexo Research — Your research starts here`
- Preview: `COA previews, batch updates & research insights inside`

Body struktura:

- logo + brand header
- naslov `Welcome to Nexo Research`
- 2-3 kratke rečenice tko ste i što nudite
- 3 bullet točke:
  - 99%+ HPLC
  - COA + SDS dokumentacija
  - cold-chain shipping
- CTA: `Browse Our Research Catalogue`
- link: `https://nexoresearch.com/#products`
- footer: RUO disclaimer + unsubscribe

### Email 2 — 24h delay

- Subject: `The science behind Semax — what you need to know`

Body:

- molecular data card
- CAS
- formula
- purity
- kratko HPLC objašnjenje
- placeholder za COA sample image
- CTA: `View Product Details`

### Email 3 — 96h delay

- Subject: `What's included with every Nexo Research order`

Body:

- COA
- SDS
- BAC water
- vial
- applicator
- cold-chain
- shipping informacije
- CTA: `Shop Now →`

### Email 4 — 7 dana

- Subject: `Still researching? Here's 10% off your first order`

Body:

- discount code: `RESEARCH10`
- urgency: `Valid for 72 hours`
- CTA: `Claim Your Discount →`
- preporučeni product card: `Semax 60mg`

Flow filter obavezno:

```text
Placed Order zero times since starting this flow
```

Time sprječavaš da kupac dobiva onboarding discount nakon što je već naručio.

## 6. Flow 2: Abandoned Cart

Trigger:

```text
Started Checkout
```

Flow filters:

- Exclude `Placed Order` in last `30 days`

### Email 1 — 1h delay

- Subject: `Your research materials are waiting 🧬`

Body:

- dynamic cart block: `{{event.extra.line_items}}`
- scarcity note: `Batch sizes are limited`
- CTA: `Complete Your Order`
- bez discount koda u prvom emailu

### Email 2 — 24h od Email 1

Filter:

```text
Has not placed order since flow start
```

Subject:

```text
Your Semax order — batch limited 🔬
```

Body:

- cart block
- limited stock poruka
- purity + COA reminder
- CTA: `Return to Cart`

### Email 3 — 48h od Email 2

Filter:

- `Has not placed order since flow start`
- `Is in first-time buyer segment`

Subject:

```text
Last chance — 10% off your research order
```

Body:

- code: `CART10`
- valid for `48 hours`
- cart block
- CTA: `Use CART10 at checkout`

## 7. Flow 3: Post-Purchase

Trigger:

```text
Placed Order
```

### Email 1 — odmah

- Subject: `Order confirmed — {{event.extra.order_name}}`

Body:

- dynamic order summary
- COA note: `Your COA will be emailed within 24 hours of shipment`
- storage note: `Store at -20°C upon receipt`
- CTA: `Track Your Order`
- RUO footer disclaimer

### Email 2 — 3 dana

- Subject: `Your order is on its way 📦`

Body:

- shipping confirmation
- how to receive & store your peptides
- kratke reconstitution notes
- CTA: `View Research Protocols`

### Email 3 — 14 dana od kupnje

- Subject: `How's your research going?`

Body:

- feedback request
- review link
- upsell druge varijante
- CTA: `Shop Again`

## 8. Flow 4: Win-Back

Trigger:

- `Segment trigger`
- Segment: `Win-Back Target`

### Email 1 — odmah na entry

- Subject: `Time for a new batch? 🔬`

Body:

- note da je prošlo vremena od zadnje narudžbe
- new batch info
- CTA: `Reorder Now`

### Email 2 — 15 dana kasnije

Filter:

```text
Has not placed order since flow start
```

Subject:

```text
15% off — back to research
```

Body:

- code: `WINBACK15`
- product preview cards
- CTA: `Claim 15% Off`

## 9. Flow 5: Browse Abandonment

Trigger:

```text
Viewed Product
```

Conditions:

- koristi built-in filter da nema narudžbu

Timing:

- delay: `2 hours`
- smart sending: `ON`

Subject:

```text
Still curious about Semax? 🧬
```

Body:

- viewed product dynamic block
- što je uključeno uz svaku narudžbu
- COA/purity highlight
- CTA: `View Product`

## 10. Segmenti

Odmah kreiraj ove segmente u `Segments -> Create Segment`.

### 1. All Active Subscribers

```text
IF: Klaviyo Email - Is Subscribed - to List "Newsletter Subscribers" - equals True
```

### 2. Purchasers

```text
IF: Placed Order - at least once - all time
```

### 3. VIP Researchers

```text
IF: Placed Order - at least 3 times - all time
OR: Total Value of Orders - is at least - €400
```

### 4. Win-Back Target

```text
IF: Placed Order - at least once - all time
AND: Placed Order - zero times - in the last 60 days
```

### 5. Never Purchased

```text
IF: Is in list "Newsletter Subscribers"
AND: Placed Order - zero times - all time
```

### 6. High Intent

```text
IF: Viewed Product - at least 2 times - in the last 30 days
AND: Placed Order - zero times - all time
```

## 11. Email dizajn template specifikacije

Koristi jedinstveni brand stil u svim flowovima.

Specifikacija:

- Background: `#0a0a08`
- Content card: `#111110`
- Max width: `600px`
- Header: centrirani logo + bottom border `#262523`
- Heading: `Cabinet Grotesk Bold`, `28px`, `#f0efe9`
- Body text: `Satoshi Regular`, `16px`, `line-height: 1.6`, `#f0efe9`
- Muted text: `#8a8980`
- CTA button: background `#4a9e6b`, color `#ffffff`, border-radius `6px`, padding `14px 28px`, font-weight `600`
- Divider: `1px solid #262523`
- Footer: centriran, `12px`, `#8a8980`

Obavezni footer tekst u svakom emailu:

```text
This email was sent by Nexo Research. Products are sold strictly for laboratory research purposes only
and are not intended for human or veterinary use.
[Unsubscribe] | [Privacy Policy] | Zagreb, Croatia, EU
```

Savjet: napravi jedan saved template u Klaviyoju pa ga dupliciraj za svaki flow email.

## 12. Klaviyo Signup Form za Vercel stranicu

1. U Klaviyoju idi na `Sign-up forms`.
2. Klikni `Create new form`.
3. Odaberi `Embedded form`.

Postavke:

- Design: dark background `#111110`
- Accent: `#4a9e6b`
- Fields: `Email only`
- Submit text: `Subscribe`
- Success message: `Thank you! Check your inbox for a welcome email.`
- List: `Newsletter Subscribers`

Kada završiš:

1. Klikni `Publish`.
2. Generiraj embed code.
3. U root [index.html](C:/Users/dp/Documents/Codex/2026-04-27-udi-u-githab-repo-stranica-smx/stranica-smx/index.html) pronađi:

```html
<!-- KLAVIYO_FORM_EMBED -->
```

4. Zamijeni placeholder s Klaviyo embed kodom.

## 13. Preporučeni event tracking za kasnije

Kad osnovni setup proradi, isplati se dodati custom eventove na Vercel landing page:

- `RUO Gate Confirmed`
- `Viewed Product Section`
- `Clicked COA CTA`
- `Clicked Start Research`
- `Viewed FAQ`

To pomaže s boljim segmentima i preciznijim flowovima.

## Završni checklist

- [ ] Klaviyo account kreiran
- [ ] Shopify integracija spojena
- [ ] Public API key dodan u `index.html`
- [ ] Sending domain verificiran
- [ ] List `Newsletter Subscribers` kreirana
- [ ] Embedded signup form objavljen
- [ ] Form embed zamijenio `<!-- KLAVIYO_FORM_EMBED -->`
- [ ] Welcome Series flow aktiviran
- [ ] Abandoned Cart flow aktiviran
- [ ] Post-Purchase flow aktiviran
- [ ] Win-Back flow aktiviran
- [ ] Browse Abandonment flow aktiviran
- [ ] Svi segmenti kreirani
- [ ] Footer RUO disclaimer dodan u svaki email
