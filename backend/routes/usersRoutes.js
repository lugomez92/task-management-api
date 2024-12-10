const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorizeRole } = require('../middleware/basicAuth');

// Admin only: Get all users
router.get('/', authenticateToken, authorizeRole(['admin']), usersController.getAllUsers);

// Admin only: create new user
router.post('/', authenticateToken, authorizeRole(['admin']), usersController.createUser);

// Admin only: Update a user's information
router.put('/:id', authenticateToken, authorizeRole(['admin']), usersController.updateUser);

// Admin only: Delete a user
router.delete('/:id', authenticateToken, authorizeRole(['admin']), usersController.deleteUser);

// Admin only: Get users by team
router.get('/team/:teamId', authenticateToken, authorizeRole(['admin']), usersController.getUsersByTeam);

// Admin only: Get user by ID
router.get('/:id', authenticateToken, authorizeRole(['admin']), usersController.getUserById);

module.exports = router;
