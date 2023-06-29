import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { isAdminRequest } from './auth/[...nextauth]';
import slugify from 'slugify';

const handle = async (req, res) => {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req,res);
  if (method === 'POST') {
    try {
      const {
        title,
        description,
        price,
        images,
        category,
        properties,
        stock,
        tags,
        downloads,
        typeOfProduct,
        tutorial,
        keyList,
        secret,
      } = req.body;

      const productDoc = await Product.create({
        title,
        description,
        price,
        images,
        category: category === '' ? null : category,
        properties,
        stock : typeOfProduct === 'SecretBased' ? stock : keyList.length,
        tags,
        downloads,
        typeOfProduct,
        tutorial,
        keyList,
        secret,
      });

      return res.json(productDoc);
    } catch (error) {
      return res.status(400).json({ error: 'Error creating product' });
    }
  }
  if (method === 'GET') {
    if (req.query?.id) {
      res.json(await Product.findById(req.query.id));
    } else {
      res.json(await Product.find());
    }
  }
  if (method === 'PUT') {
    try {
      const {
        title,
        description,
        price,
        _id,
        images,
        category,
        properties,
        stock,
        tags,
        downloads,
        typeOfProduct,
        tutorial,
        keyList,
        secret,
      } = req.body;
      const slug = slugify(title, { lower: true });
      const updateFields = {
        title,
        description,
        price,
        images,
        category: category === '' ? null : category,
        properties,
        stock: typeOfProduct === 'SecretBased' ? stock : keyList.length,
        tags,
        downloads,
        typeOfProduct,
        tutorial,
        keyList,
        secret,
        slug,
      };

      await Product.updateOne({ _id }, updateFields);

      return res.json(true);
    } catch (error) {
      return res.status(400).json({ error: 'Error updating product' });
    }
  }
  if (method === 'DELETE') {
    if (req.query?.id) {
      await Product.findByIdAndDelete(req.query.id);
      res.json(true);
    }
  }
};

export default handle;
