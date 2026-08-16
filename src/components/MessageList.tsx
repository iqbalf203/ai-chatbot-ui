import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

import type { ChatMessage as ChatMessageType } from "../types/chat";

interface MessageListProps {
  messages: ChatMessageType[];
  isTyping: boolean;
}

function MessageList({
  messages,
  isTyping,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="empty-chat">
        <div className="empty-icon">✦</div>

        <h2>How can I help you?</h2>

        <p>
          Ask me anything. I'm ready to help.
        </p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
        />
      ))}

      {isTyping && (
        <div className="loading-container">
          <div className="typing-indicator">
            <span />
            <span />
            <span />
          </div>
          <p className="loading-text">
            AI is thinking...
          </p>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;