import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
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
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  // The reset email links back here with `?token=`
  const token = searchParams.get('token');

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <LanguageSwitcher className="absolute top-4 end-4 h-9 w-9" />
      <Card className="w-full max-w-md">
        {token ? <NewPasswordForm token={token} /> : <ForgotPasswordForm />}
      </Card>
    </div>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstile, setTurnstile] = useState<string | null>(null);
  // Remounts the widget, its tokens are single use
  const [captchaKey, setCaptchaKey] = useState(0);
  const { t } = useI18n();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t.reset.enterEmail);
      return;
    }
    if (!turnstile) {
      toast.error(t.common.captchaRequired);
      return;
    }
    setLoading(true);
    try {
      await api.auth.forgotPassword({ email, turnstile });
      setSent(true);
      toast.success(t.reset.sent);
    } catch (err: any) {
      toast.error(err.message || t.reset.failed);
    } finally {
      setTurnstile(null);
      setCaptchaKey((key) => key + 1);
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <LogoMark className="size-10" />
        </div>
        <CardTitle className="text-2xl">{t.reset.title}</CardTitle>
        <CardDescription>
          {sent ? t.reset.sentDescription : t.reset.description}
        </CardDescription>
      </CardHeader>
      {!sent ? (
        <form onSubmit={handleReset} className="space-y-6">
          <CardContent className="space-y-4">
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
            <Turnstile
              key={captchaKey}
              action="forgot-password"
              onToken={setTurnstile}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              {t.reset.submit}
            </Button>
            <Link to="/login" className="text-sm text-primary hover:underline">
              {t.reset.back}
            </Link>
          </CardFooter>
        </form>
      ) : (
        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            {t.reset.resend}
          </Button>
          <Link to="/login" className="text-sm text-primary hover:underline">
            {t.reset.back}
          </Link>
        </CardFooter>
      )}
    </>
  );
}

function NewPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      toast.error(t.common.fillAllFields);
      return;
    }
    if (password !== confirm) {
      toast.error(t.reset.mismatch);
      return;
    }
    setLoading(true);
    try {
      await api.auth.resetPassword({
        password,
        confirm_password: confirm,
        token,
      });
      toast.success(t.reset.updated);
      navigate('/login', { replace: true });
    } catch (err: any) {
      toast.error(err.message || t.reset.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <LogoMark className="size-10" />
        </div>
        <CardTitle className="text-2xl">{t.reset.newTitle}</CardTitle>
        <CardDescription>{t.reset.newDescription}</CardDescription>
      </CardHeader>
      <form onSubmit={handleUpdate} className="space-y-6">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t.reset.newPassword}</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">{t.reset.confirmPassword}</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Spinner className="mr-2" />}
            {t.reset.update}
          </Button>
          <Link to="/login" className="text-sm text-primary hover:underline">
            {t.reset.back}
          </Link>
        </CardFooter>
      </form>
    </>
  );
}
