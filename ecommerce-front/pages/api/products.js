const { default: mongooseConnect } = require('@/lib/mongoose');
const { Product } = require('@/models/Product');

const handler = async (req, res) => {
  const { method } = req;
  await mongooseConnect();
  if (method === 'GET') {
    const { categories, sort,phrase, ...filters } = req.query;
    let [sortField, sortOrder] = (sort || '_id-desc').split('-');
    let productQuery = { };
    if(categories){
      productQuery.category = categories.split(',');
    }
    if(phrase){
      productQuery['$or']=[
        {title:{$regex:phrase,$options:'i'}},
        {description:{$regex:phrase,$options:'i'}},
      ]
    }
    if (Object.keys(filters).length > 0) {
      Object.keys(filters).forEach((filterName) => {
        productQuery[`properties.${filterName}`] = filters[filterName];
      });
    }
    const products = await Product.find(productQuery, null, {
      sort: { [sortField]: sortOrder==='asc' ? 1:-1 },
    }).select('-keyList -secret');
    res.status(200).json(products);
  }
};

export default handler;
