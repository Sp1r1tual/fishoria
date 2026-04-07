import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  GamePhaseType,
  CatchResultType,
  IGameState,
  ILossEvent,
} from '@/common/types';

const INITIAL: IGameState = {
  currentLakeId: null,
  phase: 'idle',
  tension: 0,
  isBroken: false,
  depthMeters: 1.0,
  groundbaitExpiresAt: null,
  lastCatch: null,
  lossEvent: null,
  weather: 'clear',
  weatherForecast: [],
  lastWeatherUpdateHour: null,
  baseDepth: 100,
};

const gameSlice = createSlice({
  name: 'game',
  initialState: INITIAL,
  reducers: {
    setCurrentLake(state, action: PayloadAction<string | null>) {
      state.currentLakeId = action.payload;
    },
    setPhase(state, action: PayloadAction<GamePhaseType>) {
      state.phase = action.payload;
    },
    setTension(
      state,
      action: PayloadAction<{ value: number; broken: boolean }>,
    ) {
      state.tension = action.payload.value;
      state.isBroken = action.payload.broken;
    },
    setDepth(state, action: PayloadAction<number>) {
      state.depthMeters = action.payload;
    },
    setBaseDepth(state, action: PayloadAction<number>) {
      state.baseDepth = action.payload;
    },
    setGroundbaitExpiry(state, action: PayloadAction<number | null>) {
      state.groundbaitExpiresAt = action.payload;
    },
    setCatch(state, action: PayloadAction<CatchResultType>) {
      state.lastCatch = action.payload;
    },
    clearCatch(state) {
      state.lastCatch = null;
    },
    setLossEvent(state, action: PayloadAction<ILossEvent>) {
      state.lossEvent = action.payload;
    },
    clearLossEvent(state) {
      state.lossEvent = null;
    },
    setWeatherForecast(
      state,
      action: PayloadAction<('clear' | 'cloudy' | 'rain')[]>,
    ) {
      state.weatherForecast = action.payload;
      if (action.payload.length > 0) {
        state.weather = action.payload[0];
      }
    },
    setLastWeatherUpdateHour(state, action: PayloadAction<number>) {
      state.lastWeatherUpdateHour = action.payload;
    },
    setWeather(state, action: PayloadAction<'clear' | 'cloudy' | 'rain'>) {
      state.weather = action.payload;
    },
    resetGame(state) {
      state.phase = 'idle';
      state.tension = 0;
      state.isBroken = false;
      state.lastCatch = null;
      state.lossEvent = null;
      // NOTE: currentLakeId is intentionally NOT reset here.
      // Resetting it would destroy the Pixi scene (dark screen after catching fish).
      // The lake is cleared when the user explicitly leaves to the main menu.
      state.groundbaitExpiresAt = null;
    },
  },
});

export const {
  setCurrentLake,
  setPhase,
  setTension,
  setDepth,
  setGroundbaitExpiry,
  setCatch,
  clearCatch,
  setLossEvent,
  clearLossEvent,
  setWeather,
  setWeatherForecast,
  setLastWeatherUpdateHour,
  setBaseDepth,
  resetGame,
} = gameSlice.actions;
export default gameSlice.reducer;
