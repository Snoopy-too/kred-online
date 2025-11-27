/**
 * Shared Modal Components
 *
 * Reusable modal components extracted from App.tsx for better organization
 * and maintainability.
 */

import React from "react";

// ============================================================================
// ALERT MODAL
// ============================================================================

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: "error" | "warning" | "info";
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  type,
  onClose,
}) => {
  if (!isOpen) return null;

  const colors = {
    error: { border: "#ef5350", text: "#ef5350", icon: "✕" },
    warning: { border: "#ffa726", text: "#ffa726", icon: "⚠️" },
    info: { border: "#29b6f6", text: "#29b6f6", icon: "ℹ️" },
  };

  const { border, text, icon } = colors[type];

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-gray-800 border-2 rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8"
        style={{ borderColor: border }}
      >
        <div className="mb-4">
          <div
            className={`text-6xl ${type === "error" ? "font-bold" : ""} mb-2`}
            style={{ color: text }}
          >
            {icon}
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-3" style={{ color: text }}>
          {title}
        </h2>
        <p className="text-slate-300 mb-6 text-lg">{message}</p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors shadow-md"
        >
          OK
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// PERFECT TILE MODAL
// ============================================================================

interface PerfectTileModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export const PerfectTileModal: React.FC<PerfectTileModalProps> = ({
  isOpen,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 border-2 border-green-500 rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8">
        <div className="mb-4">
          <div className="text-6xl text-green-400 mb-2">✓</div>
        </div>
        <h2 className="text-3xl font-bold mb-3 text-green-400">
          Perfect Tile Play
        </h2>
        <p className="text-slate-300 mb-6 text-lg">
          The tile requirements have been fulfilled perfectly. You cannot reject
          this tile. Other players may now challenge the play.
        </p>
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 transition-colors shadow-md"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// CHALLENGE RESULT MESSAGE
// ============================================================================

interface ChallengeResultMessageProps {
  message: string | null;
}

export const ChallengeResultMessage: React.FC<ChallengeResultMessageProps> = ({
  message,
}) => {
  if (!message) return null;

  const isFailed = message.includes("Failed");

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4"
      aria-live="polite"
      role="status"
    >
      <div
        className={`rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8 border-2 ${
          isFailed
            ? "bg-green-900 border-green-500 text-green-300"
            : "bg-orange-900 border-orange-500 text-orange-300"
        }`}
      >
        <h2 className="text-2xl font-bold mb-2">
          {isFailed ? "✓ Challenge Failed" : "⚠️ Challenge Successful"}
        </h2>
        <p className="text-lg">{message}</p>
      </div>
    </div>
  );
};

// ============================================================================
// FINISH TURN CONFIRMATION MODAL
// ============================================================================

interface FinishTurnConfirmModalProps {
  isOpen: boolean;
  remainingKredcoin: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const FinishTurnConfirmModal: React.FC<FinishTurnConfirmModalProps> = ({
  isOpen,
  remainingKredcoin,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-xl text-center shadow-2xl max-w-md w-full p-6 sm:p-8">
        <div className="mb-4">
          <div className="text-6xl text-yellow-400 mb-2">⚠️</div>
        </div>
        <h2 className="text-3xl font-bold mb-3 text-yellow-400">
          Finish Turn?
        </h2>
        <p className="text-slate-300 mb-6 text-lg">
          Are you sure you want to finish? You still have{" "}
          <span className="text-yellow-400 font-bold">
            ₭-{remainingKredcoin}
          </span>{" "}
          left.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors shadow-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors shadow-md"
          >
            Yes, Finish
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BUREAUCRACY TRANSITION MESSAGE
// ============================================================================

interface BureaucracyTransitionProps {
  isVisible: boolean;
}

export const BureaucracyTransition: React.FC<BureaucracyTransitionProps> = ({
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] transition-opacity duration-500"
      aria-live="polite"
      role="status"
    >
      <div className="text-center animate-pulse">
        <h1
          className="text-8xl sm:text-9xl font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.8)] mb-4"
          style={{
            textShadow:
              "0 0 20px rgba(250,204,21,0.5), 0 0 40px rgba(250,204,21,0.3)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            letterSpacing: "0.05em",
          }}
        >
          BUREAUCRACY!
        </h1>
        <p className="text-2xl text-yellow-200 font-semibold">
          Prepare for the bureaucracy phase...
        </p>
      </div>
    </div>
  );
};
