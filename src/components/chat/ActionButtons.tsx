"use client";

import { ActionButton } from "@/types";

interface ActionButtonsProps {
  buttons: ActionButton[];
  onAction: (action: string, data?: Record<string, unknown>) => void;
}

export default function ActionButtons({ buttons, onAction }: ActionButtonsProps) {
  const variantStyles: Record<string, string> = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
    secondary:
      "bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200",
    outline:
      "bg-white text-surface-700 hover:bg-surface-50 border border-surface-300",
  };

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => onAction(button.action, button.data)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            variantStyles[button.variant] ?? variantStyles.outline
          }`}
        >
          {button.label}
        </button>
      ))}
    </div>
  );
}
