import { describe, it, expect, beforeEach } from 'vitest';
import { ScoreSystem } from '../../src/gameplay/ScoreSystem.js';
import { MissionManager } from '../../src/gameplay/MissionManager.js';

describe('ScoreSystem & MissionManager Unit Tests', () => {
  let scoreSystem;
  let missionManager;

  beforeEach(() => {
    scoreSystem = new ScoreSystem();
    missionManager = new MissionManager();
    scoreSystem.reset();
  });

  it('should initialize score at 0 and multiplier at 1x', () => {
    expect(scoreSystem.score).toBe(0);
    expect(scoreSystem.multiplier).toBe(1);
    expect(scoreSystem.shardsCount).toBe(0);
  });

  it('should calculate integer distance points based on multiplier', () => {
    scoreSystem.updateDistance(100); // 100m * 10 * 1 = 1000 pts
    expect(scoreSystem.score).toBe(1000);
  });

  it('should increment multiplier on clean streak up to 5x cap', () => {
    expect(scoreSystem.multiplier).toBe(1);

    // 3 shard pickups = streak threshold reached -> 2x
    scoreSystem.collectShard();
    scoreSystem.collectShard();
    scoreSystem.collectShard();
    expect(scoreSystem.multiplier).toBe(2);

    // 3 more clean actions -> 3x
    scoreSystem.collectShard();
    scoreSystem.collectShard();
    scoreSystem.collectShard();
    expect(scoreSystem.multiplier).toBe(3);
  });

  it('should prevent farming near-miss points on duplicate obstacle registrations', () => {
    const obstacleId = 'obs_100';
    const firstScore = scoreSystem.registerNearMiss(obstacleId);
    expect(firstScore).toBe(true);
    expect(scoreSystem.nearMissCount).toBe(1);

    const duplicateScore = scoreSystem.registerNearMiss(obstacleId);
    expect(duplicateScore).toBe(false);
    expect(scoreSystem.nearMissCount).toBe(1); // Blocked duplicate farming!
  });

  it('should update local mission progress and mark completed when target met', () => {
    missionManager.resetProgress();

    missionManager.updateProgress({
      shards: 10,
      distance: 550,
      multiplier: 3
    });

    missionManager.missions.forEach(m => {
      expect(m.completed).toBe(true);
    });
  });
});
