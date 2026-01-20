const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get all tasks (with project population)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, priority, assignedTo } = req.query;
    
    let filter = {};
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('projectId', 'title')  // ✅ Populate project
      .populate('assignedTo', 'name email avatar')  // ✅ Populate assignee
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id,
      stage: 'Planning'
    };

    // ✅ Handle both 'project' and 'projectId' fields
    if (req.body.project && !req.body.projectId) {
      taskData.projectId = req.body.project;
    }

    const task = await Task.create(taskData);
    
    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update task (including stage)
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // ✅ Update task with new data
    task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email avatar');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update task status (for Kanban board)
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    task.status = status;
    
    // ✅ Auto-update completedAt and stage
    if (status === 'done') {
      task.completedAt = new Date();
      task.stage = 'Done';  // ✅ Auto-move to Done stage
    } else {
      task.completedAt = null;
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email avatar');

    res.status(200).json({
      success: true,
      data: populatedTask,
      message: `Task status updated to ${status}`
    });
  } catch (error) {
    console.error('Error in updateTaskStatus:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ NEW: Update task stage manually
// @route   PATCH /api/tasks/:id/stage
// @access  Private
exports.updateTaskStage = async (req, res) => {
  try {
    const { stage } = req.body;

    const validStages = ['Planning', 'Design', 'Development', 'Testing', 'Done'];
    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        error: `Invalid stage. Must be one of: ${validStages.join(', ')}`
      });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { stage },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'title')
      .populate('assignedTo', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task,
      message: `Task stage updated to ${stage}`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};