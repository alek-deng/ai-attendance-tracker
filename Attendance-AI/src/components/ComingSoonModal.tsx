import React from "react";

interface ComingSoonModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  open,
  onClose,
  title = "Coming Soon",
  message = "This feature is coming soon. Stay tuned — we'll notify you once it's available.",
}) => {
  if (!open) return null;

  return (
    // backdrop
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      {/* panel */}
      <div
        role="document"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* close button */}
        <button
          onClick={onClose}
          aria-label="Close coming soon"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground mb-6">{message}</p>

          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:brightness-95"
            >
              OK
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonModal;
