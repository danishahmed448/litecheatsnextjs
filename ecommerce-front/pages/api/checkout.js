import mongooseConnect from '@/lib/mongoose';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { authOptions } from './auth/[...nextauth]';
import { Address } from '@/models/Address';
import { Setting } from '@/models/Setting';

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    try {
      const {
        email,
        paymentMethod,
        cartProducts,
        defaultAddress,
      } = req.body;
      // Check if any required field is empty
      if (
        !email ||
        !paymentMethod ||
        !cartProducts
      ) {
        res.status(400).json({ message: 'All fields are required.' });
        return;
      }
      await mongooseConnect();
      if (defaultAddress) {
        const { user } = await getServerSession(req, res, authOptions);
        const address = await Address.findOne({ userEmail: user.email });
        if (address) {
          await Address.findByIdAndUpdate(
            address._id,
            {
              email,
            },
            { new: true }
          );
        } else {
          await Address.create({
            userEmail: user.email,
            email,
          });
        }
      }
      const productIds = cartProducts;
      const uniqueIds = [...new Set(productIds)];
      const productInfos = await Product.find({ _id: uniqueIds });

      let line_items = [];
      let outOfStockProducts = [];
      let totalPrice=0;
      for (const productId of uniqueIds) {
        const productInfo = productInfos.find(
          (p) => p._id.toString() === productId
        );
        const quantity =
          productIds.filter((id) => id === productId)?.length || 0;
        totalPrice += productInfo.price * quantity;
        if (quantity > 0 && productInfo) {
          if (productInfo.stock >= quantity) {
            line_items.push({
              quantity,
              price_data: {
                currency: 'INR',
                product_data: {
                  name: productInfo.title,
                  image:productInfo.images[0],
                  metadata: {
                    productId: productId,
                    selling_price: Number(productInfo.price),
                  },
                },
                unit_amount: Number(productInfo.price),
              },
            });
          } else {
            outOfStockProducts.push(productInfo);
          }
        }
      }
      if (outOfStockProducts.length > 0) {
        res.status(400).json({
          message: 'OUT_OF_STOCK_PRODUCTS',
          outOfStockProducts,
        });
        return;
      }
      const session = await getServerSession(req, res, authOptions);
      
      const shippingFeeData = await Setting.findOne({name:'stripeProcessingFee'})
      

      if (!shippingFeeData) {
        res.status(400).json({
          message: 'Order creation failed.Try again.',
        });
        return;
      }
      const [processingFee, tax] = shippingFeeData.value.split('+');
      const currentFee = Number(totalPrice) * Number(processingFee)/100;
      const currentFeeWithTax= currentFee*Number(tax)/100;
      let finalFee = currentFee + currentFeeWithTax;
      //round final fee to a whole number
      finalFee = Math.round(finalFee);
      const orderDoc = await Order.create({
        line_items,
        email,
        paid: false,
        userEmail: session?.user?.email,
        fee: finalFee,
        totalAmount:totalPrice+finalFee,
        paymentMethod,
        status:'Waiting for payment'
      });
      console.log('orderDoc', orderDoc);
      res.json({
        orderId: orderDoc._id,
      });
    } catch (error) {
      console.error('An error occurred during checkout:', error);
      res.status(500).json({
        message: 'An error occurred during payment processing',
      });
    }
  } else {
    res.json('should be a POST request');
    return;
  }
};

export default handler;
