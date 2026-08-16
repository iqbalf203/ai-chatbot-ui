# Stop Generation Sequence Diagram

## User Clicks Stop Button

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STOP FLOW SEQUENCE                               │
└─────────────────────────────────────────────────────────────────────────┘

[React UI]          [App.tsx]            [useChatWebSocket]    [Backend]
    │                  │                        │                  │
    │ Click Stop       │                        │                  │
    │ Button           │                        │                  │
    ├─────────────────>│                        │                  │
    │                  │ handleStopGeneration()│                  │
    │                  │─────────────────────>│                  │
    │                  │                        │ Send:            │
    │                  │                        │ {                │
    │                  │                        │   type:          │
    │                  │                        │   "stop_         │
    │                  │                        │   generation",   │
    │                  │                        │   message_id:    │
    │                  │                        │   "uuid..."      │
    │                  │                        │ }                │
    │                  │                        ├────────────────>│
    │                  │                        │                  │
    │                  │                        │                  │
    │                  │                        │  Receive:        │
    │                  │                        │  {               │
    │                  │                        │    type:         │
    │                  │                        │    "generation_  │
    │                  │                        │    stopped",     │
    │                  │                        │    message_id:   │
    │                  │                        │    "uuid...",    │
    │                  │                        │    content:      │
    │                  │                        │    "partial      │
    │                  │                        │    response"     │
    │                  │                        │  }               │
    │                  │                        │<────────────────┤
    │                  │ onEvent()              │                  │
    │                  │ (generation_stopped)   │                  │
    │                  │<─────────────────────┤                  │
    │                  │                        │                  │
    │ Update UI        │ setMessages()          │                  │
    │<─────────────────│ status="stopped"       │                  │
    │                  │ setStreamingMessageId()│                  │
    │                  │ setIsTyping(false)     │                  │
    │                  │                        │                  │
    │ Show:            │                        │                  │
    │ - Stop icon ⏹    │                        │                  │
    │ - Re-enable      │                        │                  │
    │   textarea       │                        │                  │
    │ - Show send btn  │                        │                  │
    │                  │                        │                  │
```

---

## Component State Changes

### Before Stop Click
```typescript
{
  messages: [
    {
      id: "uuid-123",
      role: "assistant",
      content: "This is a partial response that was being...",
      status: "streaming"  // ← Actively streaming
    }
  ],
  streamingMessageId: "uuid-123",  // ← Tracking active message
  isTyping: true,                  // ← Loading indicator visible
  connectionStatus: "connected"
}
```

### After Stop Click (Backend Response)
```typescript
{
  messages: [
    {
      id: "uuid-123",
      role: "assistant",
      content: "This is a partial response that was being...",  // ← Preserved
      status: "stopped"  // ← Changed from "streaming"
    }
  ],
  streamingMessageId: null,  // ← Cleared
  isTyping: false,           // ← Loading indicator hidden
  connectionStatus: "connected"
}
```

---

## UI Rendering Changes

### While Streaming (Before Stop)
```
┌─────────────────────────────────────────────────────────────────┐
│ AI: This is a partial response that was being... ▋              │ (blinking)
│ You: How are you?                                               │
├─────────────────────────────────────────────────────────────────┤
│ [Textarea: disabled]          [⏹ STOP Button: red, visible]    │
└─────────────────────────────────────────────────────────────────┘
```

### After Stop (After Response)
```
┌─────────────────────────────────────────────────────────────────┐
│ AI: This is a partial response that was being... ⏹              │ (stopped)
│ You: How are you?                                               │
├─────────────────────────────────────────────────────────────────┤
│ [Textarea: enabled]           [↑ SEND Button: white, enabled]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Handler Flow in Detail

### 1. User Clicks Stop Button
```typescript
// ChatInput.tsx
<button
  className="stop-button"
  onClick={onStop}  // ← Prop passed from App.tsx
>
  ⏹
</button>
```

### 2. handleStopGeneration Executes
```typescript
// App.tsx
const handleStopGeneration = useCallback(() => {
  if (streamingMessageId) {
    stopGeneration(streamingMessageId)  // ← Call hook method
  }
}, [streamingMessageId, stopGeneration])
```

