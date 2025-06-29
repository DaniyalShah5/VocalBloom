
import express from 'express';
import User from '../models/Users.js';
import jwt from 'jsonwebtoken';
import { generateVerificationToken, sendVerificationEmail } from '../services/emailService.js';

const router = express.Router();


router.post('/', async (req, res) => {
  try {
    const { parent, child } = req.body;

   
    if (!parent || !child) {
      return res.status(400).json({ error: 'Both parent and child details are required.' });
    }
    if (!parent.name || !parent.email || !parent.password) {
      return res.status(400).json({ error: 'Parent name, email, and password are all required.' });
    }
    if (!child.name || !child.password) {
      return res.status(400).json({ error: 'Child name and password are both required.' });
    }

    const existingParent = await User.findOne({ email: parent.email, role: 'parent' });
    if (existingParent) {
      return res.status(400).json({ error: 'Parent email is already registered.' });
    }

    // --- Create Parent User ---
    const parentUser = new User({
      role: 'parent',
      email: parent.email,
      password: parent.password,
      profile: {
        name: parent.name,
        contact: parent.contact || '',
        address: parent.address || ''
      },
      isVerified: false 
    });

    // Generate verification token and set expiry for parent
    const verificationToken = generateVerificationToken();
    parentUser.verificationToken = verificationToken;
    parentUser.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await parentUser.save();

    // --- Create Child User ---
    
    const childUser = new User({
      role: 'child',
      email: child.email || undefined,       
      password: child.password,            
      profile: {
        name: child.name,
        disabilityType: child.disabilityType || '',
        additionalInfo: child.additionalInfo || ''
      }
    });
    await childUser.save();

    
    parentUser.children.push(childUser._id);
    await parentUser.save(); 

    
    await sendVerificationEmail(parentUser.email, verificationToken, parentUser.profile.name);

    
    const token = jwt.sign(
      { userId: parentUser._id, role: parentUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ 
      token, 
      parent: {
        id: parentUser._id,
        email: parentUser.email,
        name: parentUser.profile.name,
        role: parentUser.role,
        isVerified: parentUser.isVerified,
        verificationTokenExpires: parentUser.verificationTokenExpires
      }, 
      child: childUser,
      message: 'Parent and Child registered successfully! Please verify the parent\'s email address.'
    });
  } catch (error) {
    console.error('Error in /register-parent:', error);
    return res.status(400).json({ error: error.message });
  }
});

export default router;