import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface LoginProps {
  onLogin: (username: string) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === 'testuser' && password === 'password') {
      onLogin(username.trim());
    } else {
      setError('Invalid credentials. Try "testuser" / "password".');
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-whatsapp-panel font-sans">
      <div className="w-full max-w-md bg-whatsapp-bg p-8 rounded-lg shadow-lg border border-whatsapp-border mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-whatsapp-text">Login</h1>
          <p className="text-sm text-whatsapp-muted mt-2">Sign in to sync and persist your chats</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-whatsapp-panel text-whatsapp-text border-whatsapp-border/50 focus-visible:ring-whatsapp-highlight"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-whatsapp-panel text-whatsapp-text border-whatsapp-border/50 focus-visible:ring-whatsapp-highlight"
            />
          </div>
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full bg-whatsapp-highlight hover:bg-whatsapp-highlight/90 text-white">
             Login
          </Button>
          <div className="text-xs text-center text-whatsapp-muted mt-6 pt-4 border-t border-whatsapp-border/50">
             <p className="mb-1 uppercase tracking-wider font-semibold text-whatsapp-text/70">Test Account Details</p>
             <p>Username: <b className="text-whatsapp-text">testuser</b></p>
             <p>Password: <b className="text-whatsapp-text">password</b></p>
          </div>
        </form>
      </div>
    </div>
  );
}
