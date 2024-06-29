import { GameSimulation } from '../models/GameSimulation';
import { strategyStorage } from '../models/StrategyStorage';
import { Environment } from '../models/Environment';
import { StrategyResult } from '../models/Strategy';

export class SimulationController {
  private environments: Environment[];

  constructor(environments: Environment[]) {
    this.environments = environments;
  }

  public runSingleSimulation(environmentId: string, strategyNames: string[], rounds: number): SimulationResult {
    const environment = this.environments.find(env => env.id === environmentId);
    if (!environment) {
      throw new Error('Environment not found');
    }

    const strategies = strategyNames.map(name => {
      const strategy = strategyStorage.getStrategy(name);
      if (!strategy) {
        throw new Error(`Strategy ${name} not found`);
      }
      return strategy;
    });

    const simulation = new GameSimulation(environment, strategies);
    const results = simulation.runSimulation(rounds);

    return {
      environment: environment.name,
      rounds,
      results
    };
  }

  public runTournament(environmentId: string, rounds: number): AggregatedStrategyResult[] {
    const environment = this.environments.find(env => env.id === environmentId);
    if (!environment) {
      throw new Error('Environment not found');
    }
  
    const allStrategies = strategyStorage.getAllStrategies();
    const results: StrategyResult[] = [];
  
    for (let i = 0; i < allStrategies.length; i++) {
      for (let j = i + 1; j < allStrategies.length; j++) {
        const simulation = new GameSimulation(environment, [allStrategies[i], allStrategies[j]]);
        const pairResults = simulation.runSimulation(rounds);
        results.push(...pairResults);
      }
    }
  
    // Aggregate results
    const aggregatedResults = new Map<string, AggregatedStrategyResult>();
    results.forEach(result => {
      const existing = aggregatedResults.get(result.name);
      if (existing) {
        existing.totalScore += result.score;
        existing.totalGames += 1;
        existing.averageCooperationRate = (existing.averageCooperationRate * (existing.totalGames - 1) + result.cooperationRate) / existing.totalGames;
        existing.averageScore = existing.totalScore / existing.totalGames;
      } else {
        aggregatedResults.set(result.name, {
          name: result.name,
          totalScore: result.score,
          averageScore: result.score,
          totalGames: 1,
          averageCooperationRate: result.cooperationRate
        });
      }
    });
  
    return Array.from(aggregatedResults.values());
  }

  private aggregateTournamentResults(results: StrategyResult[]): AggregatedStrategyResult[] {
    const aggregatedResults = new Map<string, AggregatedStrategyResult>();

    results.forEach(result => {
      const existing = aggregatedResults.get(result.name);
      if (existing) {
        existing.totalScore += result.score;
        existing.totalGames++;
        existing.averageCooperationRate = (existing.averageCooperationRate * (existing.totalGames - 1) + result.cooperationRate) / existing.totalGames;
      } else {
        aggregatedResults.set(result.name, {
            name: result.name,
            totalScore: result.score,
            totalGames: 1,
            averageCooperationRate: result.cooperationRate,
            averageScore: 0
        });
      }
    });

    return Array.from(aggregatedResults.values())
      .map(result => ({
        ...result,
        averageScore: result.totalScore / result.totalGames
      }))
      .sort((a, b) => b.averageScore - a.averageScore);
  }
}

interface SimulationResult {
  environment: string;
  rounds: number;
  results: StrategyResult[];
}

interface TournamentResult {
  environment: string;
  rounds: number;
  results: AggregatedStrategyResult[];
}

interface AggregatedStrategyResult {
  name: string;
  totalScore: number;
  totalGames: number;
  averageScore: number;
  averageCooperationRate: number;
}