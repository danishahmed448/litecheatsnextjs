///pages/api/orders/[orderId]/cancel.js
import { Order } from '@/models/Order';
import { isAdminRequest } from '../../auth/[...nextauth]';
import mongooseConnect from '@/lib/mongoose';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'PUT') {
    const { orderId } = req.query;
    try {
      await mongooseConnect();
      await isAdminRequest(req, res);
      const order = await Order.findById(orderId);
      if (order) {
        await Order.findByIdAndDelete(orderId);
        res.status(200).json({ success: true, message: 'Order cancelled.' });
      } else {
        res.status(400).json({ success: false, message: 'Order not found.' });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

export default handler;
