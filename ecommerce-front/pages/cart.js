import Button from '@/components/Button';
import { CartContext } from '@/components/CartContext';
import Center from '@/components/Center';
import Header from '@/components/Header';
import Input from '@/components/Input';
import { MarginWrapper } from '@/components/MarginWrapper';
import Spinner from '@/components/Spinner';
import SubTitle from '@/components/SubTitle';
import Table from '@/components/Table';
import ClearIcon from '@/components/icons/Clear';
import { limitLength } from '@/lib/common';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { SnackBarContext } from '@/components/SnackbarContext';
import Typewriter from 'typewriter-effect';
import SEO from '@bradgarropy/next-seo';
import Head from 'next/head';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import Title from '@/components/Title';
import Image from 'next/image';
const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  table thead tr th:nth-child(4),
  table tbody tr td:nth-child(4) {
    text-align: right;
  }
  table tr.subtotal td {
    padding: 5px 0px;
  }
  table tr.total td {
    font-weight: 700;
  }
`;
const CartTitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const CartIconWrapper = styled.td`
  text-align: start;
`;
export const Box = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  /* overflow-x: scroll; */
`;
const ProductInfoCell = styled.td`
  padding: 10px 0;
  font-size: 0.8rem;
  display: flex;
  justify-content: end;
`;
const ProductImageBox = styled(Link)`
  width: 40px;
  height: 40px;
  padding: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  img {
    max-width: 30px;
    max-height: 30px;
  }
  @media screen and (min-width: 768px) {
    width: 70px;
    height: 70px;
    padding: 10px;
    img {
      max-width: 60px;
      max-height: 60px;
    }
  }
`;
const PaymentMethodDiv = styled.div`
display: flex;
margin-bottom: 10px;
justify-content:flex-start;
align-items: center;
`;
const QuantityLabel = styled.span`
  padding: 0 15px;
  display: block;
  @media screen and (min-width: 768px) {
    display: inline-block;
    padding: 0 6px;
  }
`;

const CityHolder = styled.div`
  display: flex;
  gap: 5px;
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
`;
const ProductTitle = styled.td`
  padding-left: 2%;
  max-width: 50%;
  width: 50%;
  word-wrap: break-word;
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
  @media screen and (max-width: 500px) {
    font-size: 0.6rem;
  }
  @media screen and (max-width: 350px) {
    font-size: 0.5rem;
  }
`;
const TitleLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  ${(props) =>
    props.red &&
    css`
      color: red;
      cursor: default;
    `}
  ${(props) =>
    props.button &&
    css`
      width: fit-content;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid red;
      border-radius: 5px;
      padding: 2px 7px;
      cursor: pointer;
      svg {
        height: 16px;
        margin-right: 2px;
        cursor: pointer;
        @media screen and (max-width: 768px) {
          height: 0.7rem;
        }
        @media screen and (max-width: 500px) {
          height: 0.6rem;
        }
        @media screen and (max-width: 350px) {
          height: 0.5rem;
        }
      }
    `}
`;
const CenterTH = styled.th`
  display: flex;
  justify-content: end;
`;
const CartList = styled.div`
  width: 100%;
  height: auto;
  overflow: hidden;
`;
export const CheckWrapper = styled.div`
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  input {
    margin-bottom: 0;
    flex: 1;
  }
  button {
    flex: 1;
    max-width: fit-content;
  }
`;
const DeliveryInfo = styled.div`
  background-color: #19a572;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
  color: white;
  @media screen and (max-width: 768px) {
    font-size: 0.7rem;
  }
  @media screen and (max-width: 300px) {
    font-size: 0.6rem;
  }
`;
export const H4Titles = styled.h4`
  margin:  10px 0px;
