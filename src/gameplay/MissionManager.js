/**
 * Rotating Local Mission Manager
 * Tracks 3 active local missions across runs and persists completion in localStorage.
 */

export const MISSION_TEMPLATES = [
  { id: 'shard_collector', title: 'Collect 10 Energy Shards', type: 'shards', target: 10 },
  { id: 'distance_runner', title: 'Reach 500m Distance', type: 'distance', target: 500 },
  { id: 'multiplier_master', title: 'Achieve 3x Multiplier', type: 'multiplier', target: 3 }
];

export class MissionManager {
  constructor() {
    this.missions = this._loadMissions();
  }

  updateProgress(stats) {
    if (!stats) return;

    this.missions.forEach(mission => {
      if (mission.completed) return;

      if (mission.type === 'shards' && stats.shards >= mission.target) {
        mission.completed = true;
        mission.progress = mission.target;
      } else if (mission.type === 'distance' && stats.distance >= mission.target) {
        mission.completed = true;
        mission.progress = mission.target;
      } else if (mission.type === 'multiplier' && stats.multiplier >= mission.target) {
        mission.completed = true;
        mission.progress = mission.target;
      } else {
        if (mission.type === 'shards') mission.progress = stats.shards;
        if (mission.type === 'distance') mission.progress = stats.distance;
        if (mission.type === 'multiplier') mission.progress = stats.multiplier;
      }
    });

    this._saveMissions();
  }

  _loadMissions() {
    try {
      const saved = localStorage.getItem('cube_dash_3d_missions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Fallback
    }

    return MISSION_TEMPLATES.map(t => ({
      ...t,
      progress: 0,
      completed: false
    }));
  }

  _saveMissions() {
    try {
      localStorage.setItem('cube_dash_3d_missions', JSON.stringify(this.missions));
    } catch (e) {
      // Ignored if restricted
    }
  }

  resetProgress() {
    this.missions = MISSION_TEMPLATES.map(t => ({
      ...t,
      progress: 0,
      completed: false
    }));
    this._saveMissions();
  }
}
