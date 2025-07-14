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
      
      console.log('ICP Service login called');
      console.log('DFX_NETWORK:', process.env.DFX_NETWORK);
      console.log('CANISTER_ID_INTERNET_IDENTITY:', process.env.CANISTER_ID_INTERNET_IDENTITY);
      console.log('Identity Provider URL:', identityProvider);
      
      this.authClient!.login({
        identityProvider,
        maxTimeToLive: BigInt(8 * 60 * 60 * 1000 * 1000 * 1000), // 8 hours in nanoseconds
        windowOpenerFeatures: 'width=500,height=600,toolbar=0,location=0,menubar=0,scrollbars=1,resizable=1',
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

  async getPrincipal(): Promise<string | null> {
    if (!this.authClient || !(await this.getIsAuthenticated())) {
      return null;
    }
    
    const identity = this.authClient.getIdentity();
    return identity.getPrincipal().toString();
  }

  private async createActor() {
    if (!this.authClient || !(await this.getIsAuthenticated())) {
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
    
    console.log('Actor created successfully with identity:', identity.getPrincipal().toString());
  }

  getActor() {
    return this.actor;
  }
}

export const icpService = new ICPService();
