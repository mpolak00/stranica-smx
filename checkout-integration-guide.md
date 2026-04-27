# Checkout Integration Guide

This guide explains how to connect the Vercel storefront to Shopify checkout using the generated files:

- `checkout-page-snippet.html`
- `cart-checkout.css`
- `cart-checkout.js`

The target setup is:

- Vercel handles the public storefront and custom cart UX
- Shopify handles the real checkout, payments, order creation, and notification emails
- No card data is collected or stored on the Vercel side

## 1. Integration order

Recommended order:

1. Paste the HTML from `checkout-page-snippet.html`
2. Load `cart-checkout.css`
3. Load `cart-checkout.js`
4. Add the Shopify placeholders
5. Enable Storefront API in Shopify
6. Add the correct variant IDs
7. Test add-to-cart and checkout redirect
8. Test customer and staff notifications

## 2. Add the snippet to the existing page

### Navigation button

Copy the cart button from `checkout-page-snippet.html` into the navigation actions area of `index.html`.

### Drawer markup

Copy the overlay, drawer, and toast markup near the end of `index.html`, just before `</body>`.

### Asset loading

Add the CSS in `<head>`:

```html
<link rel="stylesheet" href="/cart-checkout.css">
```

Add the JS before `</body>`:

```html
<script src="/cart-checkout.js"></script>
```

## 3. Add button hooks to the existing product buttons

The JS module automatically binds to these attributes:

- `data-add-to-cart="semax30"`
- `data-add-to-cart="semax60"`
- `data-open-cart`
- `data-close-cart`
- `data-checkout`

Update the current CTA buttons in `index.html` so they use:

```html
<button type="button" class="btn btn-primary full-width" data-add-to-cart="semax30">
  Add to Cart
</button>
```

and

```html
<button type="button" class="btn btn-primary full-width" data-add-to-cart="semax60">
  Add to Cart
</button>
```

## 4. Enable Storefront API in Shopify

The cart module uses Shopify Storefront API cart mutations such as `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, and `cartLinesRemove`.

### Shopify Admin path

Based on Shopify's current custom app flow:

1. Open Shopify Admin
2. Go to `Settings -> Apps and sales channels`
3. Click `Develop apps`
4. Create a new app, for example:

```text
Nexo Vercel Checkout
```

5. Open the app
6. Go to `Configuration`
7. In the `Storefront API integration` section click `Configure` or `Edit`

### Recommended unauthenticated Storefront scopes

Enable these scopes:

- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_read_checkouts`
- `unauthenticated_write_checkouts`

These are the key scopes for:

- reading product information
- interacting with the cart object
- initiating checkout from a custom storefront

### Important security note

Storefront API tokens are public-facing tokens. Shopify's guidance is that Storefront API is an unauthenticated public API, so only grant the minimum scopes needed for the checkout flow.

## 5. Find the Storefront access token

After the app is configured:

1. Open the custom app
2. Go to `API credentials`
3. Copy the `Storefront access token`

Use it in the JS config:

```html
<script>
  window.NEXO_CHECKOUT_CONFIG = {
    mode: "storefront",
    storeDomain: "YOUR_STORE.myshopify.com",
    storefrontAccessToken: "YOUR_STOREFRONT_TOKEN",
    apiVersion: "2025-10",
    supportEmail: "care@nexoresearch.com",
    shippingRegion: "AUTO"
  };
</script>
<script src="/cart-checkout.js"></script>
```

## 6. Find the product variant IDs

The JS module expects these placeholders:

- `PRODUCT_VARIANT_ID_SEMAX_30`
- `PRODUCT_VARIANT_ID_SEMAX_60`

### Option A: Copy from Shopify Admin URL

1. Open `Products`
2. Open the Semax product
3. Open the variant
4. In many Shopify admin screens, the variant ID is visible in the URL or can be reached through the variant details view

### Option B: Use GraphQL Admin API or bulk export

If you already use Shopify API tooling, query the product variants and copy the GraphQL variant IDs.

The Storefront API expects GraphQL IDs in this format:

```text
gid://shopify/ProductVariant/12345678901234
```

