export interface Environment {
  id: string;
  name: string;
  description: string;
  cooperationProbability: number;
  mutationRate: number;
}

export const environments: Environment[] = [
  {
    id: 'balanced',
    name: 'Balanced World',
    description: '50% cooperative, 50% defecting',
    cooperationProbability: 0.5,
    mutationRate: 0.1
  },
  {
    id: 'hostile',
    name: 'Hostile World',
    description: '100% defecting',
    cooperationProbability: 0.2,
    mutationRate: 0.15
  },
  {
    id: 'friendly',
    name: 'Friendly World',
    description: '80% cooperative',
    cooperationProbability: 0.8,
    mutationRate: 0.05
  }
];