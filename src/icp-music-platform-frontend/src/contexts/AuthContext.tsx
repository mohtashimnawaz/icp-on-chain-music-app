import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { icpService } from '../services/icp';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  principal: string | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    const initAuth = async () => {
      try {
        await icpService.init();
        const authenticated = icpService.getIsAuthenticated();
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const principalId = icpService.getPrincipal();
          setPrincipal(principalId ? principalId.toString() : null);
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const success = await icpService.login();
      if (success) {
        setIsAuthenticated(true);
        const principalId = icpService.getPrincipal();
        setPrincipal(principalId ? principalId.toString() : null);
      }
      return success;
    } catch (error) {
      console.error('Login failed:', error);
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
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    principal,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
