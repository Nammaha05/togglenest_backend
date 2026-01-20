// Example: How to integrate auth with Task module
// File: controllers/taskController.js (Example for Member 1)

const Task = require('../models/Task');
const { getUserId, getUserInfo, canModify, validateUserExists } = require('../utils/authHelper');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    // Get authenticated user info
    const userId = getUserId(req);
    const userInfo = getUserInfo(req);
    
    // Validate assigned user if provided
    if (req.body.assignedTo) {
      const userExists = await validateUserExists(req.body.assignedTo);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not exist or is inactive'
        });
      }
    }
    
    // Create task with creator info
    const task = await Task.create({
      ...req.body,
      createdBy: userId,
      creatorInfo: {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
    
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private (Owner or Admin)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user can modify (owner or admin)
    if (!canModify(req, task.createdBy)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }
    
    // Validate assigned user if being changed
    if (req.body.assignedTo) {
      const userExists = await validateUserExists(req.body.assignedTo);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not exist or is inactive'
        });
      }
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
    
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Owner or Admin)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user can modify (owner or admin)
    if (!canModify(req, task.createdBy)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};

// @desc    Get my tasks
// @route   GET /api/tasks/my-tasks
// @access  Private
exports.getMyTasks = async (req, res) => {
  try {
    const userId = getUserId(req);
    
    // Get tasks created by user or assigned to user
    const tasks = await Task.find({
      $or: [
        { createdBy: userId },
        { assignedTo: userId }
      ]
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
    
  } catch (error) {
    console.error('Get My Tasks Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// @desc    Assign task to user
// @route   PATCH /api/tasks/:id/assign
// @access  Private (Admin or Task Owner)
exports.assignTask = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID'
      });
    }
    
    // Validate user exists
    const userExists = await validateUserExists(userId);
    if (!userExists) {
      return res.status(400).json({
        success: false,
        message: 'User does not exist or is inactive'
      });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user can assign (owner or admin)
    if (!canModify(req, task.createdBy)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to assign this task'
      });
    }
    
    task.assignedTo = userId;
    await task.save();
    
    // Populate assigned user info
    await task.populate('assignedTo', 'name email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Task assigned successfully',
      data: task
    });
    
  } catch (error) {
    console.error('Assign Task Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning task',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
  assignTask
};