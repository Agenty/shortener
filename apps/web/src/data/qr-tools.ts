import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Camera,
  ClipboardList,
  MapPin,
  MessageCircle,
  QrCode,
  Star,
  TvMinimalPlay,
} from 'lucide-react';
import type { Faq } from './tools';

/** A QR code generator page, generic or for one kind of link such as Google Maps */
export type QrTool = {
  slug: string;
  /** Short name used in chips and headings, e.g. "Google Maps" */
  name: string;
  domain?: string;
  icon: LucideIcon;
  title: string;
  description: string;
  headline: string;
  subhead: string;
  placeholder: string;
  /** Encoded in the preview before the visitor types anything */
  example: string;
  uses: Array<{ title: string; body: string }>;
  faqs: Faq[];
};

const commonFaqs = (name: string): Faq[] => [
  {
    q: `Is the ${name} QR code generator free?`,
    a: 'Yes. Make as many QR codes as you like and download them as PNG or SVG. There is no sign-up, watermark or scan limit on the code itself.',
  },
  {
    q: 'Do these QR codes expire?',
    a: 'No. A QR code is just the link drawn as a pattern, so it works as long as the link it points to works. If you encode a short link, it keeps working as long as the short link is enabled.',
  },
  {
    q: 'Can I change where the QR code points after printing?',
    a: 'Only if it encodes a short link. Shorten the URL with the form on this page, download the QR code of the short link, and you can later change the destination or see the scans in your dashboard without reprinting.',
  },
  {
    q: 'PNG or SVG, which should I download?',
    a: 'Use PNG for websites, slides and messages. Use SVG for print, such as flyers, packaging and banners, because it stays sharp at any size.',
  },
];

