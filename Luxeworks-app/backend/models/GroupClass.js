const mongoose = require('mongoose');

const groupClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  time: { type: String, required: true },
  capacity: { type: Number, required: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
});

module.exports = mongoose.model('GroupClass', groupClassSchema);