export interface Action {
  type: string;
  probability?: number;
}

export interface Condition {
  type: string;
  value?: any;
  count?: number;
  operator?: '<' | '<=' | '>' | '>=' | '==' | '%';
  interval?: number
  duration?: number
  roundNumber?: number
}

export interface Rule {
  conditions: Condition[];
  action: Action;
}

export interface Strategy {
  name: string;
  rules: Rule[];
  isGood: boolean;
}

export interface StrategyResult {
  name: string;
  score: number;
  cooperationRate: number;
  history: ('cooperate' | 'defect')[];
}

export interface AggregatedStrategyResult {
  name: string;
  totalScore: number;
  averageScore: number;
  totalGames: number;
  averageCooperationRate: number;
}