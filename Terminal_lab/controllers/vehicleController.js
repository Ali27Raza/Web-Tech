const Vehicle = require('../models/vehicleModel');
const upload = require('../upload.js');

exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().lean();
    res.render('vehicles/admin/list', { vehicles });
  } catch (err) {
    console.error(err);
    req.flash('danger', 'Error loading vehicles');
    res.redirect('/admin/vehicles');
  }
};

exports.createVehicleGet = (req, res) => {
  res.render('vehicles/admin/create');
};

exports.createVehiclePost = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, brand, price, type } = req.body;
      const image = `/uploads/${req.file.filename}`;
      await Vehicle.create({ name, brand, price, type, image });
      req.flash('success', 'Vehicle added successfully');
      res.redirect('/admin/vehicles');
    } catch (err) {
      console.error(err);
      req.flash('danger', 'Error adding vehicle');
      res.redirect('/admin/vehicles/create');
    }
  },
];

exports.editVehicleGet = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).lean();
    if (!vehicle) {
      req.flash('danger', 'Vehicle not found');
      return res.redirect('/admin/vehicles');
    }
    res.render('vehicles/admin/edit', { vehicle });
  } catch (err) {
    console.error(err);
    req.flash('danger', 'Error loading vehicle');
    res.redirect('/admin/vehicles');
  }
};

exports.editVehiclePost = [
  upload.single('image'),
  async (req, res) => {
    try {
      const { name, brand, price, type } = req.body;
      const updateData = { name, brand, price, type };
      if (req.file) updateData.image = `/uploads/${req.file.filename}`;
      await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true });
      req.flash('success', 'Vehicle updated successfully');
      res.redirect('/admin/vehicles');
    } catch (err) {
      console.error(err);
      req.flash('danger', 'Error updating vehicle');
      res.redirect(`/admin/vehicles/edit/${req.params.id}`);
    }
  },
];

exports.deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    req.flash('success', 'Vehicle deleted successfully');
    res.redirect('/admin/vehicles');
  } catch (err) {
    console.error(err);
    req.flash('danger', 'Error deleting vehicle');
    res.redirect('/admin/vehicles');
  }
};