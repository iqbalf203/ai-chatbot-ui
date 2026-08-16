import type { Conversation } from "../types/chat";
import type { ConnectionStatus } from "../hooks/useChatWebSocket";

interface SidebarProps {
  // Current props
  conversations?: Conversation[];
  activeConversationId?: string | null;
  onNewChat?: () => void;
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;

  // Backward-compatible props
  conversation?: Conversation;
  connectionStatus?: ConnectionStatus;

  // Mobile drawer control
  isOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({
  conversations = [],
  activeConversationId = null,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  isOpen = false,
  onClose,
}: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => onClose?.()}
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo">✦</div>

          <span>AI Assistant</span>

          <button
            type="button"
            className="sidebar-close-button"
            aria-label="Close sidebar"
            onClick={() => onClose?.()}
          >
            ×
          </button>
        </div>

        {/* New Chat */}
        <button
          type="button"
          className="new-chat-button"
          onClick={() => onNewChat?.()}
        >
          <span>+</span>
          <span>New chat</span>
        </button>

        {/* Conversations */}
        <div className="conversation-section">
          <div className="conversation-title">
            Recent conversations
          </div>

          <div className="conversation-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => {
                const isActive =
                  conversation.id ===
                  activeConversationId;

                return (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      isActive ? "active" : ""
                    }`}
                    onClick={() => {
                      onSelectConversation?.(
                        conversation.id
                      );
                      onClose?.();
                    }}
                  >
                    <span className="conversation-icon">
                      ◇
                    </span>

                    <span className="conversation-name">
                      {conversation.title}
                    </span>

                    <button
                      type="button"
                      className="delete-button"
                      aria-label={`Delete ${conversation.title}`}
                      onClick={(event) => {
                        event.stopPropagation();

                        onDeleteConversation?.(
                          conversation.id
                        );
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="model-info">
            <span className="model-dot" />

            <div>
              <strong>
                Qwen 2.5 Coder
              </strong>

              <small>
                Local model · Ollama
              </small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;