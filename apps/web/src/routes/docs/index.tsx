import { createFileRoute } from '@tanstack/react-router';
import { DocPage, docHead } from '@/components/docs/doc-page';
import { getDoc } from '@/lib/docs';

const doc = getDoc('index')!;

export const Route = createFileRoute('/docs/')({
  head: () => docHead(doc),
  component: () => <DocPage doc={doc} />,
});
