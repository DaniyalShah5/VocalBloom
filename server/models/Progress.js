
import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  child: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  therapyModule: { type: mongoose.Schema.Types.ObjectId, ref: 'TherapyModule', required: true },
  completedTasks: { type: [String], default: [] }, 
  taskLogs: [
    {
      task: String,
      timestamp: { type: Date, default: Date.now },
      details: String
    }
  ],
  startedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Progress', progressSchema);
