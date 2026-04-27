# Checkout README

## Integration order

1. Insert the markup from `checkout-page-snippet.html` into `index.html`
2. Load `/cart-checkout.css`
3. Load `/cart-checkout.js`
4. Replace the Shopify placeholders:
   - `SHOPIFY_STORE_DOMAIN`
   - `SHOPIFY_STOREFRONT_API_TOKEN`
   - `PRODUCT_VARIANT_ID_SEMAX_30`
   - `PRODUCT_VARIANT_ID_SEMAX_60`
5. Test `Add to Cart`
6. Test Shopify checkout redirect
7. Test customer order confirmation
8. Test staff new-order notification

## Required front-end hooks

The JS auto-binds to:

- `data-add-to-cart="semax30"`
- `data-add-to-cart="semax60"`
- `data-open-cart`
- `data-close-cart`
- `data-checkout`

## Expected result

- cart UX stays on Vercel
- checkout happens on Shopify
- customer emails come from Shopify
- staff order alerts come from Shopify
- no custom payment form is used

## Related guides

- `checkout-integration-guide.md`
- `shopify-notifications-setup.md`
- `checkout-webhooks-guide.md`
- `order-notes-and-compliance.md`
