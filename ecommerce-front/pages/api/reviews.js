
import { Review } from '@/models/Review';
import { Order } from '@/models/Order';  // make sure to import Order model
import mongooseConnect from '@/lib/mongoose';
import { authOptions } from './auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { User } from '@/models/User';

const handler = async (req, res) => {
  const { method } = req;
  await mongooseConnect();

  if(method === "POST") {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
        return res.status(401).send('You must be logged in to post a review.');
      }
      const {title,description,rating,product} = req.body;
      if(rating<=0){
        return res.status(400).json({message:'Please select a rating.'});
      }
  // find the user in the database
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return res.status(404).send('User not found.');
  }
      // check if user already reviewed the product
      const existingReview = await Review.findOne({ product, user: user._id });
      if (existingReview) {
        return res.status(400).send('You can only review a product once.');
      }
  
      // check if user purchased the product
      const order = await Order.findOne({ 
        userEmail: session.user.email, 
        'line_items.price_data.product_data.metadata.productId': product,
        paid: true 
      });
      if (!order) {
        return res.status(403).send('You can only review products you purchased.');
      }
  
      // create the review
      const review = await Review.create({
        title,
        description,
        rating,
        product,
        user: user._id
      });
      return res.status(201).json(review);
  }

  if(method === "GET") {
    const { product } = req.query;
    // include user's name and profile picture in the response
    const reviews = await Review
      .find({ product }, null, { sort: { createdAt: -1 } })
      .populate('user', 'name image');
    return res.json(reviews);
  }
};

export default handler;
