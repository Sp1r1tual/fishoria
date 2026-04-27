import type { IChatMessage, ChatTabType } from '@/common/types';

export interface IChatState {
  activeTab: ChatTabType;
  isMinimized: boolean;
}

export type ChatAction =
  | { type: 'SET_TAB'; tab: ChatTabType }
  | { type: 'TOGGLE_MINIMIZED' };

export const initialState: IChatState = {
  activeTab: 'events',
  isMinimized: true,
};

export function chatReducer(state: IChatState, action: ChatAction): IChatState {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.tab, isMinimized: false };
    case 'TOGGLE_MINIMIZED':
      return { ...state, isMinimized: !state.isMinimized };
    default:
      return state;
  }
}

export function getMessageIndex(
  messages: IChatMessage[],
  id: string | null,
): number {
  if (!id) return -1;
  return messages.findIndex((m) => m.id === id);
}
