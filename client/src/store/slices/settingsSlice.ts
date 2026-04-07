import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ISettingsState } from '@/common/types';

const SETTINGS_SAVE_KEY = 'wfg_settings';
const loadSettings = (): ISettingsState => {
  const defaults: ISettingsState = {
    musicEnabled: true,
    sfxEnabled: true,
    ambientEnabled: true,
    musicVolume: 50,
    sfxVolume: 80,
    ambientVolume: 60,
    debugMode: false,
    language: 'en',
  };

  try {
    const raw = localStorage.getItem(SETTINGS_SAVE_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      return { ...defaults, ...stored };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
  return defaults;
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadSettings(),
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<ISettingsState>>) {
      Object.assign(state, action.payload);
      try {
        localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to save settings:', err);
      }
    },
  },
});

export const { updateSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
