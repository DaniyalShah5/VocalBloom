
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['parent', 'child', 'therapist', 'admin'],
    required: true 
  },
  email: { 
    type: String, 
    unique: true,
    
    required: function() { return this.role !== 'child'; }
  },
  password: {
    type: String,
    
    required: function() { return this.role !== 'child'; }
  },
  profile: {
    name: { type: String, required: true },
    disabilityType: { type: String }, 
    contact: { type: String }, 
    address: { type: String }, 
    additionalInfo: { type: String }  
  },
 
  isVerified: {
    type: Boolean,
    default: false,
    
    required: function() { return this.role !== 'child'; }
  },
  verificationToken: {
    type: String,
    select: false 
  },
  verificationTokenExpires: {
    type: Date,
    select: false 
  },
  // Fields for therapist
  therapistApplicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  specialties: {
    type: [String],
    enum: [
      'Articulation Disorders',
      'Language Delays',
      'Stuttering',
      'Voice Disorders',
      'Apraxia of Speech',
      'Aphasia',
      'Autism Spectrum Disorders',
      'Swallowing Disorders',
      'Hearing Impairments'
    ],
    default: []
  },
  
  qualifications: {
    degree: { type: String },
    certifications: [{type: String}],
    yearsOfExperience: { type: Number }
  },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model('User', userSchema);