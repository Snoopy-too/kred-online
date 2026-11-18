import React from 'react';
import { getAssetUrl } from '../../utils/assets.js';

export function LandingScreen({
  skipDraft,
  setSkipDraft,
  onStartSoloGame,
  onStartLocalGame,
  onEnterOnlineLobby,
  onQuickRejoinOnline
}) {
  const lastLocal = JSON.parse(localStorage.getItem('kred_last_local') || 'null');
  const lastOnline = JSON.parse(localStorage.getItem('kred_last_online') || 'null');

  const cardStyle = {
    background: '#261f1a',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '22px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const skipBoxStyle = {
    background: '#1a1411',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 12px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <div className="landing-screen">
      <div className="landing-card" style={{ maxWidth: '1140px', padding: '32px' }}>
        <div className="landing-logo" style={{ marginBottom: '24px' }}>
          <img src={getAssetUrl('images/logo.png')} alt="KRED" className="landing-logo-img" />
          <p className="landing-subtitle">Multiplayer Board Game of Deception & Strategy</p>
        </div>

        <div className="mode-cards-grid" style={{ gap: '20px' }}>
          {/* Option A: Solo vs. 2 AI Bots */}
          <div style={{ ...cardStyle, border: '1px solid var(--accent-gold)' }}>
            <div>
              <h2 style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '20px' }}>
                🤖 Play Solo (vs. 2 AI)
              </h2>
              <p className="landing-subtitle" style={{ marginBottom: '16px', fontSize: '14px', lineHeight: 1.5 }}>
                3-Player match against <strong>Baron Vance</strong> and <strong>Inspector Vale</strong> with hidden bot hands.
              </p>

              <div style={skipBoxStyle}>
                <label style={{ color: '#e2e8f0', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={skipDraft}
                    onChange={(e) => setSkipDraft(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                  />
                  <span><strong>⚡ Skip Draft Phase</strong></span>
                </label>
              </div>
            </div>

            <button
              className="btn btn-primary mode-btn"
              style={{ width: '100%', padding: '14px 16px', fontSize: '15px', fontWeight: '800' }}
              onClick={onStartSoloGame}
            >
              Start Solo Match {skipDraft ? '(Quick)' : '(Full Draft)'}
            </button>
          </div>

          {/* Option B: Local Pass-and-Play / Test Mode */}
          <div style={cardStyle}>
            <div>
              <h2 style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '20px' }}>
                🎮 Local Pass & Play
              </h2>
              <p className="landing-subtitle" style={{ marginBottom: '16px', fontSize: '14px', lineHeight: 1.5 }}>
                Control 3, 4, or 5 players locally and switch player perspectives freely.
              </p>

              <div style={skipBoxStyle}>
                <label style={{ color: '#e2e8f0', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={skipDraft}
                    onChange={(e) => setSkipDraft(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                  />
                  <span><strong>⚡ Skip Draft Phase</strong></span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="btn btn-primary mode-btn" onClick={() => onStartLocalGame(3)}>
                Start 3-Player Test Game {skipDraft ? '(No Draft)' : ''}
              </button>
              <button className="btn btn-primary mode-btn" onClick={() => onStartLocalGame(4)}>
                Start 4-Player Test Game {skipDraft ? '(No Draft)' : ''}
              </button>
              <button className="btn btn-primary mode-btn" onClick={() => onStartLocalGame(5)}>
                Start 5-Player Test Game {skipDraft ? '(No Draft)' : ''}
              </button>
              {lastLocal && (
                <button
                  className="btn btn-secondary mode-btn"
                  style={{ marginTop: '4px', border: '1px solid var(--accent-gold)' }}
                  onClick={() => {
                    setSkipDraft(lastLocal.skipDraft || false);
                    onStartLocalGame(lastLocal.numPlayers);
                  }}
                >
                  🔄 Resume Last Local ({lastLocal.numPlayers}P)
                </button>
              )}
            </div>
          </div>

          {/* Option C: Online Supabase Multiplayer Mode */}
          <div style={cardStyle}>
            <div>
              <h2 style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '20px' }}>
                🌐 Online Multiplayer
              </h2>
              <p className="landing-subtitle" style={{ marginBottom: '20px', fontSize: '14px', lineHeight: 1.5 }}>
                Play online with friends using 6-digit room PINs powered by Supabase Realtime.
              </p>
            </div>
            <div>
              <button
                className="btn btn-warning"
                style={{ width: '100%', padding: '14px 16px', fontSize: '15px', fontWeight: '800' }}
                onClick={onEnterOnlineLobby}
              >
                Enter Online Lobby & PINs →
              </button>
              {lastOnline && (
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '10px', padding: '12px', border: '1px solid var(--accent-gold)' }}
                  onClick={() => onQuickRejoinOnline(lastOnline.pin)}
                >
                  🔄 Quick Rejoin PIN: {lastOnline.pin}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
