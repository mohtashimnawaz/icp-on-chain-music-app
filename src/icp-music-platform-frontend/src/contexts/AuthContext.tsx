import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { plugWalletService } from '../services/plugWallet';

type WalletType = 'internet-identity' | 'plug' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  principal: string | null;
  walletType: WalletType;
  login: (wallet: WalletType) => Promise<void>;
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
  const [walletType, setWalletType] = useState<WalletType>(null);

  // Placeholder: Replace with real Internet Identity logic
  useEffect(() => {
    setIsAuthenticated(false);
    setPrincipal(null);
    setWalletType(null);
  }, []);

  const login = async (wallet: WalletType) => {
    setIsLoading(true);
    if (wallet === 'plug') {
      const success = await plugWalletService.connect();
      if (success) {
        setIsAuthenticated(true);
        setPrincipal(plugWalletService.getPrincipal() || null);
        setWalletType('plug');
      }
    } else if (wallet === 'internet-identity') {
      // TODO: Integrate real Internet Identity login
      setTimeout(() => {
        setIsAuthenticated(true);
        setPrincipal('mock-principal');
        setWalletType('internet-identity');
        setIsLoading(false);
      }, 1000);
      return;
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    if (walletType === 'plug') {
      await plugWalletService.disconnect();
    }
    setIsAuthenticated(false);
    setPrincipal(null);
    setWalletType(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, principal, walletType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 