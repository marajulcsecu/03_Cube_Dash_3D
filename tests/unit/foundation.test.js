import { describe, it, expect } from 'vitest';
import manifest from '../../public/manifest.json';

describe('Repository Foundation & Build Contract', () => {
  it('should have a valid manifest.json meeting MegaGameBox spec', () => {
    expect(manifest.id).toBe('cube-dash-3d');
    expect(manifest.name).toBe('Cube Dash 3D');
    expect(manifest.orientation).toBe('portrait');
    expect(manifest.category).toBe('Arcade');
    expect(manifest.supportsScore).toBe(true);
    expect(manifest.hasAudio).toBe(true);
  });

  it('should format manifest id with lowercase and hyphens only', () => {
    const idRegex = /^[a-z0-9-]+$/;
    expect(manifest.id).toMatch(idRegex);
  });
});
