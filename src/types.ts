export interface ChatMessage {
  date: Date;
  author: string;
  message: string;
  attachment?: {
    fileName: string;
  };
}

export interface Chat {
  id: string;
  name: string;
  participants: string[];
  messages: ChatMessage[];
  owner: string | null;
}
