export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus =
  | "sending"
  | "streaming"
  | "complete"
  | "stopped"
  | "error";

export interface ChatMessage {
  id: string;
  conversation_id?: string;
  role: MessageRole;
  content: string;
  format?: "text" | "markdown";
  status?: MessageStatus;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface MessagesResponse {
  messages: ChatMessage[];
}

export interface SendMessageRequest {
  type: "user_message";
  message_id: string;
  content: string;
}

export type WebSocketEvent =
  | {
      type: "message_start";
      message_id: string;
    }
  | {
      type: "message_delta";
      message_id: string;
      delta: string;
    }
  | {
      type: "message_end";
      message_id: string;
    }
  | {
      type: "message_complete";
      message_id: string;
      content: string;
    }
  | {
      type: "generation_stopped";
      message_id: string;
      content?: string;
    }
  | {
      type: "error";
      message?: string;
      code?: string;
      message_id?: string;
    }
  | {
      type: "connected";
      conversation_id: string;
    };

export interface StopGenerationRequest {
  type: "stop_generation";
  message_id: string;
}