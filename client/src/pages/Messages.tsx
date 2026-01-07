import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  recipientId: string;
  recipientName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  jobId: number | null;
}

interface DirectMessage {
  id: number;
  senderId: string;
  receiverId: string;
  jobId: number | null;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAuthToken = () => localStorage.getItem('authToken');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (e) {
        console.error('Invalid token');
      }
    }
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const res = await fetch(`/api/messages/${userId}`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const selectConversation = (recipientId: string) => {
    setSelectedConversation(recipientId);
    loadMessages(recipientId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: newMessage.trim()
        })
      });

      if (res.ok) {
        const message = await res.json();
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        loadConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const selectedRecipient = conversations.find(c => c.recipientId === selectedConversation);

  if (!getAuthToken()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <MessageCircle className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold font-display">Sign in to view messages</h2>
        <p className="text-muted-foreground max-w-md">
          Connect with homeowners and contractors directly through our secure messaging system.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px] flex rounded-xl border border-border overflow-hidden bg-card" data-testid="messages-container">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r border-border flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </h2>
        </div>
        
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Messages with contractors will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {conversations.map((conv) => (
                <button
                  key={conv.recipientId}
                  onClick={() => selectConversation(conv.recipientId)}
                  className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                    selectedConversation === conv.recipientId ? 'bg-accent' : ''
                  }`}
                  data-testid={`conversation-${conv.recipientId}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate">{conv.recipientName}</span>
                        <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessageAt)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">{conv.lastMessage}</p>
                      {conv.jobId && (
                        <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Job #{conv.jobId}
                        </span>
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
                data-testid="button-back-to-list"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{selectedRecipient?.recipientName}</h3>
                {selectedRecipient?.jobId && (
                  <span className="text-xs text-muted-foreground">Job #{selectedRecipient.jobId}</span>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        msg.senderId === currentUserId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className={`text-xs mt-1 block ${
                        msg.senderId === currentUserId ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-border flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                data-testid="input-message"
              />
              <Button type="submit" disabled={!newMessage.trim()} data-testid="button-send-message">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
