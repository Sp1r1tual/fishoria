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
  readPointers: Record<string, string>;
}

const initialState: OnlineState = {
  serverStatus: null,
  connectionStatus: 'offline',
  chatConnectionStatus: 'offline',
  messages: [],
  roomState: null,
  lakesOnlineStats: {},
  currentChatLakeId: null,
  readPointers: {},
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

    deleteChatMessage(state, action: PayloadAction<string>) {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
    },

    setChatHistory(state, action: PayloadAction<IChatHistoryResponse>) {
      state.messages = [...action.payload.messages, ...action.payload.events]
        .sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        )
        .slice(-MAX_MESSAGES);
      state.readPointers = action.payload.readPointers;
    },

    setReadPointer(
      state,
      action: PayloadAction<{ type: string; messageId: string }>,
    ) {
      state.readPointers[action.payload.type] = action.payload.messageId;
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
      state.readPointers = {};
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
  deleteChatMessage,
  setChatHistory,
  setReadPointer,
  setRoomState,
  setLakesOnlineStats,
  setCurrentChatLakeId,
  clearChat,
  resetOnline,
} = onlineSlice.actions;

export default onlineSlice.reducer;
