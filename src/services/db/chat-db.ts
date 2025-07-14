import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

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

// Database initialization
let db: any = null;

export async function initDatabase() {
  if (db) return db;
  
  db = await open({
    filename: 'chats.db',
    driver: sqlite3.Database
  });
  
  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chatId INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      FOREIGN KEY (chatId) REFERENCES chats (id) ON DELETE CASCADE
    );
  `);
  
  return db;
}

// Chat operations
export async function createChat(title: string): Promise<number> {
  const db = await initDatabase();
  const result = await db.run(
    'INSERT INTO chats (title, createdAt) VALUES (?, ?)',
    title, Date.now()
  );
  return result.lastID;
}

export async function getAllChats(): Promise<Chat[]> {
  const db = await initDatabase();
  return db.all('SELECT * FROM chats ORDER BY createdAt DESC');
}

export async function deleteChat(chatId: number): Promise<void> {
  const db = await initDatabase();
  await db.run('DELETE FROM chats WHERE id = ?', chatId);
}

export async function deleteAllChats(): Promise<void> {
  const db = await initDatabase();
  await db.run('DELETE FROM messages');
  await db.run('DELETE FROM chats');
}

// Message operations
export async function addMessage(message: ChatMessage): Promise<number> {
  const db = await initDatabase();
  const result = await db.run(
    'INSERT INTO messages (chatId, role, content, timestamp) VALUES (?, ?, ?, ?)',
    message.chatId, message.role, message.content, message.timestamp || Date.now()
  );
  return result.lastID;
}

export async function getMessages(chatId: number): Promise<ChatMessage[]> {
  const db = await initDatabase();
  return db.all('SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC', chatId);
}

export async function updateChatTitle(chatId: number, title: string): Promise<void> {
  const db = await initDatabase();
  await db.run('UPDATE chats SET title = ? WHERE id = ?', title, chatId);
} 