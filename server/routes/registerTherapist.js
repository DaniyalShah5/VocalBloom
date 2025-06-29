
import express from 'express';
import User from '../models/Users.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateVerificationToken, sendVerificationEmail } from '../services/emailService.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = 'uploads/certifications';


const fullUploadDir = path.join(__dirname, '..' , uploadDir);
console.log(`[Multer Config] Full upload directory path: ${fullUploadDir}`);
if (!fs.existsSync(fullUploadDir)) {
     try {
        fs.mkdirSync(fullUploadDir, { recursive: true });
        console.log(`[Multer Config] Upload directory created: ${fullUploadDir}`);
    } catch (mkdirError) {
        console.error(`[Multer Config Error] Failed to create upload directory ${fullUploadDir}:`, mkdirError);
    }
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`[Multer Destination] Saving file: ${file.originalname} to ${fullUploadDir}`);
    cb(null, fullUploadDir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
    console.log(`[Multer Filename] Generated filename: ${fileName}`);
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.array('certifications', 5), async (req, res) => {
  console.log("[Route Start] Received therapist registration request.");
  console.log("req.body:", req.body);
  console.log("req.files:", req.files);
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
      console.log(`[Registration Error] Email already registered: ${email}`);
      
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          fs.unlink(file.path, (err) => { 
            if (err) console.error(`[Cleanup Error] Error deleting file ${file.path}:`, err);
            else console.log(`[Cleanup Success] Deleted file: ${file.path}`);
          });
        });
      }
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const certificationPaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = `/${uploadDir}/${path.basename(file.path)}`; 
        certificationPaths.push(filePath); 
        console.log(`[File Path] Storing certification path: ${filePath}`);
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
        certifications: certificationPaths
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
    console.error("Therapist registration error:", error);
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting temp file on registration failure:", err);
        });
      });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;
