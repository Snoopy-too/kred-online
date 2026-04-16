import React, { useState } from 'react';
import { useLobby } from '../../contexts/LobbyContext';

export default function LobbyScreen() {
  const { createLobby, joinLobby, rejoinAvailable, rejoinGame, dismissRejoin } = useLobby();

  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [hostName, setHostName] = useState('');
  const [selectedPlayerCount, setSelectedPlayerCount] = useState(3);
  const [skipDraftOption, setSkipDraftOption] = useState(false);
  const [diagnosticEnabled, setDiagnosticEnabled] = useState(false);
  const [joinPin, setJoinPin] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!hostName.trim()) { setError('Please enter your name'); return; }
    setError(null);
    setLoading(true);
    try {
      await createLobby(hostName.trim(), selectedPlayerCount, skipDraftOption, diagnosticEnabled);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create lobby');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!guestName.trim()) { setError('Please enter your name'); return; }
    if (!joinPin.trim()) { setError('Please enter the game PIN'); return; }
    setError(null);
    setLoading(true);
    try {
      await joinLobby(joinPin.trim(), guestName.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join lobby');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => { setMode('menu'); setError(null); };

  return (
    <main className="min-h-screen w-full bg-sky-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans text-slate-800">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="./images/logo.png"
            alt="KRED"
            className="w-full max-w-xs mx-auto"
            style={{ filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15))' }}
          />
          <p className="text-lg text-sky-900 mt-2 italic">Online Multiplayer</p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-sky-200 p-6 sm:p-8">
          {/* Rejoin banner */}
          {rejoinAvailable && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6">
              <p className="text-amber-900 text-sm font-medium mb-2">
                Active game found — PIN: <span className="font-mono font-bold tracking-wider">{rejoinAvailable.pin}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={rejoinGame}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Rejoin Game
                </button>
                <button
                  onClick={dismissRejoin}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Main menu */}
          {mode === 'menu' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('create')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl text-lg font-bold tracking-tight transition-colors shadow-md hover:shadow-lg cursor-pointer"
              >
                Create Game
              </button>
              <div className="flex items-center gap-4">
                <hr className="flex-1 border-slate-300" />
                <span className="text-slate-400 text-sm">or</span>
                <hr className="flex-1 border-slate-300" />
              </div>
              <button
                onClick={() => setMode('join')}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3 px-6 rounded-xl text-lg font-bold tracking-tight transition-colors shadow-md hover:shadow-lg cursor-pointer"
              >
                Join Game
              </button>
            </div>
          )}

          {/* Create game form */}
          {mode === 'create' && (
            <div className="space-y-5">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="w-full bg-white text-slate-800 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition-colors"
                  placeholder="Enter your name"
                  maxLength={20}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-2">Number of Players</label>
                <div className="flex gap-2">
                  {[3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setSelectedPlayerCount(n)}
                      className={`flex-1 py-2.5 rounded-lg font-bold text-lg transition-all cursor-pointer ${
                        selectedPlayerCount === n
                          ? 'bg-indigo-600 text-white shadow-md scale-105'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 transition-colors">
                <input
                  type="checkbox"
                  checked={skipDraftOption}
                  onChange={(e) => setSkipDraftOption(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600">
                  <span className="font-semibold text-amber-700">Skip Draft</span>
                  <span className="text-slate-400 ml-1">(testing — tiles distributed randomly)</span>
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 transition-colors">
                <input
                  type="checkbox"
                  checked={diagnosticEnabled}
                  onChange={(e) => setDiagnosticEnabled(e.target.checked)}
                  className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                />
                <span className="text-sm text-slate-600">
                  <span className="font-semibold text-violet-700">Enable Diagnostic Logging</span>
                  <span className="text-slate-400 ml-1">(records detailed UI events for this session — for debugging)</span>
                </span>
              </label>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white py-3 rounded-xl font-bold transition-colors shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Game'}
              </button>
              <button onClick={goBack} className="w-full text-slate-400 hover:text-slate-600 text-sm py-2 cursor-pointer">
                &larr; Back
              </button>
            </div>
          )}

          {/* Join game form */}
          {mode === 'join' && (
            <div className="space-y-5">
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1">Game PIN</label>
                <input
                  type="text"
                  value={joinPin}
                  onChange={(e) => setJoinPin(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  className="w-full bg-white text-slate-800 px-4 py-3 rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none font-mono text-center text-2xl tracking-[0.3em] transition-colors"
                  placeholder="------"
                  maxLength={6}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-slate-600 text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  className="w-full bg-white text-slate-800 px-4 py-2.5 rounded-lg border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:outline-none transition-colors"
                  placeholder="Enter your name"
                  maxLength={20}
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 disabled:text-slate-500 text-white py-3 rounded-xl font-bold transition-colors shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Game'}
              </button>
              <button onClick={goBack} className="w-full text-slate-400 hover:text-slate-600 text-sm py-2 cursor-pointer">
                &larr; Back
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
