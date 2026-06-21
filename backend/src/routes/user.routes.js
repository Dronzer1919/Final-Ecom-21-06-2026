const express = require('express');
const router  = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getPermissions,
  savePermissions,
  getPermissionStructure
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

// GET    /api/users          — list with search + pagination
// POST   /api/users          — create one user
router.route('/').get(getUsers).post(createUser);

// GET    /api/users/:id/permissions  — fetch sidebar permissions for a user
// PUT    /api/users/:id/permissions  — save sidebar permissions for a user
router.route('/:id/permissions')
  .get(protect, getPermissions)
  .put(protect, savePermissions);

// GET /api/users/:id/permissions-structure — fetch sidebar section titles/subtitles
router.get('/:id/permissions-structure', protect, getPermissionStructure);

// GET    /api/users/:id      — single user
// PATCH  /api/users/:id      — update fields (isActive, role, phone …)
// DELETE /api/users/:id      — delete user
router.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;
