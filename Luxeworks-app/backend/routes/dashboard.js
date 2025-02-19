const express = require('express');
const Member = require('../models/Member');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const WorkoutPlan = require('../models/WorkoutPlan');
const TrainerAvailability = require('../models/TrainerAvailability');

const router = express.Router();

// Middleware to check role
function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

// Get dashboard metrics
router.get('/', checkRole(['admin', 'trainer', 'member']), async (req, res) => {
  try {
    const user = req.user;
    let metrics = {};

    if (user.role === 'admin') {
      const activeMembers = await Member.countDocuments();
      const invoices = await Invoice.find({ status: 'Paid' });
      const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
      const trainers = await TrainerAvailability.distinct('trainerId');
      const bookings = await Booking.find();
      const trainerUtilization = trainers.map(trainer => {
        const trainerBookings = bookings.filter(b => b.trainerId.toString() === trainer.toString()).length;
        return { trainerId: trainer, bookings: trainerBookings };
      });

      metrics = {
        activeMembers,
        totalRevenue,
        trainerUtilization,
        quickStat: `Top Trainer: ${trainerUtilization.sort((a, b) => b.bookings - a.bookings)[0]?.trainerId || 'N/A'}`
      };
    } else if (user.role === 'trainer') {
      const assignedMembers = await WorkoutPlan.distinct('memberId', { trainerId: user._id });
      const upcomingSessions = await Booking.find({ trainerId: user._id, date: { $gte: new Date() } }).sort({ date: 1 }).limit(5);
      const plans = await WorkoutPlan.find({ trainerId: user._id });
      const engagement = plans.reduce((sum, plan) => {
        const completed = plan.logs.filter(log => log.completed).length;
        return sum + (completed / (plan.logs.length || 1)) * 100;
      }, 0) / (plans.length || 1);

      metrics = {
        assignedMembers: assignedMembers.length,
        upcomingSessions: upcomingSessions.map(s => ({ date: s.date, memberId: s.memberId })),
        memberEngagement: engagement.toFixed(2),
        quickStat: `Top Performer: ${plans.sort((a, b) => b.logs.filter(l => l.completed).length - a.logs.filter(l => l.completed).length)[0]?.memberId || 'N/A'}`
      };
    } else if (user.role === 'member') {
      const sessionsAttended = await Booking.countDocuments({ memberId: user._id });
      const activePlans = await WorkoutPlan.countDocuments({ memberId: user._id, status: 'Active' });
      const plans = await WorkoutPlan.find({ memberId: user._id });
      let streak = 0;
      plans.forEach(plan => {
        const sortedLogs = plan.logs.sort((a, b) => new Date(b.date) - new Date(a.date));
        let currentDate = sortedLogs[0] ? new Date(sortedLogs[0].date) : new Date();
        for (const log of sortedLogs) {
          if (log.completed && new Date(log.date).toDateString() === currentDate.toDateString()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else break;
        }
      });

      metrics = {
        sessionsAttended,
        activePlans,
        streak,
        quickStat: `Streak Leader: ${streak > 0 ? 'You!' : 'Start today!'}`,
        action: 'Book your next session!'
      };
    }

    res.json(metrics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;