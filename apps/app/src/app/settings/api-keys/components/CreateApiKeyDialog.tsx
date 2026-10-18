import { useState } from "react";
import { Plus, Loader2, Copy, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function CreateApiKeyDialog() {
  const [open, setOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  // The API returns the secret only once, so it's shown until the dialog closes
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { name: string }) => api.apikeys.create(data),
    onSuccess: (apiKey) => {
      queryClient.invalidateQueries({ queryKey: ["apikeys"] });
      toast.success("API key created!");
      setKeyName("");
      setSecret(apiKey.key ?? null);
      if (!apiKey.key) setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCreate = () => {
    if (!keyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }
    mutation.mutate({ name: keyName.trim() });
  };

  const copySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setSecret(null);
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Create Key
      </DialogTrigger>
      <DialogContent>
        {secret ? (
          <>
            <DialogHeader>
              <DialogTitle>Copy your API key</DialogTitle>
              <DialogDescription>
                This is the only time the key is shown. Store it somewhere safe, like your
                server's environment variables.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-1 py-4">
              <Input readOnly value={secret} className="font-mono text-xs" onFocus={(e) => e.target.select()} />
              <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={copySecret}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input
                  placeholder="e.g. Production"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
