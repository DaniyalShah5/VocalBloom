
import express from 'express';
import Schedule from '../models/Schedule.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();


router.post('/', verifyToken, async (req, res) => {
  try {
    const { child, therapist, sessionTime } = req.body;
    const schedule = new Schedule({ child, therapist, sessionTime });
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const schedules = await Schedule.find({
      $or: [
        { child: req.params.userId },
        { therapist: req.params.userId }
      ]
    }).populate('child therapist', 'profile.name email');
    res.json(schedules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
