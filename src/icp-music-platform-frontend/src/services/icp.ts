import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

// Import your backend service declaration
import { createActor, canisterId } from '../../../declarations/icp-music-platform-backend';

class ICPService {
  private authClient: AuthClient | null = null;
  private actor: any = null;
  private isAuthenticated = false;

  async init() {
    try {
      console.log('Creating AuthClient...');
      this.authClient = await AuthClient.create();
      console.log('AuthClient created successfully');
      
      this.isAuthenticated = await this.authClient.isAuthenticated();
      console.log('Authentication status:', this.isAuthenticated);
      
      if (this.isAuthenticated) {
        console.log('Setting up actor...');
        await this.setupActor();
        console.log('Actor setup complete');
      }
    } catch (error) {
      console.error('ICP service initialization failed:', error);
      this.isAuthenticated = false;
      this.authClient = null;
      this.actor = null;
    }
  }

  async setupActor() {
    if (!this.authClient) {
      console.warn('No auth client available for actor setup');
      return;
    }

    try {
      console.log('Setting up HTTP agent...');
      const identity = this.authClient.getIdentity();
      const agent = new HttpAgent({
        identity,
        host: import.meta.env.VITE_NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943',
      });

      // Fetch root key for development
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        console.log('Fetching root key for development...');
        await agent.fetchRootKey();
      }

      console.log('Creating actor with canister ID:', canisterId);
      this.actor = createActor(canisterId, {
        agent,
      });
      console.log('Actor created successfully');
    } catch (error) {
      console.error('Actor setup failed:', error);
      this.actor = null;
    }
  }

  async login() {
    if (!this.authClient) await this.init();

    // Always use production Internet Identity for better reliability
    try {
      console.log('Triggering II login');
      this.authClient!.login({
        identityProvider: import.meta.env.VITE_II_URL || 'https://identity.ic0.app',
        onSuccess: async () => {
          this.isAuthenticated = true;
          await this.setupActor();
        },
        onError: (error) => {
          console.error('Login error:', error);
        },
      });
      return true;
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
