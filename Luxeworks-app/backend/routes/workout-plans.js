const express = require('express');
const WorkoutPlan = require('../models/WorkoutPlan');

const router = express.Router();

// Middleware to check user role
function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Get workout plans (filtered by role)
router.get('/', async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'trainer') filter.trainerId = req.user._id;
    if (req.user.role === 'member') filter.memberId = req.user._id;
    const plans = await WorkoutPlan.find(filter)
      .populate('memberId', 'name')
      .populate('trainerId', 'username');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a workout plan (admin or trainer)
router.post('/', checkRole(['admin', 'trainer']), async (req, res) => {
  try {
    const { name, memberId, exercises, status } = req.body;
    const workoutPlan = new WorkoutPlan({
      name,
      memberId,
      trainerId: req.user.role === 'trainer' ? req.user._id : req.body.trainerId,
      exercises,
      status,
    });
    await workoutPlan.save();
    res.status(201).json(workoutPlan);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Update a workout plan (admin or assigned trainer)
router.put('/:id', checkRole(['admin', 'trainer']), async (req, res) => {
  try {
    const { name, memberId, exercises, status } = req.body;
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Workout plan not found' });
    if (req.user.role === 'trainer' && plan.trainerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(
      req.params.id,
      { name, memberId, trainerId: plan.trainerId, exercises, status },
      { new: true }
    );
    res.json(updatedPlan);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete a workout plan (admin or assigned trainer)
router.delete('/:id', checkRole(['admin', 'trainer']), async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Workout plan not found' });
    if (req.user.role === 'trainer' && plan.trainerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await WorkoutPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout plan deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Log a workout completion (member only)
router.post('/:id/log', checkRole(['member']), async (req, res) => {
  try {
    const { date, completed, notes } = req.body;
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Workout plan not found' });
    if (plan.memberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    plan.logs.push({ date, completed, notes });
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Get workout plan analytics (member or trainer)
router.get('/:id/analytics', checkRole(['member', 'trainer']), async (req, res) => {
  try {
    const plan = await WorkoutPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Workout plan not found' });
    if (req.user.role === 'member' && plan.memberId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.user.role === 'trainer' && plan.trainerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const logs = plan.logs;
    const totalLogs = logs.length;
    const completedLogs = logs.filter(log => log.completed).length;
    const completionRate = totalLogs > 0 ? (completedLogs / totalLogs) * 100 : 0;
    
    // Calculate workout frequency (logs per week over the last 30 days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const recentLogs = logs.filter(log => new Date(log.date) >= last30Days);
    const frequency = recentLogs.length / 4; // Average logs per week

    // Calculate streak (consecutive days with completed logs)
    let streak = 0;
    if (logs.length > 0) {
      const sortedLogs = logs.sort((a, b) => new Date(b.date) - new Date(a.date));
      let currentDate = new Date(sortedLogs[0].date);
      for (const log of sortedLogs) {
        if (log.completed && new Date(log.date).toDateString() === currentDate.toDateString()) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else break;
      }
    }

    // Engagement score (for trainers)
    const engagementScore = totalLogs > 0 ? Math.min((completedLogs * 10) + (frequency * 5), 100) : 0;

    // Personalized tip (simple logic)
    const tip = completionRate < 50 ? "Try logging 3 days this week to boost your progress!" : 
                streak > 3 ? "Great streak! Keep it up!" : "Consistency is key—aim for a workout tomorrow!";

    res.json({
      completionRate: completionRate.toFixed(2),
      frequency: frequency.toFixed(2),
      streak,
      engagementScore: req.user.role === 'trainer' ? engagementScore : undefined,
      tip: req.user.role === 'member' ? tip : undefined,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;