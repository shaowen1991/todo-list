import { useAuth } from '../context/AuthContext';

export default function TodoLists() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <h1>Todo Lists Page</h1>
      <p>Welcome, {user.username}!</p>
      <button
        className="cursor-pointer font-medium text-indigo-600 hover:text-indigo-500"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}
