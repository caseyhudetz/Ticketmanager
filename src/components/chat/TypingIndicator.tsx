"use client";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
        <span className="text-white text-xs font-bold">TM</span>
      </div>
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-surface-200 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-surface-400 typing-dot" />
          <div className="w-2 h-2 rounded-full bg-surface-400 typing-dot" />
          <div className="w-2 h-2 rounded-full bg-surface-400 typing-dot" />
        </div>
      </div>
    </div>
  );
}
