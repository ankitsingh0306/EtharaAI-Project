const express = require('express');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/',                  getProjects);
router.get('/:id',               getProject);
router.post('/',    adminOnly,   createProject);
router.put('/:id',  adminOnly,   updateProject);
router.delete('/:id', adminOnly, deleteProject);
router.post('/:id/members',              adminOnly, addMember);
router.delete('/:id/members/:userId',   adminOnly, removeMember);

module.exports = router;
