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
    <div className="toast-enter fixed bottom-[76px] left-1/2 -translate-x-1/2 bg-text-primary text-white px-5 py-3 rounded-card text-[13px] font-semibold z-[200] shadow-lg flex items-center gap-3 max-w-[90vw]">
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
