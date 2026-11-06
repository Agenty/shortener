import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { whitelistRequestUrl } from '@/lib/whitelist';

interface UnverifiedDomainDialogProps {
  /** Destination host the API refused, the dialog is closed when empty */
  host: string | null;
  onOpenChange: (open: boolean) => void;
  /** Adds the domain to the account if needed, then starts verification */
  onVerify: () => void;
  verifying?: boolean;
}

/** Lets the user choose how to continue, nothing is added to the account until they verify */
export function UnverifiedDomainDialog({
  host,
  onOpenChange,
  onVerify,
  verifying,
}: UnverifiedDomainDialogProps) {
  return (
    <Dialog open={!!host} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{host} is not verified</DialogTitle>
          <DialogDescription>
            To prevent abuse, short links can point only to domains you own. If
            this is your site, verifying by email or Google Search Console is
            recommended and works right away.
          </DialogDescription>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Don't own it? If it's a social site or could help other users too,
          request whitelisting in a public GitHub issue. Requests are reviewed
          manually.
        </p>
        <DialogFooter>
          {host && (
            <Button
              variant="outline"
              nativeButton={false}
              render={<a href={whitelistRequestUrl(host)} target="_blank" rel="noopener noreferrer" />}
            >
              Request whitelisting
            </Button>
          )}
          <Button onClick={onVerify} disabled={verifying}>
            {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify domain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
