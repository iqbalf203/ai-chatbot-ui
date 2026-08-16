import type {
  Conversation,
  ConversationsResponse,
  MessagesResponse,
} from "../types/chat";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

const AUTH_TOKEN_KEY = "auth_token";

/**
 * Fetch wrapper for authenticated API requests.
 *
 * Automatically attaches:
 *
 * Authorization: Bearer <JWT>
 */
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    localStorage.getItem(
      AUTH_TOKEN_KEY
    );

  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Content-Type",
    "application/json"
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

async function handleResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const error =
        await response.json();

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

/**
 * Get all conversations for the
 * currently authenticated user.
 */
export async function getConversations(): Promise<ConversationsResponse> {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/conversations`
    );

  return handleResponse<ConversationsResponse>(
    response
  );
}

/**
 * Create a new conversation.
 */
export async function createConversation(
  title?: string
): Promise<Conversation> {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/conversations`,
      {
        method: "POST",

        body: JSON.stringify({
          title:
            title || "New Chat",
        }),
      }
    );

  return handleResponse<Conversation>(
    response
  );
}

/**
 * Get messages for a conversation.
 */
export async function getMessages(
  conversationId: string
): Promise<MessagesResponse> {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/conversations/${conversationId}/messages`
    );

  return handleResponse<MessagesResponse>(
    response
  );
}

/**
 * Update conversation title.
 */
export async function updateConversation(
  conversationId: string,
  title: string
): Promise<Conversation> {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/conversations/${conversationId}`,
      {
        method: "PATCH",

        body: JSON.stringify({
          title,
        }),
      }
    );

  return handleResponse<Conversation>(
    response
  );
}

/**
 * Delete a conversation.
 */
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const response =
    await authenticatedFetch(
      `${API_URL}/api/conversations/${conversationId}`,
      {
        method: "DELETE",
      }
    );

  if (!response.ok) {
    let message =
      "Failed to delete conversation";

    try {
      const error =
        await response.json();

      if (error.detail) {
        message = error.detail;
      }
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }
}