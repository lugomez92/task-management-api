const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { authenticateToken, authorizeRole } = require('../middleware/basicAuth');

// Managers and PMs can create tasks (for their team)
router.post('/', authenticateToken, authorizeRole(['manager', 'pm']), tasksController.createTask);

// Managers and PMs can update any task (but in their team)
router.put('/:taskId', authenticateToken, authorizeRole(['manager', 'pm']), tasksController.updateTask);

// Managers and PMs can delete tasks (but in their team)
router.delete('/:taskId', authenticateToken, authorizeRole(['manager', 'pm']), tasksController.deleteTask);

// Engineers (only their own tasks)
router.patch('/:taskId/status', authenticateToken, authorizeRole(['engineer']), tasksController.updateTaskStatus);

// Managers, Engineers, and PMs can get tasks assigned to a specific engineer (but within their team)
router.get('/engineer/:engineerId', authenticateToken, authorizeRole(['engineer', 'manager', 'pm']), tasksController.getTasksByEngineer);

// Managers, engineers and PMs can view all tasks within their team
router.get('/', authenticateToken, authorizeRole(['engineer', 'manager', 'pm']), tasksController.getAllTasksInTeam);

// Managers, engineers, and PMs can get task by ID (but within their team)
router.get('/:taskId', authenticateToken, authorizeRole(['engineer', 'manager', 'pm']), tasksController.getTaskById);

module.exports = router;
