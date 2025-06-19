const express = require('express');
const router = express.Router();
const registerUser = require('../controllers/registrationController');
const signIn = require('../controllers/signInController');
const Product = require('../models/productModel');
const checkout = require('../controllers/checkoutController');
const account = require('../controllers/accountController');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const vehicleController = require('../controllers/vehicleController');

// Middleware to check if logged in
const isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    req.flash('danger', 'Please log in to access this page');
    return res.redirect('/login');
  }
  next();
};

// Middleware to check if admin
const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.flash('danger', 'Admin access required');
    return res.redirect('/products');
  }
  next();
};

// Routes
router.get('/', (req, res) => res.render('homePage'));
router.get('/contact-us', (req, res) => res.render('contactUs'));
router.get('/account', isAuthenticated, account.renderPage);
router.get('/checkout', isAuthenticated, checkout.getPage);
router.post('/checkout', isAuthenticated, checkout.createOrder);

router.get('/products', async (req, res) => {
  const productsList = await Product.find().lean();
  res.render('products', { products: productsList });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      req.flash('danger', 'Error logging out');
    } else {
      req.flash('success', 'Logged out successfully');
    }
    res.redirect('/login');
  });
});

router
  .route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post(registerUser.register);

router
  .route('/login')
  .get((req, res) => res.render('login'))
  .post(signIn.signInUser);

router.get('/my-orders', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.user.id).populate('orders');
    if (!user) {
      req.flash('danger', 'User not found');
      return res.redirect('/login');
    }
    res.render('my-orders', { orders: user.orders });
  } catch (err) {
    req.flash('danger', 'Error fetching orders');
    res.redirect('/login');
  }
});

// Admin vehicle routes
router.get(
  '/admin/vehicles',
  isAuthenticated,
  isAdmin,
  vehicleController.getAllVehicles
);
router.get(
  '/admin/vehicles/create',
  isAuthenticated,
  isAdmin,
  vehicleController.createVehicleGet
);
router.post(
  '/admin/vehicles/create',
  isAuthenticated,
  isAdmin,
  vehicleController.createVehiclePost
);
router.get(
  '/admin/vehicles/edit/:id',
  isAuthenticated,
  isAdmin,
  vehicleController.editVehicleGet
);
router.post(
  '/admin/vehicles/edit/:id',
  isAuthenticated,
  isAdmin,
  vehicleController.editVehiclePost
);
router.get(
  '/admin/vehicles/delete/:id',
  isAuthenticated,
  isAdmin,
  vehicleController.deleteVehicle
);

// Public vehicles page
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find().lean();
    res.render('vehicles/public', { vehicles });
  } catch (err) {
    console.error(err);
    req.flash('danger', 'Error loading vehicles');
    res.redirect('/');
  }
});

module.exports = router;
