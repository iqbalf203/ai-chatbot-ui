import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

import {
  createConversation,
  deleteConversation,
  getConversations,
  getMessages,
} from "./services/chatApi";

import {
  useChatWebSocket,
} from "./hooks/useChatWebSocket";

import type {
  ChatMessage,
  Conversation,
  WebSocketEvent,
} from "./types/chat";

import "./App.css";


// How long the initial conversations fetch must be pending
// before we show the "waking up" banner. Keeps it from
// flashing when the backend is already warm.
const WAKE_INDICATOR_DELAY_MS = 1200;


function App() {

  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);


  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(null);


  const [
    messages,
    setMessages,
  ] = useState<ChatMessage[]>([]);


  const [
    isTyping,
    setIsTyping,
  ] = useState(false);


  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);


  const [
    isWakingUp,
    setIsWakingUp,
  ] = useState(false);


  const activeConversation =
    conversations.find(
      (conversation) =>
        conversation.id === activeConversationId
    );


  /*
   * ==========================================================
   * Load conversations
   * ==========================================================
   */

  const loadConversations =
    useCallback(
      async () => {

        try {

          const response =
            await getConversations();

          setConversations(
            response.conversations
          );

        } catch (error) {

          console.error(
            "Failed to load conversations:",
            error
          );

        }

      },
      []
    );


  /*
   * Initial conversations load
   *
   * This is the first request the app makes, so if the
   * backend is cold-starting on Render, this is where it
   * shows. We show a "waking up" banner only if it takes
   * longer than WAKE_INDICATOR_DELAY_MS, so a warm backend
   * never flashes it.
   * ==========================================================
   */

  useEffect(() => {

    let didFinish = false;

    const wakeTimer = setTimeout(() => {
      if (!didFinish) {
        setIsWakingUp(true);
      }
    }, WAKE_INDICATOR_DELAY_MS);

    getConversations()
      .then((response) => {

        setConversations(
          response.conversations
        );

      })
      .catch((error) => {

        console.error(
          "Failed to load conversations:",
          error
        );

      })
      .finally(() => {

        didFinish = true;

        clearTimeout(wakeTimer);

        setIsWakingUp(false);

      });

    return () => {
      didFinish = true;
      clearTimeout(wakeTimer);
    };

  }, []);


  /*
   * ==========================================================
   * Load messages
   * ==========================================================
   */

  const loadConversation =
    useCallback(
      async (
        conversationId: string
      ) => {

        try {

          setActiveConversationId(
            conversationId
          );

          setIsSidebarOpen(false);

          setMessages([]);

          const response =
            await getMessages(
              conversationId
            );

          setMessages(
            response.messages
          );

        } catch (error) {

          console.error(
            "Failed to load messages:",
            error
          );

        }

      },
      []
    );


  /*
   * ==========================================================
   * WebSocket events
   * ==========================================================
   */

  const handleWebSocketEvent =
    useCallback(
      (
        event: WebSocketEvent
      ) => {

        console.log(
          "WebSocket event:",
          event
        );


        switch (event.type) {

          case "connected":

            console.log(
              "Connected to conversation:",
              event.conversation_id
            );

            break;


          case "message_start":

            setIsTyping(true);

            setMessages(
              (current) => [
                ...current,
                {
                  id: event.message_id,

                  role: "assistant",

                  content: "",

                  format: "markdown",

                  status: "streaming",
                },
              ]
            );

            break;


          case "message_delta":

            setMessages(
              (current) =>
                current.map(
                  (message) =>
                    message.id ===
                    event.message_id
                      ? {
                          ...message,

                          content:
                            message.content +
                            event.delta,
                        }
                      : message
                )
            );

            break;


          case "message_complete":

            setMessages(
              (current) =>
                current.map(
                  (message) =>
                    message.id ===
                    event.message_id
                      ? {
                          ...message,

                          content:
                            event.content,

                          status: "complete",
                        }
                      : message
                )
            );

            break;


          case "message_end":

            setIsTyping(false);

            setMessages(
              (current) =>
                current.map(
                  (message) =>
                    message.id ===
                    event.message_id
                      ? {
                          ...message,

                          status: "complete",
                        }
                      : message
                )
            );

            loadConversations();

            break;


          case "error":

            console.error(
              "Backend error:",
              event
            );

            setIsTyping(false);

            break;

        }

      },
      [loadConversations]
    );


  /*
   * ==========================================================
   * WebSocket
   * ==========================================================
   */

  const {
    connectionStatus,
    sendMessage,
  } = useChatWebSocket(
    activeConversationId,
    handleWebSocketEvent
  );


  /*
   * ==========================================================
   * New chat
   * ==========================================================
   */

  const handleNewChat =
    async () => {

      try {

        const conversation =
          await createConversation(
            "New Chat"
          );


        setConversations(
          (current) => [
            conversation,
            ...current,
          ]
        );


        setActiveConversationId(
          conversation.id
        );


        setIsSidebarOpen(false);


        setMessages([]);

      } catch (error) {

        console.error(
          "Failed to create conversation:",
          error
        );

      }

    };


  /*
   * ==========================================================
   * Send message
   * ==========================================================
   */

  const handleSendMessage =
    (
      content: string
    ) => {

      if (
        !activeConversationId
      ) {
        return;
      }


      const messageId =
        sendMessage(content);


      if (!messageId) {
        return;
      }


      const userMessage:
        ChatMessage = {

        id: messageId,

        conversation_id:
          activeConversationId,

        role: "user",

        content,

        format: "text",

        status: "complete",

        created_at:
          new Date().toISOString(),
      };


      setMessages(
        (current) => [
          ...current,
          userMessage,
        ]
      );

    };


  /*
   * ==========================================================
   * Delete conversation
   * ==========================================================
   */

  const handleDeleteConversation =
    async (
      conversationId: string
    ) => {

      try {

        await deleteConversation(
          conversationId
        );


        setConversations(
          (current) =>
            current.filter(
              (conversation) =>
                conversation.id !==
                conversationId
            )
        );


        if (
          activeConversationId ===
          conversationId
        ) {

          setActiveConversationId(
            null
          );

          setMessages([]);

        }

      } catch (error) {

        console.error(
          "Failed to delete conversation:",
          error
        );

      }

    };


  /*
   * ==========================================================
   * UI
   * ==========================================================
   */

  return (
    <div className="app">

      {isWakingUp && (
        <div className="wake-banner">
          <span className="wake-spinner" />
          Starting up your assistant… this can take up to a minute.
        </div>
      )}

      <Sidebar
        conversations={
          conversations
        }

        activeConversationId={
          activeConversationId
        }

        onNewChat={
          handleNewChat
        }

        onSelectConversation={
          loadConversation
        }

        onDeleteConversation={
          handleDeleteConversation
        }

        isOpen={
          isSidebarOpen
        }

        onClose={
          () => setIsSidebarOpen(false)
        }
      />


      <main className="chat-area">

        <ChatHeader
          conversation={
            activeConversation
          }

          connectionStatus={
            connectionStatus
          }

          onMenuClick={
            () => setIsSidebarOpen(true)
          }
        />


        <section className="chat-content">

          {!activeConversationId ? (

            <div className="welcome">

              <div className="welcome-icon">
                ✦
              </div>

              <h2>
                Welcome to your AI
                assistant
              </h2>

              <p>
                Start a new conversation
                to begin.
              </p>

              <button
                onClick={
                  handleNewChat
                }
              >
                Start chatting
              </button>

            </div>

          ) : (

            <MessageList
              messages={messages}

              isTyping={
                isTyping
              }
            />

          )}

        </section>


        {activeConversationId && (

          <ChatInput
            onSend={
              handleSendMessage
            }

            disabled={
              connectionStatus !==
                "connected" ||
              isTyping
            }
          />

        )}

      </main>

    </div>
  );
}


export default App;