import express, { Request, Response } from 'express';
import { SimulationController } from '../controllers/SimulationController';
import { environments } from '../models/Environment';

const router = express.Router();
const simulationController = new SimulationController(environments);

router.post('/single', (req: Request, res: Response) => {
  const { environmentId, strategyIds, rounds } = req.body;
  try {
    const results = simulationController.runSingleSimulation(environmentId, strategyIds, rounds);
    res.json(results);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/world', (req: Request, res: Response) => {
  const { environmentId, worldSize, populationSize, years, gamesPerMatch, roundsPerGame } = req.body;
  try {
    const results = simulationController.runWorldSimulation(
      environmentId,
      worldSize,
      populationSize,
      years,
      gamesPerMatch,
      roundsPerGame
    );
    res.json(results);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;