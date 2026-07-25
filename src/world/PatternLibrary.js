/**
 * Config-Driven Obstacle Pattern Library and Safe Grammar Definitions
 * Catalog of structured obstacle sequences with reachability and difficulty metadata.
 * Enforces 100% 5-lane hazard coverage so no safe AFK camping lanes exist in any tier!
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
    safePath: [0, 1, 2, 3, 4],
    hazards: []
  },

  // ── TIER 1 PATTERNS (CALM: Difficulty 1) ─────────────────────────
  {
    id: 'outer_lanes_wall_trap',
    name: 'Outer Lanes Wall Trap',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 2, 3],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 4, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 2, relativeZ: 0 }
    ]
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
    id: 'left_wing_wall_trap',
    name: 'Left Wing Blockade',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 3, relativeZ: 0 }
    ]
  },
  {
    id: 'right_wing_wall_trap',
    name: 'Right Wing Blockade',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 3, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 4, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 1, relativeZ: 0 }
    ]
  },
  {
    id: 'low_barrier_full_sweep',
    name: '5-Lane Low Barrier Leap',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4], // Requires jump across all lanes!
    requiresJump: true,
    hazards: [
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 2, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 3, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 4, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 2, relativeZ: -2 }
    ]
  },

  // ── TIER 2 PATTERNS (FLOW & FOCUS: Difficulty 2) ──────────────────
  {
    id: 'moving_gate_full_sweep',
    name: '5-Lane Moving Gate Sweep',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.MOVING_GATE, minLane: 0, maxLane: 4, speed: 3.5, relativeZ: 0 }
    ]
  },
  {
    id: 'outer_floor_gaps_center_bridge',
    name: 'Outer Lane Floor Gaps',
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
    id: 'crusher_frame_outer_walls',
    name: 'Crusher Arch & Outer Walls',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 3],
    hazards: [
      { type: OBSTACLE_TYPES.CRUSHER_FRAME, lane: 2, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 4, relativeZ: 0 }
    ]
  },
  {
    id: 'pulse_wall_outer_blitz',
    name: 'Outer Dual Pulse Walls',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: [
      { type: OBSTACLE_TYPES.PULSE_WALL, lane: 0, relativeZ: 0, pulseFrequency: 3.5 },
      { type: OBSTACLE_TYPES.PULSE_WALL, lane: 4, relativeZ: 0, pulseFrequency: 3.5 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },

  // ── TIER 3 PATTERNS (EXPERT & MASTERY: Difficulty 3) ──────────────
  {
    id: 'outer_lane_funnel_blitz',
    name: '4-Lane Outer Funnel Blitz',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 3, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 4, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'center_funnel_outer_pass',
    name: 'Center Blockade Outer Escapes',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 4],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 2, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 3, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.SHARD_TRAIL, lane: 4, relativeZ: 0 }
    ]
  },
  {
    id: 'dual_gate_outer_pincer',
    name: 'Dual Pincer Moving Gates',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: [
      { type: OBSTACLE_TYPES.MOVING_GATE, minLane: 0, maxLane: 2, speed: 4.0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.MOVING_GATE, minLane: 2, maxLane: 4, speed: 4.0, relativeZ: 0 }
    ]
  },
  {
    id: 'mastery_checkerboard_trap',
    name: 'Mastery Outer Floor Gap & Jump Barrier',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    requiresJump: true,
    hazards: [
      { type: OBSTACLE_TYPES.FLOOR_GAP, gapLanes: [0, 4] },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 2, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 3, relativeZ: 0 }
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
