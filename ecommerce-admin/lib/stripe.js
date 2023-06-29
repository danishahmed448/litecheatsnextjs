import { Order } from '@/models/Order';
import { Setting } from '@/models/Setting';
import Stripe from 'stripe';
import mongooseConnect from './mongoose';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const refundOrder = async (orderId) => {
  try {
    await mongooseConnect();
    const order = await Order.findById(orderId);
    if (order.refunded) return true;
    const shippingFee = Number(order.shippingFee) * 100;
    //add stripe processing fee to shipping fee
    const paymentIntent = await stripe.paymentIntents.retrieve(
      order.stripePaymentIntentId
    );
    const chargeId = paymentIntent.latest_charge;
    const charge = await stripe.charges.retrieve(chargeId, {
      expand: ['balance_transaction'],
    });
    const previousFee = Number(charge.balance_transaction.fee);
    const stripeProcessingFee = await Setting.findOne({
      name: 'stripeProcessingFee',
    });
    const [processingFee, tax] = stripeProcessingFee.value.split('+');
    const currentFee = Number(order.totalAmount) * Number(processingFee);
    const currentTax = (currentFee * Number(tax)) / 100;
    const amountToRefund = parseInt(
      Number(order.totalAmount) * 100 -
        shippingFee -
        currentFee -
        previousFee -
        currentTax
    );

    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      amount: amountToRefund,
    });
    if (refund.status && refund.status === 'succeeded') {
      await Order.findByIdAndUpdate(order._id, { refunded: true });
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};
