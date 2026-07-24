/**
 * High-Performance Object Pooling Architecture
 * Pre-allocates and recycles Three.js meshes/groups without runtime GC allocations.
 */

import * as THREE from 'three';

export class ObjectPool {
  constructor(factoryFn, resetFn, initialSize = 20) {
    this.factoryFn = factoryFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.activeObjects = new Set();

    // Preallocate objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factoryFn());
    }
  }

  acquire() {
    let item;
    if (this.pool.length > 0) {
      item = this.pool.pop();
    } else {
      item = this.factoryFn();
    }

    if (this.resetFn) {
      this.resetFn(item);
    }

    this.activeObjects.add(item);
    return item;
  }

  release(item) {
    if (!this.activeObjects.has(item)) return;

    this.activeObjects.delete(item);
    if (this.resetFn) {
      this.resetFn(item);
    }
    this.pool.push(item);
  }

  get stats() {
    return {
      active: this.activeObjects.size,
      pooled: this.pool.length,
      total: this.activeObjects.size + this.pool.length
    };
  }

  dispose() {
    const all = [...this.pool, ...this.activeObjects];
    all.forEach(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    this.pool.length = 0;
    this.activeObjects.clear();
  }
}
