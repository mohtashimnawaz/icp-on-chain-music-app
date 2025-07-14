import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { plugWalletService } from '../services/plugWallet';
import { icpService } from '../services/icp';

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

  // Initialize auth services
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Initialize ICP service
        await icpService.init();
        
        // Check if user is already authenticated with Internet Identity
        const isAuthenticated = await icpService.getIsAuthenticated();
        if (isAuthenticated) {
          setIsAuthenticated(true);
          const userPrincipal = await icpService.getPrincipal();
          setPrincipal(userPrincipal);
          setWalletType('internet-identity');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    initAuth();
  }, []);

  const login = async (wallet: WalletType) => {
    setIsLoading(true);
    try {
      if (wallet === 'plug') {
        const success = await plugWalletService.connect();
        if (success) {
          setIsAuthenticated(true);
          setPrincipal(plugWalletService.getPrincipal() || null);
          setWalletType('plug');
        }
      } else if (wallet === 'internet-identity') {
        const success = await icpService.login();
        if (success) {
          setIsAuthenticated(true);
          const userPrincipal = await icpService.getPrincipal();
          setPrincipal(userPrincipal);
          setWalletType('internet-identity');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (walletType === 'plug') {
        await plugWalletService.disconnect();
      } else if (walletType === 'internet-identity') {
        await icpService.logout();
      }
      
      setIsAuthenticated(false);
      setPrincipal(null);
      setWalletType(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, principal, walletType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 