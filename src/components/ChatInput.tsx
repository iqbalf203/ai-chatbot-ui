import { useState } from "react";
import type { KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (
    content: string
  ) => void;

  onStop: () => void;

  disabled: boolean;

  isStreaming: boolean;
}

function ChatInput({
  onSend,
  onStop,
  disabled,
  isStreaming,
}: ChatInputProps) {

  const [
    value,
    setValue,
  ] = useState("");


  const submit = () => {

    const content =
      value.trim();

    if (
      !content ||
      disabled ||
      isStreaming
    ) {
      return;
    }

    onSend(content);

    setValue("");
  };


  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      if (!isStreaming) {
        submit();
      }
    }
  };


  return (
    <div className="input-container">

      <textarea
        value={value}
        onChange={(event) =>
          setValue(
            event.target.value
          )
        }
        onKeyDown={
          handleKeyDown
        }
        placeholder="Message your AI assistant..."
        disabled={
          disabled ||
          isStreaming
        }
        rows={1}
      />


      {isStreaming ? (

        <button
          className="stop-button"
          onClick={onStop}
          aria-label="Stop generation"
          title="Stop the AI response"
        >
          ⏹
        </button>

      ) : (

        <button
          className="send-button"
          onClick={submit}
          disabled={
            disabled ||
            !value.trim()
          }
          aria-label="Send message"
        >
          ↑
        </button>

      )}

    </div>
  );
}

export default ChatInput;