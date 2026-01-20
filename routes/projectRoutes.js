const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getMyProjects,      
  getProjectStats     
} = require('../controllers/projectController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Special routes
router.get('/stats', getProjectStats);        // ⬅️ UNCOMMENT
router.get('/my-projects', getMyProjects);    // ⬅️ UNCOMMENT

router.route('/')
  .get(getProjects)
  .post(createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;