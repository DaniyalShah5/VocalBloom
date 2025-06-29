
import mongoose from 'mongoose';

const therapyModuleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoLink: String,
  category: { 
    type: String, 
    required: true,
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
    ]
  },
  exercises: [
    {
      type: String 
    }
  ],
  
  difficultyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  estimatedTimeMinutes: { type: Number, default: 30 },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TherapyModule', therapyModuleSchema);