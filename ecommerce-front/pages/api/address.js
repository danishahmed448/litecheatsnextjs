import mongooseConnect from '@/lib/mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { Address } from '@/models/Address';

const handler = async (req, res) => {
  const { method } = req;
  await mongooseConnect();
  const { user } = await getServerSession(req, res, authOptions);
  const address = await Address.findOne({ userEmail: user.email });
  if (method === 'PUT') {
    const {
     
      email,
     
    } = req.body;
    if (address) {
      res.json(
        await Address.findByIdAndUpdate(address._id, {
         
          email,
       
        },{new:true})
      );
    } else {
      res.json(
        await Address.create({
          userEmail: user.email,
         
          email,
         
        })
      );
    }
  }
  if (method === 'GET') {
    res.json(address);
  }
};

export default handler;
