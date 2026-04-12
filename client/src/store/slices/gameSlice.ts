import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  GamePhaseType,
  CatchResultType,
  IGameState,
  ILossEvent,
  IGearAction,
  WeatherType,
} from '@/common/types';

const INITIAL: IGameState & { pendingEquips: IGearAction[] } = {
  currentLakeId: null,
  phase: 'idle',
  tension: 0,
  isBroken: false,
  depthMeters: 1.0,
  baseDepth: 100,
  groundbaitExpiresAt: null,
  lastCatch: null,
  lossEvent: null,
  weather: 'clear',
  weatherForecast: [],
  lastWeatherUpdateHour: null,
  pendingEquips: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState: INITIAL,
  reducers: {
    addPendingEquips(state, action: PayloadAction<IGearAction[]>) {
      state.pendingEquips.push(...action.payload);
    },
    clearPendingEquips(state) {
      state.pendingEquips = [];
    },

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

    setWeatherForecast(state, action: PayloadAction<WeatherType[]>) {
      state.weatherForecast = action.payload;
      if (action.payload.length > 0) {
        state.weather = action.payload[0];
      }
    },
    setLastWeatherUpdateHour(state, action: PayloadAction<number>) {
      state.lastWeatherUpdateHour = action.payload;
    },
    setWeather(state, action: PayloadAction<WeatherType>) {
      state.weather = action.payload;
    },

    resetGame(state) {
      state.phase = 'idle';
      state.tension = 0;
      state.isBroken = false;
      state.lastCatch = null;
      state.lossEvent = null;
    },
  },
});

export const {
  addPendingEquips,
  clearPendingEquips,
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
