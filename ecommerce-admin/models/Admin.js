const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');
const AdminSchema = new mongoose.Schema({
  email:{type:String,required:true,unique:true},
});

export const Admin = models?.Admin || model('Admin', AdminSchema);
