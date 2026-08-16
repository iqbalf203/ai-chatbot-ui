# React Chat Streaming - Quick Reference

## Hook Usage

```typescript
import { useChatWebSocket } from './hooks/useChatWebSocket'
import type { WebSocketEvent } from './types/chat'

function MyChat() {
  const handleEvent = (event: WebSocketEvent) => {
    switch (event.type) {
      case 'message_start':
        console.log('AI started responding...')
        break
      case 'message_delta':
        console.log('Received chunk:', event.delta)
        break
      case 'message_end':
        console.log('Response complete')
        break
      case 'generation_stopped':
        console.log('User stopped generation')
        break
    }
  }

  const { 
    connectionStatus,
    sendMessage,
    stopGeneration,
    disconnect 
  } = useChatWebSocket('conversation-123', handleEvent)

  // Send message
  const messageId = sendMessage('Hello!')
  
  // Stop active generation
  if (messageId) {
    stopGeneration(messageId)
  }
}
```

## Component Props

### ChatInput
```typescript
<ChatInput
  onSend={(content) => sendMessage(content)}
  onStop={() => stopGeneration(activeMessageId)}
  disabled={!isConnected}
  isStreaming={!!streamingMessageId}
/>
```

### MessageList
```typescript
<MessageList
  messages={messages}
  isTyping={isTyping}
/>
```

### ChatMessage
```typescript
<ChatMessage
  message={{
    id: '123',
    role: 'assistant',
    content: 'Hello!',
    status: 'streaming' | 'complete' | 'stopped' | 'error'
  }}
/>
```

## WebSocket Events Received

| Event | Payload |
|-------|---------|
| `message_start` | `{ message_id: string }` |
| `message_delta` | `{ message_id: string, delta: string }` |
| `message_end` | `{ message_id: string }` |
| `message_complete` | `{ message_id: string, content: string }` |
| `generation_stopped` | `{ message_id: string, content?: string }` |
| `error` | `{ message?: string, code?: string, message_id?: string }` |
| `connected` | `{ conversation_id: string }` |

## WebSocket Events Sent

### User Message
```json
{
  "type": "user_message",
  "message_id": "uuid",
  "content": "Hello!"
}
```

### Stop Generation
```json
{
  "type": "stop_generation",
  "message_id": "uuid"
}
```

## UI States

### While Streaming
- Textarea: **disabled**
- Send button: **hidden**
- Stop button: **red, visible**
- Message status: **streaming** (blinking cursor ▋)
- Loading: **"AI is thinking..."**

### When Stopped
- Message status: **stopped** (amber icon ⏹)
- Opacity: **85%**
- Input: **re-enabled**

### On Error
- Message status: **error** (red icon ⚠)
- Opacity: **70%**
- Connection: checks for "error" state

## Key Types

```typescript
type MessageStatus = "sending" | "streaming" | "complete" | "stopped" | "error"
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

interface ChatMessage {
  id: string
  conversation_id?: string
  role: "user" | "assistant" | "system"
  content: string
  format?: "text" | "markdown"
  status?: MessageStatus
  created_at?: string
}
```

## Useful Constants

```typescript
// Default WebSocket URL (override with VITE_WS_URL environment variable)
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000"

// Connection path
const wsPath = `/ws/chat?conversation_id=${conversationId}`
```

## Common Patterns

### Track Active Message
```typescript
const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null)

// In event handler
case "message_start":
  setStreamingMessageId(event.message_id)
  
case "message_end":
case "generation_stopped":
  setStreamingMessageId(null)
```

### Update Message Content
```typescript
setMessages(prev => prev.map(msg =>
  msg.id === event.message_id
    ? { ...msg, content: msg.content + event.delta }
    : msg
))
```

### Check if Streaming
```typescript
const isStreaming = streamingMessageId !== null
```

### Disable Input During Streaming
```typescript
<ChatInput
  disabled={connectionStatus !== "connected"}
  isStreaming={isStreaming}
/>
```
