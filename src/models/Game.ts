import { GameSimulation } from './GameSimulation';
import { Environment } from './Environment';
import { Strategy } from './Strategy';

export class Game {
  private simulation: GameSimulation;

  constructor(environment: Environment, strategies: Strategy[]) {
    this.simulation = new GameSimulation(environment, strategies);
  }

  public play(rounds: number): { id: string, score: number, cooperationRate: number }[] {
    const results = this.simulation.runGame(rounds);
    return results.map(r => ({
      id: r.name, // Assuming the name is used as the id
      score: r.score,
      cooperationRate: r.cooperationRate
    }));
  }
}