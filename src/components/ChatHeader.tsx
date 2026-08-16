import { useState } from "react";
import type { Conversation } from "../types/chat";
import type { ConnectionStatus } from "../hooks/useChatWebSocket";
import { useAuth } from "../context/AuthContext";

interface ChatHeaderProps {
  conversation?: Conversation;
  connectionStatus: ConnectionStatus;
  onMenuClick?: () => void;
}

function ChatHeader({
  conversation,
  connectionStatus,
  onMenuClick,
}: ChatHeaderProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] =
    useState(false);

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

  const handleLogout = () => {
    signOut();
    setShowUserMenu(false);
  };

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <button
          type="button"
          className="menu-button"
          aria-label="Open menu"
          onClick={() => onMenuClick?.()}
        >
          ☰
        </button>

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
        {/* <div className="model-badge">
          <span>Qwen 2.5 Coder</span>
          <span className="model-badge-subtitle">
            Local
          </span>
        </div> */}

        {user && (
          <div className="user-menu-wrapper">
            <button
              type="button"
              className="user-menu-button"
              onClick={() =>
                setShowUserMenu(!showUserMenu)
              }
              title={user.name}
            >
              <span className="user-avatar">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </button>

            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <div className="user-menu-name">
                    {user.name}
                  </div>
                  <div className="user-menu-email">
                    {user.email}
                  </div>
                </div>

                <button
                  type="button"
                  className="user-menu-item user-menu-logout"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default ChatHeader;