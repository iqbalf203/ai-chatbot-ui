import { useState } from "react";
import type { KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (
    content: string
  ) => void;

  disabled: boolean;
}

function ChatInput({
  onSend,
  disabled,
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
      disabled
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

      submit();
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
        disabled={disabled}
        rows={1}
      />


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

    </div>
  );
}

export default ChatInput;