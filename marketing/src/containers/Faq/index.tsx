import { Fragment, useMemo, useState } from 'react';
import Heading from '@/common/components/Heading';
import Container from '@/common/components/UI/Container';
import { Icon } from 'react-icons-kit';
import { plus } from 'react-icons-kit/entypo/plus';
import { minus } from 'react-icons-kit/entypo/minus';
import Section, { SectionHeading, RcCollapse } from './faq.style';
import motion from './motion-util';
import { useTranslation } from 'next-i18next/pages';

type FAQ = {
  question: string;
  answer: string;
};

const Faq = () => {
  const { t } = useTranslation();
  const faqs = t('FAQ.data', { returnObjects: true }) as FAQ[];
  const [activeKey, setActiveKey] = useState<React.Key | React.Key[]>(0);

  const onChange = (key: React.Key | React.Key[]) => {
    setActiveKey(key);
  };

  const items = useMemo(
    () =>
      (faqs ?? []).map((faq, id) => ({
        key: String(id),
        showArrow: false,
        label: (
          <Fragment>
            <Heading as="h4" content={faq.question} />
            <span className="icon">
              <Icon icon={minus} size={20} className="minus" />
              <Icon icon={plus} size={20} className="plus" />
            </span>
          </Fragment>
        ),
        children: faq.answer,
      })),
    [faqs]
  );

  return (
    <Section id="faq">
      <Container className="container">
        <SectionHeading>
          <Heading content={t('FAQ.heading')} />
        </SectionHeading>
        <RcCollapse
          accordion
          activeKey={activeKey}
          onChange={onChange}
          openMotion={motion}
          items={items}
        />
      </Container>
    </Section>
  );
};

export default Faq;
