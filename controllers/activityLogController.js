import asyncHandler from '../utils/asyncHandler.js';
import ActivityLog from '../models/ActivityLog.js';

// Create Activity Log Entry
export const createActivityLog = asyncHandler(async (req, res) => {
  const { user, action, project, task } = req.body;
  const log = await ActivityLog.create({ user, action, project, task });
  res.status(201).json(log);
});

// Get All Activity Logs (recent first)
export const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find()
    .populate('user', 'name email')
    .populate('project', 'title')
    .populate('task', 'title status')
    .sort({ createdAt: -1 });
  res.json(logs);
});