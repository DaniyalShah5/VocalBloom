
import express from 'express';
import Progress from '../models/Progress.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();


router.post('/', verifyToken, async (req, res) => {
  try {
    const { child, therapyModule, completedTasks, taskLog } = req.body;
    
   
    let progress = await Progress.findOne({ child, therapyModule });
    if (!progress) {
      progress = new Progress({ child, therapyModule });
    }
    
    if (completedTasks) {
      progress.completedTasks = completedTasks;
    }
    
   
    if (taskLog) {
      progress.taskLogs.push(taskLog);
    }
    
    progress.updatedAt = new Date();
    
    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/:childId', verifyToken, async (req, res) => {
  try {
    const progressRecords = await Progress.find({ child: req.params.childId })
      .populate('therapyModule', 'title description exercises'); 
    res.json(progressRecords);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
