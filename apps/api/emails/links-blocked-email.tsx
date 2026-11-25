import { render } from '@react-email/render';
import { Heading, Section, Text } from '@react-email/components';
import { BRAND, EmailLayout, Paragraph, SUPPORT_EMAIL } from './components/layout';
import { defang } from '../helper/utility';

export type BlockedLinkItem = {
  short_url: string;
  url: string;
  reason: string;
};

/** Links listed in the email, the rest are summarized as a count */
const MAX_LISTED = 20;

const LinksBlockedEmailTemplate = ({
  name,
  links,
  suspended,
}: {
  name?: string;
  links: Array<BlockedLinkItem>;
  suspended: boolean;
}) => (
  <EmailLayout
    preview={
      suspended
        ? `Your ${BRAND} account has been suspended`
        : `${links.length} of your short links have been blocked`
    }
  >
    <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
      {suspended ? 'Account suspended' : 'Short links blocked'}
    </Heading>
    <Paragraph>Hi {name || 'there'},</Paragraph>
    <Paragraph>
      The following short links on {BRAND} point to a destination that is
      reported as unsafe, or to a domain that is blocked. They no longer
      redirect visitors. The addresses are written with [dot] so they can't be
      opened by accident:
    </Paragraph>
    <Section>
      {links.slice(0, MAX_LISTED).map((link) => (
        <Text
          key={link.short_url}
          className="text-black text-[13px] leading-[20px] my-[8px] break-all"
        >
          <strong>{defang(link.short_url)}</strong>
          <br />
          {defang(link.url)}
          <br />
          <span className="text-[#b91c1c]">{defang(link.reason)}</span>
        </Text>
      ))}
      {links.length > MAX_LISTED && (
        <Text className="text-[#666666] text-[13px]">
          and {links.length - MAX_LISTED} more.
        </Text>
      )}
    </Section>
    {suspended ? (
      <Paragraph>
        To protect visitors, your account has been suspended. You can no longer
        sign in, create links or use the API.
      </Paragraph>
    ) : null}
    <Paragraph>
      If you believe this is a mistake, for example your website was hacked and
      has been cleaned up, reply to this email or contact {SUPPORT_EMAIL} with
      the details.
    </Paragraph>
  </EmailLayout>
);

export const linksBlockedEmailHtml = (
  name: string | undefined,
  links: Array<BlockedLinkItem>,
  suspended: boolean
) =>
  render(
    <LinksBlockedEmailTemplate name={name} links={links} suspended={suspended} />
  );
