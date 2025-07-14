import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initOpenAI } from './openai-service';
import { initDatabase, getAllChats, Chat, ChatMessage, getMessages } from '../db/chat-db';

interface AIContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isReady: boolean;
  chats: Chat[];
  currentChatId: number | null;
  setCurrentChatId: (id: number | null) => void;
  messages: ChatMessage[];
  refreshChats: () => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Initialize database and load chats
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await refreshChats();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    initialize();
  }, []);

  // Initialize OpenAI when API key changes
  useEffect(() => {
    if (apiKey) {
      try {
        initOpenAI(apiKey);
      } catch (error) {
        console.error('Failed to initialize OpenAI:', error);
      }
    }
  }, [apiKey]);

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChatId) {
      refreshMessages();
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  // Refresh the list of chats
  const refreshChats = async () => {
    try {
      const allChats = await getAllChats();
      setChats(allChats);
      
      // If we have chats but no current chat selected, select the first one
      if (allChats.length > 0 && !currentChatId) {
        setCurrentChatId(allChats[0].id || null);
      }
    } catch (error) {
      console.error('Failed to refresh chats:', error);
    }
  };

  // Refresh messages for the current chat
  const refreshMessages = async () => {
    if (!currentChatId) return;
    
    try {
      const chatMessages = await getMessages(currentChatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error(`Failed to refresh messages for chat ${currentChatId}:`, error);
    }
  };

  const value = {
    apiKey,
    setApiKey,
    isReady,
    chats,
    currentChatId,
    setCurrentChatId,
    messages,
    refreshChats,
    refreshMessages
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}; 