import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SHORT_DOMAIN } from "@/env";

const MIN_SIZE = 128;
const MAX_SIZE = 1024;
const DEFAULTS = { size: 512, fg: "#000000", bg: "#ffffff" };

const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const [prev, setPrev] = useState(value);
  // Keep the hex text in sync when the value changes from the picker or a reset
  if (prev !== value) {
    setPrev(value);
    setText(value);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
        />
        <Input
          id={id}
          value={text}
          maxLength={7}
          className="font-mono uppercase"
          onChange={(e) => {
            const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setText(v);
            if (isHex(v)) onChange(v.toLowerCase());
          }}
          onBlur={() => setText(value)}
        />
      </div>
    </div>
  );
}

export function QrCodeDialog({
  linkKey,
  onOpenChange,
}: {
  linkKey: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [size, setSize] = useState(DEFAULTS.size);
  const [fg, setFg] = useState(DEFAULTS.fg);
  const [bg, setBg] = useState(DEFAULTS.bg);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const url = `https://${SHORT_DOMAIN}/${linkKey}`;
  const fileName = `qr-${linkKey}`;

  const save = (href: string, ext: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = `${fileName}.${ext}`;
    a.click();
  };

  const downloadPng = () => {
    if (canvasRef.current) save(canvasRef.current.toDataURL("image/png"), "png");
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const svg = svgRef.current.cloneNode(true) as SVGSVGElement;
    svg.removeAttribute("style");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    save(href, "svg");
    URL.revokeObjectURL(href);
  };

  const reset = () => {
    setSize(DEFAULTS.size);
    setFg(DEFAULTS.fg);
    setBg(DEFAULTS.bg);
  };

  return (
    <Dialog open={!!linkKey} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <DialogDescription className="truncate">
            {SHORT_DOMAIN}/{linkKey}
          </DialogDescription>
        </DialogHeader>

        {linkKey && (
          <div className="space-y-5">
            <div className="flex justify-center rounded-lg border bg-muted/30 p-4">
              <QRCodeSVG
                ref={svgRef}
                value={url}
                size={size}
                fgColor={fg}
                bgColor={bg}
                level="M"
                marginSize={2}
                className="rounded-md shadow-sm"
                style={{ width: 224, height: 224 }}
              />
              {/* Full-resolution canvas used for PNG export */}
              <QRCodeCanvas
                ref={canvasRef}
                value={url}
                size={size}
                fgColor={fg}
                bgColor={bg}
                level="M"
                marginSize={2}
                className="hidden"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Size</Label>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {size} × {size} px
                </span>
              </div>
              <Slider
                value={[size]}
                min={MIN_SIZE}
                max={MAX_SIZE}
                step={32}
                onValueChange={(v) => setSize(Array.isArray(v) ? v[0] : v)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ColorField id="qr-fg" label="Foreground" value={fg} onChange={setFg} />
              <ColorField id="qr-bg" label="Background" value={bg} onChange={setBg} />
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadSvg}>
              <Download className="mr-2 h-4 w-4" /> SVG
            </Button>
            <Button onClick={downloadPng}>
              <Download className="mr-2 h-4 w-4" /> PNG
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
