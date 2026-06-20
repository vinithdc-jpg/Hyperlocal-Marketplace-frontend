'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { connectSocket } from '@/lib/socket';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { MessageCircle, Send } from 'lucide-react';

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="text-center py-20">Loading chat...</div>}>
        <ChatContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function ChatContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [activeConv, setActiveConv] = useState(searchParams.get('conversation'));
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const { data: convData } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.getConversations().then((r) => r.data),
  });

  const { data: msgData, refetch: refetchMessages } = useQuery({
    queryKey: ['messages', activeConv],
    queryFn: () => chatService.getMessages(activeConv).then((r) => r.data),
    enabled: !!activeConv,
  });

  const sendMutation = useMutation({
    mutationFn: (content) => chatService.sendMessage(activeConv, { content }),
    onSuccess: () => {
      setMessage('');
      refetchMessages();
      queryClient.invalidateQueries(['conversations']);
    },
  });

  useEffect(() => {
    if (!user?._id) return;
    const socket = connectSocket(user._id);
    socket.on('message:new', () => {
      refetchMessages();
      queryClient.invalidateQueries(['conversations']);
    });
    return () => socket.off('message:new');
  }, [user?._id, activeConv]);

  useEffect(() => {
    if (activeConv) {
      const socket = connectSocket(user?._id);
      socket.emit('join:conversation', activeConv);
    }
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgData?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !activeConv) return;
    sendMutation.mutate(message);
    const socket = connectSocket(user?._id);
    socket.emit('message:send', { conversationId: activeConv, content: message });
  };

  const conversations = convData?.conversations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        <div className="border border-border rounded-xl bg-card overflow-y-auto">
          {conversations.length ? conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveConv(c._id)}
              className={`w-full p-4 text-left border-b border-border hover:bg-background transition ${activeConv === c._id ? 'bg-background' : ''}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{c.otherUser?.name}</p>
                {c.unreadCount > 0 && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{c.unreadCount}</span>
                )}
              </div>
              <p className="text-sm text-muted truncate">{c.lastMessage}</p>
              {c.product && <p className="text-xs text-primary mt-1 truncate">Re: {c.product.title}</p>}
            </button>
          )) : (
            <div className="p-8 text-center text-muted">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No conversations yet</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 border border-border rounded-xl bg-card flex flex-col">
          {activeConv ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgData?.messages?.map((m) => (
                  <div
                    key={m._id}
                    className={`flex ${m.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      m.sender._id === user?._id ? 'bg-primary text-white' : 'bg-background'
                    }`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${m.sender._id === user?._id ? 'text-white/70' : 'text-muted'}`}>
                        {formatDate(m.createdAt)}
                        {m.readBy?.length > 1 && ' · Read'}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-full border border-border bg-background outline-none focus:ring-2 focus:ring-primary/50"
                />
                <Button type="submit" disabled={!message.trim()}><Send className="w-4 h-4" /></Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
