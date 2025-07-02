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

    // Always use production Internet Identity for better reliability
    try {
      return new Promise<boolean>((resolve) => {
        this.authClient!.login({
          identityProvider: import.meta.env.VITE_II_URL || 'https://identity.ic0.app',
          onSuccess: async () => {
            this.isAuthenticated = true;
            await this.setupActor();
            resolve(true);
          },
          onError: (error) => {
            console.error('Login error:', error);
            resolve(false);
          },
        });
      });
    } catch (error) {
      console.error('Authentication service error:', error);
      return false;
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
