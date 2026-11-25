import { useId, useRef, useState } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { BarChart3, Download, RotateCcw, TriangleAlert, X } from 'lucide-react';
import { LinkBuilder, normalizeUrl } from '@/components/link-builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { qrTools } from '@/data/qr-tools';
import { cn } from '@/lib/utils';

const MIN_SIZE = 128;
const MAX_SIZE = 2048;
const DEFAULTS = { size: 1024, fg: '#000000', bg: '#ffffff' };
/** Dark modules on a light background, in brand-ish tones that still scan well */
const SWATCHES = ['#000000', '#1e3a8a', '#065f46', '#7c2d12', '#581c87', '#be123c'];

const isHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);

/** WCAG contrast ratio between two #rrggbb colors */
const contrast = (a: string, b: string) => {
  const luminance = (hex: string) => {
    const [r, g, b] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const [text, setText] = useState(value);
  const [prev, setPrev] = useState(value);
  // Follow the picker, swatches and reset
  if (prev !== value) {
    setPrev(value);
    setText(value);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          id={id}
          value={text}
          maxLength={7}
          className="font-mono uppercase"
          onChange={(event) => {
            const next = event.target.value.startsWith('#') ? event.target.value : `#${event.target.value}`;
            setText(next);
            if (isHex(next)) onChange(next.toLowerCase());
          }}
          onBlur={() => setText(value)}
        />
      </div>
    </div>
  );
}

/**
 * QR code generator used by every `/tools/*-qr-code-generator` page. The
 * shortener below it swaps the encoded URL for the new short link, so the
 * printed code can be tracked and redirected later.
 */
export function QrGenerator({
  defaultUrl,
  placeholder,
  currentSlug,
}: {
  defaultUrl: string;
  placeholder?: string;
  /** Example of this page's tool is listed first */
  currentSlug?: string;
}) {
  const inputId = useId();
  const [url, setUrl] = useState(defaultUrl);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [size, setSize] = useState(DEFAULTS.size);
  const [fg, setFg] = useState(DEFAULTS.fg);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const destination = normalizeUrl(url);
  const value = shortUrl ?? destination;
  const lowContrast = contrast(fg, bg) < 4;
  const examples = [
    ...qrTools.filter((tool) => tool.slug === currentSlug),
    ...qrTools.filter((tool) => tool.slug !== currentSlug),
  ];

  const changeUrl = (next: string) => {
    setUrl(next);
    setShortUrl(null);
  };

  const save = (href: string, ext: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.download = `qr-code.${ext}`;
    a.click();
  };

  const downloadPng = () => {
    if (canvasRef.current) save(canvasRef.current.toDataURL('image/png'), 'png');
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current.cloneNode(true) as SVGSVGElement;
    svg.removeAttribute('style');
    svg.removeAttribute('class');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' });
    const href = URL.createObjectURL(blob);
    save(href, 'svg');
    URL.revokeObjectURL(href);
  };

  const reset = () => {
    setSize(DEFAULTS.size);
    setFg(DEFAULTS.fg);
    setBg(DEFAULTS.bg);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
        <div className="grid content-start gap-5 rounded-2xl border bg-card p-5 shadow-lg">
          <div className="grid gap-2">
            <Label htmlFor={inputId}>Link to encode</Label>
            <div className="relative">
              <Input
                id={inputId}
                type="url"
                inputMode="url"
                placeholder={placeholder}
                value={url}
                onChange={(event) => changeUrl(event.target.value)}
                className="pr-9"
              />
              {url && (
                <button
                  type="button"
                  aria-label="Clear"
                  onClick={() => changeUrl('')}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((tool) => (
                <button
                  key={tool.slug}
                  type="button"
                  onClick={() => changeUrl(tool.example)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors hover:border-foreground/30',
                    destination === tool.example && 'border-foreground/40 bg-muted'
                  )}
                >
                  <tool.icon className="size-3.5 text-muted-foreground" />
                  {tool.name === 'URL' ? 'Website' : tool.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${inputId}-size`}>Size</Label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {size} × {size} px
              </span>
            </div>
            <input
              id={`${inputId}-size`}
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              step={64}
              value={size}
              onChange={(event) => setSize(Number(event.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField label="Foreground" value={fg} onChange={setFg} />
            <ColorField label="Background" value={bg} onChange={setBg} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {SWATCHES.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Foreground ${color}`}
                onClick={() => setFg(color)}
                className={cn(
                  'size-6 rounded-full border-2 border-background ring-1 ring-border transition-transform hover:scale-110',
                  fg === color && 'ring-2 ring-foreground'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
            <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={reset}>
              <RotateCcw /> Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-5 shadow-lg">
          <div className="flex w-full flex-1 items-center justify-center rounded-xl border bg-muted/30 p-6">
            {value ? (
              <QRCodeSVG
                ref={svgRef}
                value={value}
                size={size}
                fgColor={fg}
                bgColor={bg}
                level="M"
                marginSize={2}
                title={`QR code for ${value}`}
                className="h-auto w-full max-w-64 rounded-md shadow-sm"
              />
            ) : (
              <p className="py-24 text-center text-sm text-muted-foreground">Enter a link to see the QR code</p>
            )}
            {value && (
              <QRCodeCanvas
                ref={canvasRef}
                value={value}
                size={size}
                fgColor={fg}
                bgColor={bg}
                level="M"
                marginSize={2}
                className="hidden"
              />
            )}
          </div>

          {value && (
            <p className="w-full truncate text-center font-mono text-xs text-muted-foreground" title={value}>
              {value}
            </p>
          )}
          {lowContrast && (
            <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <TriangleAlert className="size-3.5 shrink-0" />
              Low contrast. Some phones may not scan this code.
            </p>
          )}
          {shortUrl && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <BarChart3 className="size-3.5 shrink-0" />
              Encodes your short link, so scans are counted.
            </p>
          )}

          <div className="grid w-full grid-cols-2 gap-2">
            <Button type="button" variant="outline" disabled={!value} onClick={downloadSvg}>
              <Download /> SVG
            </Button>
            <Button type="button" disabled={!value} onClick={downloadPng}>
              <Download /> PNG
            </Button>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 px-1 text-sm font-medium">
          Shorten it to track scans and change the destination later
        </p>
        <LinkBuilder
          defaultUrl={destination}
          placeholder={placeholder}
          submitLabel="Shorten"
          className="shadow-lg"
          onCreated={(link) => setShortUrl(link.short_url)}
        />
      </div>
    </div>
  );
}
