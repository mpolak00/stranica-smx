# Checkout Compliance Setup — Nexo Research

Ovaj dokument pokriva konkretan compliance setup za Shopify checkout, Shopify aplikacije, payment processor opis i operativni weekly review.

## 1. Bounce — Age Verification Gate (Shopify App)

### Installation

`Shopify Admin -> Apps -> Search "Bounce Age Verification Gate" -> Install`

### Configuration

Postavi ove vrijednosti:

- Minimum age: `18`
- Verification method: `Date of birth input (DD / MM / YYYY)`
- Popup background: `#0a0a08` at `90% opacity`
- Card background: `#1c1c1a`
- Heading: `Age Verification Required`
- Custom message: `Our products are sold strictly to qualified research professionals aged 18 and over. You must be at least 18 years old to enter this site.`
- Logo: upload dark version of the Nexo Research logo
- Enter button: green `#4a9e6b`
- Redirect if underage: `https://google.com`
- Cookie duration: `30 days`
- Enable on: `All pages`

Napomena: ovo je Shopify storefront gate. Vercel landing page već ima svoj odvojeni RUO gate i oba sloja trebaju ostati aktivna.

## 2. Checkout Blocks App (Shopify App)

### Installation

`Shopify Admin -> Apps -> Checkout Blocks -> Install`

Za Basic plan ova postava je dovoljna za početni compliance layer.

### Block 1: Research Confirmation Checkbox

Lokacija:

- `Extensions -> Checkout -> Add app block`

Postavke:

- Block type: `Checkbox`
- Position: `After "Contact information"` i prije `Payment`
- Required: `YES`

Točan tekst checkboxa:

```text
I confirm I am 18 years of age or older and am purchasing this product exclusively for lawful laboratory research purposes only. I understand that this product is not intended for human or veterinary use, diagnosis, treatment, or consumption.
```

Error message:

```text
You must confirm research intent to complete your order.
```

### Block 2: RUO Warning Banner

Postavke:

- Block type: `Rich text` ili `Banner`
- Position: `Order summary sidebar`

Content:

```text
⚠️ RESEARCH USE ONLY
This order contains laboratory research materials. By completing this purchase, you confirm compliance with our Research Use Policy. Products are not for human or veterinary use.
```

Style:

- background: `rgba(200,164,90,0.1)`
- border: warning tone
- text: warning tone

### Block 3: COA Promise (Thank You page)

Postavke:

- Block type: `Rich text`
- Position: `Order confirmation / Thank you page`

Content:

```text
✓ Your Certificate of Analysis (COA) will be emailed to you within 24 hours of shipment.
✓ Store received products at -20°C immediately upon delivery.
✓ For research support: care@nexoresearch.com
```

## 3. Order Note Field

Idi na:

`Shopify Admin -> Settings -> Checkout`

Uključi:

- `Order notes`

Label:

```text
Research purpose / additional notes (optional)
```

Placeholder:

```text
e.g., research application, institution name...
```

To nije zamjena za compliance checkbox, ali daje dodatni signal i B2B kontekst narudžbe.

## 4. Checkout Branding

Idi na:

`Shopify Admin -> Settings -> Checkout -> Customize checkout`

Postavi:

- Logo: dark version of Nexo Research logo
- Background color: `#0a0a08` ili najbliža dostupna varijanta
- Accent / button color: `#4a9e6b`

Ako Shopify plan ograničava potpunu checkout prilagodbu, primijeni barem ono što je dostupno kroz branding editor i app blocks.

## 5. Payment Processor Compliance Notes

### Stripe

Preporučeni business setup:

- Business category: `Scientific Supplies` ili `Research Chemicals`
- Business description:

```text
We sell laboratory research peptide materials designated Research Use Only (RUO). All products sold to 18+ qualified researchers for lawful laboratory research. Not for human or veterinary use.
```

Descriptors na chargeovima:

```text
NEXO RESEARCH — SEMAX 30MG LAB
NEXO RESEARCH — SEMAX 60MG LAB
```

Važno za Stripe:

- Stripe može tražiti dodatnu dokumentaciju
- pripremi unaprijed:
  - RUO Policy URL
  - primjer COA dokumenta
  - business registration documents

Nemoj koristiti ove izraze u Stripe opisu:

- supplement
- nootropic
- performance-enhancing
- human use

### PayPal

Koristi isti osnovni opis kao za Stripe.

Preporuka:

- PayPal Business category: `Scientific Equipment` ili najbliže dostupna klasifikacija

I kod PayPala drži isti research-only framing u opisima i support komunikaciji.

## 6. Weekly Compliance Checklist

Preporuka je da se provjera radi jednom tjedno, primjerice svakog ponedjeljka.

### Website

- [ ] RUO gate se prikazuje u incognito modu
- [ ] RUO gate Exit link vodi na `google.com`
- [ ] Sve legal stranice su dostupne i ažurne
- [ ] Nema health claimova ni "human use" sadržaja na stranici

### Checkout

- [ ] Checkout Blocks checkbox je required i to stvarno blokira dovršetak checkouta
- [ ] Age verification gate radi na Shopify storefrontu
- [ ] Shopify email notifikacije imaju RUO disclaimer u footeru

### Dokumentacija

- [ ] COA za trenutni batch je spreman za slanje
- [ ] SDS za trenutni batch je aktualan
- [ ] Batch number u Shopify produktu je ažuran

### Email

- [ ] Klaviyo flow emailovi imaju RUO disclaimer u footeru
- [ ] Welcome flow radi za testnog subscribera
- [ ] Unsubscribe link radi

## 7. Incident Response

Ako dobiješ upit od regulatora ili payment processora:

1. Ne briši ništa odmah
2. Kontaktiraj pravnog savjetnika
3. Pripremi:
   - RUO Policy
   - COA primjere
   - Terms of Service
   - business registration dokumente
4. Po potrebi privremeno postavi shop u maintenance mode dok se situacija ne razjasni

Ako Stripe ili PayPal zamrznu račun:

1. Odmah kontaktiraj support
2. Pošalji:
   - RUO Policy
   - COA dokumentaciju
   - product descriptions
3. Naglasi:
   - research-only
   - B2B / qualified purchasers
   - compliance confirmations
4. Drži spremne alternative:
   - Revolut Business
   - Wise Business
   - Fondy

## 8. Juridical Contact (HR)

Za pravna pitanja oko prodaje research kemikalija u Republici Hrvatskoj korisno je imati pravnog savjetnika koji poznaje:

- Zakon o kemikalijama (NN 18/13)
- Zakon o zaštiti potrošača
- REACH / CLP implementaciju u RH

Relevantne institucije:

- Ministarstvo zdravstva: [zdravlje.gov.hr](https://zdravlje.gov.hr)
- AZOP: [azop.hr](https://azop.hr)

## Završni rollout checklist

- [ ] Bounce gate instaliran i testiran
- [ ] Checkout Blocks checkbox postavljen kao required
- [ ] RUO warning banner vidljiv u checkoutu
- [ ] COA message prikazan na thank-you pageu
- [ ] Order notes polje uključeno
- [ ] Checkout branding usklađen s Nexo Research vizualom
- [ ] Stripe opis i dokumentacija pripremljeni
- [ ] PayPal business setup usklađen
- [ ] Weekly compliance checklist usvojen kao rutina
