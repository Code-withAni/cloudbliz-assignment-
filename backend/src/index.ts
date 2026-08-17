import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import healthRoutes from './routes/healthRoutes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
