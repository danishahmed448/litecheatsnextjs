import mongooseConnect from '@/lib/mongoose';
import { Order } from '@/models/Order';
const { v4: uuidv4 } = require('uuid');
const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    try {
      const { orderid } = req.query;
      const { senderDetails } = req.body;
      console.log(senderDetails)
      // Check if any required field is empty
      if (!senderDetails) {
        res.status(400).json({ message: 'Sender details required.' });
        return;
      }
      await mongooseConnect();
      const order = await Order.findById(orderid).populate('paymentMethod');
      if(order.paid || order.status === 'Order processing'){
        res.status(400).json({ message: 'Order already paid.' });
        return;
      }
      order.senderDetails = senderDetails.map((detail) => {
        if (order.paymentMethod.senderDetailsRequired.includes(detail.name)) {
          return detail;
        } else {
          //end the function and send an error
          res.status(400).json({ message: 'Invalid sender details.' });
          return;
        }
      });
      const randomUUID = uuidv4();
      order.awbCode = randomUUID.replace(/-/g, '');
      order.status = 'Order processing';
      console.log(order)
      await order.save();
      res.status(200).json({ success: true, awbCode: order.awbCode });
    } catch (error) {
      console.error('An error occurred during payment:', error);
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
