export interface ISettingsState {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  ambientEnabled?: boolean;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume?: number;
  debugMode?: boolean;
  language?: 'en' | 'uk';
  onlineMode?: boolean;
}
