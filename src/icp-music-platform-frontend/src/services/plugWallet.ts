// Plug wallet integration service

declare global {
  interface Window {
    ic?: {
      plug?: {
        requestConnect?: () => Promise<boolean>;
        connect?: () => Promise<boolean>;
        disconnect?: () => Promise<void>;
        getPrincipal?: () => Promise<string>;
      };
    };
  }
}

class PlugWalletService {
  private isConnected = false;
  private principal: string | null = null;

  async connect() {
    if (!window.ic?.plug) {
      alert('Plug wallet is not installed. Please install the Plug browser extension.');
      return false;
    }
    try {
      let connected = false;
      if (typeof window.ic.plug.requestConnect === 'function') {
        connected = await window.ic.plug.requestConnect();
      } else if (typeof window.ic.plug.connect === 'function') {
        connected = await window.ic.plug.connect();
      }
      if (connected) {
        this.isConnected = true;
        const principal = await window.ic.plug.getPrincipal?.();
        this.principal = principal ?? null;
        return true;
      }
      return false;
    } catch (e) {
      console.error('Plug connection failed:', e);
      return false;
    }
  }

  async disconnect() {
    if (window.ic?.plug?.disconnect) {
      await window.ic.plug.disconnect();
    }
    this.isConnected = false;
    this.principal = null;
  }

  getIsConnected() {
    return this.isConnected;
  }

  getPrincipal() {
    return this.principal;
  }

  static isPlugAvailable() {
    return typeof window !== 'undefined' && !!window.ic?.plug;
  }

  static getInstallationUrl() {
    return 'https://chrome.google.com/webstore/detail/plug/cfbfdhimifdmdehjmkdobpcjfefblkjm';
  }
}

export const plugWalletService = new PlugWalletService(); 