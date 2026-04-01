import type { FeatureModule } from '../types/feature.js';
import { docker } from './docker/index.js';
import { ci } from './ci/index.js';
import { testing } from './testing/index.js';
import { logging } from './logging/index.js';
import { validation } from './validation/index.js';
import { health } from './health/index.js';
import { hooks } from './hooks/index.js';
import { auth } from './auth/index.js';
import { db } from './db/index.js';
import { api } from './api/index.js';
import { component } from './component/index.js';
import { model } from './model/index.js';

const ALL_FEATURES: FeatureModule[] = [
  docker, ci, testing, logging, validation,
  health, hooks, auth, db, api, component, model,
];

const featureMap = new Map<string, FeatureModule>(
  ALL_FEATURES.map((f) => [f.id, f])
);

export function getFeature(id: string): FeatureModule | undefined {
  return featureMap.get(id);
}

export function listFeatures(): FeatureModule[] {
  return [...ALL_FEATURES];
}

export function listFeaturesByCategory(
  category: FeatureModule['category']
): FeatureModule[] {
  return ALL_FEATURES.filter((f) => f.category === category);
}
