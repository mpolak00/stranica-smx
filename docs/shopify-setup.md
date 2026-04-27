# Shopify Setup Guide — Nexo Research

Ovaj vodič pokriva kompletan Shopify setup za Nexo Research uz postojeću arhitekturu u kojoj je glavna web stranica hostana na Vercelu, a Shopify služi kao checkout, order management i inventory layer.

## 1. Kreiranje Shopify accounta

1. Idi na [shopify.com/hr](https://shopify.com/hr).
2. Klikni `Start free trial`.
3. Odaberi `Basic` plan kada završi trial.
   Trenutni ciljani plan: `29 USD/mj` za start.
4. Kao store name unesi `Nexo Research`.
5. Ispuni poslovne podatke:
   - naziv firme
   - OIB
   - poslovna adresa
   - kontakt email
6. Dovrši onboarding i uđi u Shopify Admin.

## 2. Uloga Shopifyja u našoj arhitekturi

Važno: `index.html` landing page nije na Shopifyju nego na Vercelu.

Shopify u ovom projektu koristimo samo za:

- checkout i payment processing
- Buy Button embedove koji se umeću u Vercel landing page
- order management
- inventory management

To znači da je Shopify tema sekundarna. Kupci primarno vide Vercel stranicu, a Shopify se koristi kao commerce engine ispod nje.

## 3. Odabir teme

Preporučene besplatne teme:

- `Dawn`
- `Sense`

Obje su dovoljno dobre za početni setup, čak i ako storefront nije glavni public-facing layer.

U Theme Customizeru uskladi osnovne boje:

- Background: `#0a0a08`
- Text: `#f0efe9`
- Accent / Button: `#4a9e6b`

Ako kasnije koristiš Shopify storefront ili product page fallback, vizualno će biti usklađen s Vercel stranicom.

## 4. Kreiranje produkata

Idi na `Shopify Admin -> Products -> Add product`.

### Produkt 1: Semax Nasal Spray 30mg

Koristi ove vrijednosti:

- Title: `Semax Nasal Spray — Research Grade Neuropeptide (30mg)`
- SKU: `SEMAX-30-SPRAY`
- Price: `€149.00`
- Compare-at price: ostavi prazno
- Vendor: `Nexo Research`
- Product type: `Research Peptide`
- Tags: `research, peptide, neuropeptide, semax, nasal-spray, laboratory, ruo, research-use-only`

Description HTML:

```html
<p style="color:#c8a45a;background:rgba(200,164,90,0.1);border:1px solid rgba(200,164,90,0.3);border-radius:8px;padding:16px;margin-bottom:20px;font-size:14px;">
⚠️ <strong>FOR LABORATORY RESEARCH USE ONLY.</strong> This product is not intended for human or veterinary use, diagnosis, treatment, or consumption. By purchasing you confirm you are 18+ acquiring this for lawful laboratory research only.
</p>
<p>30mg pharmaceutical-grade Semax, sterile reconstituted nasal spray with 1mg/spray metered delivery. For in vitro and laboratory research applications.</p>
<ul>
<li>✓ Certificate of Analysis (COA) — HPLC verified ≥99% purity</li>
<li>✓ Safety Data Sheet (SDS) included</li>
<li>✓ Batch number and storage documentation</li>
<li>✓ Sterile bacteriostatic water included</li>
<li>✓ Amber glass vial + precision nasal applicator</li>
<li>✓ Cold-chain shipped with ice packs</li>
</ul>
<p><strong>Molecular data:</strong> CAS 80714-61-0 | MW 813.94 g/mol | Sequence: Met-Glu-His-Phe-Pro-Gly-Pro | Storage: -20°C</p>
```

Dodaj custom metafields:

- Namespace: `product` | Key: `cas_number` | Value: `80714-61-0`
- Namespace: `product` | Key: `purity` | Value: `≥99% HPLC`
- Namespace: `product` | Key: `molecular_weight` | Value: `813.94 g/mol`
- Namespace: `product` | Key: `storage_temp` | Value: `-20°C`
- Namespace: `product` | Key: `batch_number` | Value: `[unesi per batch]`

Inventory i shipping:

- Inventory: `Track quantity`
- Inventory policy: `Don't sell when out of stock`
- Shipping: `Physical product`
- Weight: `0.05 kg`

SEO:

- SEO Title: `Semax 30mg Nasal Spray — Research Grade | Nexo Research`
- Meta Description: `Laboratory grade Semax nasal spray 30mg, ≥99% HPLC purity. COA and SDS included. For research use only.`

### Produkt 2: Semax Nasal Spray 60mg

Koristi iste korake kao gore, uz ove razlike:

- Title: `Semax Nasal Spray — Research Grade Neuropeptide (60mg) — Dual-Vial Kit`
- SKU: `SEMAX-60-SPRAY`
- Price: `€249.00`
- Compare-at price: `€299.00`
- U description tekst dodaj da je ovo `Dual-vial research kit, 2x 30mg vials, double quantity`

Praktično: dupliciraj prvi produkt i zatim izmijeni naslov, SKU, cijenu i opis. To ubrzava setup i čuva konzistentnost.

## 5. Shopify Apps — instalirati odmah

### A. Klaviyo: Email Marketing & SMS

1. Otvori `Shopify App Store`.
2. Potraži `Klaviyo`.
3. Instaliraj aplikaciju.
4. Poveži je sa svojim Klaviyo accountom.
5. Uključi:
   - Customer data sync
   - Orders sync
   - Products sync
   - Web tracking

Detaljna postava Klaviyo flowova je u [klaviyo-setup.md](C:/Users/dp/Documents/Codex/2026-04-27-udi-u-githab-repo-stranica-smx/stranica-smx/docs/klaviyo-setup.md).

### B. Bounce — Age Verification Gate

1. U Shopify App Store potraži `Bounce Age Verification Gate`.
2. Instaliraj aplikaciju.
3. Postavi:
   - Minimum age: `18`
   - Method: `Date of birth entry (DD/MM/YYYY)`
   - Background: dark overlay
   - Custom message: `Our products are sold strictly to qualified research professionals aged 18 and over.`
   - Redirect if underage: `https://google.com`
   - Cookie duration: `30 days`

Napomena: ovo pokriva Shopify stranu, posebno checkout/storefront. Vercel landing page već ima svoj vlastiti RUO gate.

### C. Checkout Blocks

1. Instaliraj `Checkout Blocks`.
2. Koristi ga za compliance checkboxeve, disclaimere i checkout messaging.
3. Detaljna konfiguracija ide u `docs/checkout-compliance.md` kada taj dokument bude dodan.

### D. Trust Badges Bear

Instaliraj `Trust Badges Bear` i dodaj trust sealove na product i checkout prikaze.

### E. Judge.me Reviews

Instaliraj `Judge.me Reviews`. Besplatni plan je dovoljan za start i možeš ga koristiti za review capture i social proof.

## 6. Buy Button Channel — ključno za Vercel integraciju

### Što je Buy Button

Shopify Buy Button generira JavaScript embed koji se može umetnuti na bilo koju vanjsku web stranicu. U našem slučaju to je Vercel `index.html`.

### Setup koraci

1. U Shopify Adminu idi na `Sales Channels`.
2. Klikni `+`.
3. Dodaj `Buy Button`.
4. Otvori Buy Button channel.
5. Klikni `Create a Buy Button`.
6. Odaberi `Product`.
7. Odaberi produkt `Semax 30mg`.
8. U customize prikazu postavi:
   - Quantity: enable
   - Variant selector: enable ako koristiš varijante
   - Stil gumba: background `#4a9e6b`, text `#ffffff`
9. Klikni `Generate Code`.
10. Kopiraj cijeli generirani `<script>` embed.
11. U root [index.html](C:/Users/dp/Documents/Codex/2026-04-27-udi-u-githab-repo-stranica-smx/stranica-smx/index.html) pronađi komentar:

```html
<!-- SHOPIFY_BUY_BUTTON_SEMAX_30 -->
```

12. Zamijeni taj placeholder s generiranim embed kodom.
13. Ponovi isti proces za `Semax 60mg`.

Primjer strukture nakon ubacivanja:

```html
<!-- SHOPIFY_BUY_BUTTON_SEMAX_30 -->
<div id='product-component-semax-30'></div>
<script type='text/javascript'>
// ... Shopify generated code ovdje
</script>
```

Savjet: prije zamjene napravi backup current `index.html` ili commitaj stanje u Git, pa onda ubaci Shopify embedove.

## 7. Shipping Zones

Idi na `Settings -> Shipping and delivery -> Manage rates`.

Konfiguriraj tri zone:

### Zona 1 — Croatia

- Countries: `Croatia (HR)`
- Rates:
  - `Free shipping` za orders `>= €150`
  - `Standard €5` za orders `< €150`
- Estimated delivery: `3-5 business days`

### Zona 2 — European Union

- Countries: `All EU countries`
- Rates:
  - `Standard €15`
- Estimated delivery: `5-10 business days`

### Zona 3 — International

- Countries: `Rest of world`
- Rates:
  - `International €25`
- Estimated delivery: `7-14 business days`

Ako shipping pravila postanu složenija, kasnije dodaj product-specific profile ili cold-chain surcharge logiku.

## 8. Payment Processors

### Stripe

1. Idi na [stripe.com](https://stripe.com).
2. Kreiraj account.
3. Business type postavi na `Company` ili `Individual`, ovisno o poslovnom modelu.
4. Business description koristi formulaciju:

`Laboratory research peptide materials sold for research use only to 18+ professionals`

5. Product category postavi što bliže:
   - `Scientific Supplies`
   - `Research Materials`
6. Važno: u Stripe opisu ne koristi riječi:
   - supplement
   - nootropic
   - performance
7. U Shopify Admin idi na `Settings -> Payments`.
8. Aktiviraj Stripe / Shopify Payments gdje je dostupno.
9. U checkout ili internal opisima koristi formulaciju:

`Research Peptide - [Product Name] - Lab Use Only`

### PayPal

1. Idi na [paypal.com/businessmanage](https://paypal.com/businessmanage).
2. Kreiraj `Business account`.
3. U Shopifyju idi na `Settings -> Payments -> PayPal`.
4. Aktiviraj PayPal.
5. Drži isti RUO disclaimer stil u opisima i internim evidencijama.

## 9. Order Notification Emails

Idi na `Settings -> Notifications`.

Postavi:

- Sender name: `Nexo Research`
- Sender email: `care@nexoresearch.com`
- Reply-to: `care@nexoresearch.com`

U `Order Confirmed` template dodaj ovaj footer blok:

```liquid
<p style="color:#8a8980;font-size:12px;margin-top:32px;border-top:1px solid #262523;padding-top:16px;">
  This order contains laboratory research materials sold by Nexo Research.<br>
  Products are intended strictly for laboratory research purposes only.<br>
  Not intended for human or veterinary use.
</p>
```

Provjeri i druge transactional templateove:

- shipping confirmation
- delivered
- refund
- order edited

Poanta je da RUO messaging bude dosljedan svugdje.

## 10. Legal Pages

U Shopifyju idi na `Online Store -> Pages -> Add page` i kreiraj ove stranice:

- `research-use-policy`
- `terms-of-service`
- `privacy-policy`
- `refund-policy`
- `shipping-policy`
- `age-verification-policy`

Sadržaj za te stranice kasnije kopiraš iz `docs/legal-pages.md`.

## 11. Spajanje domene na Shopify

Idi na `Settings -> Domains -> Connect existing domain`.

Spoji:

- `shop.nexoresearch.com`

Važno: koristi subdomenu, ne apex domenu.

Preporučena arhitektura:

- `nexoresearch.com` -> Vercel landing page
- `nexoresearch.com/admin` -> Vercel admin panel
- `shop.nexoresearch.com` -> Shopify storefront ako ga želiš koristiti
- checkout ostaje Shopify managed

To daje čistu podjelu:

- brand + content + conversion page na Vercelu
- commerce i checkout na Shopifyju

## 12. SEO osnove

Osnovni SEO setup u Shopifyju:

1. `Settings -> Store details`
2. Dodaj Google Analytics ID ako ga koristiš.
3. `Online Store -> Preferences`
4. Postavi homepage title i meta description.
5. Za svaki produkt ručno upiši SEO title i meta description iz koraka 4.

Minimalni SEO checklist:

- svaki produkt ima title i meta description
- product handle je čist i čitljiv
- produkti imaju konzistentne tagove
- legal i shipping stranice su javno dostupne

## Završni checklist prije go-live

- [ ] Shopify account aktiviran
- [ ] Oba produkta unesena
- [ ] Metafields dodani
- [ ] Inventory tracking uključen
- [ ] Shipping zones postavljene
- [ ] Stripe aktiviran
- [ ] PayPal aktiviran
- [ ] Klaviyo integriran
- [ ] Bounce age verification uključen
- [ ] Buy Button channel aktiviran
- [ ] Buy Button embedovi zamijenili placeholdere u `index.html`
- [ ] Notification email footer ažuriran
- [ ] Legal pages kreirane
- [ ] Domain/subdomain setup dovršen
