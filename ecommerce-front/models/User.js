const { Schema, model, models } = require('mongoose');
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    image: String,
});

export const User = models?.User || model('User', UserSchema);
