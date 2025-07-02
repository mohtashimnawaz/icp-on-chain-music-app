import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { icpService } from '../services/icp';
import { plugWalletService } from '../services/plugWallet';

type WalletType = 'internet-identity' | 'plug' | null;

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
      console.log('Starting auth initialization...');
      try {
        // Check Internet Identity first
        console.log('Initializing ICP service...');
        await icpService.init();
        const iiAuthenticated = icpService.getIsAuthenticated();
        console.log('ICP authenticated:', iiAuthenticated);
        
        if (iiAuthenticated) {
          setIsAuthenticated(true);
          setWalletType('internet-identity');
          const principalId = icpService.getPrincipal();
          setPrincipal(principalId ? principalId.toString() : null);
          console.log('ICP authentication successful');
        } else {
          // Check Plug wallet
          console.log('Checking Plug wallet...');
          const plugAvailable = await plugWalletService.init();
          console.log('Plug available:', plugAvailable);
          
          if (plugAvailable && plugWalletService.getIsConnected()) {
            setIsAuthenticated(true);
            setWalletType('plug');
            const plugPrincipal = plugWalletService.getPrincipal();
            console.log('Plug principal raw:', plugPrincipal);
            // Ensure principal is converted to string safely
            let principalString: string | null = null;
            if (plugPrincipal) {
              try {
                principalString = String(plugPrincipal);
              } catch (error) {
                console.error('Error converting principal to string:', error);
                principalString = null;
              }
            }
            console.log('Plug principal string:', principalString);
            setPrincipal(principalString);
            console.log('Plug authentication successful');
          } else {
            console.log('No wallet authenticated');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsAuthenticated(false);
        setPrincipal(null);
        setWalletType(null);
      } finally {
        console.log('Auth initialization complete');
        setIsLoading(false);
      }
    };

    initAuth().catch(error => {
      console.error('Auth initialization promise failed:', error);
      setIsLoading(false);
    });
  }, []);

  const login = async (selectedWalletType: WalletType): Promise<boolean> => {
    if (!selectedWalletType) return false;
    
    setIsLoading(true);
    try {
      let success = false;
      
      if (selectedWalletType === 'internet-identity') {
        success = await icpService.login();
        if (success) {
          const principalId = icpService.getPrincipal();
          setPrincipal(principalId ? principalId.toString() : null);
        }
      } else if (selectedWalletType === 'plug') {
        success = await plugWalletService.connect();
        if (success) {
          const plugPrincipal = plugWalletService.getPrincipal();
          // Ensure principal is converted to string safely
          let principalString: string | null = null;
          if (plugPrincipal) {
            try {
              principalString = String(plugPrincipal);
            } catch (error) {
              console.error('Error converting principal to string:', error);
              principalString = null;
            }
          }
          setPrincipal(principalString);
        }
      }
      
      if (success) {
        setIsAuthenticated(true);
        setWalletType(selectedWalletType);
      }
      
      return success;
    } catch (error) {
      console.error('Login failed:', error);
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
      if (walletType === 'internet-identity') {
        await icpService.logout();
      } else if (walletType === 'plug') {
        await plugWalletService.disconnect();
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

  const getBalance = async () => {
    if (!isAuthenticated) return null;
    
    try {
      if (walletType === 'plug') {
        return await plugWalletService.getBalance();
      }
      // Internet Identity doesn't have built-in balance checking
      return null;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
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
