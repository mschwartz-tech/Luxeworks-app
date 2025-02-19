const express = require('express');
const Member = require('../models/Member');
const router = express.Router();

function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}

router.get('/', checkRole(['admin']), async (req, res) => {
  const members = await Member.find();
  res.json(members);
});

router.post('/', checkRole(['admin']), async (req, res) => {
  const member = new Member(req.body);
  await member.save();
  res.status(201).json(member);
});

router.delete('/:id', checkRole(['admin']), async (req, res) => {
  await Member.findByIdAndDelete(req.params.id);
  res.json({ message: 'Member deleted' });
});

module.exports = router;