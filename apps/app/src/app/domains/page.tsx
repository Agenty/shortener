import { useEffect, useState } from 'react';
import { useQueryState } from 'nuqs';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuthUser } from '@/hooks/use-auth-user';
import type { Domain } from '@/types/domain';
import { AddDomainDialog } from './components/AddDomainDialog';
import { VerifyDomainDialog } from './components/VerifyDomainDialog';
import { MyDomains } from './components/MyDomains';
import { GlobalDomains } from './components/GlobalDomains';

export default function Domains() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuthUser();
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'mine' });
  const [verified, setVerified] = useQueryState('verified');
  const [error, setError] = useQueryState('error');
  const [verifying, setVerifying] = useState<Domain | null>(null);

  // Google Search Console verification redirects back with ?verified= or ?error=
  useEffect(() => {
    if (verified) {
      toast.success(`${verified} verified`);
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      setVerified(null);
    }
    if (error) {
      toast.error(error);
      setError(null);
    }
  }, [verified, error, queryClient, setVerified, setError]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Domains</h1>
          <p className="text-muted-foreground">
            Verify the domains you own to shorten links pointing to them
          </p>
        </div>
        <AddDomainDialog isAdmin={isAdmin} onCreated={setVerifying} />
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value)}>
        <TabsList>
          <TabsTrigger value="mine">My domains</TabsTrigger>
          <TabsTrigger value="whitelisted">Global whitelisted</TabsTrigger>
          {isAdmin && <TabsTrigger value="blocked">Blocked</TabsTrigger>}
        </TabsList>
        <TabsContent value="mine" className="pt-2">
          <MyDomains onVerify={setVerifying} />
        </TabsContent>
        <TabsContent value="whitelisted" className="pt-2">
          <GlobalDomains type="whitelisted" isAdmin={isAdmin} />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="blocked" className="pt-2">
            <GlobalDomains type="blocked" isAdmin />
          </TabsContent>
        )}
      </Tabs>

      <VerifyDomainDialog
        domain={verifying}
        onOpenChange={(open) => !open && setVerifying(null)}
      />
    </div>
  );
}
