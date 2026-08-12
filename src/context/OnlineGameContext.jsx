import React, { createContext, useContext } from 'react';

export const OnlineGameContext = createContext({
  isOnline: false,
  dbMasterState: null,
  updateMasterGameState: null,
  playerNames: [],
  onlinePlayerIndex: 0
});

export const useOnlineGame = () => useContext(OnlineGameContext);
