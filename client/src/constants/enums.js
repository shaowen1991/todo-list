/**
 * Enum values matching the PostgreSQL database schema
 */
export const FILTER_TYPES = Object.freeze({
  TODO_STATUS: 'TODO_STATUS',
  PRIORITY: 'PRIORITY',
});

export const FILTER_PARAM_KEYS = Object.freeze({
  [FILTER_TYPES.TODO_STATUS]: 'status',
  [FILTER_TYPES.PRIORITY]: 'priority',
});

export const TODO_STATUS = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
});

export const PRIORITY = Object.freeze({
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
});

export const SORT_BY_TYPES = Object.freeze({
  TITLE: 'TITLE',
  DUE_DATE: 'DUE_DATE',
  TODO_STATUS: 'TODO_STATUS',
  PRIORITY: 'PRIORITY',
  CREATED_AT: 'CREATED_AT',
});

export const SORT_BY_PARAMS = Object.freeze({
  [SORT_BY_TYPES.TITLE]: 'title',
  [SORT_BY_TYPES.DUE_DATE]: 'due_date',
  [SORT_BY_TYPES.TODO_STATUS]: 'status',
  [SORT_BY_TYPES.PRIORITY]: 'priority',
  [SORT_BY_TYPES.CREATED_AT]: 'created_at',
});

export const ACCESS_PERMISSION = Object.freeze({
  EDIT: 'EDIT',
  VIEW: 'VIEW',
});

export const OWNER_ROLE = 'OWNER'; // special case for owner, not a real enum in database

export const REQUEST_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
});

export default Object.freeze({
  ACCESS_PERMISSION,
  OWNER_ROLE,
  PRIORITY,
  REQUEST_STATUS,
  SORT_BY_PARAMS,
  SORT_BY_TYPES,
  TODO_STATUS,
});
