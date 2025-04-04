import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import clsx from 'clsx';

export default function Login() {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
    } catch {
      setError('Invalid username or password');
    }
  };

  // preserve search params when navigating to signup
  const signupLink = {
    pathname: '/signup',
    search: location.search,
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Log In</h1>
        </div>

        {error && (
          <div className="rounded-md bg-red-100 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={clsx(
                'mt-1 block h-10 w-full rounded-md border border-gray-300',
                'px-3 py-2'
              )}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={clsx(
                'mt-1 block h-10 w-full rounded-md border border-gray-300',
                'px-3 py-2'
              )}
            />
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className={clsx(
                'flex h-10 w-full items-center justify-center rounded-md',
                'border border-transparent bg-blue-100 px-4 text-sm font-medium',
                'text-blue-800 hover:bg-blue-200'
              )}
            >
              Log In
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <p className="text-gray-700">
            Don't have an account?{' '}
            <Link
              to={signupLink}
              className="font-medium text-blue-800 hover:text-blue-600"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
