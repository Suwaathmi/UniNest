const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Get JWT secret from environment variable with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-development-secret-key';

// Validation helper function
const validateRegistrationData = (data) => {
  const errors = [];
  
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  if (!data.password) errors.push('Password is required');
  if (data.password && data.password.length < 6) errors.push('Password must be at least 6 characters long');
  if (!data.userType) errors.push('User type is required');
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  return errors;
};

// Register
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

    console.log('Registration attempt for email:', email);

    // Validate input data
    const validationErrors = validateRegistrationData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('Registration failed: Email already exists:', email);
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
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

    console.log('User registered successfully:', email);
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: newUser._id
    });

  } catch (err) {
    console.error('Registration error details:', err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Login attempt for email:', email);

    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      console.log('Login failed: User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Login failed: Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
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

    console.log('Login successful for:', email);
    res.status(200).json({
      token,
      userType: user.userType,
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Missing or invalid token format' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found or inactive' });
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
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

module.exports = router;
