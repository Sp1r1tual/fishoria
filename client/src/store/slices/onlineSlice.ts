import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  IServerStatus,
  IChatMessage,
  IChatRoomState,
  ConnectionStatusType,
  IChatHistoryResponse,
} from '@/common/types';

const MAX_MESSAGES = 100;

interface OnlineState {
  serverStatus: IServerStatus | null;
  connectionStatus: ConnectionStatusType;
  chatConnectionStatus: ConnectionStatusType;
  messages: IChatMessage[];
  roomState: IChatRoomState | null;
  lakesOnlineStats: Record<string, number>;
  currentChatLakeId: string | null;
  lastReadMessageId: string | null;
}

const initialState: OnlineState = {
  serverStatus: null,
  connectionStatus: 'offline',
  chatConnectionStatus: 'offline',
  messages: [],
  roomState: null,
  lakesOnlineStats: {},
  currentChatLakeId: null,
  lastReadMessageId: null,
};

const onlineSlice = createSlice({
  name: 'online',
  initialState,
  reducers: {
    setServerStatus(state, action: PayloadAction<IServerStatus>) {
      state.serverStatus = action.payload;
    },

    setConnectionStatus(state, action: PayloadAction<ConnectionStatusType>) {
      state.connectionStatus = action.payload;
    },

    setChatConnectionStatus(
      state,
      action: PayloadAction<ConnectionStatusType>,
    ) {
      state.chatConnectionStatus = action.payload;
    },

    addChatMessage(state, action: PayloadAction<IChatMessage>) {
      state.messages = [
        ...state.messages.slice(-(MAX_MESSAGES - 1)),
        action.payload,
      ];
    },

    setChatHistory(state, action: PayloadAction<IChatHistoryResponse>) {
      state.messages = action.payload.history.slice(-MAX_MESSAGES);
      state.lastReadMessageId = action.payload.lastReadMessageId;
    },

    setLastReadMessageId(state, action: PayloadAction<string | null>) {
      state.lastReadMessageId = action.payload;
    },

    setRoomState(state, action: PayloadAction<IChatRoomState>) {
      state.roomState = action.payload;
    },

    setLakesOnlineStats(state, action: PayloadAction<Record<string, number>>) {
      state.lakesOnlineStats = action.payload;
    },

    setCurrentChatLakeId(state, action: PayloadAction<string | null>) {
      state.currentChatLakeId = action.payload;
    },

    clearChat(state) {
      state.messages = [];
      state.roomState = null;
      state.currentChatLakeId = null;
    },

    resetOnline() {
      return initialState;
    },
  },
});

export const {
  setServerStatus,
  setConnectionStatus,
  setChatConnectionStatus,
  addChatMessage,
  setChatHistory,
  setLastReadMessageId,
  setRoomState,
  setLakesOnlineStats,
  setCurrentChatLakeId,
  clearChat,
  resetOnline,
} = onlineSlice.actions;

export default onlineSlice.reducer;
