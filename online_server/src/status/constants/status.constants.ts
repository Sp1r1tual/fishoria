export const EServerStatus = {
  STARTING: 'starting',
  CONNECTING_DB: 'connecting_db',
  CONNECTING_REDIS: 'connecting_redis',
  ONLINE: 'online',
} as const;

export type EServerStatus = (typeof EServerStatus)[keyof typeof EServerStatus];
