import { World } from './World';
import { Environment } from './Environment';
import { Game } from './Game';
import { AggregatedStrategyResult, Strategy } from './Strategy';

export class Tournament {
  private world: World;
  private environment: Environment;

  constructor(world: World, environment: Environment) {
    this.world = world;
    this.environment = environment;
  }

  public runTournament(gamesPerMatch: number, roundsPerGame: number): AggregatedStrategyResult[] {
    const strategies = this.world.getStrategies();
    const results: Map<string, AggregatedStrategyResult> = new Map(
      strategies.map(s => [s.name, this.initializeAggregatedResult(s)])
    );

    for (let i = 0; i < strategies.length; i++) {
      for (let j = i; j < strategies.length; j++) {
        const strategy1 = strategies[i];
        const strategy2 = strategies[j];
        
        for (let g = 0; g < gamesPerMatch; g++) {
          const game = new Game(this.environment, [strategy1, strategy2]);
          const gameResults = game.play(roundsPerGame);
          
          this.updateResults(results, gameResults);
        }
      }
    }

    return Array.from(results.values()).map(r => ({
      ...r,
      averageScore: r.totalGames > 0 ? r.totalScore / r.totalGames : 0
    }));
  }

  private initializeAggregatedResult(strategy: Strategy): AggregatedStrategyResult {
    return {
      name: strategy.name,
      totalScore: 0,
      averageScore: 0,
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      averageCooperationRate: 0
    };
  }

  private updateResults(results: Map<string, AggregatedStrategyResult>, gameResults: { id: string, score: number, cooperationRate: number }[]): void {
    const [result1, result2] = gameResults;
    
    // Extract the strategy name from the id (assuming the format is "strategy-name_number")
    const getName = (id: string) => id.split('_')[0];
    
    const aggregatedResult1 = results.get(getName(result1.id));
    const aggregatedResult2 = results.get(getName(result2.id));

    if (!aggregatedResult1 || !aggregatedResult2) {
      console.error('Strategy not found:', getName(result1.id), getName(result2.id));
      return;
    }

    aggregatedResult1.totalScore += result1.score;
    aggregatedResult2.totalScore += result2.score;
    aggregatedResult1.totalGames++;
    aggregatedResult2.totalGames++;

    if (result1.score > result2.score) {
      aggregatedResult1.wins++;
      aggregatedResult2.losses++;
    } else if (result2.score > result1.score) {
      aggregatedResult2.wins++;
      aggregatedResult1.losses++;
    } else {
      aggregatedResult1.draws++;
      aggregatedResult2.draws++;
    }

    aggregatedResult1.averageCooperationRate = 
      (aggregatedResult1.averageCooperationRate * (aggregatedResult1.totalGames - 1) + result1.cooperationRate) / aggregatedResult1.totalGames;
    aggregatedResult2.averageCooperationRate = 
      (aggregatedResult2.averageCooperationRate * (aggregatedResult2.totalGames - 1) + result2.cooperationRate) / aggregatedResult2.totalGames;
  }
}