`
const DeliveryFee = styled.div``;
const DeliveryDay = styled.div``;
const CheckTitle = styled.h2`
  font-weight: 400;
  font-size: 1.1rem;
  @media screen and (max-width: 768px) {
    font-size: 0.9rem;
  }
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 20px;
`;
const CartPage = () => {
  const {
    cartProducts,
    addProduct,
    removeProduct,
    clearCart,
    clearSingleProduct,
    validateCartProducts,
  } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState('');
 
  const [isSuccess, setIsSuccess] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState(false);
  const [shippingFee, setShippingFee] = useState('');
  const [shippingLoading, setshippingLoading] = useState(false);
  
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { data: session } = useSession();
  const { snackBarOpen } = useContext(SnackBarContext);
  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('')
  const [awbCode, setAwbCode] = useState('');
  console.log(paymentMethod)
  const router = useRouter();
  useEffect(() => {
    const source = axios.CancelToken.source();
    const sourceTwo = axios.CancelToken.source();
    const getAllProducts = async () => {
      try {
        const response = await axios.post(
          '/api/cart',
          { ids: cartProducts },
          { cancelToken: source.token }
        );
        setProducts(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          // handle error
        }
      }
    };
    const getAllPaymentMethods = async () => {
      try {
        const response = await axios.get('/api/payment',{ cancelToken: sourceTwo.token });
        setPaymentMethodList(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          // handle error
        }
      }
    }
    if (cartProducts.length > 0) {
      getAllProducts();
      
    } else {
      setProducts([]);
    }
    getAllPaymentMethods();
    return () => {
      source.cancel();
      sourceTwo.cancel();
    };
  }, [cartProducts]);
  useEffect(() => {
    const source = axios.CancelToken.source();
  },[])
  const getShippingFee = useCallback(
    async (source) => {
     
      if (cartProducts.length <= 0) {
        return;
      }
      try {
        setshippingLoading(true);
        const response = await axios.post(
          '/api/shipping',
          {
            cartProducts,
          },
          {
            cancelToken: source?.token,
          }
        );
         
        setShippingFee(response.data.fee);
        setshippingLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          if (error.response && error.response.data) {
            snackBarOpen(error.response.data.message, 'error');
          } else {
            snackBarOpen(error.message, 'error');
          }
        }
        setshippingLoading(false);
      }
    },
    [cartProducts, snackBarOpen]
  );
  useEffect(() => {
    const source = axios.CancelToken.source();
    const shippingSource = axios.CancelToken.source();
    const getAddress = async () => {
      try {
        if(session){
          const response = await axios.get('/api/address', {
            cancelToken: source.token,
          });
          if (response.data) {
            const { email } = response.data;
            setEmail(email);
          }
        }
        await getShippingFee(shippingSource);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log('Request cancelled');
        } else {
          // handle error
        }
      }
    };
    
      getAddress();
    

    return () => {
      source.cancel();
      shippingSource.cancel();
    };
  }, [session, getShippingFee]);
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.location.href.includes('success')
    ) {
      setIsSuccess(true);
      const awbCode = window.location.href.split('&awbcode=')[1];
      setAwbCode(awbCode);
      clearCart();
    }
  }, [ ]);

  const moreOfThisProduct = async (id, stock) => {
    await addProduct(id, stock);
  };
  const lessOfThisProduct = async (id, stock) => {
    await removeProduct(id, stock);
  };
  const handleOrderInputChange = (e) => {
    const { name, value, checked } = e.target;
    switch (name) {
    
    
      case 'email':
        setEmail(value);
        break;
    
    
    
    
      case 'defaultAddress':
        setDefaultAddress(checked);
        break;
      default:
        break;
    }
  };
  const goToPayment = async () => {
    if(!paymentMethod){
      return;
    }
    try {
      setPaymentLoading(true);
      const response = await axios.post('/api/checkout', {
        email,
        cartProducts,
        defaultAddress,
        paymentMethod
      });
      if (response.data.orderId) {
        router.push(`/checkout/${response.data.orderId}`);
      } else {
        setPaymentLoading(false);
      }
    } catch (error) {
      setPaymentLoading(false);
      console.log(error);
      if (error.response.status === 400) {
        if (error.response.data.message === 'OUT_OF_STOCK_PRODUCTS') {
          const outOfStockProducts = error.response.data?.outOfStockProducts;
          const outOfStockProductMap = outOfStockProducts.reduce(
            (map, product) => {
              map[product._id] = product;
              return map;
            },
            {}
          );
          setProducts((prev) =>
            prev.map((product) => {
              const outOfStockProduct = outOfStockProductMap[product._id];
              if (outOfStockProduct) {
                return { ...product, stock: outOfStockProduct.stock };
              } else {
                return product;
              }
            })
          );
          snackBarOpen('Payment failed due to out of stock products', 'error');
          await validateCartProducts();
        } else {
          if (error.response && error.response.data) {
            snackBarOpen(error.response.data.message, 'error');
          } else {
            snackBarOpen(error.message, 'error');
          }
        }
      } else {
        if (error.response && error.response.data) {
          snackBarOpen(error.response.data.message, 'error');
        } else {
          snackBarOpen(error.message, 'error');
        }
      }
    }
  };
  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  let productsTotal = 0;
  for (const productId of cartProducts) {
    const price =
      products.find((p) => p._id === productId && p.stock > 0)?.price || 0;
    productsTotal += price;
  }
  let continueToPayment =
    products.every((product) => product.stock > 0) || false;
  if (isSuccess) {
    return (
      <Layout>
        <SEO
          title={`Order Success | Flavors Of Kalimpong`}
          description={`Get ready for an exciting delivery experience! We will keep you
        updated with SMS notifications as we prepare and send your
        order on its way to you.`}
          keywords={[
            'flavors of kalimpong',
            'order success',
            'order success page',
            'order success page flavors of kalimpong',
            'flavors of kalimpong order success page',
          ]}
        />
        <Header />
        <MarginWrapper>
          <Center>
            <ColumnsWrapper>
              <Box>
                <h1>Thank You for Your Order!</h1>
                <p>
                  Thank You! We{`'`}ll send your product by email in short time once order is confirmed by admin.Your Tracking ID is <b>{awbCode}</b> and you can track your order by clicking on the button below.
                </p>
                <Button
                black
                  onClick={() => {
                    router.push({
                      pathname: `/track-order`,
                      query: { awbcode: awbCode },
                    });
                  }}
                >
                  Track Order
                </Button>
              </Box>
            </ColumnsWrapper>
          </Center>
        </MarginWrapper>
      </Layout>
    );
  }
  if (paymentLoading) {
    return (
      <>
        <Spinner fullWidth />
      </>
    );
  }
  return (
    <Layout>
      <Head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Cart - Flavors Of Kalimpong',
              description:
                'Dive into your cart and checkout with your favorite products from Flavors Of Kalimpong',
              url: 'https://www.flavorsofkalimpong.in/cart',
            }),
          }}
          key='cart-jsonld'
        />
      </Head>
      <SEO
        title={`Cart ${
          cartProducts.length > 0 ? `(${cartProducts.length})` : ''
        } - Flavors Of Kalimpong`}
        description={`Dive into your cart and checkout with your favorite products from Flavors Of Kalimpong`}
        keywords={[
          'flavors of kalimpong',
          'cart',
          'cart page',
          'cart page flavors of kalimpong',
          'flavors of kalimpong cart page',
          'checkout',
          'checkout page',
          'checkout page flavors of kalimpong',
          'flavors of kalimpong checkout page',
          'cart flavors of kalimpong',
          'checkout flavors of kalimpong',
          'flavors of kalimpong cart',
          'flavors of kalimpong checkout',
        ]}
      />
      <Header />
      <MarginWrapper>
        <Center>
          <ColumnsWrapper>
            <Box>
              <CartTitleWrapper>
                <h2>Cart</h2>
                {cartProducts.length > 0 && (
                  <Button
                    reduceSizeScreenOnlyFont
                    red
                    outline
                    onClick={clearCart}
                  >
                    <ClearIcon />
                    Empty cart
                  </Button>
                )}
              </CartTitleWrapper>
              {!cartProducts?.length && <div>Your cart is empty</div>}
              {cartProducts?.length > 0 && products?.length === 0 && (
                <Spinner fullWidth />
              )}
              {products?.length > 0 && (
                // <CartList>
                //   {products.map((product, index) => (
                //     <ShoppingCart
                //       key={product._id}
                //       product={product}
                //       cartProducts={cartProducts}
                //       lessOfThisProduct={lessOfThisProduct}
                //       moreOfThisProduct={moreOfThisProduct}
                //     />
                //   ))}
                // </CartList>
                <Table>
                  <thead>
                    <tr>
                      <CenterTH>Product</CenterTH>
                      <th></th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product, index) => (
                      <tr key={product._id}>
                        <ProductInfoCell>
                          <ProductImageBox href={`/product/${product.slug}`}>
                            <img src={product.images[0]} alt={product.title} />
                          </ProductImageBox>
                        </ProductInfoCell>
                        <ProductTitle>
                          <TitleLink href={`/product/${product.slug}`}>
                            {limitLength(product.title)}
                          </TitleLink>
                          {product.stock <= 0 && (
                            <TitleLink
                              red
                              href={'#'}
                              onClick={(e) => e.preventDefault()}
                            >
                              Out of stock
                            </TitleLink>
                          )}
                        </ProductTitle>

                        <CartIconWrapper colSpan={product.stock > 0 ? 1 : 2}>
                          {product.stock > 0 ? (
                            <ButtonContainer>
                              <Button
                                green
                                outline
                                removeRightBorder
                                reduceSizeScreen
                                onClick={async () => {
                                  await lessOfThisProduct(
                                    product._id,
                                    product.stock
                                  );
                                }}
                              >
                                -
                              </Button>
                              <Button reduceSizeScreen green>
                                {
                                  cartProducts.filter(
                                    (id) => id === product._id
                                  ).length
                                }
                              </Button>
                              <Button
                                green
                                outline
                                removeLeftBorder
                                reduceSizeScreen
                                onClick={async () => {
                                  await moreOfThisProduct(
                                    product._id,
                                    product.stock
                                  );
                                }}
                              >
                                +
                              </Button>
                            </ButtonContainer>
                          ) : (
                            <TitleLink
                              red
                              button
                              href={'#'}
                              onClick={(e) => {
                                e.preventDefault();
                                clearSingleProduct(product._id);
                              }}
                            >
                              <ClearIcon
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearSingleProduct(product._id);
                                }}
                              />
                              Remove
                            </TitleLink>
                          )}
                        </CartIconWrapper>

                        {product.stock > 0 ? (
                          <td>
                            ₹
                            {cartProducts.filter((id) => id === product._id)
                              .length * product.price}
                          </td>
                        ) : (
                          <></>
                        )}
                      </tr>
                    ))}
                    <tr className='subtotal'>
                      <td></td>
                      <td></td>
                      <td>Subtotal</td>
                      <td>₹{productsTotal}</td>
                    </tr>
                    {shippingFee && !shippingLoading ? (
                      <tr className='subtotal'>
                        <td></td>
                        <td></td>
                        <td>Fee</td>
                        <td>₹{shippingFee}</td>
                      </tr>
                    ) : (
                      <></>
                    )}
                    {shippingLoading && (
                      <tr className='subtotal'>
                        <td></td>
                        <td></td>
                        <td>Fee</td>
                        <td>
                          <Spinner smaller justifyend />
                        </td>
                      </tr>
                    )}
                    <tr className='subtotal total'>
                      <td></td>
                      <td></td>
                      <td>Total</td>
                      <td>
                        ₹{Number(productsTotal) + Number(shippingFee || 0)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              )}
            </Box>
            {!!cartProducts?.length && (
              <Box>

                
<H4Titles>Email For Delivery</H4Titles>
                <Input
                  name='email'
                  value={email}
                  onChange={handleOrderInputChange}
                  type='text'
                  placeholder='Email'
                  required
                />
                
                
                
                
                {session && (
                  <SubTitle flex input>
                    <input
                      type='checkbox'
                      name='defaultAddress'
                      checked={defaultAddress}
                      onChange={handleOrderInputChange}
                    />
                    <label>Set as default email</label>
                  </SubTitle>
                )}
                <div>
                   <H4Titles>Select Payment Method</H4Titles>
                   {paymentMethodList.map((p) => (
                    <PaymentMethodDiv key={p._id}>
                      <input
                        type='radio'
                        name='paymentMethod'
                        value={p._id}
                        checked={p._id === paymentMethod}
                        onChange={handlePaymentChange}
                      />
                      <Image height='30' width='100' style={
                        {
                          objectFit: 'contain',
                          maxWidth:'100%'
                        }
                      } src={p.image} alt={p.name} />
                    </PaymentMethodDiv>
                   ))}
                </div>
                <Button
                  reducesizescreennormal
                  black
                  block
                  onClick={
                    continueToPayment
                      ? goToPayment
                      : () => {
                          snackBarOpen(
                            'Remove out of stock products from cart before checking out!',
                            'error'
                          );
                        }
                  }
                  disabledbutton={!continueToPayment}
                >
                  Continue to payment
                </Button>
              </Box>
            )}
          </ColumnsWrapper>
        </Center>
      </MarginWrapper>
    </Layout>
  );
};

export default CartPage;
