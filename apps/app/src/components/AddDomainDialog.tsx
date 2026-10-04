import { useState } from "react";
import { Plus } from "lucide-react";
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

export function AddDomainDialog() {
  const [open, setOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  const handleAdd = () => {
    if (!newDomain) {
      toast.error("Please enter a domain");
      return;
    }
    toast.success("Domain added! Please verify DNS records.");
    setOpen(false);
    setNewDomain("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Domain
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Domain</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Domain Name</Label>
            <Input
              placeholder="short.yourdomain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
            />
          </div>
          <div className="rounded-md border p-4 space-y-2">
            <p className="text-sm font-medium">DNS Configuration</p>
            <p className="text-sm text-muted-foreground">
              Add a CNAME record pointing to <code className="text-primary">cname.idm.in</code>
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add Domain</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
