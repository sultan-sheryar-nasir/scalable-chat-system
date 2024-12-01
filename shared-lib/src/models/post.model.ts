export interface Post {
    id: number;
    title: string;
    content: string;
    author: string; // Could be "admin" or "user"
    timestamp: Date;
  }
  