export interface ChatMessage {
    senderId: string; // Could be admin or user ID
    recipientId: string; // Target user/admin ID
    content: string;
    timestamp: Date;
  }
  