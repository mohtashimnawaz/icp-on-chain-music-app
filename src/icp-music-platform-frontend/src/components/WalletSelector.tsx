import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './WalletSelector.css';

export const WalletSelector = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleLogin = async (walletType: 'internet-identity') => {
    setIsLoading(true);
    setSelectedWallet(walletType);
    try {
      const success = await login(walletType);
      if (!success) {
        alert('Failed to connect with Internet Identity');
      }
    } catch (error) {
      alert(`Error connecting to Internet Identity: ${error}`);
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
    return (
      <div className="wallet-selector">
        <h3>Error</h3>
        <p>There was an error loading the wallet selector. Please refresh the page.</p>
        <pre style={{ color: 'red', fontSize: '12px' }}>{String(error)}</pre>
      </div>
    );
  }
};
