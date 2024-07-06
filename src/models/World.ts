import { Population } from './Population';
import { Strategy } from './Strategy';


export class World {
  private grid: (Strategy | null)[][];
  private population: Population;

  constructor(size: { width: number, height: number }, population: Population) {
    this.grid = Array(size.height).fill(null).map(() => Array(size.width).fill(null));
    this.population = population;
    this.populateWorld();
  }

  private populateWorld(): void {
    const strategies = this.population.getStrategies();
    let index = 0;
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (index < strategies.length) {
          this.grid[y][x] = strategies[index];
          index++;
        } else {
          break;
        }
      }
      if (index >= strategies.length) break;
    }
  }

  public getStrategies(): Strategy[] {
    return this.grid.flat().filter((s): s is Strategy => s !== null);
  }

  public mutate(mutationRate: number): void {
    const goodStrategies = this.getStrategies().filter(s => s.isGood);
    const badStrategies = this.getStrategies().filter(s => !s.isGood);
    
    const winner = goodStrategies.length > badStrategies.length ? 'good' : 'bad';
    const loser = winner === 'good' ? 'bad' : 'good';
    
    const mutationCount = Math.floor(this.getStrategies().length * mutationRate);
    
    for (let i = 0; i < mutationCount; i++) {
      const randomX = Math.floor(Math.random() * this.grid[0].length);
      const randomY = Math.floor(Math.random() * this.grid.length);
      
      if (this.grid[randomY][randomX] && this.grid[randomY][randomX]!.isGood === (loser === 'good')) {
        this.grid[randomY][randomX]!.isGood = !this.grid[randomY][randomX]!.isGood;
      }
    }
  }

  public getStats(): { goodCount: number, badCount: number } {
    const strategies = this.getStrategies();
    const goodCount = strategies.filter(s => s.isGood).length;
    return {
      goodCount,
      badCount: strategies.length - goodCount
    };
  }

  public getFinalStats(): { worldType: 'good' | 'bad', goodPercentage: number } {
    const { goodCount, badCount } = this.getStats();
    const totalCount = goodCount + badCount;
    const goodPercentage = (goodCount / totalCount) * 100;
    return {
      worldType: goodCount > badCount ? 'good' : 'bad',
      goodPercentage
    };
  }
}