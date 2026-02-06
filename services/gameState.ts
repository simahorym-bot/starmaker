import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Artist, Team, Studio, Fanbase, SocialMedia } from '@/types/game';

const STORAGE_KEY = '@starmaker_game_state';

// Initialize a new game
export const initializeNewGame = (artistName: string, stageName: string, genre: string): GameState => {
  const artist: Artist = {
    id: Date.now().toString(),
    name: artistName,
    stageName,
    genre,
    level: 1,
    experience: 0,
    energy: 100,
    maxEnergy: 100,
    prestige: 0,
    money: 10000, // Starting money
    reputation: 0,
    createdAt: Date.now(),
  };

  const team: Team = {
    manager: null,
    engineer: null,
    publicist: null,
    creativeDirector: null,
    digitalStrategist: null,
    pressAttache: null,
    tourManager: null,
    bodyguards: null,
  };

  const studio: Studio = {
    quality: 1,
    equipment: [],
    upgrades: [],
    rooms: [],
    soundFidelity: 50,
  };

  const fanbase: Fanbase = {
    total: 0,
    hardcore: 0,
    casual: 0,
    haters: 0,
    demographics: {
      regions: {},
      ageGroups: {
        '13-17': 0,
        '18-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45+': 0,
      },
    },
    engagement: 0,
  };

  const socialMedia: SocialMedia = {
    starGram: {
      followers: 0,
      posts: [],
    },
    twittArt: {
      followers: 0,
      tweets: [],
    },
  };

  return {
    artist,
    team,
    studio,
    songs: [],
    fanbase,
    socialMedia,
    relationships: [],
    luxuryItems: [],
    merchandise: [],
    tours: [],
    mediaEvents: [],
    awards: [],
    contracts: [],
    businessInvestments: [],
    brandDeals: [],
    fashionLines: [],
    popupStores: [],
    pressConferences: [],
    retirementProgress: 0,
    lastSaved: Date.now(),
  };
};

// Save game state
export const saveGameState = async (state: GameState): Promise<void> => {
  try {
    const updatedState = { ...state, lastSaved: Date.now() };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
  } catch (error) {
    console.error('Error saving game state:', error);
    throw error;
  }
};

// Load game state
export const loadGameState = async (): Promise<GameState | null> => {
  try {
    const stateString = await AsyncStorage.getItem(STORAGE_KEY);
    if (stateString) {
      return JSON.parse(stateString);
    }
    return null;
  } catch (error) {
    console.error('Error loading game state:', error);
    return null;
  }
};

// Clear game state (new game)
export const clearGameState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing game state:', error);
    throw error;
  }
};

// Update specific parts of game state
export const updateArtist = async (updates: Partial<Artist>): Promise<void> => {
  const state = await loadGameState();
  if (state) {
    state.artist = { ...state.artist, ...updates };
    await saveGameState(state);
  }
};

export const addMoney = async (amount: number): Promise<void> => {
  const state = await loadGameState();
  if (state) {
    state.artist.money += amount;
    await saveGameState(state);
  }
};

export const spendMoney = async (amount: number): Promise<boolean> => {
  const state = await loadGameState();
  if (state && state.artist.money >= amount) {
    state.artist.money -= amount;
    await saveGameState(state);
    return true;
  }
  return false;
};

export const addPrestige = async (amount: number): Promise<void> => {
  const state = await loadGameState();
  if (state) {
    state.artist.prestige += amount;
    await saveGameState(state);
  }
};

export const addFans = async (amount: number, type: 'hardcore' | 'casual' = 'casual'): Promise<void> => {
  const state = await loadGameState();
  if (state) {
    state.fanbase.total += amount;
    if (type === 'hardcore') {
      state.fanbase.hardcore += amount;
    } else {
      state.fanbase.casual += amount;
    }
    await saveGameState(state);
  }
};
