// Creating a simpler in-memory database since wa-sqlite has import issues
// We'll store everything in memory with basic operations

// Define types for chat data
export interface ChatMessage {
  id?: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Chat {
  id?: number;
  title: string;
  createdAt: number;
}

// Simple in-memory database implementation
let memoryDb: { 
  initialized: boolean;
  chats: Chat[];
  messages: ChatMessage[];
  lastChatId: number;
  lastMessageId: number;
} = {
  initialized: false,
  chats: [],
  messages: [],
  lastChatId: 0,
  lastMessageId: 0
};

export async function initDatabase() {
  if (!memoryDb.initialized) {
    console.log('Initializing in-memory database');
    // Load from localStorage if available
    try {
      const savedChats = localStorage.getItem('ai-chats');
      const savedMessages = localStorage.getItem('ai-messages');
      
      if (savedChats) {
        memoryDb.chats = JSON.parse(savedChats);
        memoryDb.lastChatId = memoryDb.chats.reduce((max, chat) => 
          chat.id && chat.id > max ? chat.id : max, 0);
      }
      
      if (savedMessages) {
        memoryDb.messages = JSON.parse(savedMessages);
        memoryDb.lastMessageId = memoryDb.messages.reduce((max, msg) => 
          msg.id && msg.id > max ? msg.id : max, 0);
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
    }
    
    memoryDb.initialized = true;
  }
  
  return memoryDb;
}

// Helper function to save DB to localStorage
function saveToLocalStorage() {
  try {
    localStorage.setItem('ai-chats', JSON.stringify(memoryDb.chats));
    localStorage.setItem('ai-messages', JSON.stringify(memoryDb.messages));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

// Chat operations
export async function createChat(title: string): Promise<number> {
  await initDatabase();
  
  const id = ++memoryDb.lastChatId;
  const createdAt = Date.now();
  
  memoryDb.chats.push({ id, title, createdAt });
  saveToLocalStorage();
  
  return id;
}

export async function getAllChats(): Promise<Chat[]> {
  await initDatabase();
  
  // Return a sorted copy
  return [...memoryDb.chats].sort((a, b) => 
    (b.createdAt || 0) - (a.createdAt || 0)
  );
}

export async function deleteChat(chatId: number): Promise<void> {
  await initDatabase();
  
  memoryDb.chats = memoryDb.chats.filter(chat => chat.id !== chatId);
  memoryDb.messages = memoryDb.messages.filter(msg => msg.chatId !== chatId);
  
  saveToLocalStorage();
}

export async function deleteAllChats(): Promise<void> {
  await initDatabase();
  
  memoryDb.chats = [];
  memoryDb.messages = [];
  
  saveToLocalStorage();
}

// Message operations
export async function addMessage(message: ChatMessage): Promise<number> {
  await initDatabase();
  
  const id = ++memoryDb.lastMessageId;
  const newMessage = { ...message, id };
  
  memoryDb.messages.push(newMessage);
  saveToLocalStorage();
  
  return id;
}

export async function getMessages(chatId: number): Promise<ChatMessage[]> {
  await initDatabase();
  
  return memoryDb.messages
    .filter(msg => msg.chatId === chatId)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

export async function updateChatTitle(chatId: number, title: string): Promise<void> {
  await initDatabase();
  
  const chat = memoryDb.chats.find(chat => chat.id === chatId);
  if (chat) {
    chat.title = title;
    saveToLocalStorage();
  }
} 