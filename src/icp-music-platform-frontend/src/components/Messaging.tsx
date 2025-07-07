import React, { useState, useEffect, useRef } from 'react';
import { Principal } from '@dfinity/principal';
import { sendMessage, listMessagesWith, markMessageRead } from '../services/musicService';
import { useSnackbar } from '../contexts/SnackbarContext';
import { useLoading } from '../contexts/LoadingContext';

// MUI imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import DoneIcon from '@mui/icons-material/Done';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MessageIcon from '@mui/icons-material/Message';

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
  const [newRecipient, setNewRecipient] = useState('');
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { showMessage } = useSnackbar();
  const { withLoading } = useLoading();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    const poll = async () => {
      if (recipient) {
        try {
          const msgs = await listMessagesWith(Principal.fromText(recipient));
          setMessages(msgs);
          setAllMessages(prev => ({ ...prev, [recipient]: msgs }));
        } catch (error) {
          console.error('Polling error:', error);
        }
      }
    };
    poll();
    pollingRef.current = setInterval(poll, 10000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [recipient]);

  // Load messages with recipient (on recipient change)
  useEffect(() => {
    if (recipient) {
      const loadMessages = async () => {
        const loadPromise = (async () => {
          setError('');
          try {
            const msgs = await listMessagesWith(Principal.fromText(recipient));
            setMessages(msgs);
            setAllMessages(prev => ({ ...prev, [recipient]: msgs }));
          } catch (error) {
            setError('Failed to load messages.');
            showMessage('Failed to load messages', 'error');
          }
        })();
        
        await withLoading(loadPromise, 'Loading messages...');
      };
      
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [recipient, withLoading, showMessage]);

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
    if (!messageInput.trim()) {
      showMessage('Please enter a message', 'error');
      return;
    }

    const sendPromise = (async () => {
      setError('');
      try {
        const to = Principal.fromText(recipient);
        const sent = await sendMessage(to, messageInput);
        if (sent) {
          setMessages((prev) => [...prev, sent]);
          setAllMessages(prev => ({ ...prev, [recipient]: [...(prev[recipient] || []), sent] }));
          setMessageInput('');
          showMessage('Message sent successfully!', 'success');
        } else {
          setError('Failed to send message.');
          showMessage('Failed to send message', 'error');
        }
      } catch (error) {
        setError('Failed to send message.');
        showMessage('Failed to send message', 'error');
      }
    })();
    
    await withLoading(sendPromise, 'Sending message...');
  };

  // Mark a message as read
  const handleMarkRead = async (id: bigint) => {
    const markReadPromise = (async () => {
      try {
        await markMessageRead(id);
        setMessages((prev) => prev.map(m => m.id === id ? { ...m, read: true } : m));
        setAllMessages(prev => ({
          ...prev,
          [recipient]: (prev[recipient] || []).map(m => m.id === id ? { ...m, read: true } : m)
        }));
        showMessage('Message marked as read', 'success');
      } catch (error) {
        showMessage('Failed to mark message as read', 'error');
      }
    })();
    
    await withLoading(markReadPromise, 'Marking as read...');
  };

  // Start new conversation
  const handleStartConversation = () => {
    if (!newRecipient.trim()) {
      showMessage('Please enter a recipient principal', 'error');
      return;
    }
    setRecipient(newRecipient.trim());
    setNewRecipient('');
  };

  // Handle Enter key in message input
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const getLastMessage = (partner: string) => {
    const msgs = allMessages[partner] || [];
    return msgs[msgs.length - 1];
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', p: 2 }}>
      {/* Sidebar: Conversation List */}
      <Card sx={{
        background: 'linear-gradient(135deg, #7b1fa2 0%, #42a5f5 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientMove 8s ease-in-out infinite',
        boxShadow: '0 8px 32px 0 rgba(123,31,162,0.18)',
        borderRadius: 4,
        transition: 'transform 0.3s cubic-bezier(.4,2,.6,1)',
        '&:hover': {
          transform: 'translateY(-4px) scale(1.04)',
          boxShadow: '0 16px 48px 0 rgba(123,31,162,0.22)',
        },
        width: 320,
        mr: 2,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MessageIcon sx={{ fontSize: 32, color: '#fff', filter: 'drop-shadow(0 2px 8px #42a5f5)' }} />
            <Typography variant="h6" sx={{
              background: 'linear-gradient(90deg, #fff, #00e5ff, #7b1fa2)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              letterSpacing: 1,
              textShadow: '0 2px 8px #42a5f5',
              ml: 1
            }}>
              Messaging
            </Typography>
          </Box>
          
          {/* New Conversation Input */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="New Recipient Principal"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              placeholder="Enter principal ID"
              sx={{ mb: 1 }}
            />
            <Button
              fullWidth
              variant="outlined"
              onClick={handleStartConversation}
              disabled={!newRecipient.trim()}
              startIcon={<PersonIcon />}
            >
              Start Conversation
            </Button>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Conversation List */}
          {allPartners.length === 0 ? (
            <Alert severity="info">No conversations yet.</Alert>
          ) : (
            <List sx={{ flex: 1, overflow: 'auto' }}>
              {allPartners.map((partner, index) => {
                const lastMessage = getLastMessage(partner);
                const unreadCount = unreadCounts[partner];
                const isSelected = partner === recipient;
                
                return (
                  <React.Fragment key={partner}>
                    <ListItem disablePadding>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => setRecipient(partner)}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                            },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge badgeContent={unreadCount} color="error">
                            <Avatar sx={{ bgcolor: isSelected ? 'primary.main' : 'grey.300' }}>
                              <PersonIcon />
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                                color: unreadCount > 0 ? 'text.primary' : 'text.secondary',
                              }}
                            >
                              {partner.substring(0, 20)}...
                            </Typography>
                          }
                          secondary={
                            lastMessage ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: unreadCount > 0 ? 'text.primary' : 'text.secondary',
                                    fontWeight: unreadCount > 0 ? 'bold' : 'normal',
                                  }}
                                >
                                  {lastMessage.content.substring(0, 30)}
                                  {lastMessage.content.length > 30 && '...'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(lastMessage.timestamp)}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                No messages yet
                              </Typography>
                            )
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < allPartners.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Main Messaging Area */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!recipient ? (
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Box sx={{ textAlign: 'center' }}>
              <MessageIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a conversation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a conversation from the sidebar or start a new one
              </Typography>
            </Box>
          </CardContent>
        ) : (
          <>
            {/* Chat Header */}
            <CardContent sx={{ pb: 1, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">
                    {recipient.substring(0, 20)}...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {unreadCounts[recipient] > 0 ? `${unreadCounts[recipient]} unread messages` : 'All messages read'}
                  </Typography>
                </Box>
              </Box>
            </CardContent>

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : messages.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MessageIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No messages yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start the conversation by sending a message
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {messages.map((message) => {
                    const isOwnMessage = message.from.toText() === MOCK_CURRENT_PRINCIPAL.toText();
                    
                    return (
                      <Box
                        key={message.id.toString()}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          mb: 1,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor: isOwnMessage ? 'primary.main' : 'grey.100',
                            color: isOwnMessage ? 'white' : 'text.primary',
                            borderRadius: 2,
                            position: 'relative',
                          }}
                        >
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {message.content}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {new Date(Number(message.timestamp) * 1000).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {isOwnMessage ? (
                                message.read ? (
                                  <DoneAllIcon sx={{ fontSize: 16 }} />
                                ) : (
                                  <DoneIcon sx={{ fontSize: 16 }} />
                                )
                              ) : (
                                !message.read && (
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => handleMarkRead(message.id)}
                                    sx={{ 
                                      color: 'inherit',
                                      minWidth: 'auto',
                                      p: 0.5,
                                      fontSize: '0.75rem'
                                    }}
                                  >
                                    Mark read
                                  </Button>
                                )
                              )}
                            </Box>
                          </Box>
                        </Paper>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Box>
              )}
            </Box>

            {/* Message Input */}
            <CardContent sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                  variant="outlined"
                  size="small"
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={sending || !messageInput.trim()}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </CardContent>
          </>
        )}
      </Card>
    </Box>
  );
};

export default Messaging; 