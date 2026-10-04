import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { name: string }) => api.apikeys.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apikeys"] });
      toast.success("API key created!");
      setOpen(false);
      setKeyName("");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> Create Key
        </Button>
      </DialogTrigger>
      <DialogContent>
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
