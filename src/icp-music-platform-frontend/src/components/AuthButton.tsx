import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WalletSelector } from './WalletSelector';
import './AuthButton.css';

export const AuthButton = () => {
  const { isAuthenticated, isLoading, logout, principal, walletType, getBalance } = useAuth();
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [balance, setBalance] = useState<any>(null);

  const handleGetBalance = async () => {
    const balanceData = await getBalance();
    setBalance(balanceData);
  };

  if (isLoading) {
    return (
      <button className="auth-button loading" disabled>
        <span className="spinner"></span>
        Loading...
      </button>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="auth-section">
        <div className="user-info">
          <div className="wallet-type">
            {walletType === 'plug' && '🔌'}
            {walletType === 'internet-identity' && '🔐'}
            <span className="wallet-name">
              {walletType === 'plug' ? 'Plug' : 'Internet Identity'}
            </span>
          </div>
          <span className="user-principal">
            {principal ? `${principal.slice(0, 8)}...${principal.slice(-4)}` : 'User'}
          </span>
          {walletType === 'plug' && (
            <button className="balance-button" onClick={handleGetBalance}>
              💰 Balance
            </button>
          )}
        </div>
        {balance && (
          <div className="balance-display">
            {Array.isArray(balance) ? balance.map((token, index) => (
              <div key={index} className="token-balance">
                <img src={token.image} alt={token.symbol} width="16" height="16" />
                <span>{token.amount.toFixed(4)} {token.symbol}</span>
              </div>
            )) : 'No balance data'}
          </div>
        )}
        <button className="auth-button logout" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        className="auth-button login" 
        onClick={() => setShowWalletSelector(true)}
      >
        <span className="auth-icon">🔐</span>
        Connect Wallet
      </button>
      
      {showWalletSelector && (
        <div className="wallet-modal-overlay" onClick={() => setShowWalletSelector(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close" 
              onClick={() => setShowWalletSelector(false)}
            >
              ×
            </button>
            <WalletSelector />
          </div>
        </div>
      )}
    </>
  );
};
