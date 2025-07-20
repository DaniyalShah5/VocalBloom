
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/Users.js";
import { generateVerificationToken, sendVerificationEmail } from "../services/emailService.js";

const router = express.Router();

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('+verificationTokenExpires +isVerified +permissions');
    
    if (!user) return res.status(401).json({ error: "User not found" });
    

    if (user.role !== 'child' && !user.isVerified) {
      if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
        
        return res.status(403).json({ error: "Your email verification period has expired. Please contact support to reactivate your account." });
      }
      
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};


router.post("/register", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save(); 

    
    if (user.role !== 'child') {
      const verificationToken = generateVerificationToken();
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save(); 
    
      await sendVerificationEmail(user.email, verificationToken, user.profile.name);
    }
    
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      token, 
      user: {
        _id: user._id,
        email: user.email,
        name: user.profile.name,
        role: user.role,
        isVerified: user.isVerified,
        verificationTokenExpires: user.verificationTokenExpires 
      },
      message: user.role !== 'child' ? 'Registration successful! Please verify your email.' : 'Registration successful!'
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password, role, childId, parentEmail } = req.body;

    let user;

    if (role === "child" && childId && parentEmail) {
      
      const parent = await User.findOne({ email: parentEmail, role: 'parent' }).select('+verificationTokenExpires +isVerified'); 
      if (!parent) {
        return res.status(404).json({ error: "Parent not found" });
      }

      user = await User.findById(childId).select('+verificationTokenExpires +isVerified'); 
      if (!user || user.role !== 'child') {
        return res.status(404).json({ error: "Child not found" });
      }

      if (!parent.children.includes(user._id)) {
        return res.status(403).json({ error: "Child does not belong to this parent" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
    } else {
      
      const possibleRoles = ['parent', 'therapist', 'admin'];
      
      for (const tryRole of possibleRoles) {
        
        const foundUser = await User.findOne({ email, role: tryRole }).select('+verificationTokenExpires +isVerified +permissions');
        if (foundUser) {
          user = foundUser;
          break;
        }
      }

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

    
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      
      if (user.role !== 'child') {
        if (!user.isVerified) {
          
          if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
            
            user.verificationToken = undefined; 
            user.verificationTokenExpires = undefined; 
            await user.save(); 
            return res.status(403).json({
              error: "Your email verification period has expired. Please contact support to reactivate your account."
            });
          }
         
        }
      }
    }

   
    if (user.role === "therapist") {
      if (user.therapistApplicationStatus === "pending") {
        return res.status(403).json({
          error: "Your therapist application is pending approval by the admin.",
        });
      }
      if (user.therapistApplicationStatus === "rejected") {
        return res.status(403).json({
          error: "Your therapist application has been rejected. Please contact support for more information.",
        });
      }
      if (user.therapistApplicationStatus !== "approved") {
        return res.status(403).json({ 
          error: "Your therapist account is not approved." 
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ 
      token, 
      user: {
        _id: user._id,
        email: user.email,
        name: user.profile.name,
        role: user.role,
        isVerified: user.isVerified, 
        verificationTokenExpires: user.verificationTokenExpires ,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    }).select('+verificationToken +verificationTokenExpires +isVerified');

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined; 
    await user.save();

    res.status(200).json({ message: 'Email successfully verified!' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: error.message || 'An error occurred during verification.' });
  }
});


router.post('/resend-verification-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email, role: { $in: ['parent', 'therapist', 'admin'] } }).select('+verificationTokenExpires +isVerified');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified.' });
    }

    
    const newVerificationToken = generateVerificationToken();
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, newVerificationToken, user.profile.name);

    res.status(200).json({ 
      message: 'New verification email sent. Please check your inbox.',
      user: { 
        _id: user._id,
        email: user.email,
        name: user.profile.name,
        role: user.role,
        isVerified: user.isVerified,
        verificationTokenExpires: user.verificationTokenExpires
      }
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({ error: error.message || 'An error occurred while resending verification email.' });
  }
});


router.get("/parent/:email/children", async (req, res) => {
  try {
    const { email } = req.params;
    
    const parent = await User.findOne({ email, role: 'parent' }).populate('children', 'profile.name _id');
    if (!parent) {
      return res.status(404).json({ error: "Parent not found" });
    }

    res.json(parent.children);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  res.json(req.user);
});


export default router;
