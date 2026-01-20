// Helper functions for auth integration with other modules

/**
 * Extract user ID from authenticated request
 * @param {Object} req - Express request object
 * @returns {String} User ID
 */
const getUserId = (req) => {
  if (!req.user || !req.user.id) {
    throw new Error('User not authenticated');
  }
  return req.user.id;
};

/**
 * Check if current user is admin
 * @param {Object} req - Express request object
 * @returns {Boolean}
 */
const isAdmin = (req) => {
  return req.user && req.user.role === 'admin';
};

/**
 * Check if user owns a resource
 * @param {Object} req - Express request object
 * @param {String} resourceOwnerId - ID of resource owner
 * @returns {Boolean}
 */
const isOwner = (req, resourceOwnerId) => {
  return req.user && req.user.id === resourceOwnerId.toString();
};

/**
 * Check if user can modify resource (owner or admin)
 * @param {Object} req - Express request object
 * @param {String} resourceOwnerId - ID of resource owner
 * @returns {Boolean}
 */
const canModify = (req, resourceOwnerId) => {
  return isAdmin(req) || isOwner(req, resourceOwnerId);
};

/**
 * Get user info for assignment
 * @param {Object} req - Express request object
 * @returns {Object} User info
 */
const getUserInfo = (req) => {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  
  return {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar
  };
};

/**
 * Validate user exists (for assignments)
 * @param {String} userId - User ID to validate
 * @returns {Promise<Boolean>}
 */
const validateUserExists = async (userId) => {
  const User = require('../models/User');
  const user = await User.findById(userId);
  return !!user && user.isActive;
};

/**
 * Get multiple users by IDs (for team assignments)
 * @param {Array} userIds - Array of user IDs
 * @returns {Promise<Array>} Array of user objects
 */
const getUsersByIds = async (userIds) => {
  const User = require('../models/User');
  const users = await User.find({
    _id: { $in: userIds },
    isActive: true
  }).select('name email role avatar');
  
  return users;
};

/**
 * Format user for API response (hide sensitive data)
 * @param {Object} user - User document
 * @returns {Object} Formatted user
 */
const formatUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isActive: user.isActive
  };
};

/**
 * Check if users are in the same team/project
 * @param {String} userId1 - First user ID
 * @param {String} userId2 - Second user ID
 * @param {String} projectId - Project ID
 * @returns {Promise<Boolean>}
 */
const areTeammates = async (userId1, userId2, projectId) => {
  // This will be implemented when Project model is available
  // For now, return true
  return true;
};

module.exports = {
  getUserId,
  isAdmin,
  isOwner,
  canModify,
  getUserInfo,
  validateUserExists,
  getUsersByIds,
  formatUser,
  areTeammates
};