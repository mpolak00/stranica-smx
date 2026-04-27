# Domain, DNS & Email Setup — Nexo Research

Ovaj vodič pokriva cijeli setup za domenu, Cloudflare DNS, Vercel povezivanje, Zoho Mail EU, Klaviyo sending domain i osnovni email deliverability sloj za Nexo Research.

## 1. Kupnja domene

Preporučeni redoslijed provjere dostupnosti:

1. `nexoresearch.eu`
2. `nexoresearch.com`
3. `nexopeptides.eu`
4. `labpeptide.store`

### Gdje kupiti domenu

Preporuka: [registrar.cloudflare.com](https://registrar.cloudflare.com)

Zašto Cloudflare Registrar:

- nema markup na cijenu domene
- `.com` je otprilike `~$10.44/god`
- `.eu` je otprilike `~€9.15/god`
- automatski je povezan s Cloudflare DNS-om
- auto-renew se lako uključi

Alternativa:

- [namecheap.com](https://www.namecheap.com)

Ako domenu kupuješ van Cloudflarea, svejedno je možeš kasnije prebaciti na Cloudflare DNS.

## 2. Cloudflare DNS Setup

### Zašto Cloudflare

Cloudflare je dobar izbor jer daje:

- besplatni SSL
- osnovnu DDoS zaštitu
- CDN za brže učitavanje u EU
- jednostavan DNS GUI
- dovoljno jak free plan za ovaj projekt

### Setup ako domena nije kupljena na Cloudflare Registrar

1. Idi na [cloudflare.com](https://cloudflare.com).
2. Klikni `Add site`.
3. Upiši svoju domenu.
4. Klikni `Continue`.
5. Odaberi `Free plan`.
6. Cloudflare će skenirati postojeće DNS zapise.
7. Provjeri jesu li pronađeni zapisi točni.
8. Cloudflare će ti dati 2 nameservera, na primjer:

```text
ava.ns.cloudflare.com
jay.ns.cloudflare.com
```

9. Idi kod svog registrara:
   - Namecheap
   - GoDaddy
   - drugdje
10. Otvori `Domain settings -> Nameservers`.
11. Zamijeni postojeće nameservere s Cloudflare nameserverima.
12. Čekaj `24-48 sati` za potpunu propagaciju.

Provjera propagacije:

- idi na [whatsmydns.net](https://www.whatsmydns.net)
- upiši domenu
- provjeri `NS` zapis

## 3. DNS zapisi za Vercel

U Cloudflare idi na `DNS -> Records -> Add record`.

Dodaj:

| Type  | Name | Content              | Proxy Status          |
|-------|------|----------------------|-----------------------|
| CNAME | @    | cname.vercel-dns.com | DNS only (SIVA OBLAK) |
| CNAME | www  | cname.vercel-dns.com | DNS only (SIVA OBLAK) |

Kritično važno:

- Proxy mora biti `OFF`
- moraš vidjeti `sivu oblak`, ne narančastu

Razlog:

Vercel treba direktnu DNS vezu za SSL verifikaciju. Cloudflare proxy može blokirati ili usporiti ispravnu SSL potvrdu i domain verification.

### Nakon dodavanja zapisa

1. Otvori svoj Vercel projekt.
2. Idi na `Settings -> Domains`.
3. Klikni `Add`.
4. Unesi apex domenu, primjer:

```text
nexoresearch.com
```

5. Vercel će verificirati DNS i automatski aktivirati SSL.
6. Dodaj i:

```text
www.nexoresearch.com
```

7. Vercel će po potrebi automatski preusmjeravati `www` na apex.

## 4. Arhitektura domena

Preporučena raspodjela:

```text
nexoresearch.com        -> Vercel (index.html — landing page)
nexoresearch.com/admin  -> Vercel (admin/index.html — password protected)
mail.nexoresearch.com   -> Klaviyo sending subdomain (CNAME zapisi)
checkout.*              -> Shopify managed automatski
```

Važno:

- Shopify checkout subdomena je Shopify-managed
- ne postavljaš je ručno osim ako Shopify izričito ne traži dodatni DNS zapis
- Buy Button embedovi na Vercelu automatski vode kupca prema Shopify checkoutu

## 5. Zoho Mail Setup (EU)

### Zašto Zoho Mail EU

Zoho Mail EU je dobar izbor jer nudi:

- EU data residency
- do `5 korisnika` besplatno
- `5 GB` po korisniku
- custom domain email
- čist, profesionalan inbox

### Koraci

1. Idi na [mail.zoho.eu](https://mail.zoho.eu).
2. Važno: koristi `.eu`, ne `.com`.
3. Klikni `Sign up for free`.
4. Odaberi `Free plan`.
5. Klikni `Add existing domain`.
6. Upiši svoju domenu, primjer:

```text
nexoresearch.com
```

7. Zoho će dati TXT zapis za verification.
8. Dodaj taj TXT zapis u Cloudflare.
9. Vrati se u Zoho i klikni `Verify`.

### DNS zapisi za Zoho u Cloudflare

Dodaj ove zapise:

| Type  | Name             | Content                                                                      | Priority | TTL  |
|-------|------------------|------------------------------------------------------------------------------|----------|------|
| MX    | @                | mx.zoho.eu                                                                   | 10       | Auto |
| MX    | @                | mx2.zoho.eu                                                                  | 20       | Auto |
| MX    | @                | mx3.zoho.eu                                                                  | 50       | Auto |
| TXT   | @                | v=spf1 include:zoho.eu ~all                                                  | —        | Auto |
| CNAME | zmail._domainkey | [Zoho DKIM record — kopiraj iz Zoho Mail admin -> Deliverability]            | —        | Auto |

### Što znači SPF zapis

```text
v=spf1 include:zoho.eu ~all
```

To znači:

- Zoho EU serveri smiju slati email u ime tvoje domene
- `~all` znači soft fail
- ne odbacuje automatski sve ostalo, ali označava sumnjivo

### Email adrese koje odmah treba kreirati

- `care@nexoresearch.com` — glavna support adresa
- `research@nexoresearch.com` — B2B i laboratorijski upiti
- `noreply@nexoresearch.com` — automated responses

Preporučeni auto-reply za `noreply@`:

```text
We'll reply within 24h
```

### Pristup Zoho Mailu

Webmail:

- [mail.zoho.eu](https://mail.zoho.eu)

Mobilno:

- Zoho Mail iOS app
- Zoho Mail Android app

Desktop / third-party mail app:

```text
IMAP Server: imap.zoho.eu
Port: 993
Security: SSL/TLS

SMTP Server: smtp.zoho.eu
Port: 587
Security: STARTTLS
```

## 6. Klaviyo Sending Domain

### Zašto zasebna subdomena

Preporuka je da Klaviyo šalje s poddomene:

```text
mail.nexoresearch.com
```

Razlog:

- reputacija marketing emailova odvaja se od glavne inbox domene
- ako marketing slanje ima problema, manje utječe na Zoho transactional / support inbox
- deliverability sloj ostaje čišći

### Setup koraci

1. U Klaviyoju idi na `Settings -> Email -> Sending domains`.
2. Klikni `Add domain`.
3. Upiši:

```text
mail.nexoresearch.com
```

4. Klaviyo će prikazati `3-4 CNAME` zapisa.
5. Dodaj sve te CNAME zapise u Cloudflare.
6. Za svaki od tih zapisa postavi:
   - Proxy: `OFF`
   - odnosno `DNS only`
7. Vrati se u Klaviyo.
8. Klikni `Verify records`.
9. Kada verifikacija prođe, klikni `Enable domain`.

Provjeri dvaput da je Proxy OFF za sve Klaviyo CNAME-ove.

## 7. DMARC zapis

DMARC je važan za zaštitu od spoofinga i bolji inbox placement.

Google i Yahoo od 2024. traže DMARC za bulk sendere, pa ga je dobro postaviti odmah čak i ako još ne šalješ velike količine.

U Cloudflare dodaj:

| Type | Name    | Content                                             |
|------|---------|-----------------------------------------------------|
| TXT  | _dmarc  | v=DMARC1; p=none; rua=mailto:dmarc@nexoresearch.com |

### Preporučene faze DMARC politike

Faza 1:

```text
p=none
```

Koristi se za monitoring.

Faza 2, nakon otprilike mjesec dana:

```text
p=quarantine
```

Sumnjive poruke idu u spam.

Faza 3, nakon stabilnog SPF/DKIM setupa:

```text
p=reject
```

Neautentificirani emailovi se blokiraju.

Promjenu radiš jednostavno tako da u Cloudflareu izmijeniš vrijednost postojećeg `_dmarc` TXT zapisa.

## 8. SSL/TLS provjera

### Cloudflare SSL postavke

Idi na `Cloudflare -> SSL/TLS -> Overview` i postavi:

- Encryption mode: `Full (strict)`
- Always Use HTTPS: `ON`
- Minimum TLS Version: `TLS 1.2`

Za HSTS:

- Enable
- `max-age=31536000`
- Include Subdomains: `YES`
- Preload: `YES`

### Vercel SSL

Vercel automatski generira Let's Encrypt certifikat za custom domene.

Provjera:

- otvori `https://nexoresearch.com`
- provjeri lock ikonu u browseru

### SSL score test

Idi na:

- [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)

Upiši domenu i ciljaj na:

- ocjenu `A`
- ili `A+`

## 9. Shopify email notifikacije

U Shopifyju idi na `Settings -> Notifications`.

Postavi:

- Sender name: `Nexo Research`
- Sender email: `care@nexoresearch.com`
- Reply-to email: `care@nexoresearch.com`

### SPF za Shopify

Ako želiš da SPF pokriva i Shopify slanje, izmijeni postojeći SPF TXT zapis na:

```text
v=spf1 include:zoho.eu include:shops.shopify.com ~all
```

Važno:

- na domeni treba biti samo jedan glavni SPF TXT zapis
- nemoj kreirati drugi odvojeni SPF TXT za isti root host
- postojeći samo ažuriraj

## 10. Pregled svih DNS zapisa

Finalni Cloudflare DNS bi trebao sadržavati:

- `MX x3` — Zoho Mail
- `TXT` — SPF
- `TXT` — DMARC
- `CNAME` — `zmail._domainkey` za Zoho DKIM
- `CNAME @` — `cname.vercel-dns.com`
- `CNAME www` — `cname.vercel-dns.com`
- `CNAME x3-4` — Klaviyo sending domain

Praktični pregled:

```text
[MX x3] Zoho Mail
[TXT] SPF
[TXT] DMARC
[CNAME] zmail._domainkey
[CNAME @] cname.vercel-dns.com
[CNAME www] cname.vercel-dns.com
[CNAME x3-4] mail.nexoresearch.com Klaviyo records
```

## 11. Ukupni troškovi sustava

| Komponenta            | Servis                | Plan           | Cijena     |
|-----------------------|-----------------------|----------------|------------|
| Landing page hosting  | Vercel                | Hobby          | BESPLATNO  |
| DNS & DDoS            | Cloudflare            | Free           | BESPLATNO  |
| Email (custom domain) | Zoho Mail EU          | Free           | BESPLATNO  |
| Email automation      | Klaviyo               | Free (<500)    | BESPLATNO  |
| Domena                | Cloudflare Registrar  | —              | ~€10/god   |
| Shop & checkout       | Shopify               | Basic          | €29/mj     |
| **UKUPNO START**      |                       |                | **~€30/mj** |

Dodatno, opcionalno:

- Vercel Pro: `20 USD/mj`
- Klaviyo paid: `20 USD/mj` za `500-1000 kontakata`

## Završni checklist

- [ ] Domena kupljena
- [ ] Nameserveri prebačeni na Cloudflare
- [ ] Vercel CNAME zapisi dodani
- [ ] Vercel domena verificirana
- [ ] SSL aktivan i HTTPS radi
- [ ] Zoho verification TXT dodan
- [ ] Zoho MX zapisi dodani
- [ ] SPF postavljen
- [ ] DKIM dodan
- [ ] DMARC dodan
- [ ] Klaviyo sending domain verificiran
- [ ] Shopify sender email ažuriran
- [ ] Svi ključni inboxi kreirani (`care`, `research`, `noreply`)
