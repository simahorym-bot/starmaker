import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState } from '@/types/game';
import { loadGameState, saveGameState } from '@/services/gameState';

interface GameContextType {
  gameState: GameState | null;
  updateGameState: (updates: Partial<GameState>) => Promise<void>;
  refreshGameState: () => Promise<void>;
  loading: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  const loadGame = async () => {
    try {
      const state = await loadGameState();
      setGameState(state);
    } catch (error) {
      console.error('Error loading game:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGame();
  }, []);

  const updateGameState = async (updates: Partial<GameState>) => {
    if (gameState) {
      const newState = { ...gameState, ...updates };
      setGameState(newState);
      await saveGameState(newState);
    }
  };

  const refreshGameState = async () => {
    await loadGame();
  };

  return (
    <GameContext.Provider value={{ gameState, updateGameState, refreshGameState, loading }}>
      {children}
    </GameContext.Provider>
  );
};
