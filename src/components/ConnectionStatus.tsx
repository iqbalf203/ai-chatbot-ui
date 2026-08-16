import type {
  ConnectionStatus as Status,
} from "../hooks/useChatWebSocket";

interface ConnectionStatusProps {
  status: Status;
}

function ConnectionStatus({
  status,
}: ConnectionStatusProps) {

  const config = {
    connected: {
      label: "Connected",
      className:
        "status-connected",
    },

    connecting: {
      label: "Connecting...",
      className:
        "status-connecting",
    },

    disconnected: {
      label: "Disconnected",
      className:
        "status-disconnected",
    },

    error: {
      label: "Connection error",
      className:
        "status-error",
    },
  }[status];


  return (
    <div
      className={`connection-status ${config.className}`}
    >
      <span className="status-dot" />

      <span>
        {config.label}
      </span>
    </div>
  );
}

export default ConnectionStatus;