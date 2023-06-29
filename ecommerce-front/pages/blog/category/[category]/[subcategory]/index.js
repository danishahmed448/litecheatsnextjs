import React, { useState, useEffect } from 'react';

import Head from 'next/head';
import SEO from '@bradgarropy/next-seo';
import {
  getSubcategories,
  getSubcategory,
  getSubcategoryPosts,
  
  getSimilarSubcategoryPosts,
  getCategory,
} from '../../../../../services';
import Postcard from '../../../../../components/Postcard';
import PostWidget from '../../../../../components/PostWidget';
import CategoryBanner from '../../../../../components/CategoryBanner';
import Header from '@/components/Header';
import { MarginWrapper } from '@/components/MarginWrapper';
import Center from '@/components/Center';
import {
  Blog,
  BlogContainer,
  BlogContainerLeft,
  BlogContainerRight,
} from '@/components/BlogContainer';
import Layout from '@/components/Layout';

const Slug = ({ posts, subcategory, category,recentPosts }) => {
  
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
    name: `${subcategory?.name} - Flavors Of Kalimpong`,
    description: `Read more about ${subcategory?.name} by visiting Flavors Of Kalimpong Blog - one of the best food blog in India.`,
    url: `https://www.flavorsofkalimpong.in/blog/category/${category.slug}/${subcategory?.slug}`,
  });
  if (subcategory) {
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
          title={`${subcategory.name} - Flavors Of Kalimpong`}
          keywords={[subcategory.name]}
          facebook={{
            image: subcategory.photo.url,
            url: `https://www.flavorsofkalimpong.in/blog/category/${category.slug}/${subcategory.slug}`,
            type: 'website',
          }}
          twitter={{
            image: subcategory.photo.url,
            site: '@flavorsofkalimpong',
            card: 'summary_large_image',
          }}
        />
        <Header />
        <MarginWrapper margintop={'0'}>
          <Center nopadding>
            <Blog>
              <CategoryBanner
                category={subcategory}
                parent={category}
                speedY={innerWidth < 500 ? 0 : -24}
              />
              <BlogContainer>
                <BlogContainerLeft>
                  {posts.map((post, id) => (
                    <Postcard key={post.title} {...post} />
                  ))}
                </BlogContainerLeft>
                <BlogContainerRight>
                  <PostWidget posts={recentPosts} />
                </BlogContainerRight>
              </BlogContainer>
            </Blog>
          </Center>
        </MarginWrapper>
      </Layout>
    );
  }
  return <div></div>;
};

export async function getStaticProps({ params }) {
  const posts = (await getSubcategoryPosts(params.subcategory)) || [];
  const subcategory = (await getSubcategory(params.subcategory)) || [];
  
  const category = (await getCategory(params.category));
  const recentPosts = await getSimilarSubcategoryPosts(subcategory.slug);
  const revalidateSeconds = 24 * 60 * 60; // 24 hours in seconds
  return {
    props: { posts, subcategory, category,recentPosts },
    revalidate: revalidateSeconds,
    
  };
}

export async function getStaticPaths() {
  const subcategories = await getSubcategories();
  return {
    paths: subcategories?.map(({ node: { slug ,category} }) => ({ params: { subcategory: slug,category:category.slug } })),
    fallback: 'blocking',
  };
}
export default Slug;
