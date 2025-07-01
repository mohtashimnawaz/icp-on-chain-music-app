import React, { useState } from 'react';
import { useMessaging } from '../hooks/useMusicData';
import { useAuth } from '../contexts/AuthContext';
import './MessageCenter.css';

export const MessageCenter: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const { messages, loading, sendMessage, markMessageAsRead, fetchMessagesWithUser } = useMessaging();

  if (!isAuthenticated) {
    return (
      <div className="message-center-container">
        <h3>Message Center</h3>
        <p>Please log in to access your messages.</p>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;
    
    const success = await sendMessage(selectedUser, newMessage);
    if (success) {
      setNewMessage('');
      await fetchMessagesWithUser(selectedUser);
    }
  };

  const handleMarkAsRead = async (messageId: bigint) => {
    await markMessageAsRead(messageId);
  };

  return (
    <div className="message-center-container">
      <div className="message-header">
        <h3>Message Center</h3>
        <div className="message-actions">
          <input
            type="text"
            placeholder="User Principal ID"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="user-input"
          />
          <button
            onClick={() => selectedUser && fetchMessagesWithUser(selectedUser)}
            className="load-messages-btn"
          >
            Load Conversation
          </button>
        </div>
      </div>

      <div className="message-content">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length > 0 ? (
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id.toString()}
                className={`message ${!message.read ? 'unread' : ''}`}
                onClick={() => !message.read && handleMarkAsRead(message.id)}
              >
                <div className="message-header-info">
                  <span className="message-from">From: {message.from}</span>
                  <span className="message-time">
                    {new Date(Number(message.timestamp) / 1000000).toLocaleString()}
                  </span>
                </div>
                <div className="message-content-text">
                  {message.content}
                </div>
                {!message.read && <div className="unread-indicator">New</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-messages">
            {selectedUser ? 'No messages with this user yet.' : 'Select a user to view messages.'}
          </div>
        )}

        {selectedUser && (
          <div className="compose-message">
            <div className="compose-header">
              <h4>Send Message to {selectedUser}</h4>
            </div>
            <div className="compose-form">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-textarea"
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="send-message-btn"
              >
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
