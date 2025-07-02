import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  principal: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [principal, setPrincipal] = useState<string | null>(null);

  // Placeholder: Replace with real Internet Identity logic
  useEffect(() => {
    setIsAuthenticated(false);
    setPrincipal(null);
  }, []);

  const login = async () => {
    setIsLoading(true);
    // TODO: Integrate Internet Identity login
    setTimeout(() => {
      setIsAuthenticated(true);
      setPrincipal('mock-principal');
      setIsLoading(false);
    }, 1000);
  };

  const logout = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsAuthenticated(false);
      setPrincipal(null);
      setIsLoading(false);
    }, 500);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, principal, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 