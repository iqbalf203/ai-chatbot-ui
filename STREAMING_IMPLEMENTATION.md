# React Chat Streaming & Stop Feature Implementation

## Overview

This implementation provides a complete streaming chat UI with real-time stop/cancel functionality for AI responses. The feature uses WebSocket for bidirectional communication and includes proper state management, type safety with TypeScript, and visual feedback.

## Architecture

### 1. **Custom Hook: `useChatWebSocket`** (`src/hooks/useChatWebSocket.ts`)

The core hook that manages WebSocket lifecycle and provides:

- **`connect()`** - Establishes WebSocket connection to `/ws/chat?conversation_id=...`
- **`sendMessage(content: string)`** - Sends user message and returns a message_id
  ```typescript
  {
    type: "user_message",
    message_id: "uuid",
    content: "user input"
  }
  ```
- **`stopGeneration(messageId: string)`** - Sends stop request for active AI response
  ```typescript
  {
    type: "stop_generation",
    message_id: "assistant_message_id"
  }
  ```
- **`disconnect()`** - Cleanly closes the connection

**Return Type:**
```typescript
{
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  sendMessage: (content: string) => string | null
  stopGeneration: (messageId: string) => void
  disconnect: () => void
}
```

### 2. **WebSocket Event Types** (`src/types/chat.ts`)

The hook emits events via the `onEvent` callback:

```typescript
type WebSocketEvent =
  | { type: "message_start"; message_id: string }
  | { type: "message_delta"; message_id: string; delta: string }
  | { type: "message_end"; message_id: string }
  | { type: "message_complete"; message_id: string; content: string }
  | { type: "generation_stopped"; message_id: string; content?: string }
  | { type: "error"; message?: string; code?: string; message_id?: string }
  | { type: "connected"; conversation_id: string }
```

### 3. **Message Status States** (`src/types/chat.ts`)

```typescript
type MessageStatus = "sending" | "streaming" | "complete" | "stopped" | "error"
```

- `streaming` - Response actively being streamed
- `stopped` - User clicked stop/generation was cancelled
- `complete` - Response finished normally
- `error` - Backend error or connection issue

## State Management Flow

### App Component (`src/App.tsx`)

**Key State:**
```typescript
const [messages, setMessages] = useState<ChatMessage[]>([])
const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
const [isTyping, setIsTyping] = useState(false)
```

**Event Handler:** `handleWebSocketEvent(event: WebSocketEvent)`

```
Event Type          | Action
--------------------+------------------------------------------
message_start       | Add new assistant message, set streaming ID, set isTyping=true
message_delta       | Append delta to streaming message content
message_complete    | Update message with final content, set status=complete
message_end         | Set status=complete, clear streaming ID, set isTyping=false
generation_stopped  | Set status=stopped, clear streaming ID, set isTyping=false
error               | Set status=error, clear streaming ID, set isTyping=false
```

**Stop Handler:** `handleStopGeneration()`
- Called when stop button is clicked
- Sends `stop_generation` with current `streamingMessageId`
- Backend responds with `generation_stopped` event

## Component Integration

### ChatInput Component (`src/components/ChatInput.tsx`)

**Props:**
```typescript
interface ChatInputProps {
  onSend: (content: string) => void
  onStop: () => void
  disabled: boolean
  isStreaming: boolean
}
```

**Behavior:**
- When `isStreaming === true`: Display red stop button (⏹)
- When `isStreaming === false`: Display send button (↑)
- Stop button always enabled during streaming
- Send button disabled when not streaming or when input is empty
- Textarea disabled during streaming

### ChatMessage Component (`src/components/ChatMessage.tsx`)

**Status Indicators:**
- **Streaming**: Blinking cursor `▋` (white, animated)
- **Stopped**: Stop icon `⏹` (amber/yellow)
- **Error**: Warning icon `⚠` (red)

**Visual Feedback:**
```css
.message-stopped { opacity: 0.85; }
.message-error { opacity: 0.7; }

.stopped-indicator { color: #f59e0b; }
.error-indicator { color: #ef4444; }
```

### MessageList Component (`src/components/MessageList.tsx`)

**Loading Indicator:**
- Shows typing animation + "AI is thinking..." text while `isTyping === true`
- Auto-scrolls to bottom when messages change or typing indicator appears

## Usage Example

