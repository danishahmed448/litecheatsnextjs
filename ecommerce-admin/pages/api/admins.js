import mongooseConnect from '@/lib/mongoose';

import { isAdminRequest } from './auth/[...nextauth]';
import { Admin } from '@/models/Admin';

const handle = async (req, res) => {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === 'POST') {
    let { email } = req.body;
    if(!email){
      res.status(400).json({message:'Email required!'})
    }
    email = email.trim();
    const data = {
      email,
    };

    const adminDoc = await Admin.create(data);
    res.json(adminDoc);
  }
  if (method === 'GET') {
    res.json(await Admin.find().sort({_id:-1}));
  }

  if (method === 'DELETE') {
    if (req.query?.id) {
      await Admin.findByIdAndDelete(req.query.id);
      res.json(true);
    }
  }
};

export default handle;
