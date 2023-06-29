import mongooseConnect from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";
import { Setting } from "@/models/Setting";

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(req, res);
    if(method==='PUT'){
        const {name,value} = req.body;
        const settingDoc = await Setting.findOne({name});
        if(settingDoc){
            res.json(await Setting.findByIdAndUpdate(settingDoc._id,{value},{new:true}))
        }else{
            res.json(await Setting.create({name,value}));
        }
    }
    if(method==='GET'){
        const {name} = req.query;
        res.json(await Setting.findOne({name}))
    }
  }
  