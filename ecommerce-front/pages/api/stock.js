const { default: mongooseConnect } = require('@/lib/mongoose');
const { Product } = require('@/models/Product');

const handler = async (req, res) => {
  const { method } = req;
  await mongooseConnect();
  if (method === 'GET') {
    const { id } = req.query;
    try {
      // Find product by id
      const product = await Product.findById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      }

      // Respond with product stock
      return res.status(200).json({ success: true, stock: product.stock });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
};

export default handler;
