import logger from '../utils/logger';
import { Environment } from './Environment';
import { Strategy, StrategyResult, Action, Condition } from './Strategy';

type RoundResult = { [strategyId: string]: 'cooperate' | 'defect' };

export class GameSimulation {
  private environment: Environment;
  private strategies: Strategy[];
  private scores: { [strategyId: string]: number } = {};
  private strategyHistories: { [strategyId: string]: ('cooperate' | 'defect')[] } = {};
  private cooperationCounts: { [strategyId: string]: number } = {};

  constructor(environment: Environment, strategies: Strategy[]) {
    this.environment = environment;
    this.strategies = strategies;
    this.strategies.forEach(strategy => {
      this.scores[strategy.id] = 0;
      this.strategyHistories[strategy.id] = [];
      this.cooperationCounts[strategy.id] = 0;
    });
  }

  public runGame(rounds: number): StrategyResult[] {
    for (let round = 0; round < rounds; round++) {
      const roundActions: RoundResult = {};
      
      // Each strategy plays against all others (including itself)
      for (let i = 0; i < this.strategies.length; i++) {
        for (let j = 0; j < this.strategies.length; j++) {
          const strategy = this.strategies[i];
          const opponent = this.strategies[j];
          const strategyKey = `${strategy.id}_vs_${opponent.id}`;
          
          roundActions[strategyKey] = this.getStrategyAction(strategy, opponent.id, round);
        }
      }
      
      this.updateScores(roundActions);
      this.logRound(round + 1, roundActions);
    }
  
    return this.strategies.map(strategy => ({
      name: strategy.name,
      score: this.getTotalScore(strategy.id),
      cooperationRate: this.getCooperationRate(strategy.id, rounds),
      history: this.getHistory(strategy.id)
    }));
  }
  
  private getTotalScore(strategyId: string): number {
    return Object.keys(this.scores)
      .filter(key => key.startsWith(strategyId))
      .reduce((total, key) => total + this.scores[key], 0);
  }
  
  private getCooperationRate(strategyId: string, rounds: number): number {
    const totalCooperations = Object.keys(this.cooperationCounts)
      .filter(key => key.startsWith(strategyId))
      .reduce((total, key) => total + this.cooperationCounts[key], 0);
    
    return totalCooperations / (rounds * this.strategies.length);
  }
  
  private getHistory(strategyId: string): ('cooperate' | 'defect')[] {
    return Object.keys(this.strategyHistories)
      .filter(key => key.startsWith(strategyId))
      .flatMap(key => this.strategyHistories[key]);
  }
  
 

  private getStrategyAction(strategy: Strategy, opponentId: string, round: number): 'cooperate' | 'defect' {
    for (const rule of strategy.rules) {
      if (rule.conditions.every(condition => this.evaluateCondition(condition, strategy.id, opponentId, round))) {
        return this.executeAction(rule.action);
      }
    }
    return round === 0 ? 'cooperate' : 'defect';
  }
  private evaluateCondition(condition: Condition, strategyId: string, opponentId: string, round: number): boolean {
    const ownHistory = this.strategyHistories[strategyId];
    const opponentHistory = this.strategyHistories[opponentId];
  
    switch (condition.type) {
      case 'is_first_move':
        return round === 0;
  
      case 'opponent_last_action':
        return round > 0 && opponentHistory[round - 1] === condition.value;
  
      case 'own_last_action':
        return round > 0 && ownHistory[round - 1] === condition.value;
  
      case 'opponent_action_count':
        return this.getActionCount(opponentId, condition.value as 'cooperate' | 'defect') >= (condition.count ?? 0);
  
      case 'own_action_count':
        return this.getActionCount(strategyId, condition.value as 'cooperate' | 'defect') >= (condition.count ?? 0);
  
      case 'turn_number':
        return this.compareValue(round + 1, condition.operator ?? '==', condition.count ?? 0);
  
      case 'score_difference':
        return this.compareValue(
          this.scores[strategyId] - this.scores[opponentId],
          condition.operator ?? '>=',
          condition.count ?? 0
        );
  
      case 'opponent_consecutive_actions':
        return this.getConsecutiveActions(opponentId, condition.value as 'cooperate' | 'defect') >= (condition.count ?? 0);
  
      case 'own_consecutive_actions':
        return this.getConsecutiveActions(strategyId, condition.value as 'cooperate' | 'defect') >= (condition.count ?? 0);
  
      case 'opponent_recent_action_rate':
        const recentActions = opponentHistory.slice(-(condition.count ?? 10));
        const actionCount = recentActions.filter(action => action === condition.value).length;
        return (actionCount / recentActions.length) >= (condition.value ?? 0.5);
  
      case 'random_chance':
        return Math.random() < (condition.value ?? 0.5);
  
      case 'is_nth_move':
        return (round + 1) % (condition.interval || 1) === 0;
  
      case 'is_within_first_n_rounds':
        return round < (condition.duration || 0);
  
      case 'won_previous_round':
        if (round === 0) return false;
        const ownLastScore = this.scores[strategyId];
        const opponentLastScore = this.scores[opponentId];
        return ownLastScore > opponentLastScore;
  
      case 'is_specific_round':
        return round + 1 === condition.roundNumber;
  
      case 'is_losing_after_n_rounds':
        if (round < (condition.count || 0)) return false;
        const ownScore = this.scores[strategyId];
        const opponentScore = this.scores[opponentId];
        return ownScore < opponentScore;
  
      default:
        return false;
    }
  }
  
  private getActionCount(strategyId: string, action: 'cooperate' | 'defect'): number {
    return this.strategyHistories[strategyId].filter(a => a === action).length;
  }
  
  private compareValue(value: number, operator: string, compareValue: number): boolean {
    switch (operator) {
      case '<': return value < compareValue;
      case '<=': return value <= compareValue;
      case '>': return value > compareValue;
      case '>=': return value >= compareValue;
      case '==': return value === compareValue;
      case '%': return value % compareValue === 0;
      default: return false;
    }
  }
  
  private getConsecutiveActions(strategyId: string, action: 'cooperate' | 'defect'): number {
    const history = this.strategyHistories[strategyId];
    let count = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i] === action) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private executeAction(action: Action): 'cooperate' | 'defect' {
    switch (action.type) {
      case 'cooperate':
        return 'cooperate';
      case 'defect':
        return 'defect';
      case 'random':
        return Math.random() < (action.probability ?? 0.5) ? 'cooperate' : 'defect';
      default:
        return 'cooperate';
    }
  }


  private updateScores(actions: RoundResult): void {
    Object.entries(actions).forEach(([key, action]) => {
      const [strategyId, opponentId] = key.split('_vs_');
      const opponentAction = actions[`${opponentId}_vs_${strategyId}`];
  
      if (action === 'cooperate' && opponentAction === 'cooperate') {
        this.scores[key] = (this.scores[key] || 0) + 3;
      } else if (action === 'defect' && opponentAction === 'cooperate') {
        this.scores[key] = (this.scores[key] || 0) + 5;
      } else if (action === 'defect' && opponentAction === 'defect') {
        this.scores[key] = (this.scores[key] || 0) + 1;
      }
  
      this.strategyHistories[key] = this.strategyHistories[key] || [];
      this.strategyHistories[key].push(action);
      
      if (action === 'cooperate') {
        this.cooperationCounts[key] = (this.cooperationCounts[key] || 0) + 1;
      }
    });
  }
  private logRound(roundNumber: number, actions: RoundResult): void {
    logger.info(`Round ${roundNumber}: ${JSON.stringify(actions)}`);
  }
}
