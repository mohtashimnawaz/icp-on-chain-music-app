import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { icpService } from '../services/icp';

type WalletType = 'internet-identity' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  principal: string | null;
  walletType: WalletType;
  login: (walletType: WalletType) => Promise<boolean>;
  logout: () => Promise<void>;
  getBalance: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [principal, setPrincipal] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await icpService.init();
        const iiAuthenticated = icpService.getIsAuthenticated();
        if (iiAuthenticated) {
          setIsAuthenticated(true);
          setWalletType('internet-identity');
          const principalId = icpService.getPrincipal();
          setPrincipal(principalId ? principalId.toString() : null);
        } else {
          setIsAuthenticated(false);
          setPrincipal(null);
          setWalletType(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setPrincipal(null);
        setWalletType(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth().catch(() => setIsLoading(false));
  }, []);

  const login = async (selectedWalletType: WalletType): Promise<boolean> => {
    if (selectedWalletType !== 'internet-identity') return false;
    setIsLoading(true);
    try {
      const success = await icpService.login();
      if (success) {
        const principalId = icpService.getPrincipal();
        setPrincipal(principalId ? principalId.toString() : null);
        setIsAuthenticated(true);
        setWalletType('internet-identity');
      }
      return success;
    } catch (error) {
      setIsAuthenticated(false);
      setPrincipal(null);
      setWalletType(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await icpService.logout();
      setIsAuthenticated(false);
      setPrincipal(null);
      setWalletType(null);
    } catch (error) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async () => {
    // Internet Identity doesn't have built-in balance checking
    return null;
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    principal,
    walletType,
    login,
    logout,
    getBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
