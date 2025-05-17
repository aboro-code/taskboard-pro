const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authenticate = require('../middleware/auth');

// Google OAuth login
router.post('/google', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'No ID token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);

    // Check if user exists
    let user = await User.findOne({ googleId: decoded.uid });
    if (!user) {
      // Create new user if not exists
      user = await User.create({
        googleId: decoded.uid,
        name: decoded.name || decoded.email,
        email: decoded.email,
        avatar: decoded.picture,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    );

    // Return JWT token and user info
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Signup with email/password
router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    // Check if email already in use
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email,
      name,
      password: hash,
      googleId: '', 
      avatar: '',   
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    );

    // Return JWT token and user info
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});

// Signin with email/password
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      process.env.JWT_SECRET || 'changeme',
      { expiresIn: '7d' }
    );

    // Return JWT token and user info
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error('Signin Error:', err);
    res.status(500).json({ error: 'Signin failed', details: err.message });
  }
});

// Get user info (protected route)
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      badges: req.user.badges,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

module.exports = router;

