import { render } from '@react-email/render';
import { Heading } from '@react-email/components';
import { AuthUser } from '../models/auth-user';
import {
  ActionButton,
  APP_URL,
  BRAND,
  EmailLayout,
  Paragraph,
} from './components/layout';

const WelcomeEmailTemplate = ({ authUser }: { authUser: AuthUser }) => (
  <EmailLayout preview={`Welcome to ${BRAND}, ${authUser.name}`}>
    <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
      Welcome to <strong>{BRAND}</strong>, {authUser.name}!
    </Heading>
    <Paragraph>Hi {authUser.name},</Paragraph>
    <Paragraph>
      Thanks for signing up for <strong>{BRAND}</strong>. You can now create
      short links, generate QR codes, connect your own domains and track every
      click from one dashboard.
    </Paragraph>
    <ActionButton href={`${APP_URL}/login`}>Get Started</ActionButton>
    <Paragraph>
      If you have any questions, our support team is always here to help. Just
      reply to this email.
    </Paragraph>
    <Paragraph>
      Best regards,
      <br />
      The {BRAND} Team
    </Paragraph>
  </EmailLayout>
);

export const welcomeEmailHtml = (authUser: AuthUser) =>
  render(<WelcomeEmailTemplate authUser={authUser} />);
