import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type AuthUser, setAuth } from '@/lib/auth';
import { API_URL } from '@/lib/site';

export interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful email code sign in */
  onSuccess?: (auth: AuthUser) => void;
  /** Called right before leaving the page for Google, e.g. to remember a pending URL */
  onBeforeRedirect?: () => void;
  title?: string;
  description?: string;
  /** Where Google should send the visitor back after consent. Defaults to the current URL */
  returnTo?: string;
}

const postJson = async (path: string, body: unknown, token?: string) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(res.status === 429 ? 'Too many attempts. Wait a minute and try again.' : data.message);
  }
  return data;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"
      />
    </svg>
  );
}

export function LoginDialog({
  open,
  onOpenChange,
  onSuccess,
  onBeforeRedirect,
  title = 'Sign in or create an account',
  description = 'Continue with Google, or get a one-time code by email.',
  returnTo,
}: LoginDialogProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep('email');
      setEmail('');
      setOtp('');
      setTempToken('');
      setError(null);
    }
  }, [open]);

  const handleGoogle = () => {
    onBeforeRedirect?.();
    const url = new URL(`${API_URL}/oauth/google`);
    url.searchParams.set('reason', 'consent');
    url.searchParams.set('redirect_uri', returnTo ?? window.location.href);
    window.location.href = url.toString();
  };

  const handleSendOtp = async () => {
    setError(null);
    if (!email || !email.includes('@')) {
      setError('Enter a valid email address');
      return;
    }
    try {
      setIsSendingOtp(true);
      const data = await postJson('/auth/identify', { email });
      setTempToken(data.token);
      setStep('otp');
    } catch (err) {
      setError((err as Error).message || 'Could not send the code');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (otp.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    try {
      setIsVerifyingOtp(true);
      const data = await postJson('/auth/verify', { code: otp }, tempToken);
      const auth: AuthUser = { token: data.token, name: data.name, email: data.email, avatar: data.avatar };
      setAuth(auth);
      onOpenChange(false);
      onSuccess?.(auth);
    } catch (err) {
      setError((err as Error).message || 'Invalid code');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const errorText = error && (
    <p role="alert" className="text-sm text-destructive">
      {error}
    </p>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'email' ? (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Button variant="outline" className="w-full" onClick={handleGoogle} type="button">
                <GoogleIcon />
                Continue with Google
              </Button>

              <div className="relative text-center">
                <span className="absolute inset-x-0 top-1/2 border-t" />
                <span className="relative bg-popover px-2 text-xs tracking-wide text-muted-foreground uppercase">
                  or
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                />
              </div>
              {errorText}
              <Button onClick={handleSendOtp} disabled={isSendingOtp} className="w-full">
                {isSendingOtp ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Continue with email'
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enter verification code</DialogTitle>
              <DialogDescription>We sent a 6-digit code to {email}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="login-otp">Verification code</Label>
                <Input
                  id="login-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                />
              </div>
              {errorText}
              <Button onClick={handleVerifyOtp} disabled={isVerifyingOtp} className="w-full">
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify & continue'
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setError(null);
                  setOtp('');
                  setStep('email');
                }}
              >
                Use a different email
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
