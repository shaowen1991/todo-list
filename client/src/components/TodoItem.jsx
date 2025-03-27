import PropTypes from 'prop-types';
import React from 'react';
import clsx from 'clsx';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { STYLE_CONFIGS } from '../constants/displays';
import { formatDate } from '../utils/dateUtils';

export default function TodoItem({
  todo,
  showActions,
  onEdit,
  onDelete,
  gridTemplateColumns,
}) {
  return (
    <div
      className={clsx('grid grid-cols-7 hover:bg-gray-50', 'min-w-[1000px]')}
      style={{ gridTemplateColumns }}
    >
      <div className="truncate px-4 py-4 text-sm font-medium text-gray-900">
        {todo.title}
      </div>
      <div className="truncate px-4 py-4 text-sm text-gray-500">
        {todo.description || '—'}
      </div>
      <div className="px-4 py-4 text-sm whitespace-nowrap text-gray-500">
        {formatDate(todo.due_date)}
      </div>
      <div className="px-4 py-4 text-sm whitespace-nowrap text-gray-500">
        <span
          className={clsx(
            'inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold',
            STYLE_CONFIGS.TODO_STATUS[todo.status]?.bgColor,
            STYLE_CONFIGS.TODO_STATUS[todo.status]?.textColor
          )}
        >
          {STYLE_CONFIGS.TODO_STATUS[todo.status]?.label}
        </span>
      </div>
      <div className="px-4 py-4 text-sm whitespace-nowrap text-gray-500">
        <span
          className={clsx(
            'inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold',
            STYLE_CONFIGS.PRIORITY[todo.priority]?.bgColor,
            STYLE_CONFIGS.PRIORITY[todo.priority]?.textColor
          )}
        >
          {STYLE_CONFIGS.PRIORITY[todo.priority]?.label}
        </span>
      </div>
      <div className="px-4 py-4 text-sm whitespace-nowrap text-gray-500">
        {formatDate(todo.created_at)}
      </div>
      <div className="px-4 py-4 text-sm font-medium whitespace-nowrap">
        {showActions && (
          <div className="flex space-x-4">
            <button
              onClick={onEdit}
              className="flex cursor-pointer items-center text-gray-500 hover:text-blue-800"
              title="Edit"
            >
              <PencilIcon className="h-5 w-5" />
            </button>

            <button
              onClick={() => onDelete(todo.id)}
              className="flex cursor-pointer items-center text-gray-500 hover:text-red-600"
              title="Delete"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    due_date: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    priority: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
  showActions: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  gridTemplateColumns: PropTypes.string.isRequired,
};
