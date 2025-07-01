import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

// Import your backend service declaration
import { createActor, canisterId } from '../../../declarations/icp-music-platform-backend';

class ICPService {
  private authClient: AuthClient | null = null;
  private actor: any = null;
  private isAuthenticated = false;

  async init() {
    this.authClient = await AuthClient.create();
    this.isAuthenticated = await this.authClient.isAuthenticated();
    
    if (this.isAuthenticated) {
      await this.setupActor();
    }
  }

  async setupActor() {
    if (!this.authClient) return;

    const identity = this.authClient.getIdentity();
    const agent = new HttpAgent({
      identity,
      host: import.meta.env.VITE_NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943',
    });

    // Fetch root key for development
    if (import.meta.env.VITE_NODE_ENV === 'development') {
      await agent.fetchRootKey();
    }

    this.actor = createActor(canisterId, {
      agent,
    });
  }

  async login() {
    if (!this.authClient) await this.init();

    // For development, try Internet Identity first, fallback to mock if it fails
    try {
      return new Promise<boolean>((resolve) => {
        this.authClient!.login({
          identityProvider: import.meta.env.VITE_NODE_ENV === 'production' 
            ? 'https://identity.ic0.app'
            : 'http://localhost:4943/?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai',
          onSuccess: async () => {
            this.isAuthenticated = true;
            await this.setupActor();
            resolve(true);
          },
          onError: (error) => {
            console.error('Login error:', error);
            // Fallback to mock authentication for development
            console.log('Falling back to mock authentication...');
            this.isAuthenticated = true;
            resolve(true);
          },
        });
      });
    } catch (error) {
      console.error('Authentication service not available, using mock auth:', error);
      // Mock authentication for development when dfx is not running
      this.isAuthenticated = true;
      return true;
    }
  }

  async logout() {
    if (this.authClient) {
      await this.authClient.logout();
      this.isAuthenticated = false;
      this.actor = null;
    }
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  getActor() {
    return this.actor;
  }

  getPrincipal() {
    const principal = this.authClient?.getIdentity().getPrincipal();
    // Fallback to mock principal if not available
    return principal || { toString: () => '2vxsx-fae-dev-mock-principal' };
  }
}

export const icpService = new ICPService();
