const express = require('express');
const { getUsers, getUser, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/',          adminOnly, getUsers);
router.get('/:id',       adminOnly, getUser);
router.patch('/:id/role', adminOnly, updateUserRole);
router.delete('/:id',    adminOnly, deleteUser);

module.exports = router;
