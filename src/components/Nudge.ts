import { dormantDays, progressOf } from '../data';
import type { Project } from '../types';

/** Resting projects ranked by "most worth revisiting": close to done and neglected the longest. */
export const revisitCandidates = (projects: Project[]) =>
  projects.filter((p) => p.status === 'resting')
    .sort((a, b) => (progressOf(b) + dormantDays(b) / 20) - (progressOf(a) + dormantDays(a) / 20));
