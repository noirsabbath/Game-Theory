
import { Environment } from './Environment';
import { Strategy, StrategyResult, Action, Condition } from './Strategy';

type RoundResult = { [strategyName: string]: 'cooperate' | 'defect' };

export class GameSimulation {
  private environment: Environment;
  private strategies: Strategy[];
  private scores: { [strategyName: string]: number } = {};
  private cooperationCounts: { [strategyName: string]: number } = {};
  private strategyHistories: { [strategyName: string]: ('cooperate' | 'defect')[] } = {};
  private punishmentPhase: { [strategyName: string]: boolean } = {};
  private punishmentTurn: { [strategyName: string]: number } = {};
  private consecutiveActions: { [strategyName: string]: { cooperate: number, defect: number } } = {};
  private roundResults: { [strategyName: string]: { action: 'cooperate' | 'defect', score: number }[] } = {};

  constructor(environment: Environment, strategies: Strategy[]) {
    this.environment = environment;
    this.strategies = strategies;
    this.strategies.forEach(strategy => {
      this.scores[strategy.name] = 0;
      this.cooperationCounts[strategy.name] = 0;
      this.strategyHistories[strategy.name] = [];
      this.punishmentPhase[strategy.name] = false;
      this.punishmentTurn[strategy.name] = 0;
      this.consecutiveActions[strategy.name] = { cooperate: 0, defect: 0 };
    });
  }

  private evaluateCondition(condition: Condition, strategyName: string, opponentName: string, round: number): boolean {
    const ownHistory = this.strategyHistories[strategyName];
    const opponentHistory = this.strategyHistories[opponentName];

    switch (condition.type) {
      case 'is_first_move':
        return round === 0;
      case 'opponent_last_action':
        return round > 0 && opponentHistory[round - 1] === condition.value;
      case 'own_last_action':
        return round > 0 && ownHistory[round - 1] === condition.value;
      case 'opponent_action_count':
        return this.getActionCount(opponentName, condition.value as 'cooperate' | 'defect') >= (condition.count ?? 0);
      case 'own_action_count':
        return this.getActionCount(strategyName, condition.value as 'cooperate' | 'defect') >= (condition.count ?? 0);
      case 'turn_number':
        return this.compareValue(round + 1, condition.operator ?? '==', condition.count ?? 0);
      case 'score_difference':
        return this.compareValue(
          this.scores[strategyName] - this.scores[opponentName],
          condition.operator ?? '>=',
          condition.count ?? 0
        );
      case 'opponent_consecutive_defections':
        return this.consecutiveActions[opponentName].defect >= (condition.count ?? 0);
      case 'opponent_consecutive_cooperations':
        return this.consecutiveActions[opponentName].cooperate >= (condition.count ?? 0);
      case 'in_punishment_phase':
        return this.punishmentPhase[strategyName];
      case 'punishment_turn':
        if (condition.operator === '%') {
          return this.punishmentTurn[strategyName] % (condition.count ?? 1) === (condition.value ?? 0);
        }
        return false;
      case 'opponent_recent_defection_rate':
        const recentActions = opponentHistory.slice(-(condition.count ?? 10));
        const defectionCount = recentActions.filter(action => action === 'defect').length;
        return (defectionCount / recentActions.length) > (condition.value ?? 0.5);
      case 'random_chance':
        return Math.random() < (condition.value ?? 0.5);
      case 'is_nth_move':
        return (round + 1) % (condition.interval || 1) === 0;
      case 'is_within_first_n_rounds':
        return round < (condition.duration || 0);
      case 'won_previous_round':
        if (round === 0) return false;
        const ownLastScore = this.roundResults[strategyName][round - 1].score;
        const opponentLastScore = this.roundResults[opponentName][round - 1].score;
        return ownLastScore > opponentLastScore;
      case 'is_specific_round':
        return round + 1 === condition.roundNumber;5
      case 'is_within_first_n_rounds':
        return round < (condition.duration || 0);
      case 'turn_number':
        return this.compareValue(round + 1, condition.operator || '==', condition.count || 0);
      case 'is_losing_after_n_rounds':
        if (round < (condition.count || 0)) return false;
        const ownScore = this.scores[strategyName];
        const opponentScore = this.scores[opponentName];
        return ownScore < opponentScore;
      default:
        return false;
    }
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

  private getActionCount(strategyName: string, action: 'cooperate' | 'defect'): number {
    return this.strategyHistories[strategyName].filter(a => a === action).length;
  }

  private executeAction(action: Action, strategyName: string): 'cooperate' | 'defect' {
    switch (action.type) {
      case 'cooperate':
        return 'cooperate';
      case 'defect':
        return 'defect';
      case 'random':
        return Math.random() < (action.probability ?? 0.5) ? 'cooperate' : 'defect';
      case 'start_punishment':
        this.punishmentPhase[strategyName] = true;
        this.punishmentTurn[strategyName] = 0;
        return 'defect';
      case 'end_punishment':
        this.punishmentPhase[strategyName] = false;
        return 'cooperate';
      default:
        return 'cooperate';
    }
  }

  private getStrategyAction(strategy: Strategy, opponentName: string, round: number): 'cooperate' | 'defect' {
    for (const rule of strategy.rules) {
      if (rule.conditions.every(condition => this.evaluateCondition(condition, strategy.name, opponentName, round))) {
        return this.executeAction(rule.action, strategy.name);
      }
    }
    return round === 0 ? 'cooperate' : 'defect';
  }

  private updateScores(actions: RoundResult): void {
    const actionPair = Object.values(actions);
    if (actionPair.every(action => action === 'cooperate')) {
      Object.keys(actions).forEach(strategyName => this.scores[strategyName] += 3);
    } else if (actionPair.every(action => action === 'defect')) {
      Object.keys(actions).forEach(strategyName => this.scores[strategyName] += 1);
    } else {
      Object.entries(actions).forEach(([strategyName, action]) => {
        if (action === 'defect') {
          this.scores[strategyName] += 5;
        } else {
          this.scores[strategyName] += 0;
        }
      });
    }

    Object.entries(actions).forEach(([strategyName, action]) => {
      this.strategyHistories[strategyName].push(action);
      if (action === 'cooperate') {
        this.cooperationCounts[strategyName]++;
        this.consecutiveActions[strategyName].cooperate++;
        this.consecutiveActions[strategyName].defect = 0;
      } else {
        this.consecutiveActions[strategyName].defect++;
        this.consecutiveActions[strategyName].cooperate = 0;
      }
    });

    Object.entries(actions).forEach(([strategyName, action]) => {
      if (!this.roundResults[strategyName]) {
        this.roundResults[strategyName] = [];
      }
      this.roundResults[strategyName].push({
        action: action,
        score: this.scores[strategyName]
      });
    });
  
  }

  public runSimulation(rounds: number): StrategyResult[] {
    for (let round = 0; round < rounds; round++) {
      const roundActions: RoundResult = {};
      this.strategies.forEach(strategy => {
        const opponentName = this.strategies.find(s => s.name !== strategy.name)!.name;
        roundActions[strategy.name] = this.getStrategyAction(strategy, opponentName, round);
        if (this.punishmentPhase[strategy.name]) {
          this.punishmentTurn[strategy.name]++;
        }
      });
      this.updateScores(roundActions);
    }

    return this.strategies.map(strategy => ({
      name: strategy.name,
      score: this.scores[strategy.name],
      cooperationRate: this.cooperationCounts[strategy.name] / rounds,
      history: this.strategyHistories[strategy.name]
    }));
  }
}