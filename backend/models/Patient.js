const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: String,
  age: Number,
  gender: String,
  address: String,
  phone: String,
  // Add more fields as needed
});

module.exports = mongoose.model('Patient', patientSchema);
