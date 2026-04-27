export type UserRole = 'PLAYER' | 'MODERATOR';

export type EChatMessageType = 'chat' | 'system';

export type EFishingMethod = 'FLOAT' | 'SPINNING' | 'FEEDER';

export interface IChatUser {
  id: string;
  username: string;
  avatar: string | null;
  role: UserRole;
  level: number;
}

export interface IChatMessage {
  id: string;
  type: EChatMessageType;
  user: string;
  userId: string;
  isModerator: boolean;
  text?: string;
  fish?: string;
  weight?: string;
  lakeId?: string;
  lakeName?: string;
  method?: EFishingMethod;
  timestamp: string;
}

export interface ISendMessagePayload {
  text: string;
}

export interface ICatchEventPayload {
  speciesName: string;
  weight: number;
  lakeId: string;
  lakeName: string;
  method: EFishingMethod;
}

export interface IJoinPayload {
  userId: string;
  token: string;
  lakeId: string;
}

export interface IChatRoomState {
  lakeId: string;
  onlineCount: number;
  users: IChatUser[];
}
