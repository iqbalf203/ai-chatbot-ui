import type { Conversation } from "../types/chat";
import type { ConnectionStatus } from "../hooks/useChatWebSocket";

interface ChatHeaderProps {
  conversation?: Conversation;
  connectionStatus: ConnectionStatus;
}

function ChatHeader({
  conversation,
  connectionStatus,
}: ChatHeaderProps) {
  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";

      case "connecting":
        return "Connecting...";

      case "disconnected":
        return "Disconnected";

      case "error":
        return "Connection error";

      default:
        return "Unknown";
    }
  };

  const getStatusClass = () => {
    switch (connectionStatus) {
      case "connected":
        return "connected";

      case "connecting":
        return "connecting";

      case "error":
        return "error";

      default:
        return "disconnected";
    }
  };

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <div className="chat-title-icon">
          ✦
        </div>

        <div className="chat-title-container">
          <h1>
            {conversation?.title || "New conversation"}
          </h1>

          <div className="connection-status">
            <span
              className={`status-dot ${getStatusClass()}`}
            />

            <span>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-header-right">
        <div className="model-badge">
          <span>Qwen 2.5 Coder</span>
          <span className="model-badge-subtitle">
            Local
          </span>
        </div>
      </div>
    </header>
  );
}

export default ChatHeader;