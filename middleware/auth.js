const jwt = require('jsonwebtoken');
require('dotenv').config();  // Load environment variables

const secretKey = process.env.JWT_SECRET;  // Use JWT secret from .env

// Middleware to check if the user is authenticated
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    // Verify the token
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;  // Attach user data to request
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
