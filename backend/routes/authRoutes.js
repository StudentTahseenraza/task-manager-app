const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/api/users/register', registerUser);
router.post('/api/users/login', loginUser);

// Protected route
router.get('/api/users/profile', protect, getUserProfile);

module.exports = router;