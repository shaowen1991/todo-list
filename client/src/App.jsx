import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TodoLists from './pages/TodoLists';
import RequestAccess from './pages/RequestAccess';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/todo-lists"
            element={
              <ProtectedRoute>
                <TodoLists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todo-lists/:listId"
            element={
              <ProtectedRoute>
                <TodoLists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/todo-lists/:listId/request-access"
            element={
              <ProtectedRoute>
                <RequestAccess />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/todo-lists" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
