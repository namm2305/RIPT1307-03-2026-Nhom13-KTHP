import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  faculty?: string;
  bio?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher' | 'admin';
    faculty?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Set auth token header globally in axios
  const setAuthHeader = (token: string | null) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user profile on startup if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthHeader(token);
        try {
          const res = await axios.get('/api/auth/me');
          if (res.data && res.data.success) {
            setUser(res.data.data);
          } else {
            // If token invalid/expired
            localStorage.removeItem('token');
            setAuthHeader(null);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          localStorage.removeItem('token');
          setAuthHeader(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setUser(userData);
      } else {
        throw new Error(res.data.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      throw new Error(message);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'teacher' | 'admin';
    faculty?: string;
  }) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      if (res.data && res.data.success) {
        const { token, user: registeredUser } = res.data;
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setUser(registeredUser);
      } else {
        throw new Error(res.data.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
