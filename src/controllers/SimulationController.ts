import { World } from '../models/World';
import { Tournament } from '../models/Tournament';
import { Environment } from '../models/Environment';
import { Strategy, AggregatedStrategyResult, StrategyResult } from '../models/Strategy';
import { Population } from '../models/Population';
import { strategyStorage } from '../models/StrategyStorage';
import { GameSimulation } from '../models/GameSimulation';

export class SimulationController {
  private environments: Environment[];

  constructor(environments: Environment[]) {
    this.environments = environments;
  }

  public runSingleSimulation(environmentId: string, strategyIds: string[], rounds: number): SimulationResult {
    const environment = this.getEnvironment(environmentId);
    const strategies = this.getStrategies(strategyIds);

    const simulation = new GameSimulation(environment, strategies);
    const results = simulation.runGame(rounds);

    return {
      environment: environment.name,
      rounds,
      results
    };
  }

  public runWorldSimulation(
    environmentId: string, 
    worldSize: { width: number, height: number }, 
    populationSize: number, 
    years: number, 
    gamesPerMatch: number, 
    roundsPerGame: number
  ): WorldSimulationResult {
    const environment = this.getEnvironment(environmentId);
    const population = new Population(populationSize);
    const world = new World(worldSize, population);
    const tournament = new Tournament(world, environment);

    const yearlyStats: YearlyStats[] = [];

    for (let year = 0; year < years; year++) {
      const tournamentResults = tournament.runTournament(gamesPerMatch, roundsPerGame);
      world.mutate(environment.mutationRate);
      const worldStats = world.getStats();

      yearlyStats.push({
        year: year + 1,
        worldStats,
        tournamentResults
      });
    }

    const finalStats = world.getFinalStats();

    return {
      environment: environment.name,
      years,
      finalStats,
      yearlyStats
    };
  }

  private getEnvironment(environmentId: string): Environment {
    const environment = this.environments.find(env => env.id === environmentId);
    if (!environment) {
      throw new Error('Environment not found');
    }
    return environment;
  }

  private getStrategies(strategyIds: string[]): Strategy[] {
    return strategyIds.map(id => {
      const strategy = strategyStorage.getStrategy(id);
      if (!strategy) {
        throw new Error(`Strategy ${id} not found`);
      }
      return strategy;
    });
  }
}

interface SimulationResult {
  environment: string;
  rounds: number;
  results: StrategyResult[];
}

interface WorldSimulationResult {
  environment: string;
  years: number;
  finalStats: {
    worldType: 'good' | 'bad';
    goodPercentage: number;
  };
  yearlyStats: YearlyStats[];
}

interface YearlyStats {
  year: number;
  worldStats: {
    goodCount: number;
    badCount: number;
  };
  tournamentResults: AggregatedStrategyResult[];
}