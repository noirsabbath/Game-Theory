import express, { Express } from 'express';
import environmentRoutes from './routes/environmentRoutes';
import strategyRoutes from './routes/strategyRoutes';
import simulationRoutes from './routes/simulationRoutes';

const app: Express = express();
const port = 3000;

app.use(express.json());

app.use('/api/environments', environmentRoutes);
app.use('/api/strategies', strategyRoutes);
app.use('/api/simulations', simulationRoutes);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});