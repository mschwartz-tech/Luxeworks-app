const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password }); // Plaintext for simplicity; use hashing in production
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  req.session.user = { id: user._id, username: user.username, role: user.role };
  res.json({ message: 'Logged in successfully', user: req.session.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;