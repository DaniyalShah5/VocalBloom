import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRouter from './routes/auth.js';
import therapyRouter from './routes/therapy.js';
import progressRouter from './routes/progress.js';
import feedbackRouter from './routes/feedback.js';
import scheduleRouter from './routes/schedule.js';
import supportRouter from './routes/support.js';
import adminRouter from './routes/admin.js';
import registerParentRouter from './routes/registerParent.js';
import sessionRequestsRouter from './routes/sessionRequests.js';
import therapistsRouter from './routes/therapists.js';
import usersRouter from './routes/users.js';
import path from 'path';
import registerTherapistRoute from './routes/registerTherapist.js';
import { fileURLToPath } from 'url';
import http from 'http';
import { initSocket } from './socket.js';

const app = express();


app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use('/api/auth', authRouter);
app.use('/api/therapy', therapyRouter);
app.use('/api/progress', progressRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/support', supportRouter);
app.use('/api/admin', adminRouter);
app.use('/api/register-parent', registerParentRouter);

app.use('/api/session-requests', sessionRequestsRouter);
app.use('/api/therapists', therapistsRouter);
app.use('/api/users', usersRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/register-therapist', registerTherapistRoute);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);
server.listen(PORT, () => console.log(`Server + Socket.io running on port ${PORT}`));