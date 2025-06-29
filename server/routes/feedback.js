import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import Feedback from '../models/Feedback.js';
import SessionRequest from '../models/SessionRequest.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { therapyModule, feedbackText } = req.body;
    
    const session = await SessionRequest.findById(therapyModule)
      .orFail(new Error('Session not found'));
    
    if (session.status !== 'completed') {
      return res.status(400).json({ error: 'Session not completed yet' });
    }


    const isParticipant = req.user._id.equals(session.child) || 
                         (session.therapist && req.user._id.equals(session.therapist));
    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a session participant' });
    }

    
    const feedback = new Feedback({
      user: req.user._id,
      therapyModule,
      feedbackText
    });

    await feedback.save();
    
   
    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('user', 'profile.name');

    res.status(201).json(populatedFeedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:therapyModule', verifyToken, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ therapyModule: req.params.therapyModule })
      .populate('user', 'profile.name')
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.get('/child/:childId', verifyToken, async (req, res) => {
  try {
    
    const sessions = await SessionRequest.find({ child: req.params.childId });
    const sessionIds = sessions.map(s => s._id);
    
    
    const feedbacks = await Feedback.find({ 
      therapyModule: { $in: sessionIds } 
    })
    .populate('user', 'profile.name')
    .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;