import type { UserRole, RigTypeType } from './index';

export type FishingMethodType = RigTypeType;

export type ChatMessageTypeType = 'chat' | 'system';

export interface IServerStatus {
  status: string;
  message: string;
  uptime: number;
  timestamp?: string;
}

export interface IChatUser {
  id: string;
  username: string;
  avatar: string | null;
  role: UserRole;
  level: number;
}

export interface IChatMessage {
  id: string;
  type: ChatMessageTypeType;
  user: string;
  userId: string;
  isModerator: boolean;
  text?: string;
  fish?: string;
  weight?: string;
  lakeId?: string;
  lakeName?: string;
  method?: FishingMethodType;
  fishId?: string;
  timestamp: string;
}

export interface IChatRoomState {
  lakeId: string;
  onlineCount: number;
  users: IChatUser[];
}

export interface ICatchEventPayload {
  fishId?: string;
  speciesName: string;
  weight: number;
  lakeId: string;
  lakeName: string;
  method: FishingMethodType;
}

export interface IChatHistoryResponse {
  messages: IChatMessage[];
  events: IChatMessage[];
  readPointers: Record<string, string>;
}

export type ConnectionStatusType =
  | 'online'
  | 'offline'
  | 'connecting'
  | 'error';
