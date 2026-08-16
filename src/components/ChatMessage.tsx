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

  return (
    <div
      className={`message-row ${
        isUser
          ? "message-user"
          : "message-assistant"
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

        {message.status === "streaming" && (
          <span className="streaming-cursor">
            ▋
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;