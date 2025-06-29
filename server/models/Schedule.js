
import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Schedule', scheduleSchema);
