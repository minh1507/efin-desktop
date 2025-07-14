import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../services/ai/ai-context';
import { generateChatCompletion } from '../../services/ai/openai-service';
import { addMessage, createChat, deleteAllChats, ChatMessage } from '../../services/db/chat-db';
import { TypingAnimation } from '../../components/ai/typing-animation';
import { useLanguage } from '../../hooks/use-language';

// UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const GenAI: React.FC = () => {
  const { translate } = useLanguage();
  const { 
    apiKey, setApiKey, isReady, chats, 
    currentChatId, setCurrentChatId, 
    messages, refreshChats, refreshMessages 
  } = useAI();
  
  const [userInput, setUserInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Create a new chat
  const handleNewChat = async () => {
    try {
      const chatId = await createChat(translate('New Chat'));
      setCurrentChatId(chatId);
      await refreshChats();
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };
  
  // Delete all chats
  const handleDeleteAllChats = async () => {
    if (window.confirm(translate('Are you sure you want to delete all chats?'))) {
      try {
        await deleteAllChats();
        setCurrentChatId(null);
        await refreshChats();
      } catch (error) {
        console.error('Failed to delete all chats:', error);
      }
    }
  };
  
  // Send message to AI
  const handleSendMessage = async () => {
    if (!userInput.trim() || !apiKey || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // If no current chat, create a new one
      let chatId = currentChatId;
      if (!chatId) {
        chatId = await createChat(translate('New Chat'));
        setCurrentChatId(chatId);
        await refreshChats();
      }
      
      // Add user message to database
      const userMessage: ChatMessage = {
        chatId,
        role: 'user',
        content: userInput,
        timestamp: Date.now()
      };
      
      await addMessage(userMessage);
      setUserInput('');
      await refreshMessages();
      
      // Prepare all messages for the API call
      const chatHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      
      // Add the user's message that was just sent
      chatHistory.push({
        role: 'user',
        content: userInput
      });
      
      // Start streaming
      setStreaming(true);
      setCurrentResponse('');
      
      // Call OpenAI with streaming
      await generateChatCompletion(
        chatHistory,
        {
          onToken: (token) => {
            setCurrentResponse(prev => prev + token);
          },
          onComplete: async (fullText) => {
            setStreaming(false);
            
            // Save assistant response to database
            const assistantMessage: ChatMessage = {
              chatId,
              role: 'assistant',
              content: fullText,
              timestamp: Date.now()
            };
            
            await addMessage(assistantMessage);
            await refreshMessages();
            setCurrentResponse('');
          },
          onError: (error) => {
            console.error('Error generating response:', error);
            setStreaming(false);
            setCurrentResponse(translate('Error generating response. Please try again.'));
          }
        }
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Switch between chats
  const handleSelectChat = (chatId: number) => {
    setCurrentChatId(chatId);
  };
  
  // API Key setup UI
  const renderApiKeySetup = () => (
    <Card className="max-w-md mx-auto mt-10">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{translate('Setup OpenAI API Key')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {translate('Enter your OpenAI API key to start using the AI chat.')}
        </p>
        <Input
          type="password"
          placeholder={translate('OpenAI API Key')}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mb-4"
        />
        <p className="text-xs text-muted-foreground mb-6">
          {translate('Your API key is stored locally and never sent to our servers.')}
        </p>
      </CardContent>
    </Card>
  );
  
  // Main chat UI
  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-semibold">{translate('AI Chat')}</h1>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={handleNewChat}>
            {translate('New Chat')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeleteAllChats}>
            {translate('Clear All')}
          </Button>
        </div>
      </div>
      
      {!apiKey ? (
        renderApiKeySetup()
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Chat List Sidebar */}
          {chats.length > 0 && (
            <div className="w-64 border-r p-4 hidden md:block">
              <h2 className="font-medium mb-4">{translate('Your Chats')}</h2>
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`p-2 rounded text-sm cursor-pointer ${
                        currentChatId === chat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                      onClick={() => handleSelectChat(chat.id!)}
                    >
                      {chat.title}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <TypingAnimation content={message.content} finished={true} />
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Currently streaming response */}
                {streaming && currentResponse && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] p-3 rounded-lg bg-secondary">
                      <TypingAnimation content={currentResponse} />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={translate('Type your message...')}
                  className="resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isProcessing}
                  className="self-end"
                >
                  {isProcessing ? translate('Sending...') : translate('Send')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenAI; 