### 3. Hook Sends Stop Message
```typescript
// useChatWebSocket.ts
const stopGeneration = useCallback(
  (messageId: string) => {
    const socket = socketRef.current
    
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected")
      return
    }

    const payload: StopGenerationRequest = {
      type: "stop_generation",
      message_id: messageId  // ← The streaming message ID
    }

    socket.send(JSON.stringify(payload))  // ← Send to backend
    console.log("Sent stop_generation for message:", messageId)
  },
  []
)
```

### 4. Backend Responds with generation_stopped
```typescript
// Backend sends this event
{
  type: "generation_stopped",
  message_id: "uuid-123",
  content: "Partial response..."
}
```

### 5. WebSocket Message Handler
```typescript
// useChatWebSocket.ts - inside socket.onmessage
socket.onmessage = (event: MessageEvent<string>) => {
  try {
    const data = JSON.parse(event.data) as WebSocketEvent
    onEventRef.current(data)  // ← Pass to App's handleWebSocketEvent
  } catch (error) {
    console.error("Invalid WebSocket response:", event.data, error)
  }
}
```

### 6. App Processes Event
```typescript
// App.tsx - handleWebSocketEvent
case "generation_stopped":
  console.log("Generation stopped for message:", event.message_id)
  
  setIsTyping(false)  // ← Hide loading indicator
  setStreamingMessageId(null)  // ← Clear streaming ID
  
  // ← Update message status to "stopped"
  setMessages((current) =>
    current.map((message) =>
      message.id === event.message_id
        ? {
            ...message,
            status: "stopped",  // ← KEY CHANGE
            content: event.content || message.content
          }
        : message
    )
  )
  
  loadConversations()  // ← Refresh conversation list
  break
```

### 7. Components Re-render
```typescript
// ChatMessage.tsx renders:
<div className="message-row message-stopped">
  {/* Message content */}
  <span className="stopped-indicator">⏹</span>  // ← New indicator
</div>

// ChatInput.tsx renders:
<button
  className="send-button"  // ← Switched from "stop-button"
  onClick={submit}
  disabled={disabled || !value.trim()}
>
  ↑
</button>
```

---

## Error Handling During Stop

### If WebSocket Disconnects Before Stop
```typescript
// In stopGeneration()
const socket = socketRef.current

if (!socket || socket.readyState !== WebSocket.OPEN) {
  console.error("WebSocket is not connected")
  return  // ← Silently fail, don't throw
}
```

### If Backend Error on Stop
```typescript
// handleWebSocketEvent
case "error":
  console.error("Backend error:", event)
  
  setIsTyping(false)
  setStreamingMessageId(null)
  
  // If error is associated with streaming message
  if (event.message_id) {
    setMessages((current) =>
      current.map((message) =>
        message.id === event.message_id
          ? { ...message, status: "error" }  // ← Show error status
          : message
      )
    )
  }
  break
```

---

## Keyboard Shortcut Support

The stop feature also supports keyboard commands:

```typescript
// ChatInput.tsx
const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault()
    
    if (!isStreaming) {
      submit()  // ← Send if not streaming
    }
    // ← Ignore Enter if streaming (no default action)
  }
}
```

Future enhancement: Could add keyboard shortcut like `Escape` to stop.

---

## Message Flow Summary

| Direction | What | How |
|-----------|------|-----|
| User → Stop Button | Click | React onClick handler |
| Button Click → App | Trigger | `onStop()` prop callback |
| App → Hook | Call | `stopGeneration(messageId)` |
| Hook → Backend | Send | WebSocket `{ type: "stop_generation", ... }` |
| Backend → Hook | Response | WebSocket `{ type: "generation_stopped", ... }` |
| Hook → App | Emit | `onEventRef.current()` with event |
| App → State | Update | `setMessages()`, `setStreamingMessageId(null)` |
| State → Components | Render | ChatInput shows send button, ChatMessage shows ⏹ |
| Components → User | Display | Updated UI with stopped status |

---

## Key Points

✅ **Stop ID Tracking**: `streamingMessageId` tracks which message is being generated  
✅ **Graceful Degradation**: Handles disconnections without crashing  
✅ **Type Safe**: `generation_stopped` is a specific event type  
✅ **State Clearing**: Both `streamingMessageId` and `isTyping` are cleared  
✅ **Content Preservation**: Partial content from backend is displayed  
✅ **UI Feedback**: Status indicator and button changes give clear feedback  
✅ **No Duplication**: Message isn't duplicated, just updated
