
import express from 'express';
import User from '../models/Users.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { generateVerificationToken, sendVerificationEmail } from '../services/emailService.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vocalbloom_certifications', 
    format: async (req, file) => 'png', 
    public_id: (req, file) => `cert_${Date.now()}_${file.originalname.split('.')[0]}`, 
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.array('certifications', 5), async (req, res) => {
  try {
    const { email, password, name, contact, address, authDegree, yearsOfExperience } = req.body;

    let specialties = [];
    if (req.body.specialties) {
      try {
        specialties = JSON.parse(req.body.specialties);
      } catch (parseError) {
        console.error("Failed to parse specialties:", parseError);
        return res.status(400).json({ error: 'Invalid specialties format.' });
      }
    }
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {

      return res.status(400).json({ error: 'Email is already registered' });
    }

    const certificationUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        
        certificationUrls.push(file.path); 
      });
    }

   
    const therapist = new User({
      role: 'therapist',
      email,
      password,
      profile: {
        name,
        contact,
        address
      },
      qualifications: {
        degree: authDegree,
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        certifications: certificationUrls
      },
      specialties: specialties || [],
      therapistApplicationStatus: 'pending',
      isVerified: false 
    });

    const verificationToken = generateVerificationToken();
    therapist.verificationToken = verificationToken;
    therapist.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await therapist.save();

 
    await sendVerificationEmail(therapist.email, verificationToken, therapist.profile.name);

    
    const token = jwt.sign(
      { userId: therapist._id, email: therapist.email, role: 'therapist' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Therapist registration successful! Your application is pending admin approval and email verification.',
      token,
      user: {
        id: therapist._id,
        email: therapist.email,
        name: therapist.profile.name,
        role: 'therapist',
        status: 'pending',
        isVerified: therapist.isVerified,
        verificationTokenExpires: therapist.verificationTokenExpires
      }
    });
  } catch (error) {
    
    res.status(500).json({ error: error.message });
  }
});

export default router;
