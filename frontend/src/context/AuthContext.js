import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // LOGIN
const login = async (email, password) => {
  setIsLoading(true);
  setError(null);

  try {
    const res = await api.post('/auth/login', { email, password });

    // ✅ IMPORTANT FIX
    const { token, user } = res.data.data;

    if (!token || !user) {
      throw new Error('Invalid login response');
    }

    localStorage.setItem('token', token);
    setUser(user);

    return user;
  } catch (err) {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Login failed';
    setError(message);
    throw new Error(message);
  } finally {
    setIsLoading(false);
  }
};


  // LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // VERIFY TOKEN
  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    verifyToken();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
