import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlugWalletService } from '../services/plugWallet';
import './WalletSelector.css';

export const WalletSelector = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const isPlugAvailable = PlugWalletService.isPlugAvailable();
  console.log('WalletSelector: Plug available:', isPlugAvailable);

  const handleLogin = async (walletType: 'internet-identity' | 'plug') => {
    setIsLoading(true);
    setSelectedWallet(walletType);
    
    try {
      const success = await login(walletType);
      if (!success) {
        alert(`Failed to connect with ${walletType === 'plug' ? 'Plug Wallet' : 'Internet Identity'}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (walletType === 'plug' && !PlugWalletService.isPlugAvailable()) {
        const installPlug = confirm(
          'Plug wallet is not installed. Would you like to install it?'
        );
        if (installPlug) {
          window.open(PlugWalletService.getInstallationUrl(), '_blank');
        }
      } else {
        alert(`Error connecting to ${walletType === 'plug' ? 'Plug Wallet' : 'Internet Identity'}: ${error}`);
      }
    } finally {
      setIsLoading(false);
      setSelectedWallet(null);
    }
  };

  try {
    return (
      <div className="wallet-selector">
        <h3>Connect Your Wallet</h3>
        <p>Choose how you want to connect to SoundForge Studios</p>
        
        <div className="wallet-options">
          {/* Plug Wallet Option */}
          <button
            className={`wallet-option ${selectedWallet === 'plug' ? 'selected' : ''}`}
            onClick={() => handleLogin('plug')}
            disabled={isLoading}
          >
            <div className="wallet-icon">🔌</div>
            <div className="wallet-info">
              <h4>Plug Wallet</h4>
              <p>{isPlugAvailable ? 'Connect with Plug Wallet' : 'Install Plug Wallet'}</p>
            </div>
            {selectedWallet === 'plug' && isLoading && <div className="spinner"></div>}
          </button>

          {/* Internet Identity Option */}
          <button
            className={`wallet-option ${selectedWallet === 'internet-identity' ? 'selected' : ''}`}
            onClick={() => handleLogin('internet-identity')}
            disabled={isLoading}
          >
            <div className="wallet-icon">🔐</div>
            <div className="wallet-info">
              <h4>Internet Identity</h4>
              <p>Secure, anonymous authentication by DFINITY</p>
            </div>
            {selectedWallet === 'internet-identity' && isLoading && <div className="spinner"></div>}
          </button>
        </div>

        <div className="wallet-info-section">
          <h4>Why connect a wallet?</h4>
          <ul>
            <li>🎵 Create and manage your music tracks</li>
            <li>💰 Receive royalty payments automatically</li>
            <li>🤝 Collaborate with other artists</li>
            <li>📊 Access detailed analytics</li>
            <li>💬 Send and receive messages</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering WalletSelector:', error);
    return (
      <div className="wallet-selector">
        <h3>Error</h3>
        <p>There was an error loading the wallet selector. Please refresh the page.</p>
        <pre style={{ color: 'red', fontSize: '12px' }}>{String(error)}</pre>
      </div>
    );
  }
};
