export interface Environment {
    id: string;
    name: string;
    description: string;
    cooperationProbability: number;
  }
  
  export const environments: Environment[] = [
    {
      id: 'balanced',
      name: 'Balanced World',
      description: '50% cooperative, 50% defecting',
      cooperationProbability: 0.5
    },
    {
      id: 'hostile',
      name: 'Hostile World',
      description: '80% defecting',
      cooperationProbability: 0.2
    },
    {
      id: 'friendly',
      name: 'Friendly World',
      description: '80% cooperative',
      cooperationProbability: 0.8
    }
  ];