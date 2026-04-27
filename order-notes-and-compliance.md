# Order Notes and Compliance

This guide covers the Shopify checkout compliance elements that should sit around the custom Vercel cart and Shopify checkout redirect.

## 1. Order note field

Recommended order note configuration:

Path:

`Shopify Admin -> Settings -> Checkout`

Enable:

- `Order notes`

Label:

```text
Research purpose / additional notes (optional)
```

Placeholder:

```text
e.g., research application, institution name...
```

### Why use it

This field is optional, but useful for:

- institutional buyers
- B2B orders
- extra compliance context
- support handling after order placement

It should not replace the mandatory research intent confirmation checkbox.

## 2. Required checkbox through Checkout Blocks

Recommended app:

- `Checkout Blocks`

Path:

`Shopify Admin -> Apps -> Checkout Blocks`

### Block setup

Add a required checkbox block to checkout.

Recommended label:

```text
I confirm I am 18+ and purchasing for lawful laboratory research purposes only.
```

If you want the longer stricter version, use:

```text
I confirm I am 18 years of age or older and am purchasing this product exclusively for lawful laboratory research purposes only. I understand that this product is not intended for human or veterinary use, diagnosis, treatment, or consumption.
```

Recommended error message:

```text
You must confirm research intent to complete your order.
```

### Position

Place it:

- after contact information
- before payment

That keeps the confirmation close to the legal decision point.

## 3. RUO banner in checkout

Add a warning banner block in checkout, ideally in the order summary area or another visible area that stays in view.

Recommended content:

```text
RESEARCH USE ONLY
This order contains laboratory research materials. By completing this purchase, you confirm compliance with our Research Use Policy. Products are not for human or veterinary use.
```

Recommended styling:

- warning-toned background
- subtle warning border
- clear high-contrast text

This should be visible without feeling alarming or deceptive.

## 4. COA promise on the thank-you page

Add a post-purchase message block on the thank-you page.

Recommended content:

```text
Your Certificate of Analysis (COA) will be emailed to you within 24 hours of shipment.
Store received products at -20 C immediately upon delivery.
For research support: care@nexoresearch.com
```

### Why this helps

It reinforces:

- documentation expectations
- storage expectations
- support path for the buyer

## 5. Relationship between website gate and checkout gate

The compliance stack should have multiple layers:

1. Vercel landing page RUO gate
2. Shopify storefront age gate if enabled
3. Required checkout research checkbox
4. RUO banner in checkout
5. RUO reminder in transactional emails

This layered approach is stronger than relying on a single modal or single checkbox.

## 6. Customer email consistency

Make sure the same research-only language appears in:

- order confirmation
- shipping confirmation
- delivered notification
- refund and cancellation templates where relevant

Suggested footer text:

```text
Products sold strictly for laboratory research purposes only. Not intended for human or veterinary use.
```

## 7. Staff workflow recommendation

When a new order arrives:

1. Review the product and quantity
2. Review the order note if present
3. Review destination country
4. Confirm current batch COA and SDS availability
5. Fulfill only when documentation and cold-chain packing are ready

This is simple, but it creates a repeatable compliance habit for every order.

## 8. Suggested implementation checklist

- [ ] Order notes enabled
- [ ] Optional note label updated to research-purpose wording
- [ ] Required checkbox added through Checkout Blocks
- [ ] Error message tested
- [ ] RUO banner visible in checkout
- [ ] COA promise added to thank-you page
- [ ] Transactional email footer updated
- [ ] Test order completed end-to-end
