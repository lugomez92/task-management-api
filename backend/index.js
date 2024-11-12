const express = require('express');
const cors = require('cors');
const routes = require('./routes/routes');
const { initializeDatabase } = require('./models/database');
const app = express();
const PORT = process.env.PORT || 4000;

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('Database initialized');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });

// Middleware setup
app.use(cors());
app.use(express.json());

// Use the routes
app.use('/api', routes);

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// General error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});
