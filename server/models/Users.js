import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['child', 'parent', 'therapist', 'admin'], 
    default: 'child',
    required: true,
  },
  profile: {
    name: { type: String, trim: true },
    contact: { type: String, trim: true },
    address: { type: String, trim: true },
    disabilityType: { type: String, trim: true },
    additionalInfo: { type: String, trim: true },
  },
  qualifications: {
    degree: { type: String, trim: true },
    yearsOfExperience: { type: Number, default: 0 },
    certifications: [{ type: String }], 
  },
  specialties: [{ type: String }], 
  therapistApplicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  permissions: {
    canDeleteUsers: { type: Boolean, default: false },
    canModifyUsers: { type: Boolean, default: false }, 
    canApproveTherapists: { type: Boolean, default: false },
    canManageModules: { type: Boolean, default: false } 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;