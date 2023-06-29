///pages/api/orders/[orderId]/cancel.js
import { Order } from '@/models/Order';
import { isAdminRequest } from '../../auth/[...nextauth]';
import mongooseConnect from '@/lib/mongoose';
import sendEmail from '@/lib/emailDelivery';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    const { orderId } = req.query;
    try {
      await mongooseConnect();
      await isAdminRequest(req, res);
      const order = await Order.findById(orderId);
      if (order) {
        await sendEmail(order.email,'Order Completed',order._id);
        res.status(200).json({ success: true, message: 'Email sent' });
      } else {
        res.status(400).json({ success: false, message: 'Order not found.' });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

export default handler;
