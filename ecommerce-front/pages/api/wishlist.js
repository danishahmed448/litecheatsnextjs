import mongooseConnect from '@/lib/mongoose';
import { WishedProduct } from '@/models/WishedProduct';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { Product } from '@/models/Product';
const handler = async (req, res) => {
  const { method } = req;
  await mongooseConnect();

  const {
    user: { email },
  } = await getServerSession(req, res, authOptions);

  if (method === 'POST') {
    const { product } = req.body;
    const wishedProduct = await WishedProduct.findOne({
      userEmail: email,
      product,
    });
    if (wishedProduct) {
      await WishedProduct.findByIdAndDelete(wishedProduct._id);
    } else {
      await WishedProduct.create({
        userEmail: email,
        product,
      });
    }
    res.json(true);
  }
  if(method === 'GET'){
      const wishedProducts = await WishedProduct.find({userEmail: email,}).populate({
        path: 'product',
        select: '-keyList -secret',
      });
        res.json(wishedProducts);
  }
};

export default handler;
