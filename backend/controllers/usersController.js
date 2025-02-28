const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

// Get all users (Admin Only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    return res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching all users:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
// Create new user (Admin Only)
const createUser = async (req, res) => {
  const { name, email, password, role, teamId } = req.body;
  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, role, teamId });
    return res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error('Error creating user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update User Info (Admin Only)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, teamId } = req.body;

  try {
    const userExists = await User.findById(id); 
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const updatedUser = await User.update(id, { name, email, password: hashedPassword, role, teamId });

    return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete User (Admin Only)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const userExists = await User.findById(id); 
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.delete(id);
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch All Users in a Team (Admin Only)
const getUsersByTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    const users = await User.findByTeam(teamId);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found for this team' });
    }
    return res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users by team:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Fetch User by ID (Admin Only)
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user });
  } catch (err) {
    console.error('Error fetching user:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUsersByTeam,
  getUserById,
};

