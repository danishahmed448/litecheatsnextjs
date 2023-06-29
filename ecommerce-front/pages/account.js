import Button from '@/components/Button';
import Center from '@/components/Center';
import Header from '@/components/Header';
import Input from '@/components/Input';
import { MarginWrapper } from '@/components/MarginWrapper';
import WhiteBox from '@/components/WhiteBox';
import { getSession, signIn, signOut, useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { CategoryHeader } from './category/[name]';
import Title from '@/components/Title';
import axios from 'axios';
import Spinner from '@/components/Spinner';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { SyncLoader } from 'react-spinners';
import emotstyled from '@emotion/styled';
import BottomCart from '@/components/BottomCart';
import ProductBox from '@/components/ProductBox';
import Tabs from '@/components/Tabs';
import SingleOrder from '@/components/OrderLine';
import { useRouter } from 'next/router';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import Layout from '@/components/Layout';
export const ColsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-bottom: 40px;
`;
const CityHolder = styled.div`
  display: flex;
  gap: 5px;
`;
const StyledMuiAlert = emotstyled(MuiAlert)`
display:flex;
align-items:center;

  max-width:fit-content;
  .MuiAlert-action{
    padding:0;
    margin-left:12px;
    button{
      padding-left:0;
      padding-right:0;
    }
  }
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
    svg {
      width: 20px; // Adjust as needed
      height: 20px; // Adjust as needed
    }
  }
  @media screen and (max-width: 500px) {
    font-size: 0.6rem;
    svg {
      width: 18px; // Adjust as needed
      height: 18px; // Adjust as needed
    }
  }
  @media screen and (max-width: 350px) {
    font-size: 0.5rem;
    svg {
      width: 16px; // Adjust as needed
      height: 16px; // Adjust as needed
    }
  }
