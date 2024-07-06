import { Strategy } from './Strategy';
import { strategyStorage } from './StrategyStorage';

export class Population {
  private strategies: Strategy[];

  constructor(populationSize: number) {
    this.strategies = this.generatePopulation(populationSize);
  }

  private generatePopulation(populationSize: number): Strategy[] {
    const baseStrategies = strategyStorage.getAllStrategies();
    const population: Strategy[] = [];
    for (let i = 0; i < populationSize; i++) {
      const baseStrategy = baseStrategies[i % baseStrategies.length];
      population.push({ ...baseStrategy, id: `${baseStrategy.id}_${i}` });
    }
    return population;
  }

  public getStrategies(): Strategy[] {
    return this.strategies;
  }
}