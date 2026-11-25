import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { Domain, GlobalDomainType } from '@/types/domain';

type AddAs = 'user' | GlobalDomainType;

const ADD_AS_OPTIONS: Array<{ value: AddAs; label: string; description: string }> = [
  {
    value: 'user',
    label: 'My domain',
    description: 'Verify the ownership with email or Google Search Console',
  },
  {
    value: 'whitelisted',
    label: 'Whitelist for all accounts',
    description: 'Anyone can shorten links to it, no verification needed',
  },
  {
    value: 'blocked',
    label: 'Block for all accounts',
    description: 'Short links to it are denied, even when verified',
  },
];

interface AddDomainDialogProps {
  /** Admins can whitelist or block a domain for every account */
  isAdmin?: boolean;
  /** Called with a newly added (unverified) account domain */
  onCreated?: (domain: Domain) => void;
}

export function AddDomainDialog({ isAdmin, onCreated }: AddDomainDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState('');
  const [addAs, setAddAs] = useState<AddAs>('user');

  const reset = () => {
    setDomain('');
    setAddAs('user');
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (addAs === 'user') {
        return { type: addAs, domain: await api.domains.create({ domain }) };
      }
      const result = await api.admin.domains.upsert({ domain, type: addAs });
      return { type: addAs, domain: result };
    },
    onSuccess: (result) => {
      setOpen(false);
      reset();
      if (result.type === 'user') {
        queryClient.invalidateQueries({ queryKey: ['domains'] });
        toast.success('Domain added, verify the ownership to start using it');
        onCreated?.(result.domain as Domain);
      } else {
        queryClient.invalidateQueries({ queryKey: ['global-domains'] });
        toast.success(`${result.domain.domain} ${result.type} for all accounts`);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast.error('Please enter a domain');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Add Domain
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Domain</DialogTitle>
            <DialogDescription>
              Short links can be created only for destination URLs on verified
              domains and their subdomains.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                autoFocus
              />
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <Label>Add as</Label>
                <RadioGroup
                  value={addAs}
                  onValueChange={(value) => setAddAs(value as AddAs)}
                  className="gap-2"
                >
                  {ADD_AS_OPTIONS.map((option) => (
                    <Label
                      key={option.value}
                      className="flex items-start gap-3 rounded-md border p-3 font-normal cursor-pointer has-data-checked:border-primary"
                    >
                      <RadioGroupItem value={option.value} className="mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {addAs === 'user' ? 'Add Domain' : addAs === 'blocked' ? 'Block' : 'Whitelist'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
