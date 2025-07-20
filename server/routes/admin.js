
import express from 'express';
import TherapyModule from '../models/TherapyModule.js';
import User from '../models/Users.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();


const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only admins can perform this action.' });
  }
  next();
};

const canApproveTherapists = (req, res, next) => {
  if (!req.user.permissions || !req.user.permissions.canApproveTherapists) {
    return res.status(403).json({ error: 'Access denied. You do not have permission to approve therapists.' });
  }
  next();
};

const canManageModules = (req, res, next) => {
  if (!req.user.permissions || !req.user.permissions.canManageModules) {
    return res.status(403).json({ error: 'Access denied. You do not have permission to manage modules.' });
  }
  next();
};

const canDeleteUsers = (req, res, next) => {
  if (!req.user.permissions || !req.user.permissions.canDeleteUsers) {
    return res.status(403).json({ error: 'Access denied. You do not have permission to delete users.' });
  }
  next();
};

const canModifyUsers = (req, res, next) => {
  if (!req.user.permissions || !req.user.permissions.canModifyUsers) {
    return res.status(403).json({ error: 'Access denied. You do not have permission to view or modify users.' });
  }
  next();
};


router.get(
  '/pending-therapists',
  verifyToken, 
  isAdmin,     
  async (req, res) => {
    try {
      const pendingTherapists = await User.find({
        role: 'therapist',
        therapistApplicationStatus: 'pending'
      });
      res.json(pendingTherapists);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error fetching pending therapists.' });
    }
  }
);


router.put(
  '/approve-therapist/:id',
  verifyToken,
  isAdmin,
  canApproveTherapists,
  async (req, res) => {
    try {
      const therapist = await User.findByIdAndUpdate(
        req.params.id,
        { therapistApplicationStatus: 'approved' },
        { new: true }
      );
      if (!therapist) {
        return res.status(404).json({ error: 'Therapist not found.' });
      }
      res.json(therapist);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error approving therapist.' });
    }
  }
);


router.put(
  '/reject-therapist/:id',
  verifyToken,
  isAdmin,
  canApproveTherapists,
  async (req, res) => {
    try {
      const therapist = await User.findByIdAndUpdate(
        req.params.id,
        { therapistApplicationStatus: 'rejected' },
        { new: true }
      );
      if (!therapist) {
        return res.status(404).json({ error: 'Therapist not found.' });
      }
      res.json(therapist);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error rejecting therapist.' });
    }
  }
);


router.put(
  '/approve/:moduleId',
  verifyToken,
  isAdmin,
  canManageModules,
  async (req, res) => {
    try {
      const therapyModule = await TherapyModule.findByIdAndUpdate(
        req.params.moduleId,
        { approved: true },
        { new: true }
      );
      if (!therapyModule) {
        return res.status(404).json({ error: 'Module not found' });
      }
      res.json(therapyModule);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
);


router.put('/reject-module/:id', verifyToken, isAdmin, canManageModules, async (req, res) => {
  try {
    const moduleId = req.params.id;
    await TherapyModule.findByIdAndDelete(moduleId);
    
    res.json({ message: 'Module rejected successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get(
  '/pending-modules',
  verifyToken,
  isAdmin,
  
  async (req, res) => {
    try {
      const pendingModules = await TherapyModule.find({ approved: false })
      .populate('createdBy', 'name email') 
      .sort({ createdAt: -1 });
      res.json(pendingModules);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
);


router.get(
  '/users',
  verifyToken,
  isAdmin,
  
  async (req, res) => {
    try {
      const users = await User.find({})
        .select('-password') 
        .populate('children', 'profile.name profile.disabilityType')
        .exec();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
);


router.delete(
  '/users/:userId',
  verifyToken,
  isAdmin,
  canDeleteUsers,
  async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: error.message });
    }
  }
);

router.get(
  '/me',
  verifyToken,
  isAdmin,          
  (req, res) => {
    
    const level = req.user.role; 
    const permissions = req.user.permissions || {};
    res.json({ level, permissions });
  }
);

export default router;
