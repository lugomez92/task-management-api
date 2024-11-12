const { getAllTasks, createTask, updateTask, deleteTask, changeTaskStatus, findTaskById } = require('../models/tasks');

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const tasks = await getAllTasks();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new task
const createTaskController = async (req, res) => {
    const { title, description, status, assignedTo } = req.body;
    if (!title || title.trim() === '') {
        return res.status(400).json({error: 'Title is required'});
    }
    if (!description || description.trim() === '') {
        return res.status(400).json({ error: 'Description is required' });
    }
    if (assignedTo !== undefined && assignedTo !== null && typeof assignedTo !== 'number') {
        return res.status(400).json({ error: 'AssignedTo must be a valid user ID or null' });
    }
    if (!['Ready', 'In Progress', 'Done'].includes(status)) {
        return res.status(400).json({ error: 'Status must be one of "Ready", "In Progress", "Done"' });
    }
    try {
        const taskId = await createTask(title, description, status, assignedTo);
        res.status(201).json({ message: 'Task created', taskId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update task info
const updateTaskController = async (req, res) => {
    const { id } = req.params;
    const { title, description, status, assignedTo } = req.body;

    // Ensure the task exists
    try {
        const task = await findTaskById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Validate fields
        if (title && title.trim() === '') {
            return res.status(400).json({ error: 'Title cannot be empty' });
        }
        if (description && description.trim() === '') {
            return res.status(400).json({ error: 'Description cannot be empty' });
        }
        if (assignedTo !== undefined && assignedTo !== null && typeof assignedTo !== 'number') {
            return res.status(400).json({ error: 'AssignedTo must be a valid user ID (integer) or null' });
        }
        if (status && !['Ready', 'In Progress', 'Done'].includes(status)) {
            return res.status(400).json({ error: 'Status must be one of "Ready", "In Progress", "Done"' });
        }

        // Update task
        await updateTask(id, title, description, status, assignedTo);
        res.json({ message: 'Task updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a task
const deleteTaskController = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await findTaskById(id); 
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        await deleteTask(id);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Change task status
const changeTaskStatusController = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const task = await findTaskById(id);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        if (!['Ready', 'In Progress', 'Done'].includes(status)) {
            return res.status(400).json({ error: 'Status must be one of "Ready", "In Progress", "Done"' });
        }
        await changeTaskStatus(id, status);
        res.json({ message: 'Task status updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getTasks, createTaskController, updateTaskController, deleteTaskController, changeTaskStatusController };
