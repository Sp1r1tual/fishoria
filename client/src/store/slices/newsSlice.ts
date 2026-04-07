import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface NewsState {
  readIds: string[];
}

const READ_NEWS_KEY = 'wfg_read_news_ids';

const loadInitial = (): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(READ_NEWS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

const INITIAL: NewsState = {
  readIds: loadInitial(),
};

const newsSlice = createSlice({
  name: 'news',
  initialState: INITIAL,
  reducers: {
    markRead(state, action: PayloadAction<string>) {
      if (!state.readIds.includes(action.payload)) {
        state.readIds.push(action.payload);
        localStorage.setItem(READ_NEWS_KEY, JSON.stringify(state.readIds));
      }
    },
    markAllRead(state, action: PayloadAction<string[]>) {
      state.readIds = [...new Set([...state.readIds, ...action.payload])];
      localStorage.setItem(READ_NEWS_KEY, JSON.stringify(state.readIds));
    },
  },
});

export const { markRead, markAllRead } = newsSlice.actions;
export default newsSlice.reducer;
