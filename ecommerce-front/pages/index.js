import BottomCart from '@/components/BottomCart';
import Featured from '@/components/Featured';
import Header from '@/components/Header';
import NewProducts from '@/components/NewProducts';
import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { WishedProduct } from '@/models/WishedProduct';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { Setting } from '@/models/Setting';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import PostWidget from '@/components/PostWidget';
import Center from '@/components/Center';
import { MarginWrapper } from '@/components/MarginWrapper';
import { RevealWrapper } from 'next-reveal';
import Footer from '@/components/Footer';
import Layout from '@/components/Layout';
const HomePage = ({
  featuredProduct,
  newProducts,
  wishedNewProducts,
  recentPosts,
}) => {
  const breadcrumbList = [
    { name: 'Home', url: 'https://www.flavorsofkalimpong.in' },
    { name: 'Categories', url: 'https://www.flavorsofkalimpong.in/categories' },
    { name: 'Products', url: 'https://www.flavorsofkalimpong.in/products' },
    { name: 'Account', url: 'https://www.flavorsofkalimpong.in/account' },
    {
      name: 'Track Your Order',
      url: 'https://www.flavorsofkalimpong.in/track-order',
    },
    { name: 'Cart', url: 'https://www.flavorsofkalimpong.in/cart' },
    { name: 'Blog', url: 'https://www.flavorsofkalimpong.in/blog' },
  ];
  const addProductJsonLd = (featuredProduct, newProducts) => {
    const productListItems = newProducts.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 2, // Start position at 2 since the featured product is at position 1
      name: product.title,
      item: `https://www.flavorsofkalimpong.in/product/${product.slug}`,
    }));

    return {
      __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Flavors Of Kalimpong',
        description: 'Buy authentic pickles and snacks from Kalimpong.',
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbList.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        },
        mainEntity: [
          {
            '@type': 'Product',
            name: featuredProduct.title,
            image: featuredProduct.images[0], // Add the URL of the featured product image
            description: featuredProduct.description
              .toString()
              .replace(/\n/g, ' '),
            offers: {
              '@type': 'Offer',
              price: featuredProduct.price,
              priceCurrency: 'INR', // Replace with the appropriate currency code
            },
          },
          ...productListItems,
        ],
      }),
    };
  };

  return (
    <Layout>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={addProductJsonLd(
            featuredProduct,
            newProducts
          )}
          key={'homepage-jsonld'}
        />
      </Head>
      <SEO
        title={`Authentic Pickles & Snacks from Kalimpong | Flavors of Kalimpong`}
        description='Buy authentic pickles and snacks from Kalimpong. Dalle Khursani, Churpi, Bamboo Shoot Pickles, dry beef, chicken and pork pickles and more...'
        keywords={[
          'Flavors of Kalimpong',
          'Kalimpong Pickles',
          'Kalimpong Snacks',
          'Dalle Khursani',
          'Churpi',
          'Bamboo Shoot Pickles',
          'Kalimpong Dry Beef',
          'Kalimpong Dry Pork',
          'Kalimpong Dry Chicken',
          'Kalimpong Pickles Online',
          'Kalimpong Snacks Online',
          'Kalimpong Pickles and Snacks Online',
          'Kalimpong Pickles and Snacks',
          'buy online Kalimpong Pickles',
          'buy online Kalimpong Snacks',
          'buy online Kalimpong Pickles and Snacks',
          'buy Kalimpong Pickles',
          'buy Kalimpong Snacks',
          'buy Kalimpong Pickles and Snacks',
          'Kalimpong Pickles and Snacks India',
          'Kalimpong Pickles and Snacks India Online',
          'Kalimpong Pickles and Snacks India Online Shopping',
          'Kalimpong Pickles and Snacks India Online Shopping Free Shipping',
          'Kalimpong Pickles and Snacks India Online Shopping Free Shipping Cash',
        ]}
        facebook={{
          image: 'https://www.flavorsofkalimpong.in/flavors_of_kalimpong.jpg',
          url: 'https://www.flavorsofkalimpong.in',
          type: 'website',
        }}
        twitter={{
          image: 'https://www.flavorsofkalimpong.in/flavors_of_kalimpong.jpg',
          site: '@flavorsofkalimpong',
          card: 'summary_large_image',
        }}
      />
      <Header />
      <Featured product={featuredProduct} />
      <MarginWrapper margintop={'0'}>
        <Center>
          <NewProducts
            products={newProducts}
            wishedProducts={wishedNewProducts}
          />
          <RevealWrapper delay={0}>
            <PostWidget posts={recentPosts} />
          </RevealWrapper>
          
        </Center>
      </MarginWrapper>
      <BottomCart />
    </Layout>
  );
};

export default HomePage;

export const getServerSideProps = async (ctx) => {
  await mongooseConnect();
  const recentPosts = await Setting.findOne({ name: 'recentPosts' });
  const featuredProductId = (
    await Setting.findOne({ name: 'featuredProductId' })
  ).value;
  const featuredProduct = await Product.findById(featuredProductId).select('-keyList -secret');
  
  const newProducts = await Product.find({}, null, {
    sort: { _id: -1 },
    limit: 10,
  }).select('-keyList -secret');

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  let wishedNewProducts = [];
  if (session) {
    const {
      user: { email },
    } = session;
    wishedNewProducts = await WishedProduct.find({
      userEmail: email,
      product: newProducts.map((p) => p._id.toString()),
    });
  }
  return {
    props: {
      featuredProduct: JSON.parse(JSON.stringify(featuredProduct)),
      newProducts: JSON.parse(JSON.stringify(newProducts)),
      wishedNewProducts: wishedNewProducts.map((i) => i.product.toString()),
      recentPosts: JSON.parse(JSON.stringify(recentPosts.value)),
    },
  };
};
