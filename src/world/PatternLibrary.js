/**
 * Config-Driven Obstacle Pattern Library and Safe Grammar Definitions
 * Catalog of structured obstacle sequences with reachability and difficulty metadata.
 */

export const OBSTACLE_TYPES = {
  LANE_WALL: 'lane_wall',
  LOW_BARRIER: 'low_barrier',
  FLOOR_GAP: 'floor_gap',
  MOVING_GATE: 'moving_gate',
  PULSE_WALL: 'pulse_wall',
  CRUSHER_FRAME: 'crusher_frame',
  SHARD_TRAIL: 'shard_trail',
  REST: 'rest'
};

export const PATTERNS = [
  {
    id: 'safe_runway',
    name: 'Safe Runway',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 0,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: []
  },
  {
    id: 'center_wall_outer_shards',
    name: 'Center Wall & Side Shards',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 2, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 4, relativeZ: 0 }
    ]
  },
  {
    id: 'low_barrier_leap',
    name: 'Center Low Barrier Leap',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2], // Requires jump
    requiresJump: true,
    hazards: [
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 2, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 2, relativeZ: -2 }
    ]
  },
  {
    id: 'moving_gate_oscillator',
    name: 'Moving Gate Oscillator',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 4],
    hazards: [
      { type: OBSTACLE_TYPES.MOVING_GATE, minLane: 1, maxLane: 3, speed: 2.5, relativeZ: 0 }
    ]
  },
  {
    id: 'pulse_wall_beat',
    name: 'Expanding Pulse Wall',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 4],
    hazards: [
      { type: OBSTACLE_TYPES.PULSE_WALL, lane: 2, relativeZ: 0, pulseFrequency: 3.0 }
    ]
  },
  {
    id: 'crusher_frame_arch',
    name: 'Overhead Crusher Arch',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 3],
    hazards: [
      { type: OBSTACLE_TYPES.CRUSHER_FRAME, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'side_gaps_center_bridge',
    name: 'Side Floor Gaps',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: [
      { type: OBSTACLE_TYPES.FLOOR_GAP, gapLanes: [0, 1, 3, 4] },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'diagonal_shard_weave',
    name: 'Diagonal Shard Weave',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 0,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 0, relativeZ: -3 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 1, relativeZ: -1 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 2, relativeZ: 1 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 3, relativeZ: 3 }
    ]
  }
];

export class PatternLibrary {
  constructor() {
    this.patterns = new Map(PATTERNS.map(p => [p.id, p]));
  }

  getPattern(id) {
    return this.patterns.get(id) || null;
  }

  getRandomPattern(rng, difficulty = 1) {
    const matching = PATTERNS.filter(p => p.difficulty <= difficulty);
    if (matching.length === 0) return PATTERNS[0];
    const index = rng.nextInt(0, matching.length - 1);
    return matching[index];
  }

  getAllPatterns() {
    return PATTERNS;
  }
}
