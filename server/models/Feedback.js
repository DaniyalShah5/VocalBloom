
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  therapyModule: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SessionRequest', 
    required: true 
  },
  feedbackText: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Feedback', feedbackSchema);