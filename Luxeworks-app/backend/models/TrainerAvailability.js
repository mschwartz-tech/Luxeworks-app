const mongoose = require('mongoose');

const trainerAvailabilitySchema = new mongoose.Schema({
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

module.exports = mongoose.model('TrainerAvailability', trainerAvailabilitySchema);