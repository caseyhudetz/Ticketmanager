"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Describe what you need — find events, invite clients, allocate tickets...",
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-surface-200 bg-white px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2 bg-surface-50 rounded-2xl border border-surface-200 px-3 py-2 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
          {/* Attachment button */}
          <button
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Input */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-surface-900 placeholder-surface-400 focus:outline-none py-1 max-h-[120px]"
          />

          {/* Voice button */}
          <button
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors shrink-0"
            title="Voice input"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`p-1.5 rounded-lg transition-all shrink-0 ${
              input.trim() && !disabled
                ? "bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
                : "bg-surface-200 text-surface-400 cursor-not-allowed"
            }`}
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-xs text-surface-400 mt-2">
          Try: &quot;Show me upcoming Lakers games&quot; or &quot;Invite Sarah Chen to the
          next event&quot;
        </p>
      </div>
    </div>
  );
}
