import {
  ACCESS_PERMISSION,
  OWNER_ROLE,
  PRIORITY,
  REQUEST_STATUS,
  TODO_STATUS,
} from './enums';

// Display name mappings for enums
export const DISPLAY_NAMES = Object.freeze({
  TODO_STATUS: {
    [TODO_STATUS.NOT_STARTED]: 'Not Started',
    [TODO_STATUS.IN_PROGRESS]: 'In Progress',
    [TODO_STATUS.COMPLETED]: 'Completed',
    [TODO_STATUS.BLOCKED]: 'Blocked',
  },
  PRIORITY: {
    [PRIORITY.P0]: 'P0',
    [PRIORITY.P1]: 'P1',
    [PRIORITY.P2]: 'P2',
    [PRIORITY.P3]: 'P3',
  },
  ACCESS_PERMISSION: {
    [OWNER_ROLE]: 'Owner', // special case for owner, not a real enum in database
    [ACCESS_PERMISSION.EDIT]: 'Editor',
    [ACCESS_PERMISSION.VIEW]: 'Viewer',
  },
  REQUEST_STATUS: {
    [REQUEST_STATUS.PENDING]: 'Pending',
    [REQUEST_STATUS.ACCEPTED]: 'Accepted',
  },
});

// UI styles for status and priority labels
export const STYLE_CONFIGS = {
  TODO_STATUS: {
    [TODO_STATUS.NOT_STARTED]: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      label: DISPLAY_NAMES.TODO_STATUS[TODO_STATUS.NOT_STARTED],
    },
    [TODO_STATUS.IN_PROGRESS]: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: DISPLAY_NAMES.TODO_STATUS[TODO_STATUS.IN_PROGRESS],
    },
    [TODO_STATUS.COMPLETED]: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: DISPLAY_NAMES.TODO_STATUS[TODO_STATUS.COMPLETED],
    },
    [TODO_STATUS.BLOCKED]: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      label: DISPLAY_NAMES.TODO_STATUS[TODO_STATUS.BLOCKED],
    },
  },
  PRIORITY: {
    [PRIORITY.P0]: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      label: DISPLAY_NAMES.PRIORITY[PRIORITY.P0],
    },
    [PRIORITY.P1]: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      label: DISPLAY_NAMES.PRIORITY[PRIORITY.P1],
    },
    [PRIORITY.P2]: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      label: DISPLAY_NAMES.PRIORITY[PRIORITY.P2],
    },
    [PRIORITY.P3]: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      label: DISPLAY_NAMES.PRIORITY[PRIORITY.P3],
    },
  },
};

export default { STYLE_CONFIGS, DISPLAY_NAMES };
