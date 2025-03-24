/**
 * Enum values matching the PostgreSQL database schema
 */
export const TodoStatus = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
});

export const AccessPermission = Object.freeze({
  EDIT: 'EDIT',
  VIEW: 'VIEW',
});

export const TodoPriority = Object.freeze({
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
});

export const RequestStatus = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
});

export default Object.freeze({
  TodoStatus,
  AccessPermission,
  TodoPriority,
  RequestStatus,
});
