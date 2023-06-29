import { Review } from '@/models/Review';
import { Order } from '@/models/Order'; 
import mongooseConnect from '@/lib/mongoose';
import { authOptions } from './auth/[...nextauth]';

import { User } from '@/models/User';
import { getServerSession } from 'next-auth';

const handler = async (req, res) => {
  const { method } = req;
  await mongooseConnect();

  if(method === "GET") {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      // User must be logged in, so they're ineligible if there's no session
      return res.json({ eligibility: false, message: 'You must be logged in to post a review.' });
    }

    // find the user in the database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      // User must be found in the database, so they're ineligible if not found
      return res.json({ eligibility: false, message: 'You must be logged in to post a review.' });
    }

    const { product } = req.query;
    // check if user already reviewed the product
    const existingReview = await Review.findOne({ product, user: user._id });

    if (existingReview) {
      // User must not have already reviewed the product, so they're ineligible if review exists
      return res.json({ eligibility: false, message: 'You can only review a product once.' });
    }

    // check if user purchased the product
    const order = await Order.findOne({ 
      userEmail: session.user.email, 
      'line_items.price_data.product_data.metadata.productId': product,
      paid: true 
    });

    if (!order) {
      // User must have purchased the product, so they're ineligible if no purchase found
      return res.json({ eligibility: false, message: 'You can only review products you purchased.' });
    }

    // If all conditions have passed, user is eligible
    return res.json({ eligibility: true });
  }
};

export default handler;
