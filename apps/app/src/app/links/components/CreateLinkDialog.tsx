import { useState, useCallback } from "react";
import { Plus, Loader2, Copy, Check, Eye, EyeOff, Trash2, Globe, Smartphone, Tablet, Calendar, Link2, Lock, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SHORT_DOMAIN } from "@/env";
import type { LinkCreatePayload, LinkFormState, UrlMeta, GeoTarget } from "@/types/link";
import { initialLinkForm } from "@/types/link";

export function CreateLinkDialog() {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState<LinkFormState>({ ...initialLinkForm, params: { ...initialLinkForm.params }, geo: [] });
  const [meta, setMeta] = useState<{ data: UrlMeta | null; loading: boolean }>({ data: null, loading: false });
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const updateLink = <K extends keyof LinkFormState>(field: K, value: LinkFormState[K]) => {
    setLink((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setLink({ ...initialLinkForm, params: { ...initialLinkForm.params }, geo: [] });
    setMeta({ data: null, loading: false });
  };

  const mutation = useMutation({
    mutationFn: (data: LinkCreatePayload) => api.links.create(data),
    onSuccess: (created) => {
      toast.success("Short link created successfully!", {
        description: created.short_url,
        action: {
          label: "Copy",
          onClick: () => navigator.clipboard.writeText(created.short_url),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["links"] });
      setOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create link");
    },
  });

  const fetchMeta = useCallback(async (targetUrl: string) => {
    if (!targetUrl) return;
    setMeta((prev) => ({ ...prev, loading: true }));
    try {
      const data = await api.meta.fetch(targetUrl);
      setMeta({ data, loading: false });
    } catch {
      setMeta({ data: null, loading: false });
    }
  }, []);

  const handleUrlBlur = () => {
    if (link.url) fetchMeta(link.url);
  };

  const handleCreate = () => {
    if (!link.url) { toast.error("Please enter a URL"); return; }
    const filteredParams = Object.fromEntries(
      Object.entries(link.params).filter(([, v]) => v)
    ) as Record<string, string>;
    const payload: LinkCreatePayload = {
      url: link.url,
      ...(link.key ? { key: link.key } : {}),
      ...(link.expire_at ? { expire_at: new Date(link.expire_at).toISOString() } : {}),
      ...(link.password ? { password: link.password } : {}),
      ...(link.title ? { title: link.title } : {}),
      ...(link.description ? { description: link.description } : {}),
      ...(link.image ? { image: link.image } : {}),
      ...(link.ios ? { ios: link.ios } : {}),
      ...(link.android ? { android: link.android } : {}),
      ...(Object.keys(filteredParams).length > 0 ? { params: filteredParams } : {}),
      ...(link.geo.length > 0 ? { geo: link.geo } : {}),
    };
    mutation.mutate(payload);
  };

  const copyKey = () => {
    if (!link.key) return;
    navigator.clipboard.writeText(`https://${SHORT_DOMAIN}/${link.key}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateParam = (field: string, value: string) => {
    setLink((prev) => ({ ...prev, params: { ...prev.params, [field]: value } }));
  };

  const addGeo = () => setLink((prev) => ({ ...prev, geo: [...prev.geo, { country: "", url: "" }] }));
  const removeGeo = (i: number) => setLink((prev) => ({ ...prev, geo: prev.geo.filter((_, idx) => idx !== i) }));
  const updateGeo = (i: number, field: keyof GeoTarget, value: string) => {
    setLink((prev) => ({ ...prev, geo: prev.geo.map((g, idx) => (idx === i ? { ...g, [field]: value } : g)) }));
  };

  const previewTitle = link.title || meta.data?.title || "Page Title";
  const previewDesc = link.description || meta.data?.description || "Page description will appear here";
  const previewImage = link.image || meta.data?.image;
  const previewDomain = meta.data?.domain || "example.com";

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Create Link
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[90vh]">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl">Short Link Builder</DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left: Form */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4 border-r">
              {/* URL & Key */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="space-y-2">
                  <Label htmlFor="url">Original URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/very-long-url"
                    value={link.url}
                    onChange={(e) => updateLink("url", e.target.value)}
                    onBlur={handleUrlBlur}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">Short Link</Label>
                  <div className="flex items-center gap-0">
                    <span className="inline-flex items-center h-10 px-3 rounded-l-md border border-r-0 bg-muted text-sm text-muted-foreground">
                      {SHORT_DOMAIN}/
                    </span>
                    <Input
                      id="key"
                      placeholder="my-link"
                      value={link.key}
                      onChange={(e) => updateLink("key", e.target.value)}
                      className="rounded-l-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="ml-1 shrink-0"
                      disabled={!link.key}
                      onClick={copyKey}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Options Accordion */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Options</p>
                <Accordion className="rounded-lg">
                  {/* Expiration */}
                  <AccordionItem value="expiration">
                    <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/50">
                      <span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Expiration</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4">
                      <Input
                        type="datetime-local"
                        value={link.expire_at}
                        onChange={(e) => updateLink("expire_at", e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Expire the link automatically on a given date, or leave blank for no expiration.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* UTM Builder */}
                  <AccordionItem value="utm">
                    <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/50">
                      <span className="flex items-center gap-2"><Link2 className="h-4 w-4" /> UTM Builder</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4 space-y-3">
                      {[
                        { key: "ref", label: "Referral (ref)", placeholder: "shortener.dev" },
                        { key: "utm_source", label: "UTM Source", placeholder: "twitter, instagram" },
                        { key: "utm_medium", label: "UTM Medium", placeholder: "social, email" },
                        { key: "utm_campaign", label: "UTM Campaign", placeholder: "christmas_sale" },
                        { key: "utm_term", label: "UTM Term", placeholder: "red_shoes" },
                        { key: "utm_content", label: "UTM Content", placeholder: "logolink" },
                      ].map((field) => (
                        <div key={field.key} className="flex items-center gap-2">
                          <Label className="w-32 shrink-0 text-xs">{field.label}</Label>
                          <Input
                            placeholder={field.placeholder}
                            value={link.params[field.key] || ""}
                            onChange={(e) => updateParam(field.key, e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Social Preview */}
                  <AccordionItem value="social">
                    <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/50">
                      <span className="flex items-center gap-2"><Share2 className="h-4 w-4" /> Social Preview</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4 space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Title</Label>
                        <Input
                          placeholder="Custom title"
                          value={link.title}
                          onChange={(e) => updateLink("title", e.target.value)}
                          maxLength={60}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          placeholder="Custom description"
                          value={link.description}
                          onChange={(e) => updateLink("description", e.target.value)}
                          maxLength={155}
                          rows={2}
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Image URL</Label>
                        <Input
                          type="url"
                          placeholder="https://example.com/image.png"
                          value={link.image}
                          onChange={(e) => updateLink("image", e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Password */}
                  <AccordionItem value="password">
                    <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/50">
                      <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Password Protection</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4">
                      <div className="flex items-center gap-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={link.password}
                          onChange={(e) => updateLink("password", e.target.value)}
                          maxLength={32}
                          placeholder="Enter password"
                          className="h-8 text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Restrict access to your short link with a custom password.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* iOS Targeting */}
                  <AccordionItem value="ios">
                    <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/50">
                      <span className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> iOS Targeting</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4">
                      <Input
                        type="url"
                        placeholder="https://apps.apple.com/..."
                        value={link.ios}
                        onChange={(e) => updateLink("ios", e.target.value)}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Redirect iOS users to a different link, e.g., your iOS app.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Android Targeting */}
                  <AccordionItem value="android">
                    <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/50">
                      <span className="flex items-center gap-2"><Tablet className="h-4 w-4" /> Android Targeting</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4">
                      <Input
                        type="url"
                        placeholder="https://play.google.com/..."
                        value={link.android}
                        onChange={(e) => updateLink("android", e.target.value)}
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Redirect Android users to a different link, e.g., your Android app.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Geo Targeting */}
                  <AccordionItem value="geo">
                    <AccordionTrigger className="py-3 hover:no-underline hover:bg-muted/50">
                      <span className="flex items-center gap-2"><Globe className="h-4 w-4" /> Geo Targeting</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-4 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Redirect users based on their location, e.g., UK users to example.uk.
                      </p>
                      {link.geo.map((g, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            placeholder="Country code (US, UK)"
                            value={g.country}
                            onChange={(e) => updateGeo(i, "country", e.target.value)}
                            className="h-8 text-sm w-32 shrink-0"
                          />
                          <Input
                            type="url"
                            placeholder="https://..."
                            value={g.url}
                            onChange={(e) => updateGeo(i, "url", e.target.value)}
                            className="h-8 text-sm"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive"
                            onClick={() => removeGeo(i)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="link" size="sm" className="px-0" onClick={addGeo}>
                        + Add Country
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Sticky footer */}
              <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t">
                <Button className="w-full" onClick={handleCreate} disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Short Link
                </Button>
              </div>
            </div>

            {/* Right: Social Preview */}
            <div className="hidden lg:block w-[380px] overflow-y-auto px-6 pb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 mt-1">
                Social Media Preview
              </p>

              {/* Twitter/X Preview */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Twitter / X</p>
                <div className="rounded-xl overflow-hidden border">
                  {meta.loading ? (
                    <Skeleton className="w-full h-[180px]" />
                  ) : previewImage ? (
                    <img src={previewImage} alt={previewTitle} className="w-full h-[180px] object-cover" />
                  ) : (
                    <div className="w-full h-[180px] bg-muted flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Enter a URL to generate preview</p>
                    </div>
                  )}
                  {!meta.loading && link.url && (
                    <div className="absolute relative">
                      <span className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-xs text-xs px-2 py-0.5 rounded">
                        {previewDomain}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Facebook Preview */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Facebook</p>
                <div className="rounded-lg overflow-hidden border">
                  {meta.loading ? (
                    <Skeleton className="w-full h-[180px]" />
                  ) : previewImage ? (
                    <img src={previewImage} alt={previewTitle} className="w-full h-[180px] object-cover" />
                  ) : (
                    <div className="w-full h-[180px] bg-muted flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Enter a URL to generate preview</p>
                    </div>
                  )}
                  <div className="p-3 bg-muted/50">
                    {meta.loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] uppercase text-muted-foreground">{link.url ? previewDomain : "example.com"}</p>
                        <p className="text-sm font-semibold line-clamp-1">{previewTitle}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{previewDesc}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* LinkedIn Preview */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">LinkedIn</p>
                <div className="rounded-lg overflow-hidden border">
                  {meta.loading ? (
                    <Skeleton className="w-full h-[180px]" />
                  ) : previewImage ? (
                    <img src={previewImage} alt={previewTitle} className="w-full h-[180px] object-cover" />
                  ) : (
                    <div className="w-full h-[180px] bg-muted flex items-center justify-center">
                      <p className="text-xs text-muted-foreground">Enter a URL to generate preview</p>
                    </div>
                  )}
                  <div className="p-3">
                    {meta.loading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold line-clamp-1">{previewTitle}</p>
                        <p className="text-xs text-muted-foreground">{link.url ? previewDomain : "example.com"}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
