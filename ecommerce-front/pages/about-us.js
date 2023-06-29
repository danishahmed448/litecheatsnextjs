import React, { useState, useEffect } from 'react';
import BoardingBanner from '../components/Banner';
import DropdownSlider from '../components/DropdownSlider';
import Head from 'next/head';
import SEO from '@bradgarropy/next-seo';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import Center from '@/components/Center';
import styled from 'styled-components';
export const AboutUsDiv = styled.div`
  * {
    box-sizing: border-box;
    max-width: 100%;
    overflow-wrap:break-word ;
    word-wrap: break-word;
  }
  box-sizing: border-box;
  overflow-wrap:break-word ;
    word-wrap: break-word;
  .about_us_content {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 3em 1em;
    color: #3d3a28;
    flex-direction: column;
    box-sizing: border-box;
  }
  .about_us_content_left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    margin-right: 0em;
  }
  .about_us_title {
    font-size: 1rem;
    margin-bottom: 1.2em;
    line-height: 1.4;
    font-weight: 700;
  }
  .about_us_titletwo,
  .about_us_titletwo_facilities {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.4em;
  }
  .about_us_titletwo_facilities {
    color: red;
  }
  .about_us_desc {
    margin-top: 2em;
    width: 100%;
  }
  .about_us_desc p {
    font-size: 14px;
    max-width: none;
    color: #181818;

    font-weight: 400;
    line-height: 1.8em;
    margin-bottom: 1em;
  }
  .about_us_content_right {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .about_us_content_right [class^='dropdown'] span {
    font-weight: bolder;
    font-size: 14px !important;
  }
  .about_us_content_right [class^='dropdown'] svg {
    font-size: 16px !important;
  }
  .about_us_content_right [class^='dropdown'] {
    font-size: 14px !important;

    width: 100%;
  }
  &.privacy {
    .about_us_content .about_us_content_left .about_us_desc p {
      max-width: 1000px;
    }
  }
`;
const AboutUS = () => {
  const [innerWidth, setinnerWidth] = useState(0);

  useEffect(() => {
    setinnerWidth(window.innerWidth);
    window.addEventListener('resize', changeWidth);
  }, []);

  const changeWidth = () => {
    if (window) {
      setinnerWidth(window.innerWidth);
    }
  };
  const schemaData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Flavors Of Kalimpong',
    image: 'https://www.flavorsofkalimpong.in/flavors_of_kalimpong.jpg',
    '@id': 'https://www.flavorsofkalimpong.in/',
    url: 'https://www.flavorsofkalimpong.in/',
    telephone: '8072565800',
    priceRange: 'INR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '8th Cross,Shiva Reddy Layout,Naganathapura',
      addressLocality: 'Bangalore',
      postalCode: '560100',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 12.8747253,
      longitude: 77.6713211,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '05:30',
      closes: '17:30',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '0',
      ratingCount: '128',
    },
  });
  const schemeData2 = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Flavors of Kalimpong',
    description:
      'At Flavors of Kalimpong, we offer a wide range of authentic Kalimpong products including pickles, snacks, and more. Discover the unique flavors of Kalimpong and experience the rich culinary heritage of the region.',
    url: 'https://www.flavorsofkalimpong.in/',
  });
  return (
    <Layout>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: schemaData }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: schemeData2 }}
        />
      </Head>
      <SEO
        title='About Us - Flavors of Kalimpong'
        description='Flavors of Kalimpong: Authentic Kalimpong snacks like Dalle Chilly, Churpi, and Bamboo Shoot Pickle. Founded by Stephanie and Danish Ahmed. Taste the tradition.'
        keywords={[
          'Stephanie Jackson',
          'Danish',
          'Flavors of Kalimpong',
          'Dalle Chilly',
          'Churpi',
          'Bamboo Shoot Pickle',
          'Kalimpong snacks',
          'online store',
          'authentic Kalimpong products',
        ]}
        facebook={{
          image: 'https://www.flavorsofkalimpong.in/aboutus.png',
          url: 'https://www.flavorsofkalimpong.in/about-us',
          type: 'website',
        }}
        twitter={{
          image: 'https://www.flavorsofkalimpong.in/aboutus.png',
          site: '@flavorsofkalimpong',
          card: 'summary_large_image',
        }}
      />
      <Header />
      <MarginWrapper margintop={'0'}>
        <Center nopadding>
          <AboutUsDiv>
            <BoardingBanner
              image={'aboutus.png'}
              title1={'ABOUT US'}
              title2={'Savor the Flavor'}
              title3={'of Authentic Kalimpong'}
              buttonStat={false}
              speedY={innerWidth < 500 ? 0 : -24}
            />
            <div className='about_us_content'>
              <div className='about_us_content_left'>
                <div className='about_us_title'>WHO WE ARE</div>
                <div className='about_us_titletwo'>
                  Embracing Tradition, Delivering Quality: Your Gateway to
                  Authentic{' '}
                  <span className='about_us_titletwo_facilities'>
                    Kalimpong Flavors
                  </span>
                </div>
                <div className='about_us_desc'>
                  <p>
                    Welcome to Flavors of Kalimpong, your gateway to the
                    authentic tastes of Kalimpong. Founded in 2021 by Stephanie
                    and Danish Ahmed, our online store is a testament to our
                    passion for the rich culinary heritage of this region. Just
                    as we poured our love for animals into the creation of
                    Golden Creche, we infuse the same dedication and care into
                    curating the finest Kalimpong snacks for you.
                  </p>
                  <p>
                    Our journey began with a simple mission: to bring the unique
                    flavors of Kalimpong to food lovers everywhere. We offer a
                    delightful array of traditional products, including Dalle
                    Chilly, Churpi, and Bamboo Shoot Pickle. Each item in our
                    store is a flavorful invitation to experience the culinary
                    delights of Kalimpong, right from the comfort of your home.
                  </p>
                  <p>
                    At Flavors of Kalimpong, we{"'"}re not just about selling
                    products; we{"'"}re about sharing a taste of our culture. We
                    believe that every bite should transport you to the vibrant
                    streets of Kalimpong, and we{"'"}re committed to making that
                    experience possible for our customers. Join us on this
                    flavorful journey and discover the true essence of Kalimpong
                    with us.
                  </p>
                </div>
              </div>
              <div className='about_us_content_right'>
                <DropdownSlider
                  question='AUTHENTICITY'
                  answer={`At Flavors of Kalimpong, we believe in preserving and sharing the rich culinary heritage of Kalimpong. Our products, like Dalle Chilly, Churpi, and Bamboo Shoot Pickle, are made following traditional recipes to ensure you get a taste of authentic Kalimpong flavors.`}
                />
                <DropdownSlider
                  question={'QUALITY'}
                  answer={`We prioritize quality in every product we offer. Our snacks are made from the finest ingredients, ensuring a delightful taste experience with every bite. We're committed to delivering the best of Kalimpong to you.`}
                />
              </div>
            </div>
          </AboutUsDiv>
        </Center>
      </MarginWrapper>
    </Layout>
  );
};

export default AboutUS;
