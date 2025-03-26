/**
 * Enum values matching the PostgreSQL database schema
 */
export const TASK_STATUS = Object.freeze({
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

export const ACCESS_PERMISSION = Object.freeze({
  EDIT: 'EDIT',
  VIEW: 'VIEW',
});

export const REQUEST_STATUS = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
});

export default Object.freeze({
  TASK_STATUS,
  PRIORITY,
  ACCESS_PERMISSION,
  REQUEST_STATUS,
});
