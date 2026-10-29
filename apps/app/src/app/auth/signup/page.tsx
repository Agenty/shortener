import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogoMark } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Turnstile } from '@/components/Turnstile';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [turnstile, setTurnstile] = useState<string | null>(null);
  // Remounts the widget, its tokens are single use
  const [captchaKey, setCaptchaKey] = useState(0);
  const { t } = useI18n();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error(t.common.fillAllFields);
      return;
    }
    if (!turnstile) {
      toast.error(t.common.captchaRequired);
      return;
    }
    setLoading(true);
    try {
      await api.auth.signup({ name, email, password, turnstile });
      toast.success(t.signup.created);
      navigate('/onboarding', { replace: true, state: { email } });
    } catch (err: any) {
      toast.error(err.message || t.signup.failed);
      setTurnstile(null);
      setCaptchaKey((key) => key + 1);
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
            <LogoMark className="size-10" />
          </div>
          <CardTitle className="text-2xl">{t.signup.title}</CardTitle>
          <CardDescription>{t.signup.description}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup} className="space-y-6">
          <CardContent className="space-y-4">
            <GoogleSignInButton />
            <div className="space-y-2">
              <Label htmlFor="name">{t.signup.name}</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder={t.signup.namePlaceholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.common.email}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t.common.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.signup.password}</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Turnstile key={captchaKey} action="signup" onToken={setTurnstile} />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              {loading ? t.signup.submitting : t.signup.submit}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {t.signup.haveAccount}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t.signup.signin}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