`;
const Alert = React.forwardRef(function Alert(props, ref) {
  return <StyledMuiAlert elevation={6} ref={ref} variant='filled' {...props} />;
});
const WishedProductsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  @media screen and (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;
export const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
`;
const AccountPage = ({ serverSession }) => {
  const [email, setEmail] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [loadedWish, setLoadedWish] = useState(false);
  const [loadedOrders, setLoadedOrders] = useState(false);
  const { data: clientSession } = useSession();
  const [snackbar, setsnackbar] = useState(false);
  const [snackbarmessage, setsnackbarmessage] = useState('');
  const [saving, setsaving] = useState(false);
  const [wishedProducts, setWishedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Wishlist');
  const [orders, setOrders] = useState([]);
  const session = serverSession || clientSession;
  const router = useRouter();
  useEffect(() => {
    const source = axios.CancelToken.source();
    const sourceWish = axios.CancelToken.source();
    const sourceOrders = axios.CancelToken.source();
    const getAddress = async () => {
      try {
        const response = await axios.get('/api/address', {
          cancelToken: source.token,
        });
        if (response.data) {
          const { email } = response.data;

          setEmail(email);
        }
        setLoaded(true);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          // handle error
        }
      }
    };
    const getWishList = async () => {
      try {
        const response = await axios.get('/api/wishlist', {
          cancelToken: sourceWish.token,
        });
        setWishedProducts(response.data.map((wp) => wp.product));
        setLoadedWish(true);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          // handle error
        }
      }
    };
    const getOrdersList = async () => {
      try {
        const response = await axios.get('/api/orders', {
          cancelToken: sourceOrders.token,
        });
        setOrders(response.data);
        setLoadedOrders(true);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          // handle error
        }
      }
    };

    if (session) {
      getAddress();
      getWishList();
      getOrdersList();
    }

    return () => {
      source.cancel();
      sourceWish.cancel();
      sourceOrders.cancel();
    };
  }, [session]);

  useEffect(() => {
    if (router?.query?.ordercanceled === '1') {
      setActiveTab('Orders');
    }
  }, [router]);
  const logout = async () => {
    await signOut();
  };
  const login = async () => {
    await signIn('google');
  };
  const handleOrderInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'email':
        setEmail(value);
        break;
      default:
        break;
    }
  };
  const snackBarOpen = async (message) => {
    setsnackbarmessage(message);
    setsnackbar(true);
  };
  const saveAddress = async () => {
    setsaving(true);
    const response = await axios.put('/api/address', {
      email,
    });
    if (response.data) {
      const { email } = response.data;

      setEmail(email);

      await snackBarOpen('Saved successfully!');
      setsaving(false);
    }
  };
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setsnackbar(false);
  };
  const productRemoved = (id) => {
    setWishedProducts((prev) => prev.filter((p) => p._id.toString() !== id));
  };
  return (
    <Layout>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Account - Flavors Of Kalimpong',
              description:
                'Login and see your orders and wishlist on Flavors Of Kalimpong',
              url: 'https://www.flavorsofkalimpong.in/account',
            }),
          }}
          key='account-jsonld'
        />
      </Head>
      <SEO
        title={`Account - Flavors Of Kalimpong`}
        description={`Login and see your orders and wishlist on Flavors Of Kalimpong`}
        keywords={[
          'Flavors Of Kalimpong',
          'Account',
          'Orders',
          'Wishlist',
          'Login',
          'Logout',
          'Flavors Of Kalimpong Account',
          'Flavors Of Kalimpong Orders',
          'Flavors Of Kalimpong Wishlist',
          'Flavors Of Kalimpong Login',
          'Flavors Of Kalimpong Logout',
          'Flavors Of Kalimpong Account Orders',
          'Flavors Of Kalimpong Account Wishlist',
          'Flavors Of Kalimpong Account Login',
          'Flavors Of Kalimpong Account Logout',
        ]}
      />
      <Header />
      <MarginWrapper>
        <Center>
          <CategoryHeader>
            <Title marginverticaless>Account</Title>
            {session && (
              <Button reducesizescreennormal black onClick={logout}>
                Logout
              </Button>
            )}
            {!session && (
              <Button reducesizescreennormal black onClick={login}>
                Login
              </Button>
            )}
          </CategoryHeader>
          <ColsWrapper>
            <div>
              <WhiteBox white>
                <Tabs
                  tabs={['Orders', 'Wishlist']}
                  active={activeTab}
                  onChange={setActiveTab}
                />
                {!session && <div>Not logged in.</div>}
                {activeTab === 'Wishlist' && (
                  <>
                    {loadedWish ? (
                      <WishedProductsGrid>
                        {wishedProducts.length > 0 ? (
                          wishedProducts.map((wp) => (
                            <ProductBox
                              {...wp}
                              key={wp._id}
                              wished={true}
                              onRemoveFromWishList={productRemoved}
                              graybox={true}
                            />
                          ))
                        ) : (
                          <div>Your wishlist is empty</div>
                        )}
                      </WishedProductsGrid>
                    ) : session ? (
                      <Spinner fullWidth />
                    ) : (
                      <></>
                    )}
                  </>
                )}
                {activeTab === 'Orders' && (
                  <>
                    {loadedOrders ? (
                      <OrdersGrid>
                        {orders.length > 0 ? (
                          orders.map((od) => (
                            <SingleOrder key={od._id} {...od} />
                          ))
                        ) : (
                          <div>No orders found.</div>
                        )}
                      </OrdersGrid>
                    ) : session ? (
                      <Spinner fullWidth />
                    ) : (
                      <></>
                    )}
                  </>
                )}
              </WhiteBox>
            </div>
            {session && (
              <div>
                <WhiteBox white>
                  <h2>Default email to deliver</h2>
                  {loaded ? (
                    <>
                      <Input
                        name='email'
                        value={email}
                        onChange={handleOrderInputChange}
                        type='text'
                        placeholder='Email'
                      />

                      <Button
                        reducesizescreennormal
                        black
                        block
                        onClick={saveAddress}
                      >
                        {!saving ? (
                          'Save'
                        ) : (
                          <SyncLoader
                            size={9}
                            speedMultiplier={1}
                            color={'#fff'}
                          />
                        )}
                      </Button>
                    </>
                  ) : (
                    <Spinner fullWidth />
                  )}
                </WhiteBox>
              </div>
            )}
          </ColsWrapper>
          <Snackbar
            open={snackbar}
            autoHideDuration={3000}
            onClose={handleClose}
          >
            <Alert
              onClose={handleClose}
              severity='success'
              sx={{ width: '100%' }}
            >
              {snackbarmessage}
            </Alert>
          </Snackbar>
        </Center>
      </MarginWrapper>
      <BottomCart />
    </Layout>
  );
};

export default AccountPage;

export async function getServerSideProps(context) {
  const serverSession = await getSession(context);

  return {
    props: {
      serverSession,
    },
  };
}
