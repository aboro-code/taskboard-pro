const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: false }, 
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: String,
  badges: [String], 
});

module.exports = mongoose.model('User', userSchema);
