export type FeatureKey =
  | 'summary'
  | 'timeline'
  | 'kanban'
  | 'backlog'
  | 'sprints'
  | 'epics'
  | 'members'
  | 'settings';

export type UserFeatures = Record<FeatureKey, boolean>;

export const DEFAULT_FEATURES: UserFeatures = {
  summary: false,
  timeline: false,
  kanban: false,
  backlog: false,
  sprints: false,
  epics: false,
  members: false,
  settings: false,
};
