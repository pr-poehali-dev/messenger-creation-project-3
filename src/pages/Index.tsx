import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

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
  text: string;
  senderId: string;
  chatId: string;
  timestamp: string;
  isEncrypted: boolean;
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

  // Состояния для регистрации
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', displayName: '', password: '' });

  // Простая система хранения данных (имитация localStorage)
  const saveUserData = (userData: User[]) => {
    localStorage.setItem('telegram_users', JSON.stringify(userData));
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

  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat && currentUser) {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        text: messageText.trim(),
        senderId: currentUser.id,
        chatId: selectedChat,
        timestamp: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true
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
            <Button variant="ghost" size="sm" onClick={() => setCurrentUser(null)}>
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
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === currentUser.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">{message.timestamp}</span>
                          {message.senderId === currentUser.id && (
                            <Icon name="Check" size={12} className="opacity-70" />
                          )}
                          {message.isEncrypted && (
                            <Icon name="Shield" size={10} className="opacity-70" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Ввод сообщения */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  <Icon name="Paperclip" size={18} />
                </Button>
                <Input
                  placeholder="Напишите сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" disabled={!messageText.trim()}>
                  <Icon name="Send" size={18} />
                </Button>
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