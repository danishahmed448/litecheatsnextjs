import mongooseConnect from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { isAdminRequest } from "./auth/[...nextauth]";

const handle = async (req, res) => {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req,res);

  if (method === "POST") {
    const { name, parentCategory, properties } = req.body;

    const categoryData = {
      name,
      parent: parentCategory || undefined,
      properties: properties.length > 0 ? properties : undefined,
    };

    const categoryDoc = await Category.create(categoryData);
    res.json(categoryDoc);
  }
  if (method === "GET") {
    res.json(await Category.find().populate("parent"));
  }
  if (method === "PUT") {
    const { name, parentCategory, _id, properties } = req.body;

    const updateQuery = {
      name,
      parent: parentCategory || null,
      properties: properties.length > 0 ? properties : [],
    };

    await Category.updateOne({ _id }, updateQuery);
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await Category.findByIdAndDelete(req.query.id);
      res.json(true);
    }
  }
};

export default handle;
