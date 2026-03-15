"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  onClose: () => void;
  onUndo?: () => void;
}

export default function Toast({ message, onClose, onUndo }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="toast-enter fixed bottom-5 left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-2.5 rounded-std text-[13px] font-medium z-[200] shadow-lg flex items-center gap-3">
      <span>{message}</span>
      {onUndo && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUndo();
            onClose();
          }}
          className="text-green-light font-semibold underline underline-offset-2 hover:text-white transition-colors"
        >
          Undo
        </button>
      )}
    </div>
  );
}
