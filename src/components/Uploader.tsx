import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText } from 'lucide-react';
import * as whatsappChatParser from 'whatsapp-chat-parser';
import { Chat, ChatMessage } from '../types';

interface UploaderProps {
  onChatsLoaded: (chats: Chat[]) => void;
}

export function Uploader({ onChatsLoaded }: UploaderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setLoading(true);
    setError(null);
    const loadedChats: Chat[] = [];

    try {
      for (const file of acceptedFiles) {
        if (!file.name.endsWith('.txt')) continue;

        const text = await file.text();
        const parsed = whatsappChatParser.parseString(text, { parseAttachments: true });
        
        if (!parsed || parsed.length === 0) continue;

        // Extract unique participants
        const participantsSet = new Set<string>();
        parsed.forEach((msg) => {
          if (msg.author && msg.author !== 'System') {
            participantsSet.add(msg.author);
          }
        });
        const participants = Array.from(participantsSet);

        // Try to guess a name from the filename: "WhatsApp Chat with John Doe.txt" -> "John Doe"
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
        setError('No valid WhatsApp chat logs found. Please upload a .txt file exported from WhatsApp.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while parsing the file.');
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
    <div className="flex flex-col items-center justify-center h-full w-full p-8 bg-whatsapp-panel text-whatsapp-text">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-light mb-6 text-center">WhatsApp Chat Viewer</h1>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-whatsapp-highlight bg-whatsapp-bg' : 'border-whatsapp-border bg-whatsapp-bg/50 hover:bg-whatsapp-bg'
          }`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="w-16 h-16 mx-auto mb-4 text-whatsapp-muted" />
          {loading ? (
            <p className="text-lg">Parsing your chats...</p>
          ) : isDragActive ? (
            <p className="text-lg text-whatsapp-highlight">Drop the files here ...</p>
          ) : (
            <div>
              <p className="text-lg mb-2">Drag & drop WhatsApp .txt exports here</p>
              <p className="text-sm text-whatsapp-muted">or click to select files</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-destructive/20 text-destructive border border-destructive rounded-md">
            {error}
          </div>
        )}

        <div className="mt-12 bg-whatsapp-bg rounded-lg p-6 border border-whatsapp-border">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" /> How to export from WhatsApp
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-whatsapp-muted/90">
            <li>Open the WhatsApp chat you want to export.</li>
            <li>Tap on the contact's name or the group subject at the top.</li>
            <li>Scroll to the bottom and tap <strong>Export Chat</strong>.</li>
            <li>Choose <strong>Without Media</strong> (recommended for text analytics).</li>
            <li>Save the resulting <strong>.txt</strong> file to your computer.</li>
            <li>Upload it here! All processing is done locally in your browser.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
