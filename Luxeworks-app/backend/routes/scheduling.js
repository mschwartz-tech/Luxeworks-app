const express = require('express');
const router = express.Router();
const TrainerAvailability = require('../models/TrainerAvailability');
const Booking = require('../models/Booking');
const GroupClass = require('../models/GroupClass');

router.get('/availability', async (req, res) => {
  const availability = await TrainerAvailability.find();
  res.json(availability);
});

router.post('/availability', async (req, res) => {
  const availability = new TrainerAvailability(req.body);
  await availability.save();
  res.status(201).json(availability);
});

router.get('/bookings', async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

router.post('/bookings', async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.status(201).json(booking);
});

router.get('/group-classes', async (req, res) => {
  const classes = await GroupClass.find();
  res.json(classes);
});

router.post('/group-classes', async (req, res) => {
  const groupClass = new GroupClass(req.body);
  await groupClass.save();
  res.status(201).json(groupClass);
});

module.exports = router;