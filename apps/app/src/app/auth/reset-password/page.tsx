import { useState } from "react";
import { Link } from "react-router";
import { LogoMark } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { t } = useI18n();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t.reset.enterEmail);
      return;
    }
    setSent(true);
    toast.success(t.reset.sent);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-muted/30">
          <LanguageSwitcher className="absolute top-4 end-4 h-9 w-9" />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <LogoMark className="size-10" />
          </div>
          <CardTitle className="text-2xl">{t.reset.title}</CardTitle>
          <CardDescription>{sent ? t.reset.sentDescription : t.reset.description}</CardDescription>
        </CardHeader>
        {!sent ? (
          <form onSubmit={handleReset} className="space-y-6">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.common.email}</Label>
                <Input id="email" type="email" autoComplete="email" placeholder={t.common.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">{t.reset.submit}</Button>
              <Link to="/login" className="text-sm text-primary hover:underline">{t.reset.back}</Link>
            </CardFooter>
          </form>
        ) : (
          <CardFooter className="flex flex-col gap-4">
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              {t.reset.resend}
            </Button>
            <Link to="/login" className="text-sm text-primary hover:underline">{t.reset.back}</Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
