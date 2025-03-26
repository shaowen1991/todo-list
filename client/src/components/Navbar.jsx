import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-4 py-4">
        <Link
          className="text-2xl font-bold tracking-tight text-gray-900 select-none"
          to="/"
        >
          Todo Lists
        </Link>
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={clsx(
              'flex h-10 w-10 cursor-pointer',
              'items-center justify-center',
              'rounded-md bg-gray-200'
            )}
          >
            <span className="text-xl">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </button>

          {showProfileMenu && (
            <div
              className={clsx(
                'absolute right-0 z-50 mt-2 w-48',
                'origin-top-right rounded-md',
                'border border-gray-200 bg-white py-1 shadow-lg'
              )}
            >
              <button
                onClick={logout}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <ArrowRightStartOnRectangleIcon className="mr-2 h-5 w-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
