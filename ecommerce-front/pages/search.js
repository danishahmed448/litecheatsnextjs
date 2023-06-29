import Header from '@/components/Header';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Center from '@/components/Center';
import { MarginWrapper } from '@/components/MarginWrapper';
import styled from 'styled-components';
import Input from '@/components/Input';
import axios from 'axios';
import ProductsGrid from '@/components/ProductsGrid';
import { debounce } from 'lodash';
import Spinner from '@/components/Spinner';
import BottomCart from '@/components/BottomCart';
import { useSession } from 'next-auth/react';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import Layout from '@/components/Layout';
const SearchInput = styled(Input)`
  padding: 5px 10px;
  
  border: 0px;
  outline: none;
  -webkit-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
  -moz-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
  box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
`;
const InputWrapper = styled.div`
  position: sticky;
  padding: 10px 0;
  top: 70px;
  z-index: 11;
  background-color: #eee;
`;

const SearchPage = () => {
  const {data:session} = useSession();
  const [phrase, setPhrase] = useState('');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [wishedProducts, setWishedProducts] = useState([])
  
  const debouncedSearch = useCallback(debounce(async(phrase,session)=>{
    if (phrase.length > 0) {
      try {
        const response = await axios.get(
          `/api/products?phrase=${encodeURIComponent(phrase)}`
        );
        if(session){
          const wishResponse = await axios.get('/api/wishlist')
          const wishListFetched = wishResponse.data;
          setWishedProducts(wishListFetched.map(i=>i.product._id.toString()))
        }
        setProducts(response.data);
        setLoadingProducts(false);
      } catch (error) {
        console.log(error);
      }
    } else {
      setProducts([]);
    }
  }, 500), [session]);
  useEffect(() => {
    if (phrase.length > 0) {
      setLoadingProducts(true);
    } else {
      setLoadingProducts(false);
      setProducts([]);
    }
    debouncedSearch(phrase,session);

    return () => {
      debouncedSearch.cancel();
    }

  }, [phrase,debouncedSearch,session]);

  

  return (
    <Layout>
    <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Search - Flavors Of Kalimpong',
              description: 'Search for products on Flavors Of Kalimpong',
              url: 'https://www.flavorsofkalimpong.in/search',
            }),
          }}
          key="search-jsonld"
        />
      </Head>
    <SEO 
     title='Search - Flavors Of Kalimpong'
     description='Search for products on Flavors Of Kalimpong'
     keywords={['search','products','flavors of kalimpong','kalimpong','flavors','flavors of kalimpong','flavors of kalimpong products','flavors of kalimpong search','flavors of kalimpong search products','search page for flavors of kalimpong','search page for flavors of kalimpong products','search page for flavors of kalimpong products']}
    />
      <Header />
      <MarginWrapper>
        <Center>
          <InputWrapper>
            <SearchInput
              normal
              type='text'
              placeholder='Search for products...'
              autoFocus
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
            />
          </InputWrapper>
        
          {!loadingProducts && phrase !== '' && products.length === 0 && (
            <h2>No products found for query &quot;{phrase}&quot;</h2>
          )}
          {loadingProducts && <Spinner fullWidth={true} />}
          {!loadingProducts && products.length > 0 && (
            <ProductsGrid products={products} wishedProducts={wishedProducts}/>
          )}
         
        </Center>
      </MarginWrapper>
      <BottomCart/>
    </Layout>
  );
};

export default SearchPage;
