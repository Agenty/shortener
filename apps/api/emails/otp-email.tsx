import { render } from '@react-email/render';
import { Heading } from '@react-email/components';
import { AuthUser } from '../models/auth-user';
import { BRAND, EmailLayout, OtpCode, Paragraph } from './components/layout';

const OtpEmailTemplate = ({
  authUser,
  otp,
}: {
  authUser: AuthUser;
  otp: number;
}) => (
  <EmailLayout preview={`Your ${BRAND} verification code is ${otp}`}>
    <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
      Verify your email
    </Heading>
    <Paragraph>Hi {authUser.name},</Paragraph>
    <Paragraph>Here is your one-time verification code for {BRAND}:</Paragraph>
    <OtpCode code={otp} />
    <Paragraph>
      This code is valid for 5 minutes only. If you did not request it, you can
      safely ignore this email.
    </Paragraph>
  </EmailLayout>
);

export const otpEmailHtml = (authUser: AuthUser, otp: number) =>
  render(<OtpEmailTemplate authUser={authUser} otp={otp} />);
