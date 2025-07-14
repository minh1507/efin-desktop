import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '../../services/ai/ai-context';
import { generateChatCompletion } from '../../services/ai/openai-service';
import { addMessage, createChat, deleteAllChats, deleteChat, ChatMessage, updateChatTitle } from '../../services/db/chat-db';
import { TypingAnimation } from '../../components/ai/typing-animation';
import { useLanguage } from '../../components/language-provider';
import { 
  getSavedModelConfigs, 
  SavedModelConfig, 
  isModelConfigUsable
} from '../../services/ai/model-config-service';
import ModelConfig from './ModelConfig';

// UI Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Label } from '../../components/ui/label';
import { 
  Settings, 
  Send, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Loader2, 
  Edit,
  Check,
  Server,
  AlertCircle,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '../../components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';

const GenAI: React.FC = () => {
  const { t } = useLanguage();
  const { 
    apiKey, setApiKey, isReady, chats, 
    currentChatId, setCurrentChatId, 
    messages, refreshChats, refreshMessages,
    modelConfig, setModelConfig
  } = useAI();
  
  const [userInput, setUserInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [streaming, setStreaming] = useState<boolean>(false);
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [newChatTitle, setNewChatTitle] = useState<string>('');
  const [savedConfigs, setSavedConfigs] = useState<SavedModelConfig[]>([]);
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [activeModelConfig, setActiveModelConfig] = useState<SavedModelConfig | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState<boolean>(false);
  const [chatToDelete, setChatToDelete] = useState<number | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load saved model configs
  useEffect(() => {
    const configs = getSavedModelConfigs();
    setSavedConfigs(configs);
    
    // If no active model config, set default
    if (!activeModelConfig) {
      const defaultConfig = configs.find(c => isModelConfigUsable(c)) || configs[0];
      setActiveModelConfig(defaultConfig);
      if (defaultConfig?.apiKey) {
        setApiKey(defaultConfig.apiKey);
        setModelConfig({
          type: defaultConfig.type,
          apiKey: defaultConfig.apiKey,
          model: defaultConfig.model,
          endpoint: defaultConfig.endpoint
        });
      }
    }
  }, []);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);
  
  // Create a new chat
  const handleNewChat = async () => {
    try {
      const chatId = await createChat(t('ai.new_chat'));
      setCurrentChatId(chatId);
      await refreshChats();
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };
  
  // Show delete all chats dialog
  const openDeleteAllChatsDialog = () => {
    setShowDeleteAllDialog(true);
  };
  
  // Delete all chats
  const handleDeleteAllChats = async () => {
    try {
      await deleteAllChats();
      setCurrentChatId(null);
      await refreshChats();
      setShowDeleteAllDialog(false);
    } catch (error) {
      console.error('Failed to delete all chats:', error);
    }
  };
  
  // Show delete chat dialog
  const openDeleteChatDialog = (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatToDelete(chatId);
    setShowDeleteDialog(true);
  };
  
  // Delete single chat
  const handleDeleteChat = async () => {
    if (chatToDelete === null) return;
    
    try {
      await deleteChat(chatToDelete);
      
      // If we deleted the current chat, set currentChatId to null
      if (currentChatId === chatToDelete) {
        setCurrentChatId(null);
      }
      
      await refreshChats();
      setShowDeleteDialog(false);
      setChatToDelete(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // Start editing chat title
  const startEditingChatTitle = (chatId: number, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setNewChatTitle(currentTitle);
  };

  // Save the edited chat title
  const saveEditedChatTitle = async () => {
    if (editingChatId && newChatTitle.trim()) {
      try {
        await updateChatTitle(editingChatId, newChatTitle.trim());
        await refreshChats();
        setEditingChatId(null);
        setNewChatTitle('');
      } catch (error) {
        console.error('Failed to update chat title:', error);
      }
    }
  };
  
  // Send message to AI
  const handleSendMessage = async () => {
    if (!userInput.trim() || !activeModelConfig?.apiKey || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // Store the current message for immediate display
      const currentMessage = userInput;
      setPendingMessage(currentMessage);
      
      // Clear input field immediately for better UX
      setUserInput('');
      
      // If no current chat, create a new one
      let chatId = currentChatId;
      if (!chatId) {
        chatId = await createChat(t('ai.new_chat'));
        setCurrentChatId(chatId);
        await refreshChats();
      }
      
      // Add user message to database
      const userMessage: ChatMessage = {
        chatId,
        role: 'user',
        content: currentMessage,
        timestamp: Date.now()
      };
      
      await addMessage(userMessage);
      await refreshMessages();
      
      // Start streaming
      setStreaming(true);
      setCurrentResponse('');
      
      // Use active model config
      const activeConfig = {
        type: activeModelConfig.type,
        apiKey: activeModelConfig.apiKey,
        model: activeModelConfig.model,
        endpoint: activeModelConfig.endpoint
      };
      
      // Call AI with streaming
      await generateChatCompletion(
        [...messages, userMessage].map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
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
            setCurrentResponse(t('ai.error_response'));
          }
        },
        { config: activeConfig }
      );
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
      // Clear the pending message since it should now be part of messages array 
      // or we've hit an error
      setPendingMessage(null);
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
  
  // Handle model selection from ModelConfig
  const handleModelSelect = (config: SavedModelConfig) => {
    setActiveModelConfig(config);
    setApiKey(config.apiKey || '');
    setModelConfig({
      type: config.type,
      apiKey: config.apiKey,
      model: config.model,
      endpoint: config.endpoint
    });
  };
  
  // Rename chat dialog
  const renderRenameChatDialog = () => (
    <Dialog open={editingChatId !== null} onOpenChange={(open) => !open && setEditingChatId(null)}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('ai.edit_chat_title')}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            placeholder={t('ai.model_name')}
            className="w-full"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditingChatId(null)}>
            {t('app.cancel')}
          </Button>
          <Button onClick={saveEditedChatTitle} disabled={!newChatTitle.trim()}>
            {t('ai.rename_chat')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Delete chat dialog
  const renderDeleteChatDialog = () => (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('ai.delete_chat')}
          </DialogTitle>
          <DialogDescription>
            {t('ai.delete_chat_confirm')}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
            {t('app.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDeleteChat}>
            {t('ai.delete_chat')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // Delete all chats dialog
  const renderDeleteAllChatsDialog = () => (
    <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            {t('ai.clear_all')}
          </DialogTitle>
          <DialogDescription>
            {t('ai.delete_confirm')}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>
            {t('app.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleDeleteAllChats}>
            {t('ai.clear_all')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
  
  // API Key setup UI
  const renderApiKeySetup = () => (
    <Card className="max-w-md mx-auto mt-10 border shadow-lg animate-in fade-in duration-300">
      <CardContent className="pt-6">
        <Tabs defaultValue="models" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="models" onClick={() => setActiveTab('models')}>
              {t('ai.model_management')}
            </TabsTrigger>
            <TabsTrigger value="chat" onClick={() => setActiveTab('chat')}>
              {t('ai.chat')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="models" className="mt-4">
            <ModelConfig onModelSelect={handleModelSelect} />
          </TabsContent>
          <TabsContent value="chat">
            <div className="text-center py-10">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary opacity-80" />
              <p className="text-lg font-medium mb-2">{t('ai.config_models_first')}</p>
              <p className="text-sm text-muted-foreground mb-6">
                {t('ai.no_usable_models')}
              </p>
              <Button onClick={() => setActiveTab('models')}>
                {t('ai.go_to_models')}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
  
  // Render Model Dropdown bên cạnh input chat
  const renderModelDropdown = () => {
    const usableModels = savedConfigs.filter(config => isModelConfigUsable(config));
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-[60px] gap-1"
          >
            <Server className="h-4 w-4" />
            <span className="max-w-[80px] text-ellipsis overflow-hidden whitespace-nowrap">
              {activeModelConfig?.name || t('ai.select_model_for_chat')}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>{t('ai.active_model')}</DropdownMenuLabel>
          
          {usableModels.length > 0 ? (
            <>
              {usableModels.map(config => (
                <DropdownMenuItem 
                  key={config.id}
                  onClick={() => handleModelSelect(config)}
                  className="flex items-center justify-between"
                >
                  <span>{config.name}</span>
                  {activeModelConfig?.id === config.id && 
                    <Check className="h-4 w-4 ml-2" />
                  }
                </DropdownMenuItem>
              ))}
            </>
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {t('ai.no_usable_models')}
            </div>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setActiveTab('models')}>
            {t('ai.go_to_models')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  // Main Chat Area - Update the render code to display the pending message
  const renderChatArea = () => {
    return (
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" type="always">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.length === 0 && !pendingMessage ? (
              <div className="text-center text-muted-foreground py-24 flex flex-col items-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">{t('ai.start_conversation')}</p>
                <p className="text-sm max-w-md opacity-70">
                  {activeModelConfig?.name ? 
                    `${t('ai.active_model')}: ${activeModelConfig.name}` : 
                    t('ai.select_model_for_chat')
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Render existing messages */}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[90%] p-4 rounded-lg shadow-md ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-card border rounded-bl-none'
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
                
                {/* Render pending user message if it exists */}
                {pendingMessage && (
                  <div className="flex justify-end">
                    <div className="max-w-[90%] p-4 rounded-lg shadow-md bg-primary text-primary-foreground rounded-br-none">
                      <div className="whitespace-pre-wrap">{pendingMessage}</div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Currently streaming response */}
            {streaming && (
              <div className="flex justify-start">
                <div className="max-w-[90%] p-4 rounded-lg shadow-md bg-card border rounded-bl-none">
                  {currentResponse ? (
                    <TypingAnimation content={currentResponse} />
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span>{t('ai.thinking')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="p-4 border-t bg-muted/20">
          <div className="flex gap-3 max-w-4xl mx-auto items-end">
            {renderModelDropdown()}
            <div className="flex-1 relative">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ai.type_message')}
                className="resize-none min-h-[60px] pr-12 shadow-sm focus:ring-1 focus:ring-primary"
                rows={1}
                disabled={isProcessing || !activeModelConfig?.apiKey}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isProcessing || !activeModelConfig?.apiKey}
                className="absolute right-2 bottom-2 h-[40px] w-[40px] p-0 rounded-full"
                size="icon"
                variant="ghost"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-xs text-center mt-2 text-muted-foreground max-w-4xl mx-auto">
            {t('ai.api_key_stored_locally')}
          </div>
        </div>
      </div>
    );
  };
  
  // Main chat UI
  return (
    <div className="flex flex-col h-screen bg-background">
      {renderRenameChatDialog()}
      {renderDeleteChatDialog()}
      {renderDeleteAllChatsDialog()}
      <div className="p-4 border-b flex justify-between items-center bg-card/50">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-primary" />
          <h1 className="text-xl font-semibold">{t('ai.chat')}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tabs value={activeTab} className="hidden sm:block">
            <TabsList>
              <TabsTrigger 
                value="chat" 
                onClick={() => setActiveTab('chat')}
                className={activeTab === 'chat' ? 'bg-primary text-primary-foreground' : ''}
              >
                {t('ai.chat')}
              </TabsTrigger>
              <TabsTrigger 
                value="models" 
                onClick={() => setActiveTab('models')}
                className={activeTab === 'models' ? 'bg-primary text-primary-foreground' : ''}
              >
                {t('ai.model_management')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {activeTab === 'chat' && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleNewChat}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('ai.new_chat')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={openDeleteAllChatsDialog}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('ai.clear_all')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          <Button 
            variant="ghost" 
            size="sm"
            className="sm:hidden"
            onClick={() => setActiveTab(activeTab === 'chat' ? 'models' : 'chat')}
          >
            {activeTab === 'chat' ? t('ai.model_management') : t('ai.chat')}
          </Button>
        </div>
      </div>
      
      {!activeModelConfig?.apiKey ? (
        renderApiKeySetup()
      ) : (
        <>
          {activeTab === 'models' ? (
            <div className="p-4 overflow-auto">
              <ModelConfig onModelSelect={handleModelSelect} />
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden">
              {/* Chat List Sidebar */}
              {chats.length > 0 && (
                <div className="w-64 border-r p-4 hidden md:block bg-muted/30">
                  <h2 className="font-medium mb-4 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('ai.your_chats')}
                  </h2>
                  <ScrollArea className="h-[calc(100vh-10rem)]" type="hover">
                    <div className="space-y-2 pr-2">
                      {chats.map((chat) => (
                        <div
                          key={chat.id}
                          className="group flex items-center justify-between"
                        >
                          <div
                            className={`flex-1 p-2 rounded-md text-sm cursor-pointer transition-colors ${
                              currentChatId === chat.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => handleSelectChat(chat.id!)}
                          >
                            {chat.title}
                          </div>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => startEditingChatTitle(chat.id!, chat.title, e)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={(e) => openDeleteChatDialog(chat.id!, e)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              {/* Main Chat Area */}
              {renderChatArea()}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GenAI;
