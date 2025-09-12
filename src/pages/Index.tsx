import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  bio?: string;
  phone?: string;
  email?: string;
  joinedAt?: string;
}

interface Chat {
  id: string;
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
}

interface Message {
  id: string;
  text?: string;
  senderId: string;
  chatId: string;
  timestamp: string;
  isEncrypted: boolean;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  encryptedData?: string;
}

export default function Index() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Состояния для регистрации
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', displayName: '', password: '' });

  // Ключ шифрования (в реальном приложении должен генерироваться безопасно)
  const ENCRYPTION_KEY = 'telegram-secret-key-2024';

  // Система шифрования
  const encryptMessage = (message: string): string => {
    return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
  };

  const decryptMessage = (encryptedMessage: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      return 'Сообщение не удалось расшифровать';
    }
  };

  // Система куки и хранения данных
  const saveUserToCookies = (user: User) => {
    Cookies.set('telegram_user', JSON.stringify(user), { expires: 30 }); // 30 дней
  };

  const loadUserFromCookies = (): User | null => {
    const userCookie = Cookies.get('telegram_user');
    return userCookie ? JSON.parse(userCookie) : null;
  };

  const clearUserCookies = () => {
    Cookies.remove('telegram_user');
  };

  // Простая система хранения данных
  const saveUserData = (userData: User[]) => {
    localStorage.setItem('telegram_users', JSON.stringify(userData));
  };

  const saveMessages = (messages: Message[]) => {
    // Шифруем сообщения перед сохранением
    const encryptedMessages = messages.map(msg => ({
      ...msg,
      text: msg.text ? encryptMessage(msg.text) : undefined,
      isEncrypted: true
    }));
    localStorage.setItem('telegram_messages', JSON.stringify(encryptedMessages));
  };

  const loadMessages = (): Message[] => {
    const saved = localStorage.getItem('telegram_messages');
    if (!saved) return [];
    
    const encryptedMessages: Message[] = JSON.parse(saved);
    // Расшифровываем сообщения при загрузке
    return encryptedMessages.map(msg => ({
      ...msg,
      text: msg.text ? decryptMessage(msg.text) : undefined
    }));
  };

  const loadUserData = (): User[] => {
    const saved = localStorage.getItem('telegram_users');
    return saved ? JSON.parse(saved) : [
      { 
        id: '2', 
        username: 'alex_dev', 
        displayName: 'Алексей Разработчик', 
        avatar: '👨‍💻', 
        isOnline: true,
        bio: 'Frontend разработчик с 5-летним опытом',
        email: 'alex@example.com',
        joinedAt: '2023-01-15'
      },
      { 
        id: '3', 
        username: 'maria_design', 
        displayName: 'Мария Дизайнер', 
        avatar: '👩‍🎨', 
        isOnline: false, 
        lastSeen: '2 часа назад',
        bio: 'UI/UX дизайнер, создаю красивые интерфейсы',
        email: 'maria@example.com',
        joinedAt: '2023-02-20'
      },
      { 
        id: '4', 
        username: 'ivan_pm', 
        displayName: 'Иван Менеджер', 
        avatar: '👨‍💼', 
        isOnline: true,
        bio: 'Project Manager, люблю эффективность',
        phone: '+7 (999) 123-45-67',
        joinedAt: '2023-03-10'
      },
      { 
        id: '5', 
        username: 'kate_qa', 
        displayName: 'Катя Тестировщик', 
        avatar: '👩‍🔬', 
        isOnline: false, 
        lastSeen: '1 день назад',
        bio: 'QA Engineer, ищу баги везде',
        email: 'kate@example.com',
        joinedAt: '2023-01-30'
      },
    ];
  };

  const [mockUsers, setMockUsers] = useState<User[]>(loadUserData());

  // Автоматический вход при загрузке
  useEffect(() => {
    const savedUser = loadUserFromCookies();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    // Загружаем сообщения
    setMessages(loadMessages());
  }, []);

  // Сохраняем сообщения при изменении
  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages]);

  const updateUserProfile = (updatedUser: User) => {
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      // Обновляем в списке пользователей
      const updatedUsers = mockUsers.map(u => u.id === updatedUser.id ? updatedUser : u);
      setMockUsers(updatedUsers);
      saveUserData(updatedUsers);
    }
  };

  const handleLogin = () => {
    if (loginData.username && loginData.password) {
      const user: User = {
        id: '1',
        username: loginData.username,
        displayName: loginData.username,
        avatar: '😊',
        isOnline: true,
        bio: '',
        joinedAt: new Date().toISOString().split('T')[0]
      };
      setCurrentUser(user);
      saveUserToCookies(user);
      setLoginData({ username: '', password: '' });
    }
  };

  const handleRegister = () => {
    if (registerData.username && registerData.displayName && registerData.password) {
      const user: User = {
        id: Date.now().toString(),
        username: registerData.username,
        displayName: registerData.displayName,
        avatar: '😊',
        isOnline: true,
        bio: '',
        joinedAt: new Date().toISOString().split('T')[0]
      };
      setCurrentUser(user);
      saveUserToCookies(user);
      // Добавляем нового пользователя в список
      const updatedUsers = [...mockUsers, user];
      setMockUsers(updatedUsers);
      saveUserData(updatedUsers);
      setRegisterData({ username: '', displayName: '', password: '' });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = mockUsers.filter(user => 
        user.username.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const startChat = (user: User) => {
    const existingChat = chats.find(chat => chat.participant.id === user.id);
    
    if (existingChat) {
      setSelectedChat(existingChat.id);
    } else {
      const newChat: Chat = {
        id: `chat_${Date.now()}`,
        participant: user,
        unreadCount: 0,
        createdAt: new Date().toISOString()
      };
      setChats(prev => [...prev, newChat]);
      setSelectedChat(newChat.id);
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // Обработка фото
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedChat && currentUser) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const newMessage: Message = {
          id: `msg_${Date.now()}`,
          senderId: currentUser.id,
          chatId: selectedChat,
          timestamp: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
          isEncrypted: true,
          type: 'image',
          imageUrl: imageUrl
        };
        
        setMessages(prev => [...prev, newMessage]);
        setChats(prev => prev.map(chat => 
          chat.id === selectedChat 
            ? { ...chat, lastMessage: { ...newMessage, text: '📷 Фото' } }
            : chat
        ));
      };
      reader.readAsDataURL(file);
    }
    // Сброс input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Запись голосового сообщения
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (selectedChat && currentUser) {
          const newMessage: Message = {
            id: `msg_${Date.now()}`,
            senderId: currentUser.id,
            chatId: selectedChat,
            timestamp: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
            isEncrypted: true,
            type: 'voice',
            voiceUrl: audioUrl,
            voiceDuration: recordingTime
          };
          
          setMessages(prev => [...prev, newMessage]);
          setChats(prev => prev.map(chat => 
            chat.id === selectedChat 
              ? { ...chat, lastMessage: { ...newMessage, text: '🎤 Голосовое сообщение' } }
              : chat
          ));
        }
        
        // Остановка всех треков
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Счетчик времени записи
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
      alert('Не удалось получить доступ к микрофону');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat && currentUser) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        text: messageText.trim(),
        senderId: currentUser.id,
        chatId: selectedChat,
        timestamp: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true,
        type: 'text'
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Обновляем последнее сообщение в чате
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat 
          ? { ...chat, lastMessage: newMessage }
          : chat
      ));
      
      setMessageText('');
    }
  };

  const getCurrentChat = () => {
    return chats.find(chat => chat.id === selectedChat);
  };

  const getChatMessages = () => {
    return messages.filter(msg => msg.chatId === selectedChat);
  };

  const showUserProfile = (user: User) => {
    setSelectedUserProfile(user);
    setIsProfileOpen(true);
  };

  const sidebarSections = [
    { id: 'chats', name: 'Чаты', icon: 'MessageCircle' },
    { id: 'settings', name: 'Настройки', icon: 'Settings', onClick: () => setIsSettingsOpen(true) },
    { id: 'profile', name: 'Профиль', icon: 'User', onClick: () => currentUser && showUserProfile(currentUser) },
    { id: 'channels', name: 'Каналы', icon: 'Radio' }
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="MessageCircle" size={32} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Telegram</h1>
            <p className="text-muted-foreground">Войдите или создайте аккаунт</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <Input
                placeholder="Имя пользователя"
                value={loginData.username}
                onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={loginData.password}
                onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
              />
              <Button onClick={handleLogin} className="w-full">
                Войти
              </Button>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <Input
                placeholder="Имя пользователя"
                value={registerData.username}
                onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
              />
              <Input
                placeholder="Отображаемое имя"
                value={registerData.displayName}
                onChange={(e) => setRegisterData(prev => ({ ...prev, displayName: e.target.value }))}
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={registerData.password}
                onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
              />
              <Button onClick={handleRegister} className="w-full">
                Зарегистрироваться
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Боковая панель */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="MessageCircle" size={18} className="text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Telegram</h1>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              setCurrentUser(null);
              clearUserCookies();
            }}>
              <Icon name="LogOut" size={16} />
            </Button>
          </div>
        </div>

        {/* Профиль пользователя */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <div className="w-full h-full flex items-center justify-center text-lg">
                {currentUser.avatar}
              </div>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-foreground text-sm">{currentUser.displayName}</p>
              <p className="text-xs text-muted-foreground">@{currentUser.username}</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {/* Навигация */}
        <div className="p-3">
          <div className="flex gap-1">
            {sidebarSections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  if (section.onClick) {
                    section.onClick();
                  } else {
                    setActiveSection(section.id);
                  }
                }}
                className="flex-1 flex items-center gap-2"
              >
                <Icon name={section.icon as any} size={16} />
                <span className="text-xs">{section.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Поиск и новый чат */}
        <div className="px-3 pb-3 flex gap-2">
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Icon name="Search" size={16} className="mr-2" />
                Найти людей
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Поиск пользователей</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Введите имя или @username"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  autoFocus
                />
                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <Card
                        key={user.id}
                        className="p-3 cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => startChat(user)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar 
                              className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                              onClick={(e) => {
                                e.stopPropagation();
                                showUserProfile(user);
                                setIsSearchOpen(false);
                              }}
                            >
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                {user.avatar}
                              </div>
                            </Avatar>
                            {user.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                            {!user.isOnline && user.lastSeen && (
                              <p className="text-xs text-muted-foreground">{user.lastSeen}</p>
                            )}
                          </div>
                          {user.isOnline && (
                            <Badge variant="secondary" className="text-xs">В сети</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                    {searchQuery && searchResults.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Пользователи не найдены
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Список чатов */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="MessageCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Нет активных чатов
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Найдите людей и начните общение
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <Card
                  key={chat.id}
                  className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedChat === chat.id ? 'bg-accent border-primary' : 'border-border'
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          {chat.participant.avatar}
                        </div>
                      </Avatar>
                      {chat.participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate text-foreground">
                          {chat.participant.displayName}
                        </h3>
                        <Icon name="Shield" size={12} className="text-green-600" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {chat.lastMessage?.text || 'Начните общение'}
                      </p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      {chat.lastMessage && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {chat.lastMessage.timestamp}
                        </p>
                      )}
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="text-xs px-2 py-1">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Область чата */}
      <div className="flex-1 flex flex-col">
        {selectedChat && getCurrentChat() ? (
          <>
            {/* Заголовок чата */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => getCurrentChat()?.participant && showUserProfile(getCurrentChat()!.participant)}
                  >
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {getCurrentChat()?.participant.avatar}
                    </div>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {getCurrentChat()?.participant.displayName}
                    </h2>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {getCurrentChat()?.participant.isOnline ? 'в сети' : getCurrentChat()?.participant.lastSeen || 'был недавно'}
                      </p>
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <Icon name="Shield" size={10} />
                        Зашифровано
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Icon name="Phone" size={18} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Icon name="Video" size={18} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Icon name="MoreVertical" size={18} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Сообщения */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl">
                {getChatMessages().length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="Lock" size={48} className="mx-auto text-green-600 mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">
                      Зашифрованный чат
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Сообщения в этом чате защищены сквозным шифрованием
                    </p>
                  </div>
                ) : (
                  getChatMessages().map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <MessageBubble 
                        message={message} 
                        isOwn={message.senderId === currentUser.id}
                      />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Ввод сообщения */}
            <div className="p-4 border-t border-border bg-card">
              {isRecording && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-red-700 dark:text-red-300">
                        Запись: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <Button onClick={stopRecording} size="sm" variant="outline">
                      <Icon name="Square" size={16} className="mr-1" />
                      Остановить
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {/* Скрытый input для файлов */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {/* Кнопка для фото */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  title="Отправить фото"
                >
                  <Icon name="Image" size={18} />
                </Button>
                
                <Input
                  placeholder="Напишите сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isRecording && handleSendMessage()}
                  className="flex-1"
                  disabled={isRecording}
                />
                
                {/* Кнопка голосового сообщения */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={isRecording ? 'bg-red-500 text-white hover:bg-red-600' : ''}
                  title={isRecording ? 'Остановить запись' : 'Записать голосовое сообщение'}
                >
                  <Icon name={isRecording ? "Square" : "Mic"} size={18} />
                </Button>
                
                {/* Кнопка отправки */}
                {!isRecording && (
                  <Button 
                    onClick={handleSendMessage} 
                    size="sm" 
                    disabled={!messageText.trim()}
                    title="Отправить сообщение"
                  >
                    <Icon name="Send" size={18} />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Icon name="MessageCircle" size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Добро пожаловать, {currentUser.displayName}!
              </h3>
              <p className="text-muted-foreground mb-4">
                Найдите людей и начните общение
              </p>
              <Button onClick={() => setIsSearchOpen(true)}>
                <Icon name="Search" size={18} className="mr-2" />
                Найти пользователей
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно профиля */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Профиль пользователя</DialogTitle>
          </DialogHeader>
          {selectedUserProfile && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {selectedUserProfile.avatar}
                    </div>
                  </Avatar>
                  {selectedUserProfile.isOnline && (
                    <div className="absolute bottom-3 right-3 w-6 h-6 bg-green-500 rounded-full border-4 border-background"></div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground">{selectedUserProfile.displayName}</h2>
                <p className="text-muted-foreground">@{selectedUserProfile.username}</p>
                {selectedUserProfile.isOnline ? (
                  <Badge variant="default" className="mt-2">В сети</Badge>
                ) : selectedUserProfile.lastSeen && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedUserProfile.lastSeen}</p>
                )}
              </div>

              {selectedUserProfile.bio && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">О себе</h3>
                  <p className="text-muted-foreground">{selectedUserProfile.bio}</p>
                </div>
              )}

              <div className="space-y-2">
                {selectedUserProfile.email && (
                  <div className="flex items-center gap-3">
                    <Icon name="Mail" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedUserProfile.email}</span>
                  </div>
                )}
                {selectedUserProfile.phone && (
                  <div className="flex items-center gap-3">
                    <Icon name="Phone" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{selectedUserProfile.phone}</span>
                  </div>
                )}
                {selectedUserProfile.joinedAt && (
                  <div className="flex items-center gap-3">
                    <Icon name="Calendar" size={16} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">Регистрация: {new Date(selectedUserProfile.joinedAt).toLocaleDateString('ru')}</span>
                  </div>
                )}
              </div>

              {selectedUserProfile.id !== currentUser?.id && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => {
                    startChat(selectedUserProfile);
                    setIsProfileOpen(false);
                  }} className="flex-1">
                    <Icon name="MessageCircle" size={16} className="mr-2" />
                    Написать
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    В друзья
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно настроек профиля */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Настройки профиля</DialogTitle>
          </DialogHeader>
          {currentUser && (
            <ProfileSettings 
              user={currentUser} 
              onUpdate={updateUserProfile}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Компонент для настроек профиля
interface ProfileSettingsProps {
  user: User;
  onUpdate: (user: User) => void;
  onClose: () => void;
}

function ProfileSettings({ user, onUpdate, onClose }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    displayName: user.displayName,
    bio: user.bio || '',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar
  });
  const [avatarInput, setAvatarInput] = useState('');

  const handleSave = () => {
    const updatedUser: User = {
      ...user,
      displayName: formData.displayName,
      bio: formData.bio,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar
    };
    onUpdate(updatedUser);
    onClose();
  };

  const handleAvatarChange = () => {
    if (avatarInput.trim()) {
      setFormData(prev => ({ ...prev, avatar: avatarInput.trim() }));
      setAvatarInput('');
    }
  };

  const predefinedAvatars = ['😊', '😎', '🚀', '⭐', '🎯', '💎', '🔥', '⚡', '🌟', '🎨', '🎭', '🎪', '🎨', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬'];

  return (
    <div className="space-y-4">
      {/* Аватар */}
      <div className="text-center">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {formData.avatar}
          </div>
        </Avatar>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Введите emoji или ссылку на картинку"
              value={avatarInput}
              onChange={(e) => setAvatarInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAvatarChange} size="sm">
              <Icon name="Check" size={16} />
            </Button>
          </div>
          
          <div className="grid grid-cols-10 gap-1">
            {predefinedAvatars.map((emoji, index) => (
              <button
                key={index}
                onClick={() => setFormData(prev => ({ ...prev, avatar: emoji }))}
                className="w-8 h-8 text-lg hover:bg-accent rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Основная информация */}
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Отображаемое имя
          </label>
          <Input
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            О себе
          </label>
          <Input
            placeholder="Расскажите о себе..."
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Email
          </label>
          <Input
            type="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">
            Телефон
          </label>
          <Input
            placeholder="+7 (999) 123-45-67"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          <Icon name="Save" size={16} className="mr-2" />
          Сохранить
        </Button>
        <Button variant="outline" onClick={onClose} className="flex-1">
          Отмена
        </Button>
      </div>
    </div>
  );
}

// Компонент для отображения сообщений
interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const playVoiceMessage = () => {
    if (message.voiceUrl) {
      const audio = new Audio(message.voiceUrl);
      setIsPlaying(true);
      
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        alert('Ошибка воспроизведения голосового сообщения');
      };
      
      audio.play().catch(() => {
        setIsPlaying(false);
        alert('Не удалось воспроизвести голосовое сообщение');
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
      isOwn
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground'
    }`}>
      {/* Текстовое сообщение */}
      {message.type === 'text' && message.text && (
        <p className="text-sm">{message.text}</p>
      )}

      {/* Фото */}
      {message.type === 'image' && message.imageUrl && (
        <div className="space-y-2">
          <img 
            src={message.imageUrl} 
            alt="Изображение"
            className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.imageUrl, '_blank')}
          />
        </div>
      )}

      {/* Голосовое сообщение */}
      {message.type === 'voice' && message.voiceUrl && (
        <div className="flex items-center gap-3 min-w-[200px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={playVoiceMessage}
            disabled={isPlaying}
            className={`rounded-full p-2 ${isOwn ? 'hover:bg-primary-foreground/20' : 'hover:bg-background/20'}`}
          >
            <Icon name={isPlaying ? "Pause" : "Play"} size={16} />
          </Button>
          
          <div className="flex-1">
            <div className={`h-1 rounded-full ${isOwn ? 'bg-primary-foreground/30' : 'bg-foreground/30'} relative`}>
              <div className={`h-full rounded-full ${isOwn ? 'bg-primary-foreground' : 'bg-foreground'} w-0 transition-all duration-300`}></div>
            </div>
          </div>
          
          <span className="text-xs opacity-70">
            {message.voiceDuration ? formatDuration(message.voiceDuration) : '0:00'}
          </span>
        </div>
      )}

      {/* Метаданные сообщения */}
      <div className="flex items-center justify-end gap-1 mt-1">
        <span className="text-xs opacity-70">{message.timestamp}</span>
        {isOwn && (
          <Icon name="Check" size={12} className="opacity-70" />
        )}
        {message.isEncrypted && (
          <Icon name="Shield" size={10} className="opacity-70" />
        )}
      </div>
    </div>
  );
}