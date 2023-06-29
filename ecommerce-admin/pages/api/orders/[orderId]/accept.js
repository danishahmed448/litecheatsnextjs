///pages/api/orders/[orderId]/cancel.js

import { Order } from '@/models/Order';
import { isAdminRequest } from '../../auth/[...nextauth]';
import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';

import { PaymentMethod } from '@/models/PaymentMethods';
import sendEmail from '@/lib/emailDelivery';
const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    const { orderId } = req.query;
    try {
      await mongooseConnect();
      await isAdminRequest(req, res);
      const order = await Order.findById(orderId).populate('paymentMethod');
      if (order) {
        if (order.paid) {
          res
            .status(400)
            .json({ success: false, message: 'Order is already paid.' });
          return;
        }
        //make sure there is no out of stock products on order.line_items
        let outOfStockProducts = [];
        for (const lineItem of order.line_items) {
          const product = await Product.findById(
            lineItem.price_data.product_data.metadata.productId
          );
          if (product.stock < lineItem.quantity) {
            outOfStockProducts.push(product);
          }
        }
        if (outOfStockProducts.length > 0) {
          res
            .status(400)
            .json({
              message: `The following products are out of stock: ${outOfStockProducts
                .map((p) => p.title)
                .join(',')}`,
            });
          return;
        }
        order.line_items = order.line_items.map(async (lineItem) => {
          const product = await Product.findById(
            lineItem.price_data.product_data.metadata.productId
          );
          if (product.stock >= lineItem.quantity) {
            product.stock -= lineItem.quantity;
            if (product.typeOfProduct === 'KeyBased') {
              //remove keys based on quantity from the product and add those keys to the order
              const keys = product.keyList.splice(0, lineItem.quantity);
              lineItem.keyList = keys;
              //if there is secret in product then we have to add the secret to the order
              if (product.secret) {
                lineItem.secret = product.secret;
              }
            } else {
              //if it is not KeyBased then we have to just add the secret if exist to the order and save it
              if (product.secret) {
                lineItem.secret = product.secret;
              }
            }
            await product.save();
            return lineItem;
          }
        });
        order.line_items = await Promise.all(order.line_items);
        order.status = 'Order Delivered';
        order.paid = true;
        await order.save();
        const emailSent=await sendEmail(order.email,'Order Delivered',order._id);
        let newOrder=order;
        if(emailSent){
          newOrder=await Order.findByIdAndUpdate(order._id,{emailSent:true}).populate('paymentMethod');
        }
        res.status(200).json({ success: true, updatedOrder: newOrder });
      } else {
        res.status(400).json({ success: false, message: 'Order not found.' });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

export default handler;
