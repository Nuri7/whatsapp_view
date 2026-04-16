import React, { useState, useEffect } from 'react';
import localforage from 'localforage';
import { Uploader } from './components/Uploader';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatView } from './components/ChatView';
import { WhoAreYouDialog } from './components/WhoAreYouDialog';
import { Login } from './components/Login';
import type { Chat } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  
  // Who are you dialog state
  const [whoAreYouOpen, setWhoAreYouOpen] = useState(false);
  const [pendingChatId, setPendingChatId] = useState<string | null>(null);

  // Force dark mode globally (WhatsApp Web style)
  useEffect(() => {
    document.documentElement.classList.add('dark');
    const storedUser = localStorage.getItem('whatsapp_viewer_user');
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  // Load from IndexedDB upon login
  useEffect(() => {
    if (!currentUser) return;
    
    setIsLoadingChats(true);
    localforage.getItem<Chat[]>(`whatsapp_chats_${currentUser}`)
      .then(storedChats => {
        if (storedChats) {
          setChats(storedChats);
          if (storedChats.length > 0) {
            setSelectedChatId(storedChats[0].id);
          }
        } else {
          setChats([]);
        }
      })
      .catch(err => {
        console.error("Failed to load chats from indexedDB", err);
      })
      .finally(() => {
        setIsLoadingChats(false);
      });
  }, [currentUser]);

  const saveChatsLocally = async (updatedChats: Chat[]) => {
    if (!currentUser) return;
    try {
      await localforage.setItem(`whatsapp_chats_${currentUser}`, updatedChats);
    } catch (err) {
      console.error("Failed to save chats to indexedDB", err);
    }
  };

  const handleLogin = (user: string) => {
    localStorage.setItem('whatsapp_viewer_user', user);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('whatsapp_viewer_user');
    setCurrentUser(null);
    setChats([]);
    setSelectedChatId(null);
  };

  const handleChatsLoaded = (newChats: Chat[]) => {
    const updatedChats = [...chats, ...newChats];
    setChats(updatedChats);
    saveChatsLocally(updatedChats);
    
    // Automatically select the first chat if none selected
    if (!selectedChatId && newChats.length > 0) {
      handleSelectChat(newChats[0].id, updatedChats);
    }
  };

  const handleSelectChat = (chatId: string, currentChats: Chat[] = chats) => {
    const chat = currentChats.find(c => c.id === chatId);
    if (!chat) return;

    // If chat participants don't have an owner mapped yet, prompt the user
    if (!chat.owner && chat.participants.length > 0) {
      setPendingChatId(chatId);
      setWhoAreYouOpen(true);
    } else {
      setSelectedChatId(chatId);
    }
  };

  const handleSelectOwner = (ownerName: string) => {
    if (!pendingChatId) return;

    const updatedChats = chats.map(c => {
      if (c.id === pendingChatId) {
        return { ...c, owner: ownerName };
      }
      return c;
    });

    setChats(updatedChats);
    saveChatsLocally(updatedChats);

    setSelectedChatId(pendingChatId);
    setWhoAreYouOpen(false);
    setPendingChatId(null);
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);
    saveChatsLocally(updatedChats);

    if (selectedChatId === chatId) {
      setSelectedChatId(updatedChats.length > 0 ? updatedChats[0].id : null);
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground font-sans bg-whatsapp-panel">
      {isLoadingChats ? (
         <div className="flex w-full items-center justify-center text-lg text-whatsapp-muted">Loading your secure local chats...</div>
      ) : chats.length === 0 ? (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Quick logout top left */}
            <div className="absolute top-4 right-4 sm:left-4 sm:right-auto z-10">
               <button onClick={handleLogout} className="px-4 py-2 text-sm text-whatsapp-text hover:bg-whatsapp-bg rounded-md border border-whatsapp-border/50 shadow">Logout</button>
            </div>
            <Uploader onChatsLoaded={handleChatsLoaded} />
        </div>
      ) : (
        <div className="flex w-full h-full max-w-[1600px] mx-auto shadow-2xl overflow-hidden relative">
          <ChatSidebar 
            chats={chats} 
            selectedChatId={selectedChatId} 
            onSelectChat={id => handleSelectChat(id)} 
            onLogout={handleLogout}
            username={currentUser}
            onChatsLoaded={handleChatsLoaded}
            onDeleteChat={handleDeleteChat}
          />
          {selectedChat ? (
            <ChatView chat={selectedChat} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-whatsapp-bg border-l border-whatsapp-border/50 text-whatsapp-muted p-8 text-center">
              <h2 className="text-3xl font-light mb-4">WhatsApp Web</h2>
              <p>Select a chat from the sidebar to view it.</p>
            </div>
          )}
        </div>
      )}

      {pendingChatId && (
        <WhoAreYouDialog
          open={whoAreYouOpen}
          participants={chats.find(c => c.id === pendingChatId)?.participants || []}
          onSelect={handleSelectOwner}
        />
      )}
    </div>
  );
}
