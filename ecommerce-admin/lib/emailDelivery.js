import { Order } from '@/models/Order';
import sendgrid from '@sendgrid/mail';
import mongooseConnect from './mongoose';
import { PaymentMethod } from "@/models/PaymentMethods";
import { Product } from '@/models/Product';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
import { render } from '@react-email/render';
import ProductDelivery from '@/components/ProductDelivery';
const sendEmail = async (to, subject, orderId) => {
    await mongooseConnect();
    const order = await Order.findById(orderId).populate('paymentMethod');
    //find maximum 4 products
    const products = await Product.find({}).select('-keyList -secret').limit(4);
  try {
    const emailTemplate = render(<ProductDelivery order={order} products={products} />);
    
    const email = {
      to: to,
      from: process.env.SENDGRID_EMAIL,
      subject: subject,
      html: emailTemplate,
    };
    const emailResponse = await sendgrid.send(email);
    if (
      emailResponse &&
      Array.isArray(emailResponse) &&
      emailResponse.length > 0 &&
      emailResponse[0].statusCode === 202
    ) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      console.log(error.response.data.message);
    } else {
      console.log(error);
    }
    return null;
  }
};

export default sendEmail;
