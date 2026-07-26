/**
 * Authoritative Integer-Only Scoring System
 * Tracks distance points, energy shard collection, near-miss bonuses,
 * multiplier progression, and local high score persistence.
 */

export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.highScore = this._loadHighScore();
    this.multiplier = 1;
    this.multiplierCap = 5;
    this.streakCount = 0;
    this.streakThreshold = 3; // Every 3 clean actions increases multiplier by +1

    this.shardsCount = 0;
    this.coinsCount = 0;
    this.nearMissCount = 0;

    // Cooldown map to prevent farming near-miss score on the same obstacle
    this.scoredObstacles = new Set();
  }

  reset() {
    this.score = 0;
    this.multiplier = 1;
    this.streakCount = 0;
    this.shardsCount = 0;
    this.coinsCount = 0;
    this.nearMissCount = 0;
    this.scoredObstacles.clear();
  }

  updateDistance(distanceMeters) {
    // 1 meter = 10 integer points * current multiplier
    const distancePoints = Math.floor(distanceMeters) * 10 * this.multiplier;
    this.score = distancePoints + (this.shardsCount * 50 * this.multiplier) + (this.coinsCount * 50 * this.multiplier) + (this.nearMissCount * 25 * this.multiplier);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this._saveHighScore(this.highScore);
    }
  }

  collectShard() {
    this.shardsCount++;
    this.score += 50 * this.multiplier;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this._saveHighScore(this.highScore);
    }
    this._incrementStreak();
  }

  collectCoin() {
    this.coinsCount++;
    this.score += 50 * this.multiplier;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this._saveHighScore(this.highScore);
    }
    this._incrementStreak();
  }

  addBonusPoints(points = 100) {
    this.score += points * this.multiplier;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this._saveHighScore(this.highScore);
    }
  }

  registerNearMiss(obstacleId) {
    if (this.scoredObstacles.has(obstacleId)) return false; // Prevent farming!

    this.scoredObstacles.add(obstacleId);
    this.nearMissCount++;
    this._incrementStreak();
    return true;
  }

  resetMultiplier() {
    this.multiplier = 1;
    this.streakCount = 0;
  }

  _incrementStreak() {
    this.streakCount++;
    if (this.streakCount >= this.streakThreshold) {
      this.streakCount = 0;
      if (this.multiplier < this.multiplierCap) {
        this.multiplier++;
      }
    }
  }

  _loadHighScore() {
    try {
      const saved = localStorage.getItem('cube_dash_3d_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch (e) {
      return 0;
    }
  }

  _saveHighScore(val) {
    try {
      localStorage.setItem('cube_dash_3d_highscore', val.toString());
    } catch (e) {
      // Ignored if storage restricted
    }
  }

  get stats() {
    return {
      score: this.score,
      highScore: this.highScore,
      multiplier: this.multiplier,
      shards: this.shardsCount,
      nearMisses: this.nearMissCount
    };
  }
}
