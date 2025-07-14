import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent } from '@dfinity/agent';

// Import the backend actor
import { createActor } from '../../../declarations/icp-music-platform-backend';

class ICPService {
  private authClient: AuthClient | null = null;
  private isInitialized = false;
  private actor: any = null;

  async init() {
    if (this.isInitialized) return;
    
    try {
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
        },
      });
      this.isInitialized = true;
      console.log('ICP service initialized');
    } catch (error) {
      console.error('Failed to initialize ICP service:', error);
      throw error;
    }
  }

  async login(): Promise<boolean> {
    if (!this.authClient) {
      await this.init();
    }

    return new Promise((resolve) => {
      const identityProvider = process.env.DFX_NETWORK === 'ic' 
        ? 'https://identity.ic0.app'
        : `http://${process.env.CANISTER_ID_INTERNET_IDENTITY || 'rdmx6-jaaaa-aaaaa-aaadq-cai'}.localhost:4943`;
      
      this.authClient!.login({
        identityProvider,
        onSuccess: async () => {
          console.log('Internet Identity login successful');
          await this.createActor();
          resolve(true);
        },
        onError: (error) => {
          console.error('Internet Identity login failed:', error);
          resolve(false);
        },
      });
    });
  }

  async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
      this.actor = null;
    }
  }

  async getIsAuthenticated(): Promise<boolean> {
    if (!this.authClient) return false;
    return await this.authClient.isAuthenticated();
  }

  getPrincipal(): string | null {
    if (!this.authClient || !this.getIsAuthenticated()) {
      return null;
    }
    
    const identity = this.authClient.getIdentity();
    return identity.getPrincipal().toString();
  }

  private async createActor() {
    if (!this.authClient || !this.getIsAuthenticated()) {
      return;
    }

    const identity = this.authClient.getIdentity();
    const host = process.env.DFX_NETWORK === 'ic' ? 'https://ic0.app' : 'http://localhost:4943';
    const agent = new HttpAgent({
      identity,
      host,
    });

    // Fetch root key for local development
    if (process.env.DFX_NETWORK !== 'ic') {
      await agent.fetchRootKey();
    }

    const canisterId = process.env.CANISTER_ID_ICP_MUSIC_PLATFORM_BACKEND;
    if (!canisterId) {
      console.error('Backend canister ID not found in environment variables');
      return;
    }
    
    this.actor = createActor(canisterId, {
      agent,
    });
  }

  getActor() {
    return this.actor;
  }
}

export const icpService = new ICPService();
