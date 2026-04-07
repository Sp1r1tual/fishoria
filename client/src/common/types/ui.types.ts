export type ScreenType =
  | 'mainMenu'
  | 'lakeSelect'
  | 'game'
  | 'shop'
  | 'inventory'
  | 'gear';

export interface IToast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error' | 'warning' | 'achievement' | 'quest';
  duration?: number;
  imageUrl?: string;
}

export type UniversalModalType =
  | 'info'
  | 'error'
  | 'success'
  | 'warning'
  | 'question'
  | 'store'
  | 'gear'
  | 'default'
  | 'danger';

export interface IModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  icon?: string;
  price?: number;
  onConfirm: () => void;
}
