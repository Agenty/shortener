import { render } from '@react-email/render';
import { Heading } from '@react-email/components';
import { AuthUser } from '../models/auth-user';
import { BRAND, EmailLayout, OtpCode, Paragraph } from './components/layout';

const DomainVerificationEmailTemplate = ({
  authUser,
  domain,
  otp,
}: {
  authUser: AuthUser;
  domain: string;
  otp: number;
}) => (
  <EmailLayout preview={`Verify ownership of ${domain} on ${BRAND}`}>
    <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
      Verify <strong>{domain}</strong>
    </Heading>
    <Paragraph>
      {authUser.name} ({authUser.email}) requested to verify the ownership of{' '}
      <strong>{domain}</strong> on {BRAND}. Here is the verification code:
    </Paragraph>
    <OtpCode code={otp} />
    <Paragraph>
      This code is valid for 10 minutes only. If you did not request it, you can
      safely ignore this email.
    </Paragraph>
  </EmailLayout>
);

export const domainVerificationEmailHtml = (
  authUser: AuthUser,
  domain: string,
  otp: number
) =>
  render(
    <DomainVerificationEmailTemplate
      authUser={authUser}
      domain={domain}
      otp={otp}
    />
  );
