
import express from 'express';
import User from '../models/Users.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();


router.get('/child/:childId', verifyToken, async (req, res) => {
  try {
    const childId = req.params.childId;
    
    const child = await User.findById(childId).select('-password');
    
    if (!child) {
      return res.status(404).json({ error: 'Child not found' });
    }
    
    if (child.role !== 'child') {
      return res.status(400).json({ error: 'User is not a child profile' });
    }
    
    res.json(child);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/parent-of-child/:childId', verifyToken, async (req, res) => {
  try {
    const { childId } = req.params;
    const parent = await User.findOne({ children: childId, role: 'parent' }).select('profile.name email');
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found for this child.' });
    }
    res.json(parent);
  } catch (error) {
    console.error("Error fetching parent of child:", error);
    res.status(400).json({ error: error.message || "Failed to fetch parent information." });
  }
});



export default router;