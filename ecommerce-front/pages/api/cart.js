import mongooseConnect from "@/lib/mongoose";
import { Product } from "@/models/Product";

const handler = async (req, res) => {
    await mongooseConnect();
    const ids = req.body.ids;
    res.json(await Product.find({_id:ids}).select('-keyList -secret'));
};

export default handler;
