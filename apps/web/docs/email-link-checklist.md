---
title: Email link checklist, test every link before you send
nav: Email link checklist
description: A checklist for the links in an email campaign. Test each link in the delivered message, through your email tool's click tracking, on a phone and a desktop, and record what opened before you hit send.
section: Playbooks
order: 3
updated: 2026-11-17
---

A broken link in a newsletter can't be fixed after it's sent, unless the link in the email is a short link you control. This checklist covers what to set up before the send and what to test in the delivered test email.

## Give each link its own short link

Every link in the email that you want to compare gets its own short link. A typical newsletter:

| Link in the email | Short link | utm_content |
| --- | --- | --- |
| Header logo | `srt1.link/nov-news-logo` | `logo` |
| Main button | `srt1.link/nov-news-button` | `main_button` |
| Product image | `srt1.link/nov-news-image` | `product_image` |
| Text link in the second paragraph | `srt1.link/nov-news-text` | `text_link` |
| Footer link | `srt1.link/nov-news-footer` | `footer` |

Set `utm_source` to the newsletter name, `utm_medium=email` and the same `utm_campaign` on all of them in the **UTM Builder**. `utm_medium=email` is the value GA4 needs to file the visits under Email. See [UTM naming convention](/docs/utm-naming-convention).

Group the links in a [project](/docs/projects) per send, so you can see the campaign total and each link next to each other.

Because the links point to Shortener.dev, you can still [change where a link goes](/docs/edit-short-link) after sending. If a page breaks the day after the send, fix the short link and every copy of the email follows. Don't link to the destination directly if you want that safety net.

## Before you send the test

- Every short link opens the right page when you click it in the dashboard.
- Every destination is on a [verified domain](/docs/verify-domain) or a whitelisted site.
- No link has an [expiration date](/docs/link-expiration) before the campaign is over, and no link has a [password](/docs/password-protected-links) by mistake.
- The UTM values match the convention, all lowercase.
- Links with an end date, such as a sale page, have a plan for what happens after the end.

## Test the delivered email

Send a test to yourself and test from the received message, not from the editor preview. Email tools wrap every link in their own click tracking redirect when the message is sent, and that redirect is what recipients click.

For each link:

1. Click it in the test email on a desktop mail client.
2. Check that it goes through the email tool's redirect, then the Shortener.dev redirect page that names the destination, then the right page.
3. Check the address bar on the final page shows your UTM parameters.
4. Repeat on a phone, in the mail app your audience uses most.

Write the result next to each link:

| Short link | Desktop | Phone | Page correct | UTM in address bar | Checked by |
| --- | --- | --- | --- | --- | --- |
| `srt1.link/nov-news-button` | Opens | Opens | Yes | Yes | Ana |
| `srt1.link/nov-news-footer` | Opens | Opens | Old page | Yes | Ana |

Fix the "Old page" rows and test them again.

## Your test clicks count

Every click you make while testing is counted in [click analytics](/docs/click-analytics). Note how many test clicks each link got, or test before the campaign starts and compare totals from the send time onwards.

## After the send

In the first minutes after a send, expect a burst of clicks on every link at once. That's usually email security scanners at your recipients' companies opening the links to check them, not people. See [Bot clicks and link previews](/docs/bot-clicks-link-previews) for how to spot them.

After a few days, compare the links in **Analytics** by filtering to the campaign's project. **Top Links** shows which position in the email got the most clicks. Your email tool's click report will be close but not identical, because it counts at its own redirect. See [How to measure click-through rate](/docs/link-click-through-rate) for calculating rates from both.

## Frequently asked questions

### Will my email tool's click tracking break the short link?

No. The email tool wraps the short link in its own redirect, which then opens the short link, which opens your page. Both tools count the click.

### Can I fix a wrong link after the email is sent?

Yes, if the email contains a short link. [Edit the short link](/docs/edit-short-link) and change its destination, and everyone who clicks from then on gets the new page.

### Do short links hurt email deliverability?

Links on shared short domains can raise a spam filter's suspicion, especially when the rest of the email has few other signals. Test with your email tool's spam check and send to a few mailboxes at different providers before a large send.
