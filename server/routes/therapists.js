
import express from 'express';
import User from '../models/Users.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();


router.get('/', verifyToken, async (req, res) => {
  try {
    const therapists = await User.find({
      role: 'therapist',
      therapistApplicationStatus: 'approved'
    }).select('-password');
    
    res.json(therapists);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/specialty/:specialty', verifyToken, async (req, res) => {
  try {
    const therapists = await User.find({
      role: 'therapist',
      therapistApplicationStatus: 'approved',
      specialties: req.params.specialty
    }).select('-password');
    
    res.json(therapists);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/:id', verifyToken, async (req, res) => {
  try {
    const therapist = await User.findOne({
      _id: req.params.id,
      role: 'therapist'
    }).select('-password');
    
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    
    res.json(therapist);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;