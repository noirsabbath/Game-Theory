// src/routes/simulationRoutes.ts

import express from 'express';
import { SimulationController } from '../controllers/SimulationController';
import { environments } from '../models/Environment';
import { strategyStorage } from '../models/StrategyStorage';

const router = express.Router();
const simulationController = new SimulationController(environments);

router.post('/single', (req, res) => {
  const { environmentId, strategyNames, rounds } = req.body;
  try {
    const results = simulationController.runSingleSimulation(environmentId, strategyNames, rounds);
    res.json(results);
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/tournament', (req, res) => {
  const { environmentId, rounds } = req.body;
  try {
    const results = simulationController.runTournament(environmentId, rounds);
    res.json(results);
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/strategies', (req, res) => {
  const { name, rules } = req.body;
  if (!name || !rules || !Array.isArray(rules)) {
    return res.status(400).json({ error: 'Invalid strategy data' });
  }
  
  try {
    strategyStorage.addStrategy({ name, rules });
    res.json({ message: 'Strategy added successfully' });
  } catch (error:any) {
    res.status(400).json({ error: error.message });
  }
});
export default router;