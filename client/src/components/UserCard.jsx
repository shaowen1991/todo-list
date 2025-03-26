import React from 'react';
import PropTypes from 'prop-types';
import { CheckIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import { DISPLAY_NAMES } from '../constants/displays';
import { OWNER_ROLE } from '../constants/enums';
import clsx from 'clsx';

export default function UserCard({
  user,
  isRequest = false,
  onAccept,
  onOptions,
}) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between',
        'rounded-md border border-gray-200 p-3',
        'hover:bg-gray-50'
      )}
    >
      <div className="flex items-center">
        <div
          className={clsx(
            'mr-2 flex h-8 w-8',
            'items-center justify-center',
            'rounded-md bg-gray-200 text-gray-700'
          )}
        >
          <span>{user.username.charAt(0).toUpperCase()}</span>
        </div>
        <div className="text-sm font-medium">{user.username}</div>
      </div>
      <div className="flex items-center">
        <div className="mr-2 text-xs text-blue-800">
          {
            DISPLAY_NAMES.ACCESS_PERMISSION[
              isRequest
                ? user.requested_permission
                : user.isOwner
                  ? OWNER_ROLE // special case for owner, not a real enum in database
                  : user.permission
            ]
          }
        </div>
        {isRequest ? (
          <button
            onClick={() => onAccept(user.user_id)}
            className={clsx(
              'cursor-pointer rounded-full p-1',
              'text-gray-700 hover:bg-green-100 hover:text-green-800'
            )}
            title="Accept"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={() => onOptions(user.user_id)}
            className={clsx(
              'cursor-pointer rounded-full p-1',
              'text-gray-700 hover:bg-gray-100'
            )}
            title="Options"
          >
            <EllipsisHorizontalIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

UserCard.propTypes = {
  user: PropTypes.shape({
    user_id: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    permission: PropTypes.string,
    requested_permission: PropTypes.string,
    isOwner: PropTypes.bool,
  }).isRequired,
  isRequest: PropTypes.bool,
  onAccept: PropTypes.func,
  onOptions: PropTypes.func,
};

UserCard.defaultProps = {
  isRequest: false,
};
