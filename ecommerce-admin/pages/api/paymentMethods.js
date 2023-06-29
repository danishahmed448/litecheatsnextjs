import mongooseConnect from '@/lib/mongoose';
import {PaymentMethod} from '@/models/PaymentMethods';
import { isAdminRequest } from './auth/[...nextauth]';

const handle = async (req, res) => {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req,res);
  if (method === 'POST') {
    try {
      const {
        name,
        image,
        qrcode,
        senderDetailsRequired,
        receiverDetailsRequired,
        notes
      } = req.body;

      const productDoc = await PaymentMethod.create({
        name,
        image,
        qrcode,
        senderDetailsRequired,
        receiverDetailsRequired,
        notes
      });

      return res.json(productDoc);
    } catch (error) {
      return res.status(400).json({ error: 'Error creating payment method' });
    }
  }
  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await PaymentMethod.findById(req.query.id));
    } else {
      res.json(await PaymentMethod.find());
    }
  }
  if (method === 'PUT') {
    try {
      const {
        name,
        image,
        qrcode,
        senderDetailsRequired,
        receiverDetailsRequired,
        notes
      } = req.body;
      const updateFields = {
        name,
        image,
        qrcode,
        senderDetailsRequired,
        receiverDetailsRequired,
        notes
      };

      await PaymentMethod.updateOne({ _id }, updateFields);

      return res.json(true);
    } catch (error) {
      return res.status(400).json({ error: 'Error updating payment method' });
    }
  }
  if (method === 'DELETE') {
    if (req.query?.id) {
      await PaymentMethod.findByIdAndDelete(req.query.id);
      res.json(true);
    }
  }
};

export default handle;
