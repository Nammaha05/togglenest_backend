const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  getUserStats
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get user statistics (Admin only) - Must be before /:id route
router.get('/stats', authorize('admin'), getUserStats);

// Get all users
router.get('/', getAllUsers);

// Get single user by ID
router.get('/:id', getUserById);

// Update user (Admin or own profile)
router.put('/:id', updateUser);

// Permanent delete user (Admin only) - Must be before soft delete
router.delete('/:id/permanent', authorize('admin'), permanentDeleteUser);

// Soft delete user (Admin only)
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;