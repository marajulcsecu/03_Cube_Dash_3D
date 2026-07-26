/**
 * Config-Driven Obstacle Pattern Library and Safe Grammar Definitions
 * Catalog of structured obstacle sequences with reachability and 5-tier difficulty metadata.
 * Enforces smooth early-game onboarding (Tier 1: gentle single hazards) while scaling
 * up to 5-lane coverage in higher tiers to eliminate AFK camping!
 */

export const OBSTACLE_TYPES = {
  LANE_WALL: 'lane_wall',
  LOW_BARRIER: 'low_barrier',
  FLOOR_GAP: 'floor_gap',
  MOVING_GATE: 'moving_gate',
  PULSE_WALL: 'pulse_wall',
  CRUSHER_FRAME: 'crusher_frame',
  ASTEROID: 'asteroid',
  ALIEN_MONSTER: 'alien_monster',
  LASER_GRID: 'laser_grid',
  PLASMA_ROTOR: 'plasma_rotor',
  WORMHOLE_VOID: 'wormhole_void',
  COIN_TRAIL: 'coin_trail',
  COIN: 'coin',
  MAGNET_POWERUP: 'magnet_powerup',
  SHIELD_POWERUP: 'shield_powerup',
  MULTIPLIER_POWERUP: 'multiplier_powerup',
  EMP_POWERUP: 'emp_powerup',
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

  // ── TIER 1 PATTERNS (CALM: Difficulty 1 - Gentle Single Hazards) ───────
  {
    id: 'single_center_wall',
    name: 'Single Center Wall',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'single_left_wall',
    name: 'Single Left Wall',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 0, relativeZ: 0 }
    ]
  },
  {
    id: 'single_right_wall',
    name: 'Single Right Wall',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 4, relativeZ: 0 }
    ]
  },
  {
    id: 'single_low_barrier',
    name: 'Single Low Jump Barrier',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'coin_trail_center',
    name: '3D Cyber Gold Coin Trail',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0, count: 3 }
    ]
  },
  {
    id: 'magnet_powerup_center',
    name: 'Cyber Magnet Power-Up Item',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.MAGNET_POWERUP, lane: 2, relativeZ: 0 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 1, relativeZ: -2, count: 2 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 3, relativeZ: -2, count: 2 }
    ]
  },
  {
    id: 'shield_powerup_center',
    name: 'Energy Shield Power-Up Item',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.SHIELD_POWERUP, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'multiplier_powerup_center',
    name: 'Score Multiplier Boost Orb',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.MULTIPLIER_POWERUP, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'emp_powerup_center',
    name: 'EMP Sonic Blast Wave Bomb',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.EMP_POWERUP, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'single_asteroid_center',
    name: 'Tumbling Cosmic Asteroid',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.ASTEROID, lane: 2, relativeZ: 0, scale: 1.0 }
    ]
  },
  {
    id: 'single_asteroid_left',
    name: 'Left Tumbling Asteroid',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.ASTEROID, lane: 0, relativeZ: 0, scale: 1.0 }
    ]
  },
  {
    id: 'single_asteroid_right',
    name: 'Right Tumbling Asteroid',
    difficulty: 1,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3],
    hazards: [
      { type: OBSTACLE_TYPES.ASTEROID, lane: 4, relativeZ: 0, scale: 1.0 }
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
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 0, relativeZ: -3 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 1, relativeZ: -1 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 1 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 3, relativeZ: 3 }
    ]
  },

  // ── TIER 2 PATTERNS (FLOW: Difficulty 2 - Dual Wing Hazards) ─────────
  {
    id: 'outer_lanes_wall_trap',
    name: 'Outer Lanes Wall Trap',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 2, 3],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 4, relativeZ: 0 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'left_wing_wall_trap',
    name: 'Left Wing Blockade',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 3, relativeZ: 0 }
    ]
  },
  {
    id: 'right_wing_wall_trap',
    name: 'Right Wing Blockade',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 3, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 4, relativeZ: 0 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 1, relativeZ: 0 }
    ]
  },
  {
    id: 'low_barrier_center_pair',
    name: 'Center Low Barrier Pair',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    requiresJump: true,
    hazards: [
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 3, relativeZ: 0 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'asteroid_outer_pair',
    name: 'Twin Tumbling Asteroids',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 2, 3],
    hazards: [
      { type: OBSTACLE_TYPES.ASTEROID, lane: 0, relativeZ: 0, scale: 1.1 },
      { type: OBSTACLE_TYPES.ASTEROID, lane: 4, relativeZ: 0, scale: 1.1 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'alien_monster_hover_center',
    name: 'Hovering Cyber Alien Drone',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.ALIEN_MONSTER, lane: 2, relativeZ: 0, scale: 1.0 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 1, relativeZ: 0 }
    ]
  },
  {
    id: 'laser_grid_single_lane',
    name: 'Cyberpunk Laser Beam Gate',
    difficulty: 2,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.LASER_GRID, lane: 2, heightY: 1.1, isSweeping: false },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 1, relativeZ: 0 }
    ]
  },

  // ── TIER 3 PATTERNS (FOCUS: Difficulty 3 - Dynamic Gates & Pits) ─────
  {
    id: 'moving_gate_full_sweep',
    name: '5-Lane Moving Gate Sweep',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.MOVING_GATE, minLane: 0, maxLane: 4, speed: 3.2, relativeZ: 0 }
    ]
  },
  {
    id: 'laser_grid_sweeper_pair',
    name: 'Sweeping Twin Laser Beams',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 2, 3],
    hazards: [
      { type: OBSTACLE_TYPES.LASER_GRID, lane: 0, heightY: 1.1, isSweeping: true },
      { type: OBSTACLE_TYPES.LASER_GRID, lane: 4, heightY: 1.1, isSweeping: true },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'plasma_rotor_center_saw',
    name: 'Spinning 3-Blade Plasma Saw',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.PLASMA_ROTOR, lane: 2, spinSpeed: 6.5 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 1, relativeZ: 0 }
    ]
  },
  {
    id: 'wormhole_void_center_pit',
    name: 'Swirling Cosmic Wormhole Pit',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 3, 4],
    hazards: [
      { type: OBSTACLE_TYPES.WORMHOLE_VOID, lane: 2, scale: 1.0 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 1, relativeZ: 0 }
    ]
  },
  {
    id: 'alien_monster_flank_pair',
    name: 'Flanking Cyber Monster Pair',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [1, 2, 3],
    hazards: [
      { type: OBSTACLE_TYPES.ALIEN_MONSTER, lane: 0, relativeZ: 0, scale: 1.1 },
      { type: OBSTACLE_TYPES.ALIEN_MONSTER, lane: 4, relativeZ: 0, scale: 1.1 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'asteroid_shower_weave',
    name: 'Asteroid Shower Weave',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 2, 4],
    hazards: [
      { type: OBSTACLE_TYPES.ASTEROID, lane: 1, relativeZ: -2, scale: 1.0 },
      { type: OBSTACLE_TYPES.ASTEROID, lane: 3, relativeZ: 1, scale: 1.25 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'outer_floor_gaps_center_bridge',
    name: 'Outer Lane Floor Gaps',
    difficulty: 3,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: [
      { type: OBSTACLE_TYPES.FLOOR_GAP, gapLanes: [0, 1, 3, 4] },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'crusher_frame_outer_walls',
    name: 'Crusher Arch & Outer Walls',
    difficulty: 3,
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

  // ── TIER 4 PATTERNS (EXPERT: Difficulty 4 - Sweeps & Funnels) ────────
  {
    id: 'asteroid_apocalypse_blitz',
    name: 'Cosmic Asteroid Apocalypse',
    difficulty: 4,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: [
      { type: OBSTACLE_TYPES.ASTEROID, lane: 0, relativeZ: -1, scale: 1.1 },
      { type: OBSTACLE_TYPES.ASTEROID, lane: 1, relativeZ: 1, scale: 1.0 },
      { type: OBSTACLE_TYPES.ASTEROID, lane: 3, relativeZ: -1, scale: 1.0 },
      { type: OBSTACLE_TYPES.ASTEROID, lane: 4, relativeZ: 1, scale: 1.1 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'low_barrier_full_sweep',
    name: '5-Lane Low Barrier Sweep',
    difficulty: 4,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [0, 1, 2, 3, 4],
    requiresJump: true,
    hazards: [
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 2, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 3, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LOW_BARRIER, lane: 4, relativeZ: 0 }
    ]
  },
  {
    id: 'outer_lane_funnel_blitz',
    name: '4-Lane Outer Funnel Blitz',
    difficulty: 4,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: [
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 0, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 1, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 3, relativeZ: 0 },
      { type: OBSTACLE_TYPES.LANE_WALL, lane: 4, relativeZ: 0 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },
  {
    id: 'pulse_wall_outer_blitz',
    name: 'Outer Dual Pulse Walls',
    difficulty: 4,
    minSpeedTier: 1,
    recoveryWindow: 1,
    incompatibleNeighbors: [],
    safePath: [2],
    hazards: [
      { type: OBSTACLE_TYPES.PULSE_WALL, lane: 0, relativeZ: 0, pulseFrequency: 3.5 },
      { type: OBSTACLE_TYPES.PULSE_WALL, lane: 4, relativeZ: 0, pulseFrequency: 3.5 },
      { type: OBSTACLE_TYPES.COIN_TRAIL, lane: 2, relativeZ: 0 }
    ]
  },

  // ── TIER 5 PATTERNS (MASTERY: Difficulty 5 - Extreme Traps) ─────────
  {
    id: 'dual_gate_outer_pincer',
    name: 'Dual Pincer Moving Gates',
    difficulty: 5,
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
    difficulty: 5,
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

  getRandomPattern(rng, maxDifficulty = 1) {
    // Exclude special powerup patterns from random hazard pool
    const hazardPool = PATTERNS.filter(p => !p.id.includes('powerup'));
    
    // Determine target difficulty level using a smooth weighted distribution curve
    const roll = rng.next();
    let selectedDiff = 1;

    if (maxDifficulty >= 5) {
      if (roll < 0.40) selectedDiff = rng.nextInt(1, 3); // 40% Breathing room & flow
      else if (roll < 0.75) selectedDiff = 4;            // 35% Expert challenge
      else selectedDiff = 5;                             // 25% Mastery peak trap
    } else if (maxDifficulty >= 4) {
      if (roll < 0.50) selectedDiff = rng.nextInt(1, 3); // 50% Flow
      else selectedDiff = 4;                             // 50% Expert
    } else if (maxDifficulty >= 3) {
      if (roll < 0.60) selectedDiff = rng.nextInt(1, 2); // 60% Flow
      else selectedDiff = 3;                             // 40% Focus
    } else if (maxDifficulty >= 2) {
      if (roll < 0.60) selectedDiff = 1;
      else selectedDiff = 2;
    } else {
      selectedDiff = 1;
    }

    const matching = hazardPool.filter(p => p.difficulty === selectedDiff);
    if (matching.length === 0) {
      const fallback = hazardPool.filter(p => p.difficulty <= maxDifficulty);
      const index = rng.nextInt(0, fallback.length - 1);
      return fallback[index] || PATTERNS[0];
    }

    const index = rng.nextInt(0, matching.length - 1);
    return matching[index];
  }

  getAllPatterns() {
    return PATTERNS;
  }
}
