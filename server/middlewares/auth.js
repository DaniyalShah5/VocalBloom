import jwt from 'jsonwebtoken';
import User from '../models/Users.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+isVerified +verificationTokenExpires +permissions');
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user; 
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};