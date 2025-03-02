const Task = require('../models/tasks');

const createTask = async (req, res) => {
  const { title, description, status, assignedTo, dueDate, priority, comments } = req.body;
  const userId = req.user.userId;

  if (!title || !description || !dueDate || !priority) {
    return res.status(400).json({ error: "Title, description, due date, and priority are required" });
  }

  try {
    const newTask = await Task.create({ title, description, status, assignedTo, dueDate, priority, comments, userId });
    return res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (err) {
    console.error('Error creating task:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getTaskById = async (req, res) => {
  const { taskId } = req.params;
  const { teamId } = req.user;
  try {
    console.log(`Manager's teamId from JWT: ${teamId}`);
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    console.log(`Task's teamId: ${task.teamId}`);
    if (task.teamId !== teamId) {
      return res.status(403).json({ message: 'Access Denied: You cannot view tasks from other teams'});
    }
    return res.status(200).json({ task });
  } catch (err) {
    console.error('Error fetching task:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get tasks by assigned engineer
const getTasksByEngineer = async (req, res) => {
  const { engineerId } = req.params;
  try {
    const tasks = await Task.findByAssignedTo(engineerId);
    return res.status(200).json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks for engineer:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const getAllTasksInTeam = async (req, res) => {
  const { teamId } = req.user;
  try {
    const tasks = await Task.findByTeam(teamId);
    return res.status(200).json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks for team:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update task status (Ready, In Progress, Done)
const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  const { taskId } = req.params;
  const userId = req.user.userId;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    // Fetch task by ID
    const task = await Task.findById(taskId);
    if (!task) {
      console.log(`Task with ID ${taskId} not found`);
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if the task is assigned to the user requesting the update
    if (task.assignedTo !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this task' });
    }

    // If user is authorized, update status
    const updatedTask = await Task.updateStatus(taskId, status);
    return res.status(200).json({
      message: 'Task status updated successfully',
      task: updatedTask,
    });
  } catch (err) {
    console.error('Error updating task status:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


// Update task details (title, description, etc.)
const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, assignedTo, dueDate, priority, comments } = req.body;
  
  try {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    } 
  
    const updatedTask = await Task.update(taskId, { title, description, status, assignedTo, dueDate, priority, comments });
    return res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (err) {
    console.error('Error updating task:', err);
    return res.status(500).json({ message: 'Internal server error' });
  } 
};

const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await Task.delete(taskId);
    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createTask,
  getTaskById,
  getTasksByEngineer,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getAllTasksInTeam,
};
