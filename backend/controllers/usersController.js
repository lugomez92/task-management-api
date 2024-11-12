const bcrypt = require('bcryptjs');
const { getAllUsers, createUser, updateUser, deleteUser } = require('../models/users');

// Hash passwords
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new user
const createUserController = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const userId = await createUser(email, hashedPassword, role);
        res.status(201).json({ message: 'User created', userId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update user info
const updateUserController = async (req, res) => {
    const { id } = req.params;
    const { email, password, role } = req.body;
    try {
        const hashedPassword = password ? await hashPassword(password) : undefined;
        await updateUser(id, email, hashedPassword || password, role);
        res.json({ message: 'User updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete a user
const deleteUserController = async (req, res) => {
    const { id } = req.params;
    try {
        await deleteUser(id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getUsers, createUserController, updateUserController, deleteUserController };
