const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../data/database');

// Register user
const register = (req, res) => {
  const { email, password, role } = req.body;

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password', error: err });
    }

    // Insert user into database
    const stmt = db.prepare("INSERT INTO users (email, password, role) VALUES (?, ?, ?)");
    stmt.run(email, hashedPassword, role, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving user', error: err });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
    stmt.finalize();
  });
};

// Login user
const login = (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role, 
          teamId: user.teamId
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1h' }
      );

      res.status(200).json({ token });
    });
  });
};


module.exports = { register, login };
