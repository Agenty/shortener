import { render } from '@react-email/render';
import { Column, Heading, Row, Section } from '@react-email/components';
import { capitalize } from 'lodash';
import { EmailLayout, Paragraph } from './components/layout';

// Internal notification (support tickets, system alerts) listing key/value data
const DataTableEmailTemplate = ({
  title,
  intro,
  data,
}: {
  title: string;
  intro: string;
  data: Record<string, unknown>;
}) => (
  <EmailLayout preview={title}>
    <Heading className="text-black text-[20px] font-normal p-0 my-[24px] mx-0">
      {title}
    </Heading>
    <Paragraph>{intro}</Paragraph>
    <Section>
      {Object.entries(data || {}).map(([key, value]) => (
        <Row key={key} className="border-b border-solid border-[#eaeaea]">
          <Column className="text-[13px] font-semibold py-[6px] pr-[12px] align-top w-[35%]">
            {capitalize(key)}
          </Column>
          <Column className="text-[13px] py-[6px] break-all align-top">
            {typeof value == 'object' ? JSON.stringify(value) : String(value)}
          </Column>
        </Row>
      ))}
    </Section>
  </EmailLayout>
);

export const dataTableEmailHtml = (
  title: string,
  intro: string,
  data: Record<string, unknown>
) => render(<DataTableEmailTemplate title={title} intro={intro} data={data} />);
