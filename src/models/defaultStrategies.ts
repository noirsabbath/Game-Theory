import { Strategy } from "./Strategy";

export const defaultStrategies: Omit<Strategy, 'id' | 'isGood'>[] = [
  // Good Strategies
  {
    name: "Tit-for-Tat",
    rules: [
      {
        conditions: [{ type: "opponent_last_action", value: "cooperate" }],
        action: { type: "cooperate" }
      },
      {
        conditions: [{ type: "opponent_last_action", value: "defect" }],
        action: { type: "defect" }
      },
      {
        conditions: [],
        action: { type: "cooperate" }
      }
    ]
  },
  {
    name: "Generous Tit-for-Tat",
    rules: [
      {
        conditions: [{ type: "opponent_last_action", value: "cooperate" }],
        action: { type: "cooperate" }
      },
      {
        conditions: [{ type: "opponent_last_action", value: "defect" }],
        action: { type: "random", probability: 0.7 }
      },
      {
        conditions: [],
        action: { type: "cooperate" }
      }
    ]
  },
  {
    name: "Pavlov",
    rules: [
      {
        conditions: [
          { type: "own_last_action", value: "cooperate" },
          { type: "opponent_last_action", value: "cooperate" }
        ],
        action: { type: "cooperate" }
      },
      {
        conditions: [
          { type: "own_last_action", value: "defect" },
          { type: "opponent_last_action", value: "defect" }
        ],
        action: { type: "cooperate" }
      },
      {
        conditions: [],
        action: { type: "defect" }
      }
    ]
  },
  {
    name: "Gradual",
    rules: [
      {
        conditions: [{ type: "opponent_action_count", value: "defect", count: 1 }],
        action: { type: "defect" }
      },
      {
        conditions: [{ type: "is_nth_move", interval: 2 }],
        action: { type: "cooperate" }
      },
      {
        conditions: [],
        action: { type: "cooperate" }
      }
    ]
  },
  {
    name: "Forgiver",
    rules: [
      {
        conditions: [{ type: "opponent_consecutive_actions", value: "cooperate", count: 2 }],
        action: { type: "cooperate" }
      },
      {
        conditions: [{ type: "opponent_last_action", value: "defect" }],
        action: { type: "defect" }
      },
      {
        conditions: [],
        action: { type: "cooperate" }
      }
    ]
  },
  
  // Bad Strategies
  {
    name: "Always Defect",
    rules: [
      {
        conditions: [],
        action: { type: "defect" }
      }
    ]
  },
  {
    name: "Suspicious Tit-for-Tat",
    rules: [
      {
        conditions: [{ type: "opponent_last_action", value: "cooperate" }],
        action: { type: "cooperate" }
      },
      {
        conditions: [{ type: "opponent_last_action", value: "defect" }],
        action: { type: "defect" }
      },
      {
        conditions: [],
        action: { type: "defect" }
      }
    ]
  },
  {
    name: "Random",
    rules: [
      {
        conditions: [],
        action: { type: "random", probability: 0.5 }
      }
    ]
  },
  {
    name: "Grudger",
    rules: [
      {
        conditions: [{ type: "opponent_action_count", value: "defect", count: 1 }],
        action: { type: "defect" }
      },
      {
        conditions: [],
        action: { type: "cooperate" }
      }
    ]
  },
  {
    name: "Alternate",
    rules: [
      {
        conditions: [{ type: "is_nth_move", interval: 2 }],
        action: { type: "cooperate" }
      },
      {
        conditions: [],
        action: { type: "defect" }
      }
    ]
  }
];