```typescript
function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const handleWebSocketEvent = (event: WebSocketEvent) => {
    switch (event.type) {
      case "message_start":
        setStreamingMessageId(event.message_id)
        setIsTyping(true)
        setMessages(prev => [...prev, {
          id: event.message_id,
          role: "assistant",
          content: "",
          status: "streaming"
        }])
        break

      case "message_delta":
        setMessages(prev => prev.map(msg =>
          msg.id === event.message_id
            ? { ...msg, content: msg.content + event.delta }
            : msg
        ))
        break

      case "generation_stopped":
        setStreamingMessageId(null)
        setIsTyping(false)
        setMessages(prev => prev.map(msg =>
          msg.id === event.message_id
            ? { ...msg, status: "stopped", content: event.content || msg.content }
            : msg
        ))
        break
    }
  }

  const { sendMessage, stopGeneration } = useChatWebSocket(
    conversationId,
    handleWebSocketEvent
  )

  const handleStop = () => {
    if (streamingMessageId) {
      stopGeneration(streamingMessageId)
    }
  }

  return (
    <ChatInput
      onSend={content => sendMessage(content)}
      onStop={handleStop}
      isStreaming={streamingMessageId !== null}
      disabled={connectionStatus !== "connected"}
    />
  )
}
```

## WebSocket Protocol

### Client → Server

**Send Message:**
```json
{
  "type": "user_message",
  "message_id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hello, how are you?"
}
```

**Stop Generation:**
```json
{
  "type": "stop_generation",
  "message_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

### Server → Client

**Stream Started:**
```json
{ "type": "message_start", "message_id": "660e8400-e29b-41d4-a716-446655440001" }
```

**Stream Chunk (Delta):**
```json
{ "type": "message_delta", "message_id": "660e8400-e29b-41d4-a716-446655440001", "delta": "Hello " }
```

**Stream Complete:**
```json
{ "type": "message_end", "message_id": "660e8400-e29b-41d4-a716-446655440001" }
```

**Generation Stopped:**
```json
{
  "type": "generation_stopped",
  "message_id": "660e8400-e29b-41d4-a716-446655440001",
  "content": "Partial response that was generated..."
}
```

**Error:**
```json
{
  "type": "error",
  "message": "Connection lost",
  "code": "CONNECTION_ERROR",
  "message_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

## Key Features

✅ **Real-time Streaming**: Messages append as delta chunks arrive  
✅ **Stop/Cancel**: User can cancel generation mid-stream  
✅ **State Machine**: Proper handling of all event types  
✅ **Type Safety**: Full TypeScript support with discriminated unions  
✅ **Visual Feedback**:
  - Loading indicator with animation
  - Stop button (red) replaces send button during streaming
  - Status indicators (✓ complete, ⏹ stopped, ⚠ error, ▋ streaming)
  - Message opacity changes for stopped/error states

✅ **Accessibility**:
  - ARIA labels on buttons
  - Semantic HTML structure
  - Keyboard support (Enter to send, Shift+Enter for newline)
  - Screen reader friendly status indicators

✅ **Robust Error Handling**:
  - WebSocket connection errors logged
  - Invalid messages handled gracefully
  - Reconnection ready (hook manages lifecycle)
  - Cleared streaming state on errors

## Configuration

**WebSocket URL**: Configured via environment variable `VITE_WS_URL`
```bash
# .env or .env.local
VITE_WS_URL=ws://localhost:8000
```

Default: `ws://localhost:8000`

## Styling

Key CSS classes:
- `.stop-button` - Red stop button, scales on hover/click
- `.streaming-cursor` - Blinking cursor animation
- `.stopped-indicator` - Amber stop icon
- `.error-indicator` - Red error icon
- `.loading-container` - Loading indicator wrapper
- `.message-stopped` - Reduced opacity for stopped messages
- `.message-error` - Reduced opacity for error messages

## Error Handling

The implementation handles:

1. **Connection Failures**: Sets `connectionStatus` to "error"
2. **Invalid JSON**: Logs to console, continues operation
3. **Missing Connection**: Gracefully returns null/no-op
4. **Mid-Stream Errors**: Updates message status to "error" and clears streaming state
5. **Disconnections**: Auto-cleanup via effect return function

## Performance Considerations

- Uses `useRef` for WebSocket to prevent unnecessary reconnections
- Event handlers memoized with `useCallback` to avoid recreation
- Message updates batch via `setMessages` to reduce re-renders
- Streaming state isolated from other state to minimize update scope

## Future Enhancements

Possible improvements:
- Retry logic with exponential backoff
- Message persistence to localStorage during offline periods
- Streaming rate limiting UI
- Per-token timing metrics
- Voice input/output integration
- Message editing after generation stops
