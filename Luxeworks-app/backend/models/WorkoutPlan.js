const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  trainerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: Number, required: true },
  }],
  assignedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  logs: [{
    date: { type: Date, required: true },
    completed: { type: Boolean, required: true },
    notes: { type: String },
  }],
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);