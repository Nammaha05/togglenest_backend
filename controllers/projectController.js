const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    const { status, owner, search, priority, sort, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (owner) filter.owner = owner;
    if (priority) filter.priority = priority;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Project.countDocuments(filter);

    let query = Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .skip(skip)
      .limit(parseInt(limit));

    if (sort) {
      query = query.sort(sort.split(',').join(' '));
    } else {
      query = query.sort('-createdAt');
    }

    const projects = await query;

    // ✅ ADD: Get task count for each project
    const projectsWithTaskCount = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ projectId: project._id });
        return {
          ...project.toObject(),
          taskCount
        };
      })
    );

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalProjects: total,
      limit: parseInt(limit)
    };

    res.status(200).json({
      success: true,
      count: projectsWithTaskCount.length,
      pagination,
      data: projectsWithTaskCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members', 'name email avatar role');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const { tasks, ...projectData } = req.body;

    // Create project
    const project = await Project.create({
      ...projectData,
      owner: req.user._id
    });

    // ✅ Create tasks if provided
    let createdTasks = [];
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const taskPromises = tasks.map(task =>
        Task.create({
          title: task.title,
          description: task.description || '',
          projectId: project._id,  // ✅ Correct field name
          priority: task.priority || 'medium',
          status: task.status || 'todo',
          stage: 'Planning',  // ✅ Default stage
          dueDate: task.dueDate || null,
          createdBy: req.user._id
        })
      );

      createdTasks = await Promise.all(taskPromises);
      console.log(`✅ Created ${createdTasks.length} tasks for project: ${project.title}`);
    }

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedProject,
      tasksCreated: createdTasks.length
    });
  } catch (error) {
    console.error('❌ Error creating project:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // ✅ OPTIONAL: Delete all tasks related to this project
    await Task.deleteMany({ projectId: req.params.id });
    console.log(`✅ Deleted all tasks for project: ${project.title}`);

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Project and associated tasks deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already a member of this project'
      });
    }

    project.members.push(userId);
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    project.members = project.members.filter(
      member => member.toString() !== req.params.userId
    );

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get projects where user is member or owner
// @route   GET /api/projects/my-projects
// @access  Private
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    const projects = await Project.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats
// @access  Private
exports.getProjectStats = async (req, res) => {
  try {
    const stats = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Project.countDocuments();

    const result = {
      total,
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};