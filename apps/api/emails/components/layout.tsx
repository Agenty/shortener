import type { ReactNode } from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

export const BRAND = 'shortener.dev';
export const SITE_URL = 'https://shortener.dev';
export const APP_URL = 'https://app.shortener.dev';
export const SUPPORT_EMAIL = 'support@shortener.dev';

export const EmailLayout = ({
  preview,
  children,
  footer,
}: {
  preview: string;
  children: ReactNode;
  footer?: ReactNode;
}) => (
  <Html>
    <Head />
    <Preview>{preview}</Preview>
    <Tailwind>
      <Body className="bg-white my-auto mx-auto font-sans px-2">
        <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
          <Section className="mt-[24px] text-center">
            <Link
              href={SITE_URL}
              className="text-black text-[22px] font-bold no-underline"
            >
              {BRAND}
            </Link>
          </Section>
          {children}
          <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
          <Text className="text-[#666666] text-[12px] leading-[20px]">
            {footer || (
              <>
                Need help? Reply to this email or contact{' '}
                <Link href={`mailto:${SUPPORT_EMAIL}`} className="text-[#666666]">
                  {SUPPORT_EMAIL}
                </Link>
                .
              </>
            )}
          </Text>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export const Paragraph = ({ children }: { children: ReactNode }) => (
  <Text className="text-black text-[14px] leading-[24px]">{children}</Text>
);

export const ActionButton = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <Section className="text-center mt-[32px] mb-[32px]">
    <Button
      className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
      href={href}
    >
      {children}
    </Button>
  </Section>
);

export const OtpCode = ({ code }: { code: number | string }) => (
  <Section className="text-center my-[24px]">
    <Text className="text-black text-[32px] font-bold tracking-[8px] m-0">
      {code}
    </Text>
  </Section>
);
