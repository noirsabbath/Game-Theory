import express, { Request, Response } from 'express';
import { Strategy } from '../models/Strategy';
import { strategyStorage } from '../models/StrategyStorage';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  const strategies = strategyStorage.getAllStrategies();
  res.json(strategies);
});

router.get('/:id', (req: Request, res: Response) => {
  const strategy = strategyStorage.getStrategy(req.params.id);
  if (strategy) {
    res.json(strategy);
  } else {
    res.status(404).json({ message: 'Strategy not found' });
  }
});

router.post('/', (req: Request, res: Response) => {
  const { name, rules } = req.body;
  if (!name || !rules || !Array.isArray(rules)) {
    return res.status(400).json({ message: 'Invalid strategy data' });
  }

  try {
    strategyStorage.addStrategy({ name, rules });
    const newStrategy = strategyStorage.getStrategy(name);
    res.status(201).json(newStrategy);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;