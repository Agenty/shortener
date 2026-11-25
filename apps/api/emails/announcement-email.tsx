import { render } from '@react-email/render';
import { Link, Section } from '@react-email/components';
import { BRAND, EmailLayout, Paragraph } from './components/layout';

const AnnouncementEmailTemplate = ({
  name,
  subject,
  body,
  unsubscribeUrl,
}: {
  name: string;
  subject: string;
  body: string;
  unsubscribeUrl?: string;
}) => (
  <EmailLayout
    preview={subject}
    footer={
      <>
        You are receiving this email because you signed up for {BRAND}.
        {unsubscribeUrl && (
          <>
            {' '}
            <Link href={unsubscribeUrl} className="text-[#666666]">
              Unsubscribe
            </Link>
          </>
        )}
      </>
    }
  >
    <Paragraph>Hi {name},</Paragraph>
    {/* body is admin-authored HTML from the rich text editor */}
    <Section>
      <div
        className="text-black text-[14px] leading-[24px]"
        dangerouslySetInnerHTML={{ __html: body }}
      />
    </Section>
  </EmailLayout>
);

export const announcementEmailHtml = (props: {
  name: string;
  subject: string;
  body: string;
  unsubscribeUrl?: string;
}) => render(<AnnouncementEmailTemplate {...props} />);
