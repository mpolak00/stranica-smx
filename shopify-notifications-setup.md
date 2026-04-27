# Shopify Notifications Setup

This guide covers the production notification flow for Nexo Research:

- customer order emails
- staff new order alerts
- shipping updates
- RUO footer text

Admin path for almost everything in this document:

`Shopify Admin -> Settings -> Notifications`

## 1. Customer notifications

Shopify customer notifications are automatic for core order events.

### Recommended customer notifications to review

- Order confirmation
- Shipping confirmation
- Shipping update
- Out for delivery, where supported by carrier integrations
- Delivered, where supported by carrier integrations
- Refund notifications
- Order canceled notifications

### What happens by default

For a normal checkout:

1. Customer places the order
2. Shopify creates the order
3. Shopify sends the customer an order confirmation automatically
4. When you fulfill the order, Shopify sends shipping confirmation automatically unless you manually disable it during fulfillment
5. If tracking updates are supported, shipping updates and delivered notices can also be sent

### Edit subject and body

Shopify currently allows editing both subject and HTML body for individual templates.

Steps:

1. Go to `Settings -> Notifications`
2. Click `Customer notifications`
3. Open the notification you want to edit
4. Click `Edit code`
5. Edit:
   - `Email subject`
   - `Email body (HTML)`
6. Preview
7. Send a test email
8. Save

### Brand styling

You can also customize:

- logo
- accent color
- email header branding

Path:

`Settings -> Notifications -> Customer notifications -> Customize email template`

Recommended brand values:

- Accent color: `#4a9e6b`
- Background/content styling aligned with Nexo Research branding

## 2. Add the RUO disclaimer to customer email footers

Suggested footer text:

```text
Products sold strictly for laboratory research purposes only. Not intended for human or veterinary use.
```

### Suggested HTML footer block

Add this near the bottom of the email body:

```html
<p style="color:#8a8980;font-size:12px;line-height:1.6;margin-top:32px;border-top:1px solid #262523;padding-top:16px;">
  Products sold strictly for laboratory research purposes only.<br>
  Not intended for human or veterinary use.
</p>
```

### Where to add it

At minimum, add it to:

- Order confirmation
- Shipping confirmation
- Shipping update
- Delivered
- Refund notification

That keeps the research-only framing consistent across the lifecycle.

## 3. Staff notifications

Staff notifications are separate from customer notifications.

### Main new order alert to care@nexoresearch.com

Steps:

1. Go to `Settings -> Notifications`
2. Click `Staff notifications`
3. In `Recipients`, click `Add recipient`
4. Select `Email address`
5. Enter:

```text
care@nexoresearch.com
```

6. Save

### Add another recipient

Repeat the same process and add:

```text
research@nexoresearch.com
```

You can also add staff accounts directly if you want Shopify to send to a staff member's account email.

### Important note

Shopify's current staff notification flow lets you:

- add recipients
- edit which events a recipient receives
- send a test notification

Use a test recipient first if you want to confirm formatting before enabling all inboxes.

## 4. Edit the New order staff template

You can customize the staff `New order` email as well.

Suggested additions:

- link back to the Shopify admin order page
- display the order note
- add RUO/compliance note

### Useful admin order link

Shopify's own documentation shows this pattern:

```liquid
You can review details of this order in your shop admin at {{ shop.url }}/admin/orders/{{ id }}.
```

### Suggested RUO footer for staff emails

```html
<p style="color:#8a8980;font-size:12px;line-height:1.6;margin-top:24px;border-top:1px solid #262523;padding-top:14px;">
  Internal note: this order contains laboratory research materials designated for research use only.
</p>
```

### Suggested order note snippet

```liquid
{% unless note == blank %}
  Special instructions: {{ note }}
{% endunless %}
```

This is especially useful if you enable the optional research-purpose order note field.

## 5. Recommended notification flow

Production recommendation:

1. Customer places order on Shopify checkout
2. Customer immediately gets `Order confirmation`
3. You immediately get `New order` staff email at `care@nexoresearch.com`
4. Optional second inbox `research@nexoresearch.com` gets the same alert
5. When you fulfill the order and add tracking:
   - customer gets `Shipping confirmation`
   - customer may also get `Shipping update`
   - customer may receive `Out for delivery` or `Delivered` when carrier support exists

This covers both customer confidence and internal operational awareness without building a custom email system.

## 6. Suggested subjects

These are optional examples if you want the notifications to match the Nexo tone more closely.

### Customer

- Order confirmation:

```text
Nexo Research order confirmed - {{ order_name }}
```

- Shipping confirmation:

```text
Your Nexo Research order is on the way - {{ order_name }}
```

- Delivered:

```text
Delivered: your Nexo Research shipment - {{ order_name }}
```

### Staff

- New order:

```text
New Nexo Research order received - {{ order_name }}
```

## 7. Testing notifications

### Customer notification test

1. Put Shopify payments into test mode or use a valid test flow
2. Place a test order
3. Confirm:
   - order confirmation arrives
   - footer renders correctly
   - links and branding look correct

### Staff notification test

1. In `Settings -> Notifications -> Staff notifications`
2. Use the available `Send test notification` action for the recipient
3. Confirm the email arrives in:
   - `care@nexoresearch.com`
   - `research@nexoresearch.com`

## 8. Operational recommendation

Keep notification responsibilities split like this:

- Shopify:
  - customer order confirmation
  - shipping and delivery updates
  - staff new order alerts
- Klaviyo:
  - marketing flows
  - post-purchase nurture
  - browse/cart follow-up

That prevents duplicate transactional email logic and keeps the real order state anchored in Shopify.

## 9. Suggested footer text

Use this exact line if you want a short universal version:

```text
Products sold strictly for laboratory research purposes only. Not intended for human or veterinary use.
```

## 10. Minimal rollout checklist

- [ ] Order confirmation reviewed
- [ ] Shipping confirmation reviewed
- [ ] Delivered template reviewed
- [ ] RUO footer added to customer templates
- [ ] care@nexoresearch.com added as staff recipient
- [ ] research@nexoresearch.com added as secondary staff recipient
- [ ] Staff new order test email received
- [ ] Real checkout test completed
