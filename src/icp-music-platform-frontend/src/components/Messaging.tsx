import React, { useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { sendMessage, listMessagesWith, markMessageRead } from '../services/musicService';

// Mock current user principal (replace with real auth context in production)
const MOCK_CURRENT_PRINCIPAL = Principal.fromText('aaaaa-aa');

const Messaging: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [messages, setMessages] = useState<Array<{ id: bigint, to: Principal, content: string, from: Principal, read: boolean, timestamp: bigint }>>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // Load messages with recipient
  useEffect(() => {
    if (recipient) {
      setLoading(true);
      setError('');
      listMessagesWith(Principal.fromText(recipient))
        .then(setMessages)
        .catch(() => setError('Failed to load messages.'))
        .finally(() => setLoading(false));
    } else {
      setMessages([]);
    }
  }, [recipient]);

  // Send a message
  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      const to = Principal.fromText(recipient);
      const sent = await sendMessage(to, messageInput);
      if (sent) {
        setMessages((prev) => [...prev, sent]);
        setMessageInput('');
      } else {
        setError('Failed to send message.');
      }
    } catch {
      setError('Failed to send message.');
    }
    setSending(false);
  };

  // Mark a message as read
  const handleMarkRead = async (id: bigint) => {
    await markMessageRead(id);
    setMessages((prev) => prev.map(m => m.id === id ? { ...m, read: true } : m));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Messaging</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Recipient Principal (e.g. aaaaa-aa)"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={() => setRecipient(recipient.trim())} disabled={!recipient.trim()}>
          Load Conversation
        </button>
      </div>
      {loading && <div>Loading messages...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {recipient && !loading && (
        <>
          <div style={{ border: '1px solid #ccc', padding: 16, minHeight: 200, marginBottom: 16 }}>
            {messages.length === 0 && <div>No messages yet.</div>}
            {messages.map(m => (
              <div key={m.id.toString()} style={{ marginBottom: 8, background: m.from.toText() === MOCK_CURRENT_PRINCIPAL.toText() ? '#e0ffe0' : '#f0f0f0', padding: 8, borderRadius: 4 }}>
                <div><b>{m.from.toText() === MOCK_CURRENT_PRINCIPAL.toText() ? 'You' : m.from.toText()}</b>: {m.content}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{new Date(Number(m.timestamp) * 1000).toLocaleString()} {m.read ? '(Read)' : <button onClick={() => handleMarkRead(m.id)}>Mark as read</button>}</div>
              </div>
            ))}
          </div>
          <div>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              style={{ width: 300, marginRight: 8 }}
              disabled={!recipient}
            />
            <button onClick={handleSend} disabled={sending || !messageInput.trim() || !recipient}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Messaging; 