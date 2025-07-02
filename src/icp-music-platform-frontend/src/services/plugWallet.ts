// Plug wallet integration service
import { HttpAgent } from '@dfinity/agent';
import { createActor, canisterId, idlFactory } from '../../../declarations/icp-music-platform-backend';

// Type definitions for Plug wallet
declare global {
  interface Window {
    ic?: {
      plug?: {
        agent: any;
        isConnected: () => Promise<boolean>;
        connect: (options?: {
          whitelist?: string[];
          host?: string;
          timeout?: number;
        }) => Promise<boolean>;
        disconnect: () => Promise<void>;
        requestTransfer: (params: {
          to: string;
          amount: number;
          opts?: {
            fee?: number;
            memo?: string;
            from_subaccount?: number;
            created_at_time?: {
              timestamp_nanos: number;
            };
          };
        }) => Promise<{ transactionId: string }>;
        requestBalance: (principal?: string) => Promise<Array<{
          amount: number;
          canisterId: string;
          currency: string;
          image: string;
          name: string;
          symbol: string;
          value: number;
        }>>;
        createActor: (options: {
          canisterId: string;
          interfaceFactory: any;
        }) => Promise<any>;
        getPrincipal: () => Promise<string>;
        accountId: string;
        sessionManager: any;
      };
    };
  }
}

export class PlugWalletService {
  private isConnected = false;
  private actor: any = null;
  private principal: string | null = null;

  async init() {
    console.log('Initializing Plug wallet...');
    
    // Check if Plug is available
    if (!window.ic?.plug) {
      console.warn('Plug wallet is not installed');
      return false;
    }

    try {
      console.log('Checking Plug connection status...');
      this.isConnected = await window.ic.plug.isConnected();
      console.log('Plug connected:', this.isConnected);
      
      if (this.isConnected) {
        console.log('Setting up Plug actor...');
        await this.setupActor();
        this.principal = await window.ic.plug.getPrincipal();
        console.log('Plug principal:', this.principal);
      }
      return true;
    } catch (error) {
      console.error('Plug initialization failed:', error);
      return false;
    }
  }

  async connect() {
    console.log('Attempting to connect to Plug wallet...');
    
    if (!window.ic?.plug) {
      const error = 'Plug wallet is not installed. Please install Plug browser extension.';
      console.error(error);
      throw new Error(error);
    }

    try {
      console.log('Calling Plug connect with config:', {
        whitelist: [canisterId],
        host: import.meta.env.VITE_NODE_ENV === 'production' 
          ? 'https://ic0.app' 
          : 'http://localhost:4943',
        timeout: 50000,
      });
      
      const connected = await window.ic.plug.connect({
        whitelist: [canisterId],
        host: import.meta.env.VITE_NODE_ENV === 'production' 
          ? 'https://ic0.app' 
          : 'http://localhost:4943',
        timeout: 50000,
      });

      console.log('Plug connect result:', connected);

      if (connected) {
        this.isConnected = true;
        console.log('Setting up actor after connection...');
        await this.setupActor();
        this.principal = await window.ic.plug.getPrincipal();
        console.log('Connection successful, principal:', this.principal);
        return true;
      }
      console.warn('Plug connection failed - user may have rejected');
      return false;
    } catch (error) {
      console.error('Plug connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (!window.ic?.plug) return;

    try {
      await window.ic.plug.disconnect();
      this.isConnected = false;
      this.actor = null;
      this.principal = null;
    } catch (error) {
      console.error('Plug disconnection failed:', error);
    }
  }

  async setupActor() {
    if (!window.ic?.plug || !this.isConnected) return;

    try {
      // Use Plug's built-in createActor method
      this.actor = await window.ic.plug.createActor({
        canisterId,
        interfaceFactory: idlFactory,
      });
    } catch (error) {
      console.error('Plug actor setup failed:', error);
      // Fallback to manual actor creation
      try {
        const agent = new HttpAgent({
          identity: window.ic.plug.agent?.identity,
          host: import.meta.env.VITE_NODE_ENV === 'production' 
            ? 'https://ic0.app' 
            : 'http://localhost:4943',
        });

        if (import.meta.env.VITE_NODE_ENV === 'development') {
          await agent.fetchRootKey();
        }

        this.actor = createActor(canisterId, { agent });
      } catch (fallbackError) {
        console.error('Fallback actor creation failed:', fallbackError);
      }
    }
  }

  getIsConnected() {
    return this.isConnected;
  }

  getActor() {
    return this.actor;
  }

  getPrincipal() {
    return this.principal;
  }

  async getBalance() {
    if (!window.ic?.plug || !this.isConnected) return null;

    try {
      const balances = await window.ic.plug.requestBalance();
      return balances;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return null;
    }
  }

  async requestTransfer(to: string, amount: number, memo?: string) {
    if (!window.ic?.plug || !this.isConnected) {
      throw new Error('Plug wallet not connected');
    }

    try {
      const result = await window.ic.plug.requestTransfer({
        to,
        amount,
        opts: memo ? { memo } : undefined,
      });
      return result;
    } catch (error) {
      console.error('Transfer failed:', error);
      throw error;
    }
  }

  // Check if Plug is installed
  static isPlugAvailable() {
    return typeof window !== 'undefined' && !!window.ic?.plug;
  }

  // Get installation URL
  static getInstallationUrl() {
    return 'https://chrome.google.com/webstore/detail/plug/cfbfdhimifdmdehjmkdobpcjfefblkjm';
  }
}

export const plugWalletService = new PlugWalletService();
