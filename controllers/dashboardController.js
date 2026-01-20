import asyncHandler from '../utils/asyncHandler.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';

// Dashboard Stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalProjects = await Project.countDocuments();
  const totalTasks = await Task.countDocuments();

  const tasksByStatus = await Task.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const recentActivities = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name')
    .populate('project', 'title')
    .populate('task', 'title');

  res.json({
    totalProjects,
    totalTasks,
    tasksByStatus,
    recentActivities
  });
});