export const qrTools: QrTool[] = [
  {
    slug: 'qr-code-generator',
    name: 'URL',
    icon: QrCode,
    title: 'Free QR code generator',
    description:
      'Free QR code generator for any link. Pick the size and colors, download as PNG or SVG, and use a short link to track scans and edit the destination later.',
    headline: 'Free QR code generator',
    subhead:
      'Turn any link into a QR code with your own colors and size. Download it as PNG or SVG, or encode a short link to count the scans.',
    placeholder: 'https://example.com/menu',
    example: 'https://shortener.dev',
    uses: [
      {
        title: 'Menus and flyers',
        body: 'Point a printed QR code to your menu, price list or event page so people can open it on their phone.',
      },
      {
        title: 'Packaging and labels',
        body: 'Link a product box to the manual, a setup video or the page where customers register their purchase.',
      },
      {
        title: 'Slides and business cards',
        body: 'Let an audience scan your slides, your profile or a sign-up form instead of typing a URL.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between a static and a dynamic QR code?',
        a: 'A static QR code holds the final URL, so it can never change. A dynamic QR code holds a short link, so you can change the destination and count the scans after it is printed. Shorten your link on this page to get a dynamic QR code.',
      },
      ...commonFaqs('QR code'),
    ],
  },
  {
    slug: 'google-maps-qr-code-generator',
    name: 'Google Maps',
    domain: 'google.com',
    icon: MapPin,
    title: 'Google Maps QR code generator',
    description:
      'Create a QR code for a Google Maps location so customers can get directions to your shop, office or event venue in one scan. Free PNG and SVG download.',
    headline: 'Google Maps QR code generator',
    subhead:
      'Make a QR code that opens your shop, office or venue in Google Maps, so visitors get directions with one scan.',
    placeholder: 'https://maps.google.com/?q=Your+Shop,+City',
    example: 'https://maps.google.com/?q=Eiffel+Tower,+Paris',
    uses: [
      {
        title: 'Directions on invitations',
        body: 'Print the venue QR code on wedding cards, event tickets and posters so guests open the route on their phone.',
      },
      {
        title: 'Store windows and receipts',
        body: 'Help customers find your other branches or save your location for their next visit.',
      },
      {
        title: 'Deliveries and pickups',
        body: 'Add a location QR code to order confirmations, so couriers and customers land on the exact gate or entrance.',
      },
    ],
    faqs: [
      {
        q: 'How do I get the Google Maps link for my location?',
        a: 'Open Google Maps, search for the place or drop a pin, select Share and then Copy link. Paste that link into the generator. To shorten it and count scans, use a maps.google.com link instead, such as maps.google.com/?q=Your+Shop,+City.',
      },
      {
        q: 'Will the QR code open the Google Maps app?',
        a: 'Yes. On phones with Google Maps installed, the link opens in the app with the place and the Directions button. Otherwise it opens Google Maps in the browser.',
      },
      ...commonFaqs('Google Maps'),
    ],
  },
  {
    slug: 'google-review-qr-code-generator',
    name: 'Google review',
    domain: 'google.com',
    icon: Star,
    title: 'Google review QR code generator',
    description:
      'Get more Google reviews with a QR code that opens your review form. Print it on tables, receipts and counters. Free PNG and SVG download.',
    headline: 'Google review QR code generator',
    subhead:
      'A QR code that opens the Google review box for your business, so happy customers can rate you before they leave.',
    placeholder: 'https://g.page/r/.../review',
    example: 'https://search.google.com/local/writereview?placeid=ChIJLU7jZClu5kcR4PcOOO6p3I0',
    uses: [
      {
        title: 'Counters and tables',
        body: 'Place a small stand with the QR code at checkout or on each table, where customers already have their phone out.',
      },
      {
        title: 'Receipts and invoices',
        body: 'Add the review QR code to printed receipts and PDF invoices to ask for feedback after the sale.',
      },
      {
        title: 'Thank-you cards and emails',
        body: 'Include the code in a thank-you card or follow-up email, where customers can leave a review in one tap.',
      },
    ],
    faqs: [
      {
        q: 'How do I find my Google review link?',
        a: 'Open your Business Profile on Google, select Ask for reviews or Get more reviews, and copy the link. It looks like g.page/r/xxxx/review. You can also build it from your place ID: search.google.com/local/writereview?placeid=YOUR_PLACE_ID.',
      },
      {
        q: 'Is it allowed to ask for Google reviews with a QR code?',
        a: 'Yes, asking for reviews is allowed. Google does not allow offering discounts or gifts in exchange for reviews, so keep the request neutral.',
      },
      ...commonFaqs('Google review'),
    ],
  },
  {
    slug: 'whatsapp-qr-code-generator',
    name: 'WhatsApp',
    domain: 'whatsapp.com',
    icon: MessageCircle,
    title: 'WhatsApp QR code generator',
    description:
      'Create a WhatsApp QR code that opens a chat with your number and a prefilled message. Free PNG and SVG download for shops, ads and packaging.',
    headline: 'WhatsApp QR code generator',
    subhead:
      'A QR code that opens a WhatsApp chat with your business, with the first message already typed.',
    placeholder: 'https://wa.me/14155550123',
    example: 'https://wa.me/14155550123?text=Hi!%20I%20have%20a%20question',
    uses: [
      {
        title: 'Orders and bookings',
        body: 'Let customers order, book a table or ask for a quote by scanning a code on a flyer or shop window.',
      },
      {
        title: 'Support on packaging',
        body: 'Print the code on the box or manual so buyers reach your support chat without saving your number.',
      },
      {
        title: 'Prefilled message',
        body: 'Add text such as "Hi, I saw your ad" to know where each chat came from.',
      },
    ],
    faqs: [
      {
        q: 'How do I make a WhatsApp link for the QR code?',
        a: 'Use wa.me followed by your full number with the country code and no plus sign, for example wa.me/14155550123. Use the WhatsApp link generator on Shortener.dev to add a prefilled message.',
      },
      ...commonFaqs('WhatsApp'),
    ],
  },
  {
    slug: 'youtube-qr-code-generator',
    name: 'YouTube',
    domain: 'youtube.com',
    icon: TvMinimalPlay,
    title: 'YouTube QR code generator',
    description:
      'Make a QR code for a YouTube video, Short or channel. Put it on packaging, slides and print, and track scans with a short link. Free PNG and SVG.',
    headline: 'YouTube QR code generator',
    subhead:
      'A QR code that plays your video or opens your channel, for packaging, classrooms, slides and print ads.',
    placeholder: 'https://www.youtube.com/watch?v=...',
    example: 'https://www.youtube.com/@cloudflare',
    uses: [
      {
        title: 'How-to videos on products',
        body: 'Print the code on a box or manual to open the setup or recipe video in the YouTube app.',
      },
      {
        title: 'Classrooms and talks',
        body: 'Share a lesson or demo video with the room by showing the QR code on a slide.',
      },
      {
        title: 'Grow your channel offline',
        body: 'Put your channel QR code on merch, posters and business cards.',
      },
    ],
    faqs: commonFaqs('YouTube'),
  },
  {
    slug: 'instagram-qr-code-generator',
    name: 'Instagram',
    domain: 'instagram.com',
    icon: Camera,
    title: 'Instagram QR code generator',
    description:
      'Create a QR code for your Instagram profile, post or reel in your brand colors. Download PNG or SVG and track scans with a short link.',
    headline: 'Instagram QR code generator',
    subhead:
      'A QR code in your brand colors that opens your Instagram profile, post or reel, for shops, events and print.',
    placeholder: 'https://www.instagram.com/your-profile/',
    example: 'https://www.instagram.com/cloudflare/',
    uses: [
      {
        title: 'Followers from your shop',
        body: 'Put the code at the counter or on bags so customers follow you while they wait.',
      },
      {
        title: 'Events and pop-ups',
        body: 'Show the code on a banner so visitors can tag you and find the event posts.',
      },
      {
        title: 'Know which print works',
        body: 'Encode a different short link on each flyer to see which one brings the most scans.',
      },
    ],
    faqs: commonFaqs('Instagram'),
  },
  {
    slug: 'google-form-qr-code-generator',
    name: 'Google Form',
    domain: 'docs.google.com',
    icon: ClipboardList,
    title: 'Google Form QR code generator',
    description:
      'Create a QR code for a Google Form, survey or sign-up sheet. People scan and fill it on their phone. Free PNG and SVG download.',
    headline: 'Google Form QR code generator',
    subhead:
      'A QR code that opens your Google Form, survey or quiz, for posters, classrooms, events and feedback stands.',
    placeholder: 'https://docs.google.com/forms/d/e/.../viewform',
    example: 'https://docs.google.com/forms/d/e/1FAIpQL/viewform',
    uses: [
      {
        title: 'Event sign-ups',
        body: 'Collect registrations and attendance from a poster or an entrance stand.',
      },
      {
        title: 'Feedback and surveys',
        body: 'Ask for feedback at the end of a class, a talk or a stay, while the experience is fresh.',
      },
      {
        title: 'Close the form on time',
        body: 'Encode a short link with an expiration date so the code stops working after the deadline.',
      },
    ],
    faqs: commonFaqs('Google Form'),
  },
  {
    slug: 'linkedin-qr-code-generator',
    name: 'LinkedIn',
    domain: 'linkedin.com',
    icon: Briefcase,
    title: 'LinkedIn QR code generator',
    description:
      'Make a QR code for your LinkedIn profile or company page, for business cards, resumes, name badges and booths. Free PNG and SVG download.',
    headline: 'LinkedIn QR code generator',
    subhead:
      'A QR code that opens your LinkedIn profile or company page, so new contacts can connect on the spot.',
    placeholder: 'https://www.linkedin.com/in/your-name/',
    example: 'https://www.linkedin.com/in/vikashrathee/',
    uses: [
      {
        title: 'Business cards and badges',
        body: 'Let people connect at a conference by scanning your card or badge.',
      },
      {
        title: 'Resumes',
        body: 'Add a small QR code to a printed resume so recruiters can open your profile.',
      },
      {
        title: 'Booths and job fairs',
        body: 'Point candidates to your company page or open roles from a banner.',
      },
    ],
    faqs: commonFaqs('LinkedIn'),
  },
];

export const getQrTool = (slug: string) => qrTools.find((tool) => tool.slug === slug);
