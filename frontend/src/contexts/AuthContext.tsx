import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/services/mockData';
import { authApi } from '@/services/mockApi';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from sessionStorage on mount
  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual backend authentication with JWT tokens
      const loggedInUser = await authApi.login(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        sessionStorage.setItem('user', JSON.stringify(loggedInUser));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    try {
      // TODO: Replace with actual backend user registration
      const newUser = await authApi.signup(userData);
      setUser(newUser);
      sessionStorage.setItem('user', JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
