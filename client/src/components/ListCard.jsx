import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../utils/dateUtils';
import { useNavigate, useParams } from 'react-router-dom';

export default function ListCard({ list }) {
  const navigate = useNavigate();
  const { listId } = useParams();
  const listIdParam = Number(listId);

  return (
    <div
      className={`block cursor-pointer border-b border-gray-200 p-4 ${
        listIdParam === list.id
          ? 'bg-blue-100 hover:bg-blue-200'
          : 'bg-white hover:bg-gray-50'
      }`}
      onClick={() => navigate(`/todo-lists/${list.id}`)}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="max-w-[70%] truncate text-sm font-medium text-gray-900">
          {list.title}
        </div>
        <div className="text-xs text-gray-500">
          {formatDate(list.created_at)}
        </div>
      </div>
      <div className="mb-3 line-clamp-2 overflow-hidden text-sm text-gray-700">
        {list.description}
      </div>
      <div className="flex items-center text-sm text-gray-500">
        <span className="truncate">Owner: {list.owner_username}</span>
      </div>
    </div>
  );
}

ListCard.propTypes = {
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    owner_username: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
  }).isRequired,
};
