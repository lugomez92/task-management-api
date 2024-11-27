const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./data/database');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/tasksRoutes');
const teamRoutes = require('./routes/teamsRoutes');
const userRoutes = require('./routes/usersRoutes');

// Load environment variables
dotenv.config();
console.log(process.env.JWT_SECRET);

// Middleware setup
app.use(cors());
app.use(express.json());

// Test DB Route (returns list of tables)
app.get('/test-db', (req, res) => {
  db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ tables: rows });
  });
});

// Authentication routes
app.use('/auth', authRoutes);
// Task routes
app.use('/api/tasks', taskRoutes); 
// Team routes 
app.use('/api/teams', teamRoutes); 
// User routes 
app.use('/api/users', userRoutes);  

app.get('/', (req,res) => {
  res.send('Task Management API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});