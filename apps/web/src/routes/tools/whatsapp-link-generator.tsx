import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Check, Copy, MessageCircle } from 'lucide-react';
import { Faq } from '@/components/faq';
import { LinkBuilder } from '@/components/link-builder';
import { PageHero } from '@/components/page-hero';
import { Eyebrow, Section, Showcase } from '@/components/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { faqJsonLd, seo } from '@/lib/seo';

const faqs = [
  {
    q: 'What is a WhatsApp link?',
    a: 'A wa.me link opens a WhatsApp chat with a phone number, optionally with a message already typed. Anyone who taps it can start a chat without saving your number.',
  },
  {
    q: 'Which phone number format should I use?',
    a: 'Use the full international number with the country code and no plus sign, spaces or dashes, for example 14155550123 for a US number.',
  },
  {
    q: 'How do I track clicks on my WhatsApp link?',
    a: 'Shorten the generated link and sign in to see clicks by day, country, referrer and device. WhatsApp itself does not report link clicks.',
  },
  {
    q: 'How do I add a WhatsApp chat button to my website?',
    a: 'Add a link to your short URL, for example <a href="https://srt1.link/chat">Chat on WhatsApp</a>, and style it as a button. Every click is then counted in your analytics.',
  },
  {
    q: 'Can I turn my WhatsApp link into a QR code?',
    a: 'Yes. Paste the link into the free WhatsApp QR code generator at shortener.dev/tools/whatsapp-qr-code-generator, pick your colors and download it as PNG or SVG for flyers, packaging and shop windows.',
  },
];

export const Route = createFileRoute('/tools/whatsapp-link-generator')({
  head: () =>
    seo({
      title: 'WhatsApp link generator',
      description:
        'Generate a wa.me WhatsApp link with a prefilled message, then shorten it to share online or add to your website with click tracking.',
      path: '/tools/whatsapp-link-generator',
      jsonLd: [
        {
          '@type': 'WebApplication',
          name: 'WhatsApp link generator',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        faqJsonLd(faqs),
      ],
    }),
  component: WhatsappGenerator,
});

function WhatsappGenerator() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Hi! I have a question about your product.');
  const [copied, setCopied] = useState(false);

  const digits = phone.replace(/\D/g, '');
  const waLink = useMemo(() => {
    if (digits.length < 7) return '';
    const text = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : '';
    return `https://wa.me/${digits}${text}`;
  }, [digits, message]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(waLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied; the link is selectable
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Free tool"
        tone="green"
        title="WhatsApp link generator"
        description="Create a link that opens a WhatsApp chat with your number and a ready-to-send message. Shorten it to share anywhere and count the clicks."
      />
      <div className="container">
        <Showcase className="mt-0">
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5 shadow-lg">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="wa-phone">WhatsApp number with country code</Label>
                  <Input
                    id="wa-phone"
                    inputMode="tel"
                    placeholder="14155550123"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wa-message">Message</Label>
                  <Textarea
                    id="wa-message"
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Your WhatsApp link</Label>
                  <div className="flex items-center gap-2 rounded-xl border bg-muted/40 p-2 pl-3">
                    <MessageCircle className="size-4 shrink-0 text-brand-3" />
                    <span className="min-w-0 flex-1 truncate font-mono text-xs">
                      {waLink || 'Enter a number to generate the link'}
                    </span>
                    <Button type="button" variant="outline" size="sm" disabled={!waLink} onClick={copy}>
                      {copied ? <Check /> : <Copy />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <p className="mb-3 px-1 text-sm font-medium">Shorten it to track clicks</p>
              <LinkBuilder
                defaultUrl={waLink}
                placeholder="https://wa.me/14155550123"
                submitLabel="Shorten"
                className="shadow-lg"
              />
            </div>
          </div>
        </Showcase>
      </div>

      <Section>
        <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow tone="blue">Website button</Eyebrow>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              Add a WhatsApp chat button to your site
            </h2>
            <p className="mt-4 text-muted-foreground">
              Paste this snippet where you want the button, and replace the link with your short link.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-xl border bg-neutral-950 p-5 font-mono text-xs leading-relaxed text-neutral-200">
            <code>{`<a href="https://srt1.link/chat"
   style="display:inline-flex;align-items:center;gap:8px;
          padding:10px 16px;border-radius:999px;
          background:#25D366;color:#fff;font-weight:600;
          text-decoration:none">
  Chat on WhatsApp
</a>`}</code>
          </pre>
        </div>
      </Section>

      <Section surface>
        <Faq faqs={faqs} />
      </Section>
    </>
  );
}
