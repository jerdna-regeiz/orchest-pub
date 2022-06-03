(notifications)=

# Notifications

You can receive notifications when specific events happen in Orchest,
for example to receive an alert when a job fails.
The way to do this is by using webhooks:
whenever any of these events triggers,
Orchest will send an HTTP request to an endpoint of your choosing
with a specific payload you can process on your end.

To create a webhook, first go to the {ref}`Orchest settings <orchest settings>`,
then click the "Notification settings button".

The webhook creation dialog will ask you some essential information, namely:

Webhook URL
: The URL Orchest will send the HTTP requests to.
You can verify its correctness by clicking the "Test" button.

Content type
: Either `application/json` or `application/x-www-form-urlencoded`
(default of `application/json`).

Webhook name (optional)
: A custom name for your webhook.

Secret
: A secret string that you can use to verify the origin of the request
(see {ref}`below <secure webhook>`).

The webhook will contain a payload with information about the triggered event
and a series of headers.
This is an example payload:

```json
{
  "delivered_for": {
    "name": "Test webhook",
    "verify_ssl": false,
    "content_type": "application/json",
    "uuid": "a1edb89c-1cfb-4086-8f75-ab073612c5bf",
    "type": "webhook"
  },
  "event": {
    "type": "ping",
    "uuid": "08bd2a31-9b17-4d1b-83ba-b4538a970dee",
    "timestamp": "2022-06-02 16:12:25.242592+00:00"
  }
}
```

(You can read [the source code of the webhook schema]).

[the source code of the webhook schema]: https://github.com/orchest/orchest/blob/v2022.06.2/services/orchest-api/app/app/schema.py#L885-L905

(secure webhook)=

## Verifying the webhook

The HTTP request of the webhook will contain a few additional headers
that you can use to verify that the webhook is coming from Orchest.

`X-Orchest-Event`
: The event type.

`X-Orchest-Delivery`
: UUID of the delivery.

`X-Hub-Signature`
: SHA-256 HMAC digest of the payload.

This is some sample code that verifies that the signature of the payload
is the same as the one expected from the webhook secret you specified:

```python
import hashlib
import hmac
import os


def verify_signature(payload, request_headers):
    """
    Verify that the signature of payload is the same
    as the one expected from the stored webhook secret.
    """
    if not isinstance(body, bytes):
        body = body.encode("utf-8")
    digest = hmac.new(
        os.environ["WEBHOOK_SECRET"].encode("utf-8"),
        body,
        hashlib.sha256
    )
    expected_signature = digest.hexdigest()

    return hmac.compare_digest(
        request_headers["X-Hub-Signature"].encode(),
        expected_signature.encode(),
    )
```