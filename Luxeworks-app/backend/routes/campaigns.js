const express = require('express');
const Campaign = require('../models/Campaign');
const WorkoutPlan = require('../models/WorkoutPlan');
const Booking = require('../models/Booking');
const router = express.Router();

// Middleware to check role (admin only for now)
function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Get all campaigns
router.get('/', checkRole(['admin']), async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('createdBy', 'username');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a campaign
router.post('/', checkRole(['admin']), async (req, res) => {
  try {
    const { title, description, targetAudience, startDate, endDate, status } = req.body;
    const campaign = new Campaign({
      title,
      description,
      targetAudience,
      startDate,
      endDate,
      status,
      createdBy: req.user._id,
    });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Update a campaign
router.put('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const { title, description, targetAudience, startDate, endDate, status } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { title, description, targetAudience, startDate, endDate, status },
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

// Delete a campaign
router.delete('/:id', checkRole(['admin']), async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get campaign analytics
router.get('/:id/analytics', checkRole(['admin']), async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const { startDate, endDate, targetAudience } = campaign;

    // Determine target members based on audience
    let membersQuery = {};
    if (targetAudience === 'active') {
      membersQuery = { $expr: { $gt: [{ $size: '$logs' }, 0] } }; // Members with logs
    } else if (targetAudience === 'inactive') {
      membersQuery = { logs: { $size: 0 } }; // Members without logs
    }

    // Reach: Number of members in target audience
    const targetMembers = await WorkoutPlan.distinct('memberId', membersQuery);
    const reach = targetMembers.length;

    // Engagement: Workouts logged and bookings made during campaign period
    const workoutLogs = await WorkoutPlan.aggregate([
      { $match: { 'logs.date': { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      { $unwind: '$logs' },
      { $match: { 'logs.date': { $gte: new Date(startDate), $lte: new Date(endDate) } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    const logCount = workoutLogs.length > 0 ? workoutLogs[0].count : 0;

    const bookings = await Booking.countDocuments({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    const totalEngagement = logCount + bookings;
    const engagementRate = reach > 0 ? (totalEngagement / reach) * 100 : 0;

    // Simple effectiveness tip
    const tip = engagementRate < 20 ? 'Consider shorter campaigns or more incentives.' :
                engagementRate < 50 ? 'Good start! Try targeted messaging.' : 'Great engagement—keep it up!';

    res.json({
      reach,
      engagement: { workoutLogs: logCount, bookings },
      engagementRate: engagementRate.toFixed(2),
      tip,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;