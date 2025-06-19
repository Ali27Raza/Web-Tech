const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

// Get cart page
router.get('/', (req, res) => {
  res.render('cart', { cart: req.session.cart || [] });
});

// Add to cart
router.post('/add/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash('danger', 'Product not found');
      return res.redirect('/products');
    }
    if (!req.session.cart) {
      req.session.cart = [];
    }
    const itemIndex = req.session.cart.findIndex(item => item.productId.toString() === req.params.id);
    if (itemIndex > -1) {
      req.session.cart[itemIndex].qty += 1;
    } else {
      req.session.cart.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
        qty: 1
      });
    }
    req.flash('success', 'Item added to cart');
    res.redirect('/products');
  } catch (err) {
    req.flash('danger', 'Error adding to cart');
    res.redirect('/products');
  }
});

// Update cart item quantity
router.post('/update/:id', (req, res) => {
  const qty = parseInt(req.body.qty);
  if (!req.session.cart || qty < 1) {
    req.flash('danger', 'Invalid quantity');
    return res.redirect('/cart');
  }
  const itemIndex = req.session.cart.findIndex(item => item.productId.toString() === req.params.id);
  if (itemIndex > -1) {
    req.session.cart[itemIndex].qty = qty;
    req.flash('success', 'Cart updated');
  } else {
    req.flash('danger', 'Item not found');
  }
  res.redirect('/cart');
});

// Remove item from cart
router.post('/remove/:id', (req, res) => {
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.productId.toString() !== req.params.id);
    req.flash('success', 'Item removed from cart');
  }
  res.redirect('/cart');
});

// Get checkout page
router.get('/checkout', (req, res) => {
  res.render('checkout', { cart: req.session.cart || [] });
});

// Place order
router.post('/order/place', async (req, res) => {
  try {
    if (!req.session.cart || !req.session.cart.length) {
      req.flash('danger', 'Cart is empty');
      return res.redirect('/cart/checkout');
    }
    const order = new Order({
      user: {
        name: req.body.name,
        phone: req.body.phone,
        address: req.body.address
      },
      items: req.session.cart,
      total: req.session.cart.reduce((total, item) => total + item.price * item.qty, 0)
    });
    await order.save();
    req.session.cart = [];
    req.flash('success', 'Order placed successfully!');
    res.redirect('/products');
  } catch (err) {
    req.flash('danger', 'Error placing order');
    res.redirect('/cart/checkout');
  }
});

module.exports = router;