import { Strategy, Rule } from './Strategy';
import { defaultStrategies } from './defaultStrategies';

class StrategyStorage {
  private strategies: Map<string, Strategy> = new Map();

  constructor() {
    this.initializeDefaultStrategies();
  }

  private initializeDefaultStrategies(): void {
    defaultStrategies.forEach(strategy => {
      this.addStrategy(strategy);
    });
  }

  addStrategy(strategyData: Omit<Strategy, 'isGood' | 'id'>): void {
    const isGood = this.determineIfGood(strategyData.rules);
    const id = this.generateId(strategyData.name);
    const strategy: Strategy = {
      ...strategyData,
      id,
      isGood
    };
    this.strategies.set(id, strategy);
    console.log(`Added strategy: ${strategy.name} with id: ${id}`);
  }

  private determineIfGood(rules: Rule[]): boolean {
    const firstAction = rules[0]?.action;
    return firstAction?.type === 'cooperate' || (firstAction?.type === 'random' && (firstAction.probability ?? 0.5) > 0.5);
  }

  private generateId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  getStrategy(id: string): Strategy | undefined {
    return this.strategies.get(id);
  }

  getStrategyByName(name: string): Strategy | undefined {
    const id = this.generateId(name);
    return this.getStrategy(id);
  }

  getAllStrategies(): Strategy[] {
    return Array.from(this.strategies.values());
  }

  debugPrintStrategies(): void {
    console.log("Current strategies:");
    this.strategies.forEach((strategy, id) => {
      console.log(`ID: ${id}, Name: ${strategy.name}, IsGood: ${strategy.isGood}`);
    });
  }
}

export const strategyStorage = new StrategyStorage();
strategyStorage.debugPrintStrategies();