import mongooseConnect from "@/lib/mongoose"
import { Order } from "@/models/Order";
import { isAdminRequest } from "./auth/[...nextauth]";
import { PaymentMethod } from "@/models/PaymentMethods";

const handler = async(req,res) => {
  await mongooseConnect();
  await isAdminRequest(req,res);
  res.json(await Order.find({status: { $ne: 'Waiting for payment' }}).populate('paymentMethod').sort({createdAt:-1}));
}

export default handler