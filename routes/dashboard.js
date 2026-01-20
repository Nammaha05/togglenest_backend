const express = require('express');
const router = express.Router();

// Assuming you have models for Project, Task, etc.
// Adjust the imports based on your actual model structure
// const Project = require('../models/Project');
// const Task = require('../models/Task');

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    // Replace with actual database queries
    // Example using hypothetical models:
    // const totalProjects = await Project.countDocuments();
    // const totalTasks = await Task.countDocuments();
    // const completedTasks = await Task.countDocuments({ status: 'completed' });
    // const totalTime = await Task.aggregate([...]);
    
    const stats = {
      totalTime: "2.88", // Total hours spent
      avgTaskTime: "128.26", // Average time per task in minutes
      totalTasks: "47",
      totalProjects: "20.60",
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard statistics' 
    });
  }
});

// GET /api/dashboard/completion-rate
router.get('/completion-rate', async (req, res) => {
  try {
    // Replace with actual database queries
    // const totalTasks = await Task.countDocuments();
    // const completedTasks = await Task.countDocuments({ status: 'completed' });
    // const completionPercentage = (completedTasks / totalTasks) * 100;
    
    const completionRate = [
      { name: "Completed", value: 55 },
      { name: "Remaining", value: 45 },
    ];

    res.json(completionRate);
  } catch (error) {
    console.error('Error fetching completion rate:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch completion rate' 
    });
  }
});

// GET /api/dashboard/top-projects
router.get('/top-projects', async (req, res) => {
  try {
    // Replace with actual database queries
    // const topProjects = await Project.aggregate([
    //   {
    //     $lookup: {
    //       from: 'tasks',
    //       localField: '_id',
    //       foreignField: 'projectId',
    //       as: 'tasks'
    //     }
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       value: { $size: '$tasks' }
    //     }
    //   },
    //   { $sort: { value: -1 } },
    //   { $limit: 5 }
    // ]);
    
    const topProjects = [
      { name: "UI", value: 25.37 },
      { name: "Backend", value: 23.79 },
      { name: "Testing", value: 19.29 },
      { name: "Research", value: 15.39 },
      { name: "Deployment", value: 16.16 },
    ];

    res.json(topProjects);
  } catch (error) {
    console.error('Error fetching top projects:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch top projects' 
    });
  }
});

// GET /api/dashboard/projects-tasks
router.get('/projects-tasks', async (req, res) => {
  try {
    // Replace with actual database queries
    // const projectsData = await Project.aggregate([
    //   {
    //     $lookup: {
    //       from: 'tasks',
    //       localField: '_id',
    //       foreignField: 'projectId',
    //       as: 'tasks'
    //     }
    //   },
    //   {
    //     $project: {
    //       name: 1,
    //       Completed: {
    //         $size: {
    //           $filter: {
    //             input: '$tasks',
    //             cond: { $eq: ['$$this.status', 'completed'] }
    //           }
    //         }
    //       },
    //       Assigned: {
    //         $size: {
    //           $filter: {
    //             input: '$tasks',
    //             cond: { $ne: ['$$this.status', 'completed'] }
    //           }
    //         }
    //       }
    //     }
    //   },
    //   { $limit: 5 }
    // ]);
    
    const projectsTaskData = [
      { name: "Project 1", Completed: 40, Assigned: 10 },
      { name: "Project 2", Completed: 30, Assigned: 20 },
      { name: "Project 3", Completed: 50, Assigned: 5 },
      { name: "Project 4", Completed: 20, Assigned: 15 },
      { name: "Project 5", Completed: 25, Assigned: 10 },
    ];

    res.json(projectsTaskData);
  } catch (error) {
    console.error('Error fetching projects task data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch projects task data' 
    });
  }
});

// GET /api/dashboard/uploaded-purpose
router.get('/uploaded-purpose', async (req, res) => {
  try {
    // Replace with actual database queries
    // Assuming you have a File/Upload model with a 'purpose' field
    // const uploadData = await File.aggregate([
    //   {
    //     $group: {
    //       _id: '$purpose',
    //       count: { $sum: 1 }
    //     }
    //   },
    //   {
    //     $project: {
    //       name: '$_id',
    //       count: 1,
    //       _id: 0
    //     }
    //   },
    //   { $sort: { count: -1 } }
    // ]);
    
    const uploadedPurposeData = [
      { name: "Food", count: 40 },
      { name: "Personal", count: 35 },
      { name: "Project Resources", count: 20 },
      { name: "Buyers", count: 15 },
      { name: "Others", count: 10 },
    ];

    res.json(uploadedPurposeData);
  } catch (error) {
    console.error('Error fetching uploaded purpose data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch uploaded purpose data' 
    });
  }
});

module.exports = router;