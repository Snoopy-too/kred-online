import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface GameHeaderProps {
  showLanguageSwitcher?: boolean;
  className?: string;
}

/**
 * GameHeader - Displays the KRED logo and optional language switcher
 * Can be used across different game screens
 */
const GameHeader: React.FC<GameHeaderProps> = ({ 
  showLanguageSwitcher = true,
  className = ''
}) => {
  const { t } = useTranslation('common');

  return (
    <div className={`game-header ${className}`}>
      {showLanguageSwitcher && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1000 }}>
          <LanguageSwitcher />
        </div>
      )}
      
      <div className="text-center mb-4">
        <img
          src="./images/logo.png"
          alt="KRED Logo"
          className="w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto"
          style={{ filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.15))" }}
        />
        <p className="text-xl text-sky-900 mt-2 italic">
          {t('game.tagline')}
        </p>
      </div>
    </div>
  );
};

export default GameHeader;
