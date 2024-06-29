# Advanced Game Theory Strategy Simulator

## Table of Contents
1. [Project Overview](#project-overview)
2. [Core Modules](#core-modules)
3. [Strategy Grammar](#strategy-grammar)
4. [API Routes](#api-routes)
5. [Example Strategies](#example-strategies)
6. [Building Complex Strategies](#building-complex-strategies)
7. [Running Simulations](#running-simulations)
8. [Setup and Running](#setup-and-running)

## Project Overview

This project implements an advanced strategy simulator for game theory scenarios, focusing on the Iterated Prisoner's Dilemma. It allows users to define custom strategies using a flexible rule-based system, run simulations between strategies, and analyze the results.

## Core Modules

1. **Strategy Model** (`src/models/Strategy.ts`): Defines the structure of strategies and their components.
2. **Environment Model** (`src/models/Environment.ts`): Defines simulation environments.
3. **Game Simulation** (`src/models/GameSimulation.ts`): The core simulation engine.
4. **Strategy Storage** (`src/models/StrategyStorage.ts`): Manages the storage and retrieval of strategies.
5. **Simulation Controller** (`src/controllers/SimulationController.ts`): Orchestrates simulations and tournaments.

## Strategy Grammar

Strategies are defined using a rule-based system. Each strategy consists of rules with conditions and actions.

### Conditions

- `is_first_move`
- `opponent_last_action`
- `own_last_action`
- `turn_number`
- `is_nth_move`
- `is_within_first_n_rounds`
- `won_previous_round`
- `is_specific_round`
- `is_losing_after_n_rounds`
- `opponent_action_count`
- `own_action_count`
- `score_difference`

### Actions

- `cooperate`
- `defect`
- `random`

## API Routes

1. **Strategy Routes** (`/api/strategies`)
   - GET `/`: Retrieves all strategies
   - GET `/:name`: Retrieves a specific strategy
   - POST `/`: Adds a new strategy

2. **Simulation Routes** (`/api/simulations`)
   - POST `/single`: Runs a single simulation
   - POST `/tournament`: Conducts a tournament

## Example Strategies

### Tit-for-Tat

```bash
curl -X POST http://localhost:3000/api/strategies \
-H "Content-Type: application/json" \
-d '{
  "name": "Tit-for-Tat",
  "rules": [
    {
      "conditions": [{ "type": "is_first_move" }],
      "action": { "type": "cooperate" }
    },
    {
      "conditions": [{ "type": "opponent_last_action", "value": "cooperate" }],
      "action": { "type": "cooperate" }
    },
    {
      "conditions": [{ "type": "opponent_last_action", "value": "defect" }],
      "action": { "type": "defect" }
    }
  ]
}'