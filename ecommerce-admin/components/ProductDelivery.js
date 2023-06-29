import { Html } from '@react-email/html';
import { Text } from '@react-email/text';
import { Section } from '@react-email/section';
import { Container } from '@react-email/container';
import { Row } from '@react-email/row';
import { Column } from '@react-email/column';
import { Head } from '@react-email/head';
import { Body } from '@react-email/body';
import { Hr } from '@react-email/hr';
import { Img } from '@react-email/img';
import { Link } from '@react-email/link';
import { Preview } from '@react-email/preview';
import { Heading } from '@react-email/heading';
import React from 'react';
const baseUrl = 'https://flavorsofkalimpong.in';
export const NikeReceiptEmail = ({order,products}) => (
  <Html>
    <Head />
    <Preview>Get your order summary, estimated delivery date and more</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={track.container}>
          <Row>
            <Column>
              <Text style={global.paragraphWithBold}>Tracking Number</Text>
              <Text style={track.number}>{order.awbCode}</Text>
            </Column>
            <Column align='right'>
              <Link
                href={`${baseUrl}/track-order?awbcode=${order.awbCode}`}
                style={global.button}
              >
                Track Package
              </Link>
            </Column>
          </Row>
        </Section>
         
        <Section style={message}>
          <Img
            src={`${baseUrl}/flavors_of_kalimpong.jpg`}
            width='66'
            height='22'
            alt='logo'
            style={{ margin: 'auto' }}
          />
          <Heading style={global.heading}>Delivered</Heading>
          <Text style={global.text}>
            You order is confirmed. Following are the products you purchased:
          </Text>
          <Text style={{ ...global.text, marginTop: 24 }}>
            We have also charged your payment method for the cost of your order
            and will be removing any authorization holds. For payment details,
            please visit your Orders page on xyz.com.
          </Text>
        </Section>
        
        <Section style={global.defaultPadding}>
          <Text style={adressTitle}>Emailed to: {order.email}</Text>
          {order.senderDetails.map((detail,i) => (
            <Text key={i} style={{ ...global.text, fontSize: 14 }}>
              {detail.name}: {detail.value}
            </Text>
          ))}
        </Section>
        <Hr style={global.hr} />
        <Section
          style={{ ...paddingX, paddingTop: '40px', paddingBottom: '40px' }}
        >
          {order.line_items.map((item, id) => (
            <Row key={id}>
              <Column>
                <Img
                  src={item.price_data.product_data.image}
                  alt={item.price_data.product_data.name}
                  style={{ float: 'left' }}
                  width='260px'
                />
              </Column>
              <Column style={{ verticalAlign: 'top', paddingLeft: '12px' }}>
                <Text style={{ ...paragraph, fontWeight: '500' }}>
                  {item.price_data.product_data.name} x {item.quantity}
                </Text>
                {item.keyList && item.keyList.length > 0 && (
                  <>
                    <Text style={{ ...paragraph, fontWeight: '500' }}>
                      Keys
                    </Text>
                    <Text style={global.text}>
                      {item.keyList.map((key) => (
                        <Text key={key} style={global.text}>{key}</Text>
                      ))}
                    </Text>
                  </>
                )}
                {item.secret && (
                  <>
                    <Text style={{ ...paragraph, fontWeight: '500' }}>
                      Secret
                    </Text>
                    <Text style={global.text}>{item.secret}</Text>
                  </>
                )}
              </Column>
            </Row>
          ))}
        </Section>
        
        <Section style={global.defaultPadding}>
          <Row style={{ display: 'inline-flex', marginBottom: 40 }}>
            <Column style={{ width: '170px' }}>
              <Text style={global.paragraphWithBold}>Tracking Number</Text>
              <Text style={track.number}>{order.awbCode}</Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text style={global.paragraphWithBold}>Order Date</Text>
              <Text style={track.number}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </Column>
          </Row>
          <Row>
            <Column align='center'>
              <Link
                href={`${baseUrl}/track-order?awbcode=${order.awbCode}`}
                style={global.button}
              >
                Order Status
              </Link>
            </Column>
          </Row>
        </Section>
       
        <Section style={paddingY}>
          <Text style={global.heading}>Top Picks For You</Text>
          <Row style={recomendations.container}>
                    {products.map((product) => (
            
            <Column 
              style={{ ...recomendations.product, paddingLeft: '4px' }}
              align='center'
              key={product._id}
            >
            <Link href={`${baseUrl}/product/${product.slug}`}>
              <Img
                src={product.images[0]}
                alt={product.title}
                width='100%'
              />
              <Text style={recomendations.title}>
                {product.title}
              </Text>
              <Text style={recomendations.text}>
                {product.description.substring(0, 100)}
              </Text>
            </Link>
            </Column>
          
          ))}
          </Row>
        </Section>
        <Hr style={global.hr} />
        
        <Hr style={global.hr} />
        <Section style={paddingY}>
          <Text style={global.heading}>xyz.com</Text>
        </Section>
        <Hr style={{ ...global.hr, marginTop: '12px' }} />
        <Section style={paddingY}>
          <Row style={footer.policy}>
            <Column>
              <Text style={footer.text}>Web Version</Text>
            </Column>
            <Column>
              <Text style={footer.text}>Privacy Policy</Text>
            </Column>
          </Row>
          <Text style={{ ...footer.text, paddingTop: 30, paddingBottom: 30 }}>
            Please contact us if you have any questions. (If you reply to this
            email, we won't be able to see it.)
          </Text>
          <Text style={footer.text}>
            © 2022 xyz, Inc. All Rights Reserved.
          </Text>
          <Text style={footer.text}>
            xyz, INC
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NikeReceiptEmail;

const paddingX = {
  paddingLeft: '40px',
  paddingRight: '40px',
};

const paddingY = {
  paddingTop: '22px',
  paddingBottom: '22px',
};

const paragraph = {
  margin: '0',
  lineHeight: '2',
};

const global = {
  paddingX,
  paddingY,
  defaultPadding: {
    ...paddingX,
    ...paddingY,
  },
  paragraphWithBold: { ...paragraph, fontWeight: 'bold' },
  heading: {
    fontSize: '32px',
    lineHeight: '1.3',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: '-1px',
  },
  text: {
    ...paragraph,
    color: '#747474',
    fontWeight: '500',
  },
  button: {
    border: '1px solid #929292',
    fontSize: '16px',
    textDecoration: 'none',
    padding: '10px 0px',
    width: '220px',
    display: 'block',
    textAlign: 'center',
    fontWeight: 500,
    color: '#000',
  },
  hr: {
    borderColor: '#E5E5E5',
    margin: '0',
  },
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '10px auto',
  width: '600px',
  border: '1px solid #E5E5E5',
};

const track = {
  container: {
    padding: '22px 40px',
    backgroundColor: '#F7F7F7',
  },
  number: {
    margin: '12px 0 0 0',
    fontWeight: 500,
    lineHeight: '1.4',
    color: '#6F6F6F',
  },
};

const message = {
  padding: '40px 74px',
  textAlign: 'center',
};

const adressTitle = {
  ...paragraph,
  fontSize: '15px',
  fontWeight: 'bold',
};

const recomendationsText = {
  margin: '0',
  fontSize: '15px',
  lineHeight: '1',
  paddingLeft: '10px',
  paddingRight: '10px',
};

const recomendations = {
  container: {
    padding: '20px 0',
  },
  product: {
    verticalAlign: 'top',
    textAlign: 'left',
    paddingLeft: '2px',
    paddingRight: '2px',
  },
  title: { ...recomendationsText, paddingTop: '12px', fontWeight: '500' },
  text: {
    ...recomendationsText,
    paddingTop: '4px',
    color: '#747474',
  },
};

const menu = {
  container: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '20px',
    backgroundColor: '#F7F7F7',
  },
  content: {
    ...paddingY,
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  title: {
    paddingLeft: '20px',
    paddingRight: '20px',
    fontWeight: 'bold',
  },
  text: {
    fontSize: '13.5px',
    marginTop: 0,
    fontWeight: 500,
    color: '#000',
  },
  tel: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '32px',
    paddingBottom: '22px',
  },
};

const categories = {
  container: {
    width: '370px',
    margin: 'auto',
    paddingTop: '12px',
  },
  text: {
    fontWeight: '500',
    color: '#000',
  },
};

const footer = {
  policy: {
    width: '166px',
    margin: 'auto',
  },
  text: {
    margin: '0',
    color: '#AFAFAF',
    fontSize: '13px',
    textAlign: 'center',
  },
};
