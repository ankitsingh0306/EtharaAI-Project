const express = require('express');
const {
  getTasks, getTask, createTask, updateTask,
  updateTaskStatus, deleteTask, getDashboardStats,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/dashboard',        getDashboardStats);   // Must be before /:id
router.get('/',                 getTasks);
router.get('/:id',              getTask);
router.post('/',   adminOnly,   createTask);
router.put('/:id', adminOnly,   updateTask);
router.patch('/:id/status',     updateTaskStatus);    // Admin + assigned member
router.delete('/:id', adminOnly, deleteTask);

module.exports = router;
