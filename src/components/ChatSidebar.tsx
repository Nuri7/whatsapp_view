import React, { useCallback, useState } from 'react';
import type { Chat, ChatMessage } from '../types';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { MessageSquare, LogOut, Plus, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import * as whatsappChatParser from 'whatsapp-chat-parser';

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (id: string) => void;
  onLogout?: () => void;
  username?: string | null;
  onChatsLoaded?: (chats: Chat[]) => void;
}

export function ChatSidebar({ chats, selectedChatId, onSelectChat, onLogout, username, onChatsLoaded }: SidebarProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!onChatsLoaded) return;
    setLoading(true);
    const loadedChats: Chat[] = [];

    try {
      for (const file of acceptedFiles) {
        if (!file.name.endsWith('.txt')) continue;

        const text = await file.text();
        const parsed = whatsappChatParser.parseString(text, { parseAttachments: true });
        
        if (!parsed || parsed.length === 0) continue;

        const participantsSet = new Set<string>();
        parsed.forEach((msg) => {
          if (msg.author && msg.author !== 'System') {
            participantsSet.add(msg.author);
          }
        });
        const participants = Array.from(participantsSet);

        let name = file.name.replace('.txt', '').replace('WhatsApp Chat with ', '').trim();
        if (!name) name = 'Unknown Chat';

        loadedChats.push({
          id: Math.random().toString(36).substring(7),
          name,
          participants,
          messages: parsed as ChatMessage[],
          owner: null,
        });
      }

      if (loadedChats.length > 0) {
        onChatsLoaded(loadedChats);
      } else {
        alert('No valid WhatsApp chat logs found in the dropped files.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while parsing the file.');
    } finally {
      setLoading(false);
    }
  }, [onChatsLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt']
    }
  });

  return (
    <div className="w-[30%] min-w-[300px] border-r border-whatsapp-border bg-whatsapp-panel flex flex-col h-full">
      <div className="h-16 px-4 flex items-center justify-between bg-whatsapp-panel border-b border-whatsapp-border shrink-0">
        <h2 className="text-xl font-semibold text-whatsapp-text">Chats</h2>
        
        {username && (
          <div className="flex items-center gap-3">
            <div className="text-xs text-whatsapp-muted max-w-[120px] truncate" title={username}>
              <span className="opacity-60 text-[10px] uppercase">user:</span> {username}
            </div>
            {onLogout && (
              <button onClick={onLogout} title="Logout" className="p-2 text-whatsapp-muted hover:text-whatsapp-text hover:bg-whatsapp-bg rounded-full transition-colors active:scale-95">
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      <div 
        {...getRootProps()} 
        className={cn(
          "p-3 border-b-2 border-dashed border-whatsapp-border/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-whatsapp-panel/50 hover:bg-whatsapp-bg shrink-0",
          isDragActive && "bg-whatsapp-bg border-whatsapp-highlight text-whatsapp-highlight"
        )}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-whatsapp-muted py-2">
            <Loader2 className="w-4 h-4 animate-spin text-whatsapp-highlight" />
            Loading chats...
          </div>
        ) : (
          <div className={cn("flex flex-col items-center justify-center py-1 opacity-70 hover:opacity-100 transition-opacity", isDragActive && "opacity-100")}>
             <div className="bg-whatsapp-bg p-2 rounded-full mb-2">
                <Plus className={cn("w-5 h-5 text-whatsapp-muted", isDragActive && "text-whatsapp-highlight")} />
             </div>
             <span className="text-xs text-whatsapp-muted text-center leading-snug">
               {isDragActive ? "Drop the .txt files here" : "Drag & Drop .txt exports here\n or click to add another chat"}
             </span>
          </div>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        {chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-whatsapp-muted p-4 text-center">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p>No chats uploaded yet</p>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={cn(
                "flex items-center gap-4 p-3 cursor-pointer hover:bg-whatsapp-bg transition-colors border-b border-whatsapp-border/50",
                selectedChatId === chat.id && "bg-whatsapp-bg"
              )}
            >
              <Avatar className="w-12 h-12 shrink-0">
                <AvatarFallback className="bg-whatsapp-border text-whatsapp-text">
                  {chat.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-medium truncate text-whatsapp-text">{chat.name}</h3>
                  {chat.messages.length > 0 && (
                    <span className="text-xs text-whatsapp-muted shrink-0">
                      {new Date(chat.messages[chat.messages.length - 1].date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {chat.messages.length > 0 && (
                  <p className="text-sm truncate text-whatsapp-muted">
                    {chat.messages[chat.messages.length - 1].message}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
