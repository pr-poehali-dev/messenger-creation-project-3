import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  avatar: string;
  type: 'private' | 'group' | 'channel';
  isEncrypted?: boolean;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
  isEncrypted?: boolean;
}

export default function Index() {
  const [activeSection, setActiveSection] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<string | null>('1');
  const [messageText, setMessageText] = useState('');

  const chats: Chat[] = [
    {
      id: '1',
      name: 'Алексей Петров',
      lastMessage: 'Привет! Как дела?',
      time: '14:30',
      unread: 2,
      isOnline: true,
      avatar: '👤',
      type: 'private',
      isEncrypted: true
    },
    {
      id: '2',
      name: 'Команда разработки',
      lastMessage: 'Обновление готово',
      time: '13:45',
      unread: 5,
      isOnline: false,
      avatar: '👥',
      type: 'group'
    },
    {
      id: '3',
      name: 'Новости технологий',
      lastMessage: 'Новая версия React...',
      time: '12:20',
      unread: 0,
      isOnline: false,
      avatar: '📢',
      type: 'channel'
    },
    {
      id: '4',
      name: 'Мария Иванова',
      lastMessage: 'Спасибо за помощь!',
      time: '11:15',
      unread: 0,
      isOnline: true,
      avatar: '👩',
      type: 'private',
      isEncrypted: true
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      text: 'Привет! Как дела с проектом?',
      time: '14:28',
      isOwn: false,
      isEncrypted: true
    },
    {
      id: '2',
      text: 'Всё отлично! Завтра презентация',
      time: '14:29',
      isOwn: true,
      isEncrypted: true
    },
    {
      id: '3',
      text: 'Здорово! Удачи тебе 🚀',
      time: '14:30',
      isOwn: false,
      isEncrypted: true
    }
  ];

  const sidebarSections = [
    { id: 'chats', name: 'Чаты', icon: 'MessageCircle' },
    { id: 'settings', name: 'Настройки', icon: 'Settings' },
    { id: 'profile', name: 'Профиль', icon: 'User' },
    { id: 'channels', name: 'Каналы', icon: 'Radio' }
  ];

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'group': return 'Users';
      case 'channel': return 'Radio';
      default: return 'User';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Боковая панель */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        {/* Заголовок */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="MessageCircle" size={18} className="text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Telegram</h1>
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
                onClick={() => setActiveSection(section.id)}
                className="flex-1 flex items-center gap-2"
              >
                <Icon name={section.icon as any} size={16} />
                <span className="text-xs">{section.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Поиск */}
        <div className="px-3 pb-3">
          <Input
            placeholder="Поиск чатов..."
            className="w-full"
          />
        </div>

        {/* Список чатов */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chats.map((chat) => (
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
                        {chat.avatar}
                      </div>
                    </Avatar>
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate text-foreground">
                        {chat.name}
                      </h3>
                      <div className="flex items-center gap-1 shrink-0">
                        {chat.isEncrypted && (
                          <Icon name="Shield" size={12} className="text-green-600" />
                        )}
                        <Icon name={getChatIcon(chat.type)} size={12} className="text-muted-foreground" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground mb-1">{chat.time}</p>
                    {chat.unread > 0 && (
                      <Badge variant="default" className="text-xs px-2 py-1">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Область чата */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Заголовок чата */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {chats.find(c => c.id === selectedChat)?.avatar}
                    </div>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {chats.find(c => c.id === selectedChat)?.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {chats.find(c => c.id === selectedChat)?.isOnline ? 'в сети' : 'был недавно'}
                      </p>
                      {chats.find(c => c.id === selectedChat)?.isEncrypted && (
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Icon name="Shield" size={10} />
                          Зашифровано
                        </Badge>
                      )}
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
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">{message.time}</span>
                        {message.isOwn && (
                          <Icon name="Check" size={12} className="opacity-70" />
                        )}
                        {message.isEncrypted && (
                          <Icon name="Shield" size={10} className="opacity-70" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
                <Button onClick={handleSendMessage} size="sm">
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
                Выберите чат
              </h3>
              <p className="text-muted-foreground">
                Выберите чат из списка слева для начала общения
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}