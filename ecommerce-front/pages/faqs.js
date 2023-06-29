import React from 'react';
import BoardingBanner from '../components/Banner';
import FaqServices from '../components/FaqServices';
import { BsBuilding, BsCreditCard, BsHeartFill, BsClock } from 'react-icons/bs';
import ServiceNavbar from '../components/ServiceNavbar';
import Head from 'next/head';
import SEO from '@bradgarropy/next-seo';
import mongooseConnect from '@/lib/mongoose';
import { Setting } from '@/models/Setting';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import Center from '@/components/Center';
import BottomCart from '@/components/BottomCart';
import Layout from '@/components/Layout';

const FAQ = ({ faqCategories, qList }) => {
   
  const schema2 = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...qList],
  });

  return (
    <Layout>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: schema2 }}
        />
      </Head>

      <SEO
        title='FAQs - Flavors of Kalimpong'
        description='Find answers to all your questions about our authentic Kalimpong products, ordering process, and shipping policies. We are dedicated to providing you with the best flavors from Kalimpong.'
        keywords={[
          'Kalimpong products',
          'Kalimpong snacks',
          'Kalimpong pickles',
          'online ordering',
          'shipping policies',
        ]}
        facebook={{
          image: 'https://www.flavorsofkalimpong.in/thinking.png',
          url: 'https://www.flavorsofkalimpong.in/faqs',
          type: 'website',
        }}
        twitter={{
          image: 'https://www.flavorsofkalimpong.in/thinking.png',
          site: '@flavorsofkalimpong',
          card: 'summary_large_image',
        }}
      />
      <Header />
      <MarginWrapper margintop={'0'}>
        <Center nopadding>
          <BoardingBanner
            image='thinking.png'
            title1={'FAQs'}
            title2={'Frequently Asked'}
            title3={'Questions'}
            buttonStat={false}
            speedY={-2}
          />
          <ServiceNavbar listoficons={faqCategories.map((faqCategory)=>({title:faqCategory.category,logo:faqCategory.logo}))} />
          {faqCategories?.map((faqCategory) => (
            <FaqServices
              key={faqCategory.category}
              faqCategory={faqCategory.category}
              qanda={faqCategory.faqs}
            />
          ))}
        </Center>
      </MarginWrapper>
    </Layout>
  );
};
export const getStaticProps = async () => {
  await mongooseConnect();
  const faqCategoriesDoc = await Setting.findOne({ name: 'faqCategories' });
  const faqCategories = faqCategoriesDoc.value;
  let faqs = [];
  faqCategories.forEach((faqCategory) => {
    faqCategory.faqs.forEach((faq) => {
      faqs.push(faq);
    });
  });
  const qList = faqs.map((faq) => ({
    '@type': 'Question',
    name: String(faq.question),
    acceptedAnswer: {
      '@type': 'Answer',
      text: String(faq.answer),
    },
  }));
  
  console.log(qList);
  return {
    props: { faqCategories, qList: qList },
  };
};
export default FAQ;
