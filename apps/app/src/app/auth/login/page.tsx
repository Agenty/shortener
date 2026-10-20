import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { executeRecaptcha } = useRecaptcha();
  const { t } = useI18n();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t.common.fillAllFields);
      return;
    }
    setLoading(true);
    try {
      const recaptcha = await executeRecaptcha("login");
      if (!recaptcha) {
        toast.error(t.common.recaptchaLoading);
        return;
      }
      const user = await api.auth.signin({ email, password, recaptcha });
      if (!user.is_verified) {
        navigate("/onboarding", { replace: true, state: { email } });
        return;
      }
      toast.success(t.common.loggedIn);
      navigate("/links");
    } catch (err: any) {
      toast.error(err.message || t.login.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-muted/30">
          <LanguageSwitcher className="absolute top-4 end-4 h-9 w-9" />
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Link2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t.login.title}</CardTitle>
          <CardDescription>{t.login.description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin} className="space-y-6">
          <CardContent className="space-y-4">
            <GoogleSignInButton />
            <div className="space-y-2">
              <Label htmlFor="email">{t.common.email}</Label>
              <Input id="email" type="email" autoComplete="email" placeholder={t.common.emailPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t.login.password}</Label>
                <Link to="/reset-password" className="text-sm text-primary hover:underline">
                  {t.login.forgot}
                </Link>
              </div>
              <PasswordInput id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.login.submitting : t.login.submit}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t.login.noAccount}{" "}
              <Link to="/signup" className="text-primary hover:underline">{t.login.signup}</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
