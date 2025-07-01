import { useAuth } from '../contexts/AuthContext';
import './AuthButton.css';

export const AuthButton = () => {
  const { isAuthenticated, isLoading, login, logout, principal } = useAuth();

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
          <span className="user-principal">
            {principal ? `${principal.slice(0, 8)}...${principal.slice(-4)}` : 'User'}
          </span>
        </div>
        <button className="auth-button logout" onClick={logout}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <button className="auth-button login" onClick={login}>
      <span className="auth-icon">🔐</span>
      Login with Internet Identity
    </button>
  );
};
