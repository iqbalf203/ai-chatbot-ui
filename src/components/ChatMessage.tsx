import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type {
  ChatMessage as ChatMessageType,
} from "../types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  const statusIndicator = () => {
    switch (message.status) {
      case "streaming":
        return (
          <span className="streaming-cursor">
            ▋
          </span>
        );
      case "stopped":
        return (
          <span
            className="stopped-indicator"
            title="Generation was stopped"
          >
            ⏹
          </span>
        );
      case "error":
        return (
          <span
            className="error-indicator"
            title="An error occurred"
          >
            ⚠
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`message-row ${
        isUser
          ? "message-user"
          : "message-assistant"
      } ${
        message.status === "stopped"
          ? "message-stopped"
          : ""
      } ${
        message.status === "error"
          ? "message-error"
          : ""
      }`}
    >
      <div className="message-avatar">
        {isUser ? "You" : "AI"}
      </div>

      <div className="message-content">
        <div className="message-role">
          {isUser ? "You" : "Assistant"}
        </div>

        <div className="message-body">
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {statusIndicator()}
      </div>
    </div>
  );
}

export default ChatMessage;