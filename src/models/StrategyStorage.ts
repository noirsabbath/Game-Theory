import { Strategy, Rule } from './Strategy';

class StrategyStorage {
  private strategies: Map<string, Strategy> = new Map();

  addStrategy(strategyData: Omit<Strategy, 'isGood'>): void {
    const isGood = this.determineIfGood(strategyData.rules);
    const strategy: Strategy = {
      ...strategyData,
      isGood
    };
    this.strategies.set(strategy.name, strategy);
  }

  private determineIfGood(rules: Rule[]): boolean {
    const firstAction = rules[0]?.action;
    return firstAction?.type === 'cooperate' || (firstAction?.type === 'random' && (firstAction.probability ?? 0.5) > 0.5);
  }

  getStrategy(name: string): Strategy | undefined {
    return this.strategies.get(name);
  }

  getAllStrategies(): Strategy[] {
    return Array.from(this.strategies.values());
  }
}

export const strategyStorage = new StrategyStorage();