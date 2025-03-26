import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    if (user) {
      return true;
    }

    try {
      const userData = await api.get('/api/auth/me');
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkAuth().then((isAuthed) => {
      // only redirect to /todo-lists if user is authenticated
      // and currently on the root path or auth pages
      const isAuthPage =
        location.pathname === '/login' ||
        location.pathname === '/signup' ||
        location.pathname === '/';

      if (isAuthed && isAuthPage) {
        navigate('/todo-lists', { replace: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAuth, location.pathname]);

  const login = async (username, password) => {
    try {
      const { user: userData } = await api.post('/api/auth/login', {
        username,
        password,
      });
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const signup = async (username, password) => {
    try {
      const { user: userData } = await api.post('/api/auth/register', {
        username,
        password,
      });
      setUser(userData);
    } catch (error) {
      console.error('Signup failed:', error);
      throw new Error(error.message || 'Signup failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        login,
        logout,
        signup,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
