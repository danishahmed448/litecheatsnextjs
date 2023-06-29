import React, { useState, useEffect } from 'react';
import BlogBanner from '../../../components/BlogBanner';
import Head from 'next/head';
import SEO from '@bradgarropy/next-seo';
import { getPosts, getPostDetails, getSimilarPosts } from '../../../services';
import PostDetails from '../../../components/PostDetails';
import PostWidget from '../../../components/PostWidget';
import moment from 'moment';

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

const Post = ({ post,recentPosts }) => {
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
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.flavorsofkalimpong.in/blog/${post?.slug}`,
    },
    headline: post?.title,
    image: post?.featuredImage.url,
    author: {
      '@type': 'Person',
      name: post?.author.name,
      url: `https://www.flavorsofkalimpong.in/blog/author/${post?.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Flavors Of Kalimpong',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.flavorsofkalimpong.in/flavors_of_kalimpong.jpg',
      },
    },
    datePublished: moment(post?.createdAt).format('YYYY-MM-DD'),
  });
  if (post) {
    return (
      <Layout>
        <Head>
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{ __html: schemaData }}
          />
        </Head>
        <SEO
          title={post.title}
          keywords={[...post.tags]}
          description={String(post.content.text).replace(/\\n/g, ' ').substring(0, 150)}
          facebook={{
            image: `${post.featuredImage.url}`,
            url: `https://www.flavorsofkalimpong.in/blog/${post.slug}`,
            type: 'article',
          }}
          twitter={{
            image: `${post.featuredImage.url}`,
            site: '@flavorsofkalimpong',
            card: 'summary_large_image',
          }}
        />
        <Header />
        <MarginWrapper margintop={'0'}>
          <Center nopadding>
            <Blog className={`${post.videoPost ? 'videoDark' : ''}`}>
              <BlogBanner
                image={post.featuredImage.url}
                title={post.title}
                category={post.categories[0]}
                createdAt={post.createdAt}
                author={post.author}
                buttonStat={false}
                speedY={innerWidth < 500 ? 0 : -24}
              />
              <BlogContainer>
                <BlogContainerLeft
                  className={`${post.videoPost ? 'fullWidthMax' : ''}`}
                >
                  <PostDetails post={post} />
                </BlogContainerLeft>
                {!post.videoPost && (
                  <BlogContainerRight>
                    <PostWidget
                      posts={recentPosts}
                      slug={post.slug}
                    />
                  </BlogContainerRight>
                )}
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
  const post = (await getPostDetails(params.post)) || [];
  const categories = post.categories.map((category) => category.slug);
  const subcategories = post.subcategories.map((sub) => sub.slug);
  const slug=post.slug;
  const recentPosts = await getSimilarPosts(slug, categories, subcategories);
  return {
    props: { post,recentPosts },
  };
}

export async function getStaticPaths() {
  const posts = await getPosts();
  return {
    paths: posts?.map(({ node: { slug } }) => ({ params: { post: slug } })),
    fallback: 'blocking',
  };
}
export default Post;
