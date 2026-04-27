# Nexo Research

## Project Overview

Nexo Research je statični premium research peptide storefront sastavljen kao čisti HTML/CSS/JS projekt bez frameworka. Landing page živi u root `index.html`, a password-protected admin panel u `admin/index.html`. Projekt je optimiziran za Vercel static deploy, dok se Shopify Buy Button i Klaviyo embedovi umeću kasnije u postojeće placeholder komentare.

Tech stack:

- Static HTML
- Inline CSS i inline JavaScript
- Vercel za hosting i routing
- Shopify Buy Button za checkout handoff
- Klaviyo za email capture i automation

## Lokalni razvoj

```bash
npm install
npm run dev
# Otvori http://localhost:3000
# Admin: http://localhost:3000/admin
```

## Struktura projekta

```text
nexo-research/
├─ index.html
├─ admin/
│  └─ index.html
├─ docs/
│  ├─ shopify-setup.md
│  ├─ klaviyo-setup.md
│  ├─ domain-email-setup.md
│  ├─ legal-pages.md
│  └─ checkout-compliance.md
├─ vercel.json
├─ .gitignore
├─ package.json
└─ README.md
```

Objašnjenja:

- `index.html` — glavna landing page stranica shopa
- `admin/index.html` — admin dashboard sa session-based password gateom
- `docs/` — operativna i poslovna dokumentacija za integracije, legal i compliance setup
- `vercel.json` — Vercel routing i security headers za static deployment
- `package.json` — minimalni lokalni dev server setup
- `.gitignore` — standardni ignore za Vercel i Node pomoćne fajlove

## GitHub Setup (korak-po-korak)

```bash
git init
git add .
git commit -m "Initial commit — Nexo Research shop"
# Kreiraj novi repo na github.com (bez README, bez .gitignore)
git remote add origin https://github.com/TVOJE_USERNAME/nexo-research.git
git branch -M main
git push -u origin main
```

## Vercel Deploy (korak-po-korak)

1. Idi na vercel.com i prijavi se (GitHub login preporucen)
2. "Add New..." -> "Project"
3. "Import Git Repository" -> odaberi nexo-research repo
4. Framework Preset: Other (ne mijenjaj)
5. Build Command: ostavi prazno
6. Output Directory: . (tocka — root)
7. "Deploy"
8. Cekaj ~30 sekundi -> dobicas vercel.app URL

## Spajanje Custom Domene na Vercel

1. Vercel projekt -> Settings -> Domains
2. "Add" -> unesi nexoresearch.com
3. Vercel ti daje DNS zapise
4. Cloudflare DNS -> Add record:

```text
CNAME | @   | cname.vercel-dns.com | Proxy: OFF (siva oblak!)
CNAME | www | cname.vercel-dns.com | Proxy: OFF
```

5. Sacekaj 5-30 minuta -> Vercel potvrduje domenu

VAZNO: Cloudflare Proxy mora biti OFF za Vercel! (DNS Only, ne Proxied)

## Arhitektura sustava

```text
nexoresearch.com -> Vercel (index.html — landing page)
nexoresearch.com/admin -> Vercel (admin/index.html — password protected)
Shopify checkout -> Shopify managed (Buy Button embeds na Vercelu pozivaju Shopify)
Email -> Zoho Mail (custom domain)
Email automation -> Klaviyo (embedded u Vercel stranicu)
```

## Update workflow (svaki put kad editiras)

```bash
git add .
git commit -m "Update: opis sto si promijenio"
git push
# Vercel automatski redeploya za 30-60 sekundi
```

## Sto zamijeniti (TODO lista)

- [ ] `<!-- SHOPIFY_BUY_BUTTON_SEMAX_30 -->` -> Shopify Buy Button embed kod
- [ ] `<!-- SHOPIFY_BUY_BUTTON_SEMAX_60 -->` -> Shopify Buy Button embed kod
- [ ] `<!-- KLAVIYO_FORM_EMBED -->` -> Klaviyo embedded form kod
- [ ] Admin password `nexoadmin2026` -> Promijeni odmah u `admin/index.html`!
- [ ] `care@nexoresearch.com` -> Tvoja prava email adresa
- [ ] Vercel Analytics -> Vercel Pro ili integriraj Plausible Analytics

## Troskovi

Vercel Hobby: BESPLATNO (za static pages)  
Vercel Pro: 20 USD/mj (za Vercel Analytics, vise projekata)  
Custom domena: ~10 EUR/god  
Ukupno deployment: BESPLATNO ili ~10 EUR/god
