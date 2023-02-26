import { useState, Fragment } from 'react';
import Heading from '@/common/components/Heading';
import Container from '@/common/components/UI/Container';
import { Icon } from 'react-icons-kit';
import { plus } from 'react-icons-kit/entypo/plus';
import { minus } from 'react-icons-kit/entypo/minus';
import Section, { SectionHeading, RcCollapse } from './faq.style';
import { Panel } from 'rc-collapse';
import motion from './motion-util';
import { useTranslation } from 'next-i18next';

type FAQ = {
  question: string;
  answer: string;
};

const Faq = () => {
  const { t } = useTranslation();
  const faqs = t('FAQ.data', { returnObjects: true }) as FAQ[];
  const [activeKey, setActiveKey] = useState<React.Key | React.Key[]>(0);

  const onChange = (activeKey: React.Key | React.Key[]) => {
    setActiveKey(activeKey);
  };

  return (
    <Section id="faq">
      <Container className="container">
        <SectionHeading>
          <Heading content={t('FAQ.heading')} />
        </SectionHeading>
        <RcCollapse
          collapsible={undefined}
          accordion={true}
          activeKey={activeKey}
          onChange={onChange}
          openMotion={motion}
        >
          {faqs?.map((faq, id) => (
            <Panel
              key={id}
              showArrow={false}
              header={
                <Fragment>
                  <Heading as="h4" content={faq.question} />
                  <span className="icon">
                    <Icon icon={minus} size={20} className="minus" />
                    <Icon icon={plus} size={20} className="plus" />
                  </span>
                </Fragment>
              }
            >
              {faq.answer}
            </Panel>
          ))}
        </RcCollapse>
      </Container>
    </Section>
  );
};

export default Faq;
