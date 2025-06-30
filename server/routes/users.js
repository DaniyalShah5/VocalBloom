import express from 'express';
import User from '../models/Users.js';
import Progress from '../models/Progress.js';
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


router.get('/therapist/patients', verifyToken, async (req, res) => {
  try {
   
    if (req.user.role !== 'therapist') {
      return res.status(403).json({ error: 'Access denied. Only therapists can view patient lists.' });
    }

    
    const children = await User.find({ role: 'child' })
      .select('-password -verificationToken -verificationTokenExpires')
      .lean();

    
    const childrenWithProgress = await Promise.all(
      children.map(async (child) => {
       
        const parent = await User.findOne({ children: child._id, role: 'parent' })
          .select('profile.name email profile.contact')
          .lean();

        
        const progressRecords = await Progress.find({ child: child._id })
          .populate('therapyModule', 'title description')
          .lean();

        
        const totalModules = progressRecords.length;
        const completedModules = progressRecords.filter(record => 
          record.completedTasks && record.completedTasks.length > 0
        ).length;

        const totalTasks = progressRecords.reduce((sum, record) => 
          sum + (record.completedTasks ? record.completedTasks.length : 0), 0
        );

        const lastActivity = progressRecords.length > 0 
          ? Math.max(...progressRecords.map(record => new Date(record.updatedAt).getTime()))
          : null;

        return {
          ...child,
          parent: parent || null,
          progressSummary: {
            totalModules,
            completedModules,
            totalTasks,
            lastActivity: lastActivity ? new Date(lastActivity) : null,
            completionRate: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
          }
        };
      })
    );

    res.json(childrenWithProgress);
  } catch (error) {
    console.error("Error fetching therapist patients:", error);
    res.status(500).json({ error: error.message || "Failed to fetch patient information." });
  }
});

export default router;