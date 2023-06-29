import multiparty from 'multiparty';
const cloudinary = require('cloudinary').v2;
import { v4 as uuidv4 } from 'uuid';
import pLimit from 'p-limit';
import { isAdminRequest } from './auth/[...nextauth]';
import mongooseConnect from '@/lib/mongoose';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const handle = async (req, res) => {
  await mongooseConnect();
  await isAdminRequest(req, res);
  const { method } = req;
  if (method === 'POST') {
    const form = new multiparty.Form();
    try {
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });
      const limit = pLimit(1);

      const uploadPromises = files.file.map((file) =>
        limit(() => {
          const uniqueFilename = uuidv4();
          const publicId = `${uniqueFilename}`;
          return cloudinary.uploader.upload(file.path, {
            public_id: publicId,
            overwrite: true,
            allowed_formats: ['jpeg', 'jpg', 'png', 'webp'],
          });
        })
      );
      const uploadResults = await Promise.all(uploadPromises);

      const urls = uploadResults.map((result) => result.secure_url);
      res.status(200).json(urls);
    } catch (error) {
      console.error(error);
      res.status(500).json('Internal server error');
    }
  } else if (method === 'DELETE') {
    if (req.query?.publicId) {
      if (req.query?.publicId) {
        try {
          const response = await cloudinary.uploader.destroy(
            req.query.publicId
          );
          if (response.result === 'ok') {
            res.status(200).json({ message: 'File deleted successfully' });
          } else {
            res.status(500).json({ message: 'Failed to delete file' });
          }
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        }
      } else {
        res.status(400).json({ message: 'Public ID not provided' });
      }
    }
  } else {
    res.status(405).json('Method not allowed');
  }
};

export default handle;

export const config = {
  api: { bodyParser: false },
};
