import { useState } from 'react';
import { Loader2, Mail } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Domain } from '@/types/domain';

interface VerifyDomainDialogProps {
  domain: Domain | null;
  onOpenChange: (open: boolean) => void;
}

export function VerifyDomainDialog({ domain, onOpenChange }: VerifyDomainDialogProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const close = () => {
    onOpenChange(false);
    setEmail('');
    setCode('');
    setCodeSent(false);
  };

  const sendOtp = useMutation({
    mutationFn: () => api.domains.sendOtp(domain!.domain_id, email),
    onSuccess: (res) => {
      setCodeSent(true);
      toast.success(res.message);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const verify = useMutation({
    mutationFn: () => api.domains.verify(domain!.domain_id, Number(code)),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success(`${res.domain} verified`);
      close();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const google = useMutation({
    mutationFn: () => api.domains.googleUrl(domain!.domain_id),
    // Google redirects back to /domains?verified=... or ?error=...
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    sendOtp.mutate();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      toast.error('Enter the 6-digit code');
      return;
    }
    verify.mutate();
  };

  return (
    <Dialog open={!!domain} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify {domain?.domain}</DialogTitle>
          <DialogDescription>
            Prove that you own the domain to create short links for it and all
            of its subdomains.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!codeSent ? (
            <form onSubmit={handleSendOtp} className="space-y-2">
              <Label htmlFor="verify-email">Email on this domain</Label>
              <div className="flex gap-2">
                <Input
                  id="verify-email"
                  type="email"
                  placeholder={`admin@${domain?.domain ?? 'example.com'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" disabled={sendOtp.isPending}>
                  {sendOtp.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  Send code
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Public and disposable email providers are not accepted.
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-2">
              <Label htmlFor="verify-code">Code sent to {email}</Label>
              <div className="flex gap-2">
                <Input
                  id="verify-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                />
                <Button type="submit" disabled={verify.isPending}>
                  {verify.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify
                </Button>
              </div>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => {
                  setCodeSent(false);
                  setCode('');
                }}
              >
                Use a different email
              </button>
            </form>
          )}

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => google.mutate()}
            disabled={google.isPending}
          >
            {google.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify with Google Search Console
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
