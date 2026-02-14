// ChatInput.tsx
import { X, Send } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function ChatInput({ 
  input, 
  setInput, 
  handleSendMessage, 
  cancelRequest, 
  loading, 
  inputRef 
}) {
  const textareaRef = useRef(null);
  
  // Focus the textarea when the component mounts or inputRef changes
  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current = textareaRef.current;
    }
    // Auto-focus the textarea on component mount
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [inputRef]);

  // Handle key press events
  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift, submit the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default to avoid adding a new line
      if (input.trim()) {
        handleSendMessage();
      }
    }
    // If Shift+Enter is pressed, allow default behavior (new line)
  };

  // Auto-resize textarea height based on content
  const adjustTextareaHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  };

  // Adjust textarea height when input changes
  useEffect(() => {
    if (textareaRef.current) {
      adjustTextareaHeight({ target: textareaRef.current });
    }
  }, [input]);

  return (
    <div className="p-4 bg-white border-t border-gray-200 flex items-end justify-between gap-3">
      <div className="relative flex-1 h-full">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="w-full p-3 pr-10 border !h-full border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm resize-none max-h-[150px] overflow-y-auto"
          rows={1}
        />

        {/* Cancel Button */}
        {loading && (
          <button
            onClick={cancelRequest}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors duration-200"
            aria-label="Cancel request"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendMessage}
        className={`p-3 rounded-lg flex items-center justify-center shadow-sm transition-all duration-200 ${
          loading || !input.trim() 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
            : 'bg-black text-white hover:bg-gray-800 active:scale-95'
        }`}
        disabled={loading || !input.trim()}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </div>
  );
}