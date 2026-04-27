# Checkout Webhooks Guide

This guide is for future automation after the base Vercel plus Shopify checkout flow is live.

No backend is created here. This is a practical implementation guide only.

## 1. Why use webhooks

Shopify webhooks are useful when you want to trigger actions outside Shopify, for example:

- Slack order alerts
- a custom admin event log
- a backup email alert system
- analytics enrichment
- compliance auditing

Because the Vercel cart is only the frontend layer, webhooks are the right place to capture durable post-checkout events.

## 2. Recommended webhook topics

For this project, the most useful topics are:

- `carts/create`
- `checkouts/create` if available in your app setup
- `orders/create`
- `orders/paid`
- `orders/fulfilled`

### What each one is good for

#### carts/create

Useful for:

- seeing when a real Shopify cart object was first created
- measuring cart starts from the custom drawer flow

#### checkouts/create

Useful for:

- detecting initiated checkout sessions
- abandoned checkout analytics and automation handoff

#### orders/create

Useful for:

- creating an internal order log entry
- sending Slack notifications
- triggering compliance review steps

#### orders/paid

Useful for:

- revenue confirmation
- finance notifications
- paid-order pipeline automation

#### orders/fulfilled

Useful for:

- internal shipping logs
- secondary email fallback workflows
- customer support dashboard updates

## 3. Where webhooks point

Shopify webhooks need a backend endpoint, for example:

```text
https://api.nexoresearch.com/shopify/webhooks/orders-create
```

or a serverless endpoint such as:

```text
https://your-backend.example.com/api/shopify/orders-create
```

Important:

- do not point webhooks directly at a static Vercel HTML page
- webhook delivery requires a server endpoint that can accept POST requests
- that backend should validate Shopify's webhook signature before doing anything with the payload

## 4. What you can connect later

### Slack alert

Webhook handler receives `orders/create`, then posts a compact message into Slack:

```text
New order: #1047
Customer: buyer@example.com
Value: EUR 249.00
Product: Semax Nasal Spray 60mg
```

### Custom admin dashboard log

Webhook handler stores a sanitized copy of the event into your own database table:

- event type
- order ID
- order number
- created timestamp
- payment status
- fulfillment status
- destination country

### Custom email fallback

If you ever want a second independent alert path, the webhook can also trigger:

- a backup SMTP email
- a transactional mail API
- a monitoring alert if Shopify notification delivery is ever uncertain

## 5. Payload logging strategy

Recommended logging pattern:

### Store raw body short-term

Temporarily store:

- raw request body
- headers
- delivery timestamp

Retention suggestion:

- 7 to 14 days

This helps with debugging failed webhook verification or retry behavior.

### Store normalized event long-term

Persist only the fields you actually need:

- topic
- webhook ID if available
- order ID
- order name
- total price
- currency
- email
- created_at
- financial status
- fulfillment status

Retention suggestion:

- 12 months or your internal policy

### Do not log sensitive unnecessary fields

Avoid storing more than needed. In particular:

- do not duplicate payment card details
- do not keep excessive customer PII if not operationally necessary
- redact payloads before forwarding them to Slack or third-party tools

## 6. Signature verification warning

Every Shopify webhook endpoint must verify the webhook signature on the backend before accepting the payload as genuine.

Do not skip this.

Your backend should:

1. Read the raw request body exactly as received
2. Read Shopify's webhook signature header
3. Compute the HMAC with your app secret
4. Compare it securely
5. Only process the event if the signature matches

Without verification, anyone could spoof order events into your automation pipeline.

## 7. Example backend flow

Recommended pipeline:

1. Receive webhook request
2. Verify signature
3. Parse JSON
4. Write an audit log entry
5. Return HTTP 200 quickly
6. Process side effects asynchronously:
   - Slack
   - database updates
   - backup alerts

Returning quickly is important because Shopify retries slow or failing webhook deliveries.

## 8. Example payload shape

The exact payload varies by topic, but a simplified `orders/create` style shape often looks like this:

```json
{
  "id": 1234567890,
  "admin_graphql_api_id": "gid://shopify/Order/1234567890",
  "name": "#1047",
  "email": "buyer@example.com",
  "created_at": "2026-04-27T12:00:00Z",
  "currency": "EUR",
  "total_price": "249.00",
  "financial_status": "paid",
  "fulfillment_status": null,
  "line_items": [
    {
      "id": 11223344,
      "title": "Semax Nasal Spray 60mg",
      "quantity": 1,
      "sku": "SEMAX-60-SPRAY",
      "price": "249.00",
      "variant_id": 987654321
    }
  ],
  "shipping_address": {
    "country": "Croatia",
    "city": "Zagreb"
  }
}
```

For `orders/fulfilled`, you would also expect fulfillment objects and tracking information.

## 9. Suggested internal event schema

If you later build your own event table, a clean schema could be:

```json
{
  "topic": "orders/create",
  "received_at": "2026-04-27T12:00:05Z",
  "shopify_id": "gid://shopify/Order/1234567890",
  "order_name": "#1047",
  "email": "buyer@example.com",
  "currency": "EUR",
  "total_price": "249.00",
  "financial_status": "paid",
  "fulfillment_status": "unfulfilled",
  "destination_country": "Croatia"
}
```

This is usually enough for dashboards and audit trails without over-logging.

## 10. Suggested automation mapping

Recommended first automation set:

- `orders/create` -> Slack alert + admin log row
- `orders/paid` -> finance log row
- `orders/fulfilled` -> shipping log row
- `checkouts/create` -> optional abandoned checkout analytics
- `carts/create` -> optional cart-start analytics

## 11. Admin notes for setup

When you are ready to implement webhooks:

1. Create or choose a backend endpoint
2. Register the webhook topics in Shopify
3. Verify signatures
4. Log events safely
5. Add retry-safe processing

Do not build automations that assume exactly-once delivery. Webhooks can be retried, so your backend should be idempotent.

## 12. Practical recommendation

For the first production pass:

- rely on Shopify notifications for customer and staff email
- use the custom Vercel cart only for UX
- add webhooks only when you are ready to maintain a backend

That keeps the initial stack simple and reliable.
