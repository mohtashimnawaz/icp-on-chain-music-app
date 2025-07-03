import React, { useState, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { sendMessage, listMessagesWith, markMessageRead } from '../services/musicService';

// Mock current user principal (replace with real auth context in production)
const MOCK_CURRENT_PRINCIPAL = Principal.fromText('aaaaa-aa');

// Helper to get unique conversation partners from messages
function getConversationPartners(messages: Array<{ id: bigint, to: Principal, content: string, from: Principal, read: boolean, timestamp: bigint }>, self: Principal) {
  const partners = new Set<string>();
  messages.forEach(m => {
    if (m.from.toText() !== self.toText()) partners.add(m.from.toText());
    if (m.to.toText() !== self.toText()) partners.add(m.to.toText());
  });
  return Array.from(partners);
}

const Messaging: React.FC = () => {
  const [recipient, setRecipient] = useState('');
  const [messages, setMessages] = useState<Array<{ id: bigint, to: Principal, content: string, from: Principal, read: boolean, timestamp: bigint }>>([]);
  const [allMessages, setAllMessages] = useState<Record<string, Array<{ id: bigint, to: Principal, content: string, from: Principal, read: boolean, timestamp: bigint }>>>({});
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    const poll = async () => {
      if (recipient) {
        try {
          const msgs = await listMessagesWith(Principal.fromText(recipient));
          setMessages(msgs);
          setAllMessages(prev => ({ ...prev, [recipient]: msgs }));
        } catch {}
      }
    };
    poll();
    pollingRef.current = setInterval(poll, 10000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [recipient]);

  // Load messages with recipient (on recipient change)
  useEffect(() => {
    if (recipient) {
      setLoading(true);
      setError('');
      listMessagesWith(Principal.fromText(recipient))
        .then(msgs => {
          setMessages(msgs);
          setAllMessages(prev => ({ ...prev, [recipient]: msgs }));
        })
        .catch(() => setError('Failed to load messages.'))
        .finally(() => setLoading(false));
    } else {
      setMessages([]);
    }
  }, [recipient]);

  // Aggregate all conversation partners
  const allPartners = Object.keys(allMessages);
  // Add current recipient if not in list
  if (recipient && !allPartners.includes(recipient)) allPartners.push(recipient);

  // Unread count per partner
  const unreadCounts: Record<string, number> = {};
  for (const partner of allPartners) {
    const msgs = allMessages[partner] || [];
    unreadCounts[partner] = msgs.filter(m => m.to.toText() === MOCK_CURRENT_PRINCIPAL.toText() && !m.read).length;
  }

  // Send a message
  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      const to = Principal.fromText(recipient);
      const sent = await sendMessage(to, messageInput);
      if (sent) {
        setMessages((prev) => [...prev, sent]);
        setAllMessages(prev => ({ ...prev, [recipient]: [...(prev[recipient] || []), sent] }));
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
    setAllMessages(prev => ({
      ...prev,
      [recipient]: (prev[recipient] || []).map(m => m.id === id ? { ...m, read: true } : m)
    }));
  };

  // Load all conversations on mount (simulate by polling known partners)
  useEffect(() => {
    // For demo, just keep the current recipient's messages in allMessages
    // In production, you would fetch all conversations from backend or index
    if (recipient && !allMessages[recipient]) {
      listMessagesWith(Principal.fromText(recipient)).then(msgs => {
        setAllMessages(prev => ({ ...prev, [recipient]: msgs }));
      });
    }
  }, [recipient, allMessages]);

  return (
    <div style={{ display: 'flex', padding: '2rem' }}>
      {/* Sidebar: Conversation List */}
      <div style={{ width: 250, borderRight: '1px solid #eee', paddingRight: 16, marginRight: 16 }}>
        <h3>Conversations</h3>
        {allPartners.length === 0 && <div>No conversations yet.</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {allPartners.map(partner => (
            <li key={partner} style={{ marginBottom: 8 }}>
              <button
                style={{
                  background: partner === recipient ? '#e0e0ff' : '#fff',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  padding: '4px 8px',
                  width: '100%',
                  textAlign: 'left',
                  position: 'relative',
                  fontWeight: unreadCounts[partner] > 0 ? 'bold' : 'normal',
                }}
                onClick={() => setRecipient(partner)}
              >
                {partner}
                {unreadCounts[partner] > 0 && (
                  <span style={{
                    background: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: 12,
                    position: 'absolute',
                    right: 8,
                    top: 4,
                  }}>{unreadCounts[partner]}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: 24 }}>
          <input
            type="text"
            placeholder="Add by Principal..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <button onClick={() => setRecipient(recipient.trim())} disabled={!recipient.trim()} style={{ width: '100%' }}>
            Start / Load Conversation
          </button>
        </div>
      </div>
      {/* Main Messaging Area */}
      <div style={{ flex: 1 }}>
        <h2>Messaging</h2>
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
    </div>
  );
};

export default Messaging; 