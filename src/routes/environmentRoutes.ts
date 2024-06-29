import express, { Request, Response } from 'express';
import { environments } from '../models/Environment';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.json(environments);
});

router.get('/:id', (req: Request, res: Response) => {
  const environment = environments.find(env => env.id === req.params.id);
  if (environment) {
    res.json(environment);
  } else {
    res.status(404).json({ message: 'Environment not found' });
  }
});

export default router;