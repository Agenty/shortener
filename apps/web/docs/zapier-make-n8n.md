---
title: Create short links with Zapier, Make or n8n
nav: Zapier, Make and n8n
description: Shorten URLs automatically in Zapier, Make or n8n with an HTTP request to the Shortener.dev API, for new blog posts, form entries, products or CRM records.
section: Integrations
order: 2
updated: 2026-11-14
---

Shortener.dev doesn't have its own Zapier, Make or n8n app yet, but all three tools can send an HTTP request, and creating a short link is a single request. Use it to shorten the URL of every new blog post, Shopify product, form submission or CRM deal, then pass the short link to the next step, such as a Slack message, a social post or a spreadsheet row.

You need an [API key](/docs/api-keys), which is included on paid plans. Create a separate key for each automation tool, so you can revoke one without breaking the others.

## The request

Every tool needs the same four things:

| Setting | Value |
| --- | --- |
| Method | `POST` |
| URL | `https://api.shortener.dev/v1/links` |
| Headers | `Authorization: Bearer YOUR_API_KEY` and `Content-Type: application/json` |
| Body | JSON with the long URL, for example `{"url": "https://example.com/blog/spring-launch"}` |

Map the long URL from the trigger into `url`. You can add any other [link field](/docs/url-shortener-api#add-link-options) the same way, for example:

```json
{
  "url": "{{long URL from the trigger}}",
  "params": { "utm_source": "slack", "utm_medium": "social", "utm_campaign": "blog" },
  "project_id": 1
}
```

The response is JSON. The short link is in `short_url`, which you map into the following steps.

## Zapier

1. Add an action step and choose **Webhooks by Zapier**.
2. Pick the **Custom Request** event.
3. Set **Method** to `POST` and **URL** to `https://api.shortener.dev/v1/links`.
4. In **Data**, enter the JSON body and insert the long URL field from your trigger.
5. Add the two headers, `Authorization` with `Bearer YOUR_API_KEY` and `Content-Type` with `application/json`.
6. Test the step. The output includes `short_url`.

## Make

1. Add the **HTTP** app with the **Make a request** module.
2. Set the URL and method, add the two headers, and choose JSON as the body type.
3. Put the JSON body in the request content and map the long URL into it.
4. Turn on parsing of the response, so `short_url` is available to the next modules.

## n8n

1. Add an **HTTP Request** node.
2. Set **Method** to `POST` and **URL** to `https://api.shortener.dev/v1/links`.
3. For authentication, use a header credential with the name `Authorization` and the value `Bearer YOUR_API_KEY`. Storing it as a credential keeps the key out of the workflow JSON.
4. Send a JSON body with `url` set to an expression from the previous node, for example `{{ $json.link }}`.
5. Run the node. The output includes `short_url`.

Labels change between versions of these tools. If a field has a slightly different name in your editor, the four settings in the table above are what matter.

## Errors to handle

A failed request returns a JSON `message`. The ones you're most likely to see in an automation:

- `Domain not verified: ...` means the trigger produced a URL on a domain that isn't [verified](/docs/verify-domain) in your account. Verify the domain once and every later run works.
- `This key '...' has already been used` appears when you send a fixed `key`. Leave `key` out to get a random back-half, or build it from a unique field like a post slug.
- Status `402` means your plan's link limit for the month is reached.
- Status `429` means too many requests. The API allows 150 requests a minute, so add a delay between items in large batches.

[Why can't I shorten this URL?](/docs/cant-shorten-url) lists every error and how to fix it.
