import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  SendMessageRequest,
  StopGenerationRequest,
  WebSocketEvent,
} from "../types/chat";

const WS_URL =
  import.meta.env.VITE_WS_URL ||
  "ws://localhost:8000";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseChatWebSocketResult {
  connectionStatus: ConnectionStatus;
  sendMessage: (
    content: string
  ) => string | null;
  stopGeneration: (
    messageId: string
  ) => void;
  disconnect: () => void;
}

export function useChatWebSocket(
  conversationId: string | null,
  onEvent: (
    event: WebSocketEvent
  ) => void
): UseChatWebSocketResult {

  const socketRef =
    useRef<WebSocket | null>(null);

  const [
    connectionStatus,
    setConnectionStatus,
  ] = useState<ConnectionStatus>(
    "disconnected"
  );

  /*
   * Keep the latest event handler without
   * recreating the WebSocket every time
   * the parent component renders.
   */
  const onEventRef =
    useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);


  const disconnect = useCallback(() => {

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setConnectionStatus(
      "disconnected"
    );

  }, []);


  const connect = useCallback(() => {

    if (!conversationId) {
      return;
    }

    if (
      socketRef.current &&
      (
        socketRef.current.readyState ===
          WebSocket.OPEN ||
        socketRef.current.readyState ===
          WebSocket.CONNECTING
      )
    ) {
      return;
    }

    setConnectionStatus(
      "connecting"
    );

    const socket = new WebSocket(
      `${WS_URL}/ws/chat?conversation_id=${encodeURIComponent(
        conversationId
      )}`
    );

    socketRef.current = socket;


    socket.onopen = () => {

      console.log(
        "WebSocket connected"
      );

      setConnectionStatus(
        "connected"
      );
    };


    socket.onmessage = (
      event: MessageEvent<string>
    ) => {

      try {

        const data =
          JSON.parse(
            event.data
          ) as WebSocketEvent;

        onEventRef.current(data);

      } catch (error) {

        console.error(
          "Invalid WebSocket response:",
          event.data,
          error
        );

      }
    };


    socket.onerror = (
      error
    ) => {

      console.error(
        "WebSocket error:",
        error
      );

      setConnectionStatus(
        "error"
      );
    };


    socket.onclose = () => {

      console.log(
        "WebSocket disconnected"
      );

      socketRef.current = null;

      setConnectionStatus(
        "disconnected"
      );
    };

  }, [conversationId]);


  useEffect(() => {

    connect();

    return () => {
      disconnect();
    };

  }, [
    connect,
    disconnect,
  ]);


  const sendMessage = useCallback(
    (
      content: string
    ): string | null => {

      const socket =
        socketRef.current;

      if (
        !socket ||
        socket.readyState !==
          WebSocket.OPEN
      ) {

        console.error(
          "WebSocket is not connected"
        );

        return null;
      }

      const messageId =
        crypto.randomUUID();

      const payload: SendMessageRequest =
        {
          type: "user_message",
          message_id:
            messageId,
          content,
        };


      socket.send(
        JSON.stringify(payload)
      );

      return messageId;
    },
    []
  );


  const stopGeneration = useCallback(
    (messageId: string) => {

      const socket =
        socketRef.current;

      if (
        !socket ||
        socket.readyState !==
          WebSocket.OPEN
      ) {

        console.error(
          "WebSocket is not connected"
        );

        return;
      }

      const payload: StopGenerationRequest =
        {
          type: "stop_generation",
          message_id: messageId,
        };

      socket.send(
        JSON.stringify(payload)
      );

      console.log(
        "Sent stop_generation for message:",
        messageId
      );
    },
    []
  );


  return {
    connectionStatus,
    sendMessage,
    stopGeneration,
    disconnect,
  };
}