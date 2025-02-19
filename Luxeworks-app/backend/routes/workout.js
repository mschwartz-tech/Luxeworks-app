const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');

// Middleware to check if user is authenticated and has correct role
const restrictTo = (roles) => (req, res, next) => {
  if (!req.session.user || !roles.includes(req.session.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Create a workout plan (trainers only)
router.post('/plans', restrictTo(['trainer']), async (req, res) => {
  const { title, description, memberId, schedule } = req.body;
  const workoutPlan = new WorkoutPlan({
    title,
    description,
    trainerId: req.session.user.id,
    memberId,
    schedule,
  });
  await workoutPlan.save();
  res.status(201).json(workoutPlan);
});

// Get all workout plans (admins see all, trainers/members see their own)
router.get('/plans', async (req, res) => {
  const user = req.session.user;
  let query = {};
  if (user.role === 'trainer') query.trainerId = user.id;
  if (user.role === 'member') query.memberId = user.id;
  const plans = await WorkoutPlan.find(query).populate('trainerId', 'username').populate('memberId', 'username');
  res.json(plans);
});

module.exports = router;