import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Chat } from '../types';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Download, Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface ChatViewProps {
  chat: Chat;
}

export function ChatView({ chat }: ChatViewProps) {
  const [search, setSearch] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset search when chat changes
  useEffect(() => {
    setSearch('');
    setCurrentMatchIndex(0);
  }, [chat.id]);

  const messagesWithFormatting = useMemo(() => {
    let lastDate: Date | null = null;
    let matchCount = 0;
    
    // Clear refs on rebuild
    matchRefs.current = [];

    const result = chat.messages.map((msg, index) => {
      const msgDate = new Date(msg.date);
      let showDateSeparator = false;
      let dateString = '';

      if (!lastDate || !isSameDay(lastDate, msgDate)) {
        showDateSeparator = true;
        if (isToday(msgDate)) {
          dateString = 'TODAY';
        } else if (isYesterday(msgDate)) {
          dateString = 'YESTERDAY';
        } else {
          dateString = format(msgDate, 'dd/MM/yyyy');
        }
      }
      lastDate = msgDate;

      const isOwner = msg.author === chat.owner;
      const showAuthor = !isOwner && (index === 0 || chat.messages[index - 1].author !== msg.author || showDateSeparator);

      const searchLower = search.toLowerCase();
      const isMatch = searchLower && msg.message && msg.message.toLowerCase().includes(searchLower);
      
      let localMatchIndex = -1;
      if (isMatch) {
        localMatchIndex = matchCount;
        matchCount++;
      }

      return {
        ...msg,
        msgDate,
        showDateSeparator,
        dateString,
        isOwner,
        showAuthor,
        isMatch,
        localMatchIndex,
        originalIndex: index
      };
    });

    return { messages: result, totalMatches: matchCount };
  }, [chat, search]);

  useEffect(() => {
    if (messagesWithFormatting.totalMatches > 0 && matchRefs.current[currentMatchIndex]) {
      matchRefs.current[currentMatchIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentMatchIndex, messagesWithFormatting.totalMatches]);

  const handleNextMatch = () => {
    setCurrentMatchIndex(prev => (prev + 1) % messagesWithFormatting.totalMatches);
  };

  const handlePrevMatch = () => {
    setCurrentMatchIndex(prev => (prev - 1 + messagesWithFormatting.totalMatches) % messagesWithFormatting.totalMatches);
  };

  const exportChatToHTML = async () => {
    if (!chatContainerRef.current) return;
    
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          console.warn('Access to stylesheet nullified by CORS or similar', e);
          return '';
        }
      })
      .filter(Boolean)
      .join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en" class="dark">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat Export - ${chat.name}</title>
        <style>
          ${styles}
          body { margin: 0; padding: 0; background-color: #0b141a; color: #e9edef; font-family: system-ui, -apple-system, sans-serif; }
          .export-container { max-w-[800px]; margin: 0 auto; height: 100vh; display: flex; flex-direction: column; }
          .hide-on-export { display: none !important; }
        </style>
      </head>
      <body>
        <div class="export-container">
          ${chatContainerRef.current.outerHTML}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-chat-${chat.name.replace(/\\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-whatsapp-bg relative">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between bg-whatsapp-panel border-b border-whatsapp-border/60 shrink-0 z-10 w-full">
        <div className="flex items-center gap-3 w-1/3">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarFallback className="bg-whatsapp-border text-whatsapp-text">
              {chat.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-col">
            <h2 className="font-semibold text-whatsapp-text truncate">{chat.name}</h2>
            <p className="text-xs text-whatsapp-muted truncate">
              {chat.participants.join(', ')}
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-4 relative overflow-visible flex items-center gap-2 hide-on-export">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-whatsapp-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in chat..."
              className="pl-9 bg-whatsapp-bg border-none rounded-lg text-sm text-whatsapp-text placeholder:text-whatsapp-muted focus-visible:ring-1 focus-visible:ring-whatsapp-highlight h-10 w-full"
            />
            {search && (
              <X 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-whatsapp-muted cursor-pointer hover:text-whatsapp-text" 
                onClick={() => setSearch('')}
              />
            )}
          </div>
          
          {search && (
            <div className="flex items-center gap-2 text-sm text-whatsapp-muted bg-whatsapp-bg px-3 py-1.5 rounded-lg whitespace-nowrap">
              <span>
                {messagesWithFormatting.totalMatches > 0 ? `${currentMatchIndex + 1} of ${messagesWithFormatting.totalMatches}` : '0 matches'}
              </span>
              <div className="flex border-l border-whatsapp-border pl-2 gap-1 ml-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-whatsapp-muted hover:text-whatsapp-text" onClick={handlePrevMatch} disabled={messagesWithFormatting.totalMatches === 0}>
                   <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-whatsapp-muted hover:text-whatsapp-text" onClick={handleNextMatch} disabled={messagesWithFormatting.totalMatches === 0}>
                   <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 w-1/3 justify-end hide-on-export">
          <Button variant="outline" size="sm" onClick={exportChatToHTML} className="border-whatsapp-border bg-whatsapp-bg hover:bg-whatsapp-panel text-whatsapp-text">
            <Download className="w-4 h-4 mr-2" />
            Export HTML
          </Button>
        </div>
      </div>

      {/* Main Wallpaper pattern layer */}
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg")', backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      {/* Messages Area */}
      <ScrollArea className="flex-1 w-full bg-whatsapp-bg/95 relative z-0" ref={scrollAreaRef}>
        <div className="flex flex-col p-4 w-full mx-auto max-w-4xl" ref={chatContainerRef}>
          {messagesWithFormatting.messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col w-full">
              {msg.showDateSeparator && (
                <div className="flex justify-center my-4 opacity-90">
                  <span className="bg-[#182229] text-whatsapp-muted text-xs uppercase px-3 py-1 rounded-lg shadow-sm">
                    {msg.dateString}
                  </span>
                </div>
              )}

              {msg.author === 'System' ? (
                <div className="flex justify-center my-2">
                  <span className="bg-[#182229] text-whatsapp-muted text-xs px-3 py-1 rounded-lg text-center max-w-[80%] shadow-sm">
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div className={cn("flex w-full mb-1", msg.isOwner ? "justify-end" : "justify-start mt-2")}
                  ref={el => {
                    if (msg.isMatch) {
                      matchRefs.current[msg.localMatchIndex] = el;
                    }
                  }}
                >
                  <div className={cn(
                    "max-w-[75%] rounded-lg px-2 pt-1 pb-2 shadow relative flex flex-col group",
                    msg.isOwner ? "bg-whatsapp-outgoing rounded-tr-none text-[#e9edef]" : "bg-whatsapp-incoming rounded-tl-none text-[#e9edef]",
                    msg.isMatch && msg.localMatchIndex === currentMatchIndex ? "ring-2 ring-whatsapp-highlight !bg-whatsapp-highlight/20" : "",
                  )}>
                    {msg.showAuthor && !msg.isOwner && (
                      <span className="text-sm text-whatsapp-highlight font-medium pr-8 truncate">
                        {msg.author}
                      </span>
                    )}

                    <div className="text-sm whitespace-pre-wrap break-words leading-snug">
                      {msg.isMatch && search ? (
                        <>
                          {msg.message.split(new RegExp(`(${search})`, 'gi')).map((part, i) => 
                            part.toLowerCase() === search.toLowerCase() ? (
                              <span key={i} className="bg-whatsapp-highlight/40 text-white rounded px-0.5">{part}</span>
                            ) : part
                          )}
                        </>
                      ) : (
                        msg.message
                      )}
                      
                      <span className="inline-block w-12" /> {/* Spacer for timestamp */}
                    </div>

                    <span className="absolute bottom-1 right-2 text-[10px] text-whatsapp-muted/80 whitespace-nowrap">
                      {format(msg.msgDate, 'HH:mm')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
