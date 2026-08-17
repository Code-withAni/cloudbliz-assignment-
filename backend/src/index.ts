import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cloudblitz_enquiry_management';

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error: Error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
