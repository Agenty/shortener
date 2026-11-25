import { render } from '@react-email/render';
import { Heading, Link, Text } from '@react-email/components';
import { AuthUser } from '../models/auth-user';
import {
  ActionButton,
  BRAND,
  EmailLayout,
  Paragraph,
} from './components/layout';

const PasswordResetEmailTemplate = ({
  authUser,
  resetUrl,
}: {
  authUser: AuthUser;
  resetUrl: string;
}) => (
  <EmailLayout preview={`Reset your ${BRAND} password`}>
    <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
      Reset your password
    </Heading>
    <Paragraph>Hi {authUser.name},</Paragraph>
    <Paragraph>
      We received a request to reset the password for your {BRAND} account.
      Click the button below to choose a new one.
    </Paragraph>
    <ActionButton href={resetUrl}>Reset password</ActionButton>
    <Text className="text-[#666666] text-[12px] leading-[20px]">
      Or copy and paste this URL into your browser:{' '}
      <Link href={resetUrl} className="text-blue-600 no-underline break-all">
        {resetUrl}
      </Link>
    </Text>
    <Paragraph>
      This link is valid for 15 minutes only. If you did not request a password
      reset, you can safely ignore this email.
    </Paragraph>
  </EmailLayout>
);

export const passwordResetEmailHtml = (authUser: AuthUser, resetUrl: string) =>
  render(
    <PasswordResetEmailTemplate authUser={authUser} resetUrl={resetUrl} />
  );
