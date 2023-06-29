import Header from '@/components/Header';
import { getPosts, getRecentPosts } from '@/services';
import Head from 'next/head';
import SEO from '@bradgarropy/next-seo';
import { MarginWrapper } from '@/components/MarginWrapper';
import Center from '@/components/Center';
import { useEffect, useState } from 'react';
import Banner from '@/components/Banner';
import Postcard from '@/components/Postcard';
import PostWidget from '@/components/PostWidget';
import {
  BlogContainer,
  BlogContainerLeft,
  BlogContainerRight,
} from '@/components/BlogContainer';
import { ClipLoader } from 'react-spinners';
import mongooseConnect from '@/lib/mongoose';
import { Setting } from '@/models/Setting';
import Layout from '@/components/Layout';

const Blog = ({ posts, recentPosts }) => {
  const [innerWidth, setinnerWidth] = useState(0);
  const [visible, setVisible] = useState(6);
  const [buttonLoading, setButtonLoading] = useState(false);
  const showMoreItems = () => {
    setButtonLoading(true);
    setVisible((prevValue) => prevValue + 6);
    setButtonLoading(false);
  };
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
    name: 'Blog - Flavors Of Kalimpong',
    description:
      'Explore our blog and discover a wide range of food-related articles, reviews, and recipes. Delve into the world of flavors and find inspiration for your culinary adventures.',
    url: 'https://www.flavorsofkalimpong.in/blog',
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
        title='Blog - Flavors Of Kalimpong'
        description='Explore our blog and discover a wide range of food-related articles, reviews, and recipes. Delve into the world of flavors and find inspiration for your culinary adventures.'
        keywords={[
          'kalimpong momo',
          'places to eat in kalimpong',
          'best places to eat in kalimpong',
          'best momos in kalimpong',
          'pizza pan kalimpong',
          'street food in kalimpong',
          'best food in kalimpong',
          'food in kalimpong',
          'traditional food in kalimpong',
          'top restaurants in kalimpong',
          'food culture in kalimpong',
          'food bloggers in kalimpong',
        ]}
      />
      <Header />
      <MarginWrapper margintop={'0'}>
        <Center nopadding>
          <Banner
            image={'blog.png'}
            title1={'HOME'}
            title2={'Blog'}
            title3={'Flavors Of Kalimpong'}
            speedY={innerWidth < 500 ? 0 : -24}
          />
          <BlogContainer>
            <BlogContainerLeft>
              {posts?.slice(0, visible).map((post, id) => (
                <Postcard key={post.node.title} {...post.node} />
              ))}
              {visible <= posts.length && (
                <div className='right_contactus_form_inputs_button'>
                  {buttonLoading ? (
                    <ClipLoader color={'#555'} loading={true} />
                  ) : (
                    <button
                      className='grow_box jootbol'
                      onClick={showMoreItems}
                    >
                      Load More
                    </button>
                  )}
                </div>
              )}
            </BlogContainerLeft>
            <BlogContainerRight>
              <PostWidget posts={recentPosts} />
            </BlogContainerRight>
          </BlogContainer>
        </Center>
      </MarginWrapper>
    </Layout>
  );
};

export default Blog;

export async function getStaticProps() {
  const posts = (await getPosts()) || [];
  const recentPosts = await getRecentPosts();
  const revalidateSeconds = 24 * 60 * 60; // 24 hours in seconds
  await mongooseConnect();
  const settingDoc = await Setting.findOne({ name: 'recentPosts' });
  if (settingDoc) {
    await Setting.findByIdAndUpdate(
      settingDoc._id,
      { value: recentPosts },
      { new: true }
    );
  } else {
    await Setting.create({ name: 'recentPosts', value: recentPosts });
  }
  return {
    props: { posts, recentPosts },
    revalidate: revalidateSeconds, // Revalidate every day
  };
}
