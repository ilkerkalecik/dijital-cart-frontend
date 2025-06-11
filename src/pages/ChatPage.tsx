import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client/dist/sockjs.js';
import { Client } from '@stomp/stompjs';
import type { IMessage } from '@stomp/stompjs';
import { api } from '../api';
import type { Message, User } from '../api';

const ChatPage: React.FC = () => {
  const { otherUserId } = useParams<{ otherUserId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);    
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const clientRef = useRef<Client | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load IDs
  useEffect(() => {
    api.getCurrentUserId().then(res => setCurrentUserId(res.data));
    if (otherUserId) {
      api.getUserById(Number(otherUserId)).then(res => setOtherUser(res.data));
    }
  }, [otherUserId]);

  // Load conversation history
  const loadHistory = useCallback(() => {
    if (!otherUserId) return;
    api.getConversation(Number(otherUserId)).then(res => setMessages(res.data));
  }, [otherUserId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Poll for new messages every second
  useEffect(() => {
    const interval = setInterval(loadHistory, 1000);
    return () => clearInterval(interval);
  }, [loadHistory]);

  // STOMP WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !otherUserId || currentUserId === null) return;
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/messages', (msg: IMessage) => {
          loadHistory();
        });
      },
    });
    client.activate();
    clientRef.current = client;
    return () => client.deactivate();
  }, [otherUserId, currentUserId, loadHistory]);

  // Auto-scroll handling
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    setAutoScrollEnabled(atBottom);
  }, []);

  useEffect(() => {
    if (autoScrollEnabled && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, autoScrollEnabled]);

  // Send message
  const sendMessage = () => {
    if (!clientRef.current || !input.trim() || !otherUserId) return;
    clientRef.current.publish({
      destination: '/app/chat',
      body: JSON.stringify({ recipientId: Number(otherUserId), text: input.trim() }),
    });
    setInput('');
    loadHistory();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="p-4 bg-white shadow">
         {otherUser ? `${otherUser.name.trim()} ${otherUser.surname.trim()}` : `(${otherUserId})`} ile sohbet
      </header>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map(msg => {
          const isMe = msg.sender.id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-xs">
                <div className="text-xs text-gray-500 mb-1">
                  {msg.sender.name.trim()} {msg.sender.surname.trim()}
                </div>
                <div
                  className={`
                    px-4 py-2 rounded-lg shadow
                    ${isMe ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}
                  `}
                >
                  <div>{msg.content}</div>
                  <div className="text-[10px] text-gray-400 mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString('tr-TR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-white flex">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Mesajınızı yazın..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="ml-3 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:opacity-90 focus:outline-none focus:ring"
        >
          Gönder
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
