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
      host: process.env.NODE_ENV === 'production' ? 'https://ic0.app' : 'http://localhost:4943',
    });

    // Fetch root key for development
    if (process.env.NODE_ENV === 'development') {
      await agent.fetchRootKey();
    }

    this.actor = createActor(canisterId, {
      agent,
    });
  }

  async login() {
    if (!this.authClient) await this.init();

    return new Promise<boolean>((resolve) => {
      this.authClient!.login({
        identityProvider: process.env.NODE_ENV === 'production' 
          ? 'https://identity.ic0.app/#authorize'
          : `http://localhost:4943/?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}#authorize`,
        onSuccess: async () => {
          this.isAuthenticated = true;
          await this.setupActor();
          resolve(true);
        },
        onError: () => {
          resolve(false);
        },
      });
    });
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
    return this.authClient?.getIdentity().getPrincipal();
  }
}

export const icpService = new ICPService();
