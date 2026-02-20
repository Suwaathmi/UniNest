const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-development-secret-key';

// Validation helper
const validateRegistrationData = (data) => {
  const errors = [];
  
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.password) errors.push('Password is required');
  if (data.password && data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (!data.userType) errors.push('User type is required');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  return errors;
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      userType,
      university,
      businessName,
      businessRegistrationNumber
    } = req.body;

    console.log('Registration attempt:', email);

    // Validate input
    const validationErrors = validateRegistrationData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      userType,
      ...(phone && { phone: phone.trim() }),
      ...(university && { university: university.trim() }),
      ...(businessName && { businessName: businessName.trim() }),
      ...(businessRegistrationNumber && { businessRegistrationNumber: businessRegistrationNumber.trim() })
    };

    const newUser = new User(userData);
    await newUser.save();

    console.log('✅ User registered:', email);
    res.status(201).json({ 
      success: true,
      message: 'User registered successfully',
      userId: newUser._id
    });

  } catch (err) {
    console.error('Registration error:', err);
    
    if (err.code === 11000) {
      return res.status(409).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id, 
        userType: user.userType,
        email: user.email
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log('✅ Login successful:', email);
    res.status(200).json({
      success: true,
      token,
      userType: user.userType,
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Missing or invalid token' 
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      userId: user._id,
      userType: user.userType,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });

  } catch (err) {
    console.error('Token verification error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout endpoint (optional - mainly for client-side token cleanup)
router.post('/logout', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

module.exports = router;