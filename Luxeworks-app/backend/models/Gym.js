const mongoose = require('mongoose');

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Gym', gymSchema);