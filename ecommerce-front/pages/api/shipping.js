import mongooseConnect from '@/lib/mongoose';
import { Product } from '@/models/Product';
import { Setting } from '@/models/Setting';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    const { cartProducts } = req.body;
    try {
      await mongooseConnect();
      const productIds = cartProducts;
      const uniqueIds = [...new Set(productIds)];
      const productInfos = await Product.find({ _id: uniqueIds });
      let totalPrice=0;
      for (const productId of uniqueIds) {
        const productInfo = productInfos.find(
          (p) => p._id.toString() === productId
        );
        const quantity =
          productIds.filter((id) => id === productId)?.length || 0;

         totalPrice += productInfo.price * quantity;
      }
      const feeSetting = await Setting.findOne({ name: 'stripeProcessingFee' });
      const [processingFee, tax] = feeSetting.value.split('+');
      const currentFee = Number(totalPrice) * Number(processingFee)/100;
      const currentFeeWithTax= currentFee*Number(tax)/100;
      let finalFee = currentFee + currentFeeWithTax;
      //round final fee to a whole number
      finalFee = Math.round(finalFee);
      res.status(200).json({fee:finalFee});
    } catch (error) {
      console.error('An error occurred during shipping fee enquiry:', error);
      res.status(500).json({
        message: 'An error occurred during shipping fee enquiry',
      });
    }
  }
}
