
import express from 'express';
import TherapyModule from '../models/TherapyModule.js';
import User from '../models/Users.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

const isTherapist = (req, res, next) => {
  if (req.user.role !== 'therapist' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only therapists can perform this action.' });
  }
  next();
};

router.get('/categories', async (req, res) => {
  try {
    
    const categories = await TherapyModule.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/category/:category', verifyToken, async (req, res) => {
  try {
    const modules = await TherapyModule.find({ 
      category: req.params.category,
      approved: true
    }).populate('createdBy', 'profile.name');
    
    res.json(modules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/', verifyToken, isTherapist, async (req, res) => {
  try {
    const moduleData = {
      ...req.body,
      createdBy: req.user._id,
    };
    const therapyModule = new TherapyModule(moduleData);
    await therapyModule.save();
    res.status(201).json(therapyModule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, isTherapist, async (req, res) => {
  try {
    const therapyModule = await TherapyModule.findById(req.params.id);
    
    if (!therapyModule) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
  
    if (therapyModule.createdBy.toString() !== req.user._id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this module' });
    }
    
    const updatedModule = await TherapyModule.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    
    res.json(updatedModule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/my-modules', verifyToken, isTherapist, async (req, res) => {
  try {
    const modules = await TherapyModule.find({ createdBy: req.user._id });
    res.json(modules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post('/assign/:id', verifyToken, isTherapist, async (req, res) => {
  try {
    const { childId } = req.body;
    const therapyModule = await TherapyModule.findById(req.params.id);
    
    if (!therapyModule) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    
    if (therapyModule.assignedTo.includes(childId)) {
      return res.status(400).json({ error: 'Module already assigned to this child' });
    }
    
    therapyModule.assignedTo.push(childId);
    await therapyModule.save();
    res.json(therapyModule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const therapyModule = await TherapyModule.findById(req.params.id)
      .populate('createdBy', 'profile.name');
      
    if (!therapyModule) {
      return res.status(404).json({ error: 'Module not found' });
    }
    
    res.json(therapyModule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;