const express = require('express');
const router = express.Router();
const { getUsers, createUserController, updateUserController, deleteUserController } = require('../controllers/usersController');
const { getTasks, createTaskController, updateTaskController, deleteTaskController, changeTaskStatusController } = require('../controllers/tasksController');

// User routes
router.get('/users', getUsers);
router.post('/users', createUserController);
router.put('/users/:id', updateUserController);
router.delete('/users/:id', deleteUserController);

// Task routes
router.get('/tasks', getTasks);
router.post('/tasks', createTaskController);
router.put('/tasks/:id', updateTaskController);
router.delete('/tasks/:id', deleteTaskController);
router.patch('/tasks/:id/status', changeTaskStatusController);

module.exports = router;