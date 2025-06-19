const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    trim: true,
  },
  mobile: {
    type: String,
    match: [/^\d{10,11}$/, 'Must be 10–11 digits'],
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email'],
  },
  password: {
    type: String,
    required: true,
  },
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,
      price: Number,
      qty: Number,
    },
  ],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

module.exports = User;