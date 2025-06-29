import mongoose from 'mongoose';

const sessionRequestSchema = new mongoose.Schema({
  child:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },                      
  status:   { 
    type: String, 
    enum: ['pending','accepted','declined','in_progress','completed', 'cancelled'], 
    default: 'pending' 
  },
  therapist:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt:  Date,
  endedAt:     Date,
  cancelledAt: Date
});

export default mongoose.model('SessionRequest', sessionRequestSchema);
