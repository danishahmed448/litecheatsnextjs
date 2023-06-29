import mongooseConnect from "@/lib/mongoose";
import { PaymentMethod } from "@/models/PaymentMethods";


const handler = async(req, res) => {
    await mongooseConnect();
    const {method} = req;
   
    if(method==='GET'){
        let paymentMethods = await PaymentMethod.find({});
        res.json(paymentMethods)
    }
};

export default handler;
