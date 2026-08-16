import type {
  Conversation,
  ConversationsResponse,
  MessagesResponse,
} from "../types/chat";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const error = await response.json();

      if (error.detail) {
        message = error.detail;
      }
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getConversations(): Promise<ConversationsResponse> {
  const response = await fetch(
    `${API_URL}/api/conversations`
  );

  return handleResponse<ConversationsResponse>(
    response
  );
}

export async function createConversation(
  title?: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/api/conversations`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title: title || "New Chat",
      }),
    }
  );

  return handleResponse<Conversation>(
    response
  );
}

export async function getMessages(
  conversationId: string
): Promise<MessagesResponse> {
  const response = await fetch(
    `${API_URL}/api/conversations/${conversationId}/messages`
  );

  return handleResponse<MessagesResponse>(
    response
  );
}

export async function updateConversation(
  conversationId: string,
  title: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/api/conversations/${conversationId}`,
    {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        title,
      }),
    }
  );

  return handleResponse<Conversation>(
    response
  );
}

export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/conversations/${conversationId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to delete conversation`
    );
  }
}