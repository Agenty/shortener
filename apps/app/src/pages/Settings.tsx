import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function Settings() {
  // ─── Profile ──────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.profile.get(),
  });

  const [name, setName] = useState("");

  useEffect(() => {
    if (profile) setName(profile.name);
  }, [profile]);

  const queryClient = useQueryClient();

  const profileMutation = useMutation({
    mutationFn: (data: { name: string }) => api.profile.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ─── Account / Billing ───────────────────────────
  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ["account"],
    queryFn: () => api.accounts.get(),
  });

  const [billing, setBilling] = useState({
    billing_name: "",
    billing_address: "",
    tax_name: "GST",
    tax_number: "",
  });

  useEffect(() => {
    if (account) {
      setBilling({
        billing_name: account.billing_name || "",
        billing_address: account.billing_address || "",
        tax_name: account.tax_name || "GST",
        tax_number: account.tax_number || "",
      });
    }
  }, [account]);

  const accountMutation = useMutation({
    mutationFn: (data: typeof billing) => api.accounts.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Billing address updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ─── Delete Account ──────────────────────────────
  const [confirmation, setConfirmation] = useState("");

  const handleDelete = () => {
    if (confirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    toast.success("Account deletion requested");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="opacity-60"
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => profileMutation.mutate({ name })}
            disabled={profileMutation.isPending || !name.trim()}
          >
            {profileMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Billing Address Card */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
          <CardDescription>
            Used for invoices and tax purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accountLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="billingName">Billing Name</Label>
                <Input
                  id="billingName"
                  value={billing.billing_name}
                  onChange={(e) =>
                    setBilling((b) => ({ ...b, billing_name: e.target.value }))
                  }
                  placeholder="Company or individual name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  value={billing.billing_address}
                  onChange={(e) =>
                    setBilling((b) => ({
                      ...b,
                      billing_address: e.target.value,
                    }))
                  }
                  placeholder="Street, City, Country"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="taxName">Tax Type</Label>
                  <Select
                    value={billing.tax_name}
                    onValueChange={(v) =>
                      v && setBilling((b) => ({ ...b, tax_name: v }))
                    }
                  >
                    <SelectTrigger id="taxName">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GST">GST</SelectItem>
                      <SelectItem value="VAT">VAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Tax Number</Label>
                  <Input
                    id="taxNumber"
                    value={billing.tax_number}
                    onChange={(e) =>
                      setBilling((b) => ({ ...b, tax_number: e.target.value }))
                    }
                    placeholder="e.g. 22AAAAA0000A1Z5"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => accountMutation.mutate(billing)}
            disabled={accountMutation.isPending}
          >
            {accountMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Billing Info
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Account Card */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Delete Account</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>
              Type <span className="font-mono font-bold">DELETE</span> to
              confirm
            </Label>
            <Input
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          <Button
            variant="destructive"
            disabled={confirmation !== "DELETE"}
            onClick={handleDelete}
          >
            Delete My Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
