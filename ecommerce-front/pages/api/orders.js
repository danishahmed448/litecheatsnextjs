import mongooseConnect from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

const handler = async(req, res) => {
    await mongooseConnect();
    const {method} = req;
    const session = await getServerSession(req,res,authOptions);
    if(method==='GET'){
        let orders = await Order.find({userEmail:session?.user?.email},null,{sort:{_id:-1}})
        //remove deliveryProducts from each order if order is not paid
        orders = orders.map(order=>{
            if(!order.paid){
                order.line_items=order.line_items.map(item=>{
                    item.keyList = undefined;
                    item.secret = undefined;
                    return item;
                }
                )
            }
            return order;
        })
        res.json(orders)
    }
};

export default handler;
