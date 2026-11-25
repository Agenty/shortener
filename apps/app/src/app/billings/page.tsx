import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { ArrowRight, Check, CreditCard, Gift, Loader2, Wallet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthUser } from "@/hooks/use-auth-user";
import { enterprise, lifetime, plans } from "./data";

type Gateway = "Stripe" | "Paypal";

/** Stripe checkout is paused for now, set to true to offer card payments again */
const STRIPE_ENABLED = false;

export default function Billings() {
  const { user } = useAuthUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pending, setPending] = useState<string | null>(null);
  const [gateway, setGateway] = useState<Gateway>(STRIPE_ENABLED ? "Stripe" : "Paypal");
  const currentPlan = user?.plan || "Free";

  // Stripe and PayPal redirect back with `?return=success|error`
  useEffect(() => {
    const result = searchParams.get("return");
    if (!result) return;
    if (result === "success") {
      toast.success("Payment received, your plan will be updated in a minute");
    } else {
      toast.error("Checkout was cancelled, your plan has not changed");
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const checkout = async (plan: string, price: number) => {
    setPending(plan);
    try {
      const { url } = await api.subscription.checkout({ plan, price, gateway });
      window.location.href = url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to start checkout");
      setPending(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
          <p className="text-muted-foreground">
            You're on the <span className="font-medium text-foreground">{currentPlan}</span> plan
          </p>
        </div>
        {STRIPE_ENABLED && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pay with</span>
            <ToggleGroup
              value={[gateway]}
              onValueChange={(v) => v[0] && setGateway(v[0] as Gateway)}
              variant="outline"
              size="sm"
              spacing={0}
              disabled={!!pending}
            >
              <ToggleGroupItem value="Stripe" aria-label="Pay with card">
                <CreditCard className="h-4 w-4" />
                Card
              </ToggleGroupItem>
              <ToggleGroupItem value="Paypal" aria-label="Pay with PayPal">
                <Wallet className="h-4 w-4" />
                PayPal
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrent = plan.name === currentPlan;
          return (
            <Card key={plan.name} className={`flex flex-col ${plan.popular ? "border-primary shadow-md" : ""}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrent ? (
                    <Badge variant="secondary">Current</Badge>
                  ) : (
                    plan.popular && <Badge>Popular</Badge>
                  )}
                </div>
                <CardDescription>{plan.tagline}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">{plan.period ?? " forever"}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-1 border-y py-3 text-sm">
                  <p className="font-medium">{plan.links}</p>
                  <p className="text-muted-foreground">{plan.analytics}</p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.price > 0 && (
                  <Button
                    className="w-full"
                    variant={plan.popular && !isCurrent ? "default" : "outline"}
                    disabled={isCurrent || !!pending}
                    onClick={() => checkout(plan.name, plan.price)}
                  >
                    {pending === plan.name && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isCurrent ? "Current Plan" : `Choose ${plan.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Card className="border-orange-200 dark:border-orange-900/60">
        <CardContent className="flex flex-col gap-4 pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
              <Gift className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">Get Pro for life. Pay ${lifetime.price} once.</p>
              <p className="text-sm text-muted-foreground">
                Every Pro feature with {lifetime.links}. No subscription, ever.
              </p>
            </div>
          </div>
          <Button
            disabled={!!pending || currentPlan !== "Free"}
            onClick={() => checkout(lifetime.name, lifetime.price)}
          >
            {pending === lifetime.name && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Claim lifetime deal
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{enterprise.name}</CardTitle>
            {currentPlan === enterprise.name && <Badge variant="secondary">Current</Badge>}
          </div>
          <CardDescription>{enterprise.tagline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <ul className="grid gap-2 sm:grid-cols-2">
            {enterprise.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <a
            href={enterprise.href}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Talk to us <ArrowRight className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
