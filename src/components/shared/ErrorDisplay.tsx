/**
 * ErrorDisplay Component
 * 
 * A simple error boundary UI component that displays when the game fails to load.
 * Provides a user-friendly error message and a reload button.
 * 
 * @component
 * @example
 * ```tsx
 * <ErrorDisplay />
 * ```
 */

import React from "react";

const ErrorDisplay: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
    <div className="bg-gray-800 border-2 border-red-500 rounded-xl p-8 max-w-md w-full text-center">
      <div className="text-6xl text-red-400 mb-4">✕</div>
      <h1 className="text-3xl font-bold text-red-400 mb-4">
        Error Loading Game
      </h1>
      <p className="text-slate-300 mb-6">
        An unexpected error occurred. Please check the browser console for
        details.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 transition-colors"
      >
        Reload Page
      </button>
    </div>
  </div>
);

export default ErrorDisplay;
