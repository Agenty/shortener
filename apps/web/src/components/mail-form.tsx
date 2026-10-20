import { useId, useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { rich, useI18n } from '@/i18n';
import { SUPPORT_EMAIL } from '@/lib/site';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'url' | 'textarea';
  placeholder?: string;
  required?: boolean;
};

/**
 * Opens the visitor's email app with the form prefilled to support. The API
 * has no contact endpoint, and this needs no spam protection or storage.
 */
export function MailForm({
  subject,
  fields,
  submitLabel,
}: {
  subject: string;
  fields: Field[];
  submitLabel?: string;
}) {
  const { t } = useI18n();
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>({});

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const body = fields
      .map((field) => `${field.label}:\n${values[field.name]?.trim() || '-'}`)
      .join('\n\n');
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-card p-5 sm:p-6">
      {fields.map((field) => {
        const fieldId = `${id}-${field.name}`;
        const common = {
          id: fieldId,
          name: field.name,
          required: field.required,
          placeholder: field.placeholder,
          value: values[field.name] ?? '',
          onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setValues((prev) => ({ ...prev, [field.name]: event.target.value })),
        };
        return (
          <div key={field.name} className="grid gap-2">
            <Label htmlFor={fieldId}>{field.label}</Label>
            {field.type === 'textarea' ? <Textarea rows={5} {...common} /> : <Input type={field.type ?? 'text'} {...common} />}
          </div>
        );
      })}
      <Button type="submit" size="lg" className="mt-1 h-11 rounded-xl">
        <Mail data-icon="inline-start" />
        {submitLabel ?? t.mailForm.send}
      </Button>
      <p className="text-xs text-muted-foreground">
        {rich(t.mailForm.note, {
          email: (
            <a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-2">
              {SUPPORT_EMAIL}
            </a>
          ),
        })}
      </p>
    </form>
  );
}
