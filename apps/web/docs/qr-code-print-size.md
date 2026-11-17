---
title: QR code size for print, quiet zone and a checklist before the print run
nav: QR code print size
description: How big to print a QR code, why a short URL lets you print it smaller, how much white space to leave around it, and what to check before you approve the print run.
section: Guides
order: 11
updated: 2026-11-17
---

Print a QR code at least 2 cm (0.8 in) wide, and about one tenth of the distance people will scan it from. A code on a table tent read from 30 cm away can be 3 cm. A poster read from 2 metres needs about 20 cm. Then check that each square in the code, called a module, is still large enough to print cleanly. That depends on how much the code holds.

## Why the URL decides how small you can go

Every character in the URL adds data, and more data means more modules in the same space. These are the codes Shortener.dev produces with its default settings (error correction level M) for URLs of different lengths:

| URL in the code | Characters | Modules across |
| --- | --- | --- |
| `https://srt1.link/menu` | 22 | 25 |
| `https://srt1.link/spring-menu` | 29 | 29 |
| A product page with three UTM parameters | 100 | 41 |
| A long collection URL with five UTM parameters | 191 | 57 |

Printed 2 cm wide, the 25-module code has modules of about 0.8 mm. The 57-module code at the same width has modules of about 0.35 mm, which smudges on uncoated paper and is hard for older phone cameras to resolve.

That's the practical reason to put a short link in the code instead of the full URL. Create the short link with your UTM parameters in the [UTM Builder](/docs/utm-parameters): the parameters are added to the destination when someone scans, so they don't make the code any denser. A short back-half such as `menu` or `fall26` keeps the code at its smallest.

## Work out the size

1. Decide the scanning distance. Someone holding a flyer scans from 20 to 30 cm. A poster across a room is 2 to 3 metres.
2. Divide by 10 for the width of the code, and never go under 2 cm.
3. Count the modules across your code, or use the table above.
4. Divide the width by the module count. Aim for at least 0.5 mm per module on paper, and more for rough surfaces like cardboard, fabric or engraving.

For example, a poster scanned from 1.5 metres needs a 15 cm code. With a 29-module code, each module is about 5 mm, which prints easily on almost anything.

## Leave the quiet zone

Scanners find a code by the empty border around it, called the quiet zone. The QR standard asks for four modules of blank space on every side.

Codes downloaded from Shortener.dev include a border of two modules. When you place the code in your design, leave at least two more modules of clear space around it, and don't put text, a frame or a background pattern inside that area. A code pushed against the edge of a page or a colored box often fails to scan even though it looks complete.

## Pick the right file

- Download **SVG** for anything printed. It's a vector file, so it stays sharp at any size and your designer or printer can scale it without blurring the modules.
- Use **PNG** for screens, slides and email. Choose a size of at least 512 pixels so the code isn't upscaled.

See [Create a QR code for a short link](/docs/qr-codes) for the size and color options.

## Colors and contrast

Keep the modules dark and the background light. Light modules on a dark background are read by most current phones but fail on some older ones and some scanning apps. Brand colors work if the contrast is high: a navy or dark green on white is fine, while a mid grey on light blue is not.

Avoid printing on glossy, curved or textured surfaces without a test. Glare on laminated menus and the curve of a bottle can stop a scan at angles people naturally hold their phones.

## Print a short URL under the code

Print the short link in plain text under the code, for example `srt1.link/menu`. People who can't scan, or whose camera won't focus, can type it. Short, lowercase back-halves without easily confused characters work best. Shortener.dev back-halves are always lowercase, so `srt1.link/Menu` and `srt1.link/menu` open the same link.

## Checklist before you approve the print run

- The code was generated from the short link, not the long destination URL.
- The short link opens the right page, and its [expiration date](/docs/link-expiration), if any, is after the campaign ends.
- The code is at least 2 cm wide and about one tenth of the scanning distance.
- Modules are at least 0.5 mm on the printed piece.
- There is clear space around the code, with nothing printed inside it.
- Modules are dark on a light background with strong contrast.
- The short URL is printed under the code.
- Someone scanned a printed proof, not the screen file, with two different phones, at the real distance and angle.
- Each placement has its own short link if you want to compare them. See [How to track QR code scans](/docs/track-qr-code-scans).

## Frequently asked questions

### What is the minimum size of a QR code?

About 2 cm (0.8 in) wide for a code holding a short link, scanned from close up. Codes holding long URLs need to be bigger, because their modules are smaller at the same width.

### Does a logo in the middle of a QR code make it harder to scan?

It can. A logo covers modules, and the code relies on error correction to recover them. Shortener.dev's QR codes use level M, which recovers roughly 15% of the code. Keep any logo small, keep the three corner squares clear, and test the printed result.

### Can I change the link after the QR code is printed?

Yes, if the code holds a short link. [Edit the short link](/docs/edit-short-link) to point it at a new page, and every printed copy follows. A code that holds the destination URL directly can't be changed.