### Option C: Use Buy Button / product embed inspection

If you already created Shopify product embeds, inspect the generated product configuration and map the variant IDs from there.

### Final JS replacement

Replace the values inside `cart-checkout.js`:

```js
variantId: "gid://shopify/ProductVariant/12345678901234"
```

and

```js
variantId: "gid://shopify/ProductVariant/98765432109876"
```

## 7. Store domain value

Use the actual Shopify store domain, for example:

```text
nexoresearch.myshopify.com
```

This goes into:

```js
storeDomain: "nexoresearch.myshopify.com"
```

Do not include `https://` in the config value.

## 8. How checkout behaves from Vercel

The customer journey is:

1. User browses the static landing page on Vercel
2. User adds products to the custom cart drawer
3. The JS module creates or updates a Shopify cart using Storefront API
4. When the customer clicks `Proceed to Checkout`, the module redirects to Shopify's `checkoutUrl`
5. Shopify handles:
   - shipping details
   - taxes
   - payment
   - order creation
   - order confirmation emails

This means the Vercel site never handles raw payment data.

## 9. Custom domain and checkout domain behavior

If the user starts on:

```text
https://nexoresearch.com
```

then clicks checkout, Shopify redirects them to the checkout URL generated by Shopify for that cart session.

Depending on your Shopify domain setup, this may look like:

- your `myshopify.com` checkout domain
- or your branded checkout-capable Shopify domain, if configured

This is expected behavior. The custom cart stays on Vercel, while the secure checkout is owned by Shopify.

## 10. Customer order confirmation emails

Shopify sends customer order confirmation emails automatically after a successful order.

Admin path:

`Shopify Admin -> Settings -> Notifications`

Relevant customer notifications:

- Order confirmation
- Shipping confirmation
- Shipping update
- Out for delivery
- Delivered, where carrier support exists

If the customer enters an email at checkout, Shopify sends order confirmation by email automatically.

## 11. Staff order notification emails

Shopify can also email you or your team when a new order is placed.

Admin path:

`Shopify Admin -> Settings -> Notifications -> Staff notifications`

Steps:

1. Click `Staff notifications`
2. In the `Recipients` section click `Add recipient`
3. Choose `Email address`
4. Enter:

```text
care@nexoresearch.com
```

5. Save

Add additional recipients the same way, for example:

```text
research@nexoresearch.com
```

Shopify's current flow also allows testing a staff notification after a recipient is added.

## 12. Fallback mode in the JS module

The generated `cart-checkout.js` supports two modes:

### Mode B: Storefront API

This is the primary mode and should be used for the final setup.

### Mode A: Buy Button fallback

If Storefront API is not ready yet, you can set:

```js
window.NEXO_CHECKOUT_CONFIG = {
  mode: "buybutton",
  buyButtonFallbackUrl: "https://YOUR_STORE.myshopify.com/cart"
};
```

This is only a fallback. The preferred production setup is Storefront API mode for the best custom cart UX.

## 13. Testing checklist

### Cart UX

- Add Semax 30mg
- Add Semax 60mg
- Increase quantity
- Decrease quantity
- Remove line item
- Close and reopen drawer
- Refresh the page and confirm cart persists in `sessionStorage`

### Checkout redirect

- Click `Proceed to Checkout`
- Confirm redirect lands on a live Shopify checkout URL
- Confirm line items and quantities match the drawer

### Email

- Complete a test order with Bogus Gateway or Shopify test mode
- Confirm customer receives order confirmation
- Confirm `care@nexoresearch.com` receives staff new-order notification

## 14. If checkout is unavailable

If the placeholders are not configured or the token is invalid, the drawer shows:

```text
Checkout is temporarily unavailable. Please try again later or contact care@nexoresearch.com
```

That is intentional. It prevents the user from seeing a broken payment flow while still keeping the cart UX stable.

## 15. Recommended production hardening

- Keep Storefront scopes minimal
- Use a dedicated Shopify custom app only for this storefront
- Rotate Storefront tokens if they ever leak into shared screenshots or public docs
- Keep all payment and order completion inside Shopify
- Test every major product update against a real checkout sandbox flow
