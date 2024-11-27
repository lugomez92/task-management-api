const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate the JWT token
function authenticateToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Access Denied: Invalid token' });
    }
    console.log('Decoded User: ', user);
    req.user = user;
    next();
  });
}

// Middleware to authorize based on user role
function authorizeRole(allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user;
    
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Access Denied: Insufficient privileges' });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRole };
