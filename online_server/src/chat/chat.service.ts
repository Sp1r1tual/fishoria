import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

import type {
  IChatMessage,
  IChatUser,
  ISendMessagePayload,
  ICatchEventPayload,
  IChatRoomState,
} from './types/chat.types';

const MAX_HISTORY = 50;
const MESSAGE_MAX_LENGTH = 100;
const MESSAGE_COOLDOWN_MS = 2000;

const redisKeys = {
  history: (lakeId: string, type: 'chat' | 'system') =>
    `chat:lake:${lakeId}:history:${type}`,
  online: (lakeId: string) => `chat:lake:${lakeId}:online`,
  readPointers: (userId: string) => `chat:user:${userId}:read_pointers`,
};

@Injectable()
export class ChatService implements OnModuleInit {
  private readonly logger = new Logger(ChatService.name);
  private readonly cooldowns = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    try {
      const keys = await this.redis.keys('chat:lake:*:online');
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(
          `Cleared ${keys.length} online lake state(s) on startup`,
        );
      }
    } catch (e) {
      this.logger.error('Failed to clear online states on startup', e);
    }
  }

  async getUser(userId: string): Promise<IChatUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: { select: { level: true } } },
    });

    if (!user || !user.username) return null;

    return {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      role: user.role as IChatUser['role'],
      level: user.profile?.level ?? 1,
    };
  }

  async createChatMessage(
    chatUser: IChatUser,
    lakeId: string,
    payload: ISendMessagePayload,
  ): Promise<IChatMessage | null> {
    const text = payload.text.trim().slice(0, MESSAGE_MAX_LENGTH);
    if (!text) return null;

    const now = Date.now();
    const lastSent = this.cooldowns.get(chatUser.id) ?? 0;
    if (now - lastSent < MESSAGE_COOLDOWN_MS) return null;
    this.cooldowns.set(chatUser.id, now);

    const message: IChatMessage = {
      id: `msg_${now}_${chatUser.id.slice(0, 8)}`,
      type: 'chat',
      user: chatUser.username,
      userId: chatUser.id,
      isModerator: chatUser.role === 'MODERATOR',
      text,
      lakeId,
      timestamp: new Date().toISOString(),
    };

    await this.saveToHistory(lakeId, message);
    await this.markAsRead(lakeId, chatUser.id, message.id, 'chat');
    return message;
  }

  createCatchEvent(
    chatUser: IChatUser,
    payload: ICatchEventPayload,
  ): IChatMessage {
    const message: IChatMessage = {
      id: `catch_${Date.now()}_${chatUser.id.slice(0, 8)}`,
      type: 'system',
      user: chatUser.username,
      userId: chatUser.id,
      isModerator: chatUser.role === 'MODERATOR',
      fishId: payload.fishId,
      fish: payload.speciesName,
      weight: `${payload.weight.toFixed(3)} кг`,
      lakeId: payload.lakeId,
      lakeName: payload.lakeName,
      method: payload.method,
      timestamp: new Date().toISOString(),
    };

    this.saveToHistory(payload.lakeId, message).then(() => {
      this.markAsRead(payload.lakeId, chatUser.id, message.id, 'system');
    });
    return message;
  }

  async addOnlineUser(lakeId: string, chatUser: IChatUser): Promise<void> {
    await this.redis.hset(redisKeys.online(lakeId), {
      [chatUser.id]: JSON.stringify(chatUser),
    });
  }

  async removeOnlineUser(lakeId: string, userId: string): Promise<void> {
    await this.redis.hdel(redisKeys.online(lakeId), userId);
  }

  async getLakeRoomState(lakeId: string): Promise<IChatRoomState> {
    const raw = await this.redis.hgetall<Record<string, string>>(
      redisKeys.online(lakeId),
    );

    const users: IChatUser[] = raw
      ? Object.values(raw).map((val) =>
          typeof val === 'string' ? JSON.parse(val) : val,
        )
      : [];

    return { lakeId, onlineCount: users.length, users };
  }

  async getHistory(
    lakeId: string,
  ): Promise<{ messages: IChatMessage[]; events: IChatMessage[] }> {
    const [messagesRaw, eventsRaw] = await Promise.all([
      this.redis.lrange<string>(
        redisKeys.history(lakeId, 'chat'),
        0,
        MAX_HISTORY - 1,
      ),
      this.redis.lrange<string>(
        redisKeys.history(lakeId, 'system'),
        0,
        MAX_HISTORY - 1,
      ),
    ]);

    const messages = (messagesRaw || []).map((item) =>
      typeof item === 'string' ? JSON.parse(item) : item,
    );
    const events = (eventsRaw || []).map((item) =>
      typeof item === 'string' ? JSON.parse(item) : item,
    );

    return { messages, events };
  }

  async getAllLakesOnlineCount(): Promise<Record<string, number>> {
    try {
      const keys = await this.redis.keys('chat:lake:*:online');
      if (!keys || keys.length === 0) return {};

      const counts: Record<string, number> = {};
      await Promise.all(
        keys.map(async (key) => {
          const parts = key.split(':');
          const lakeId = parts[2];
          if (lakeId) {
            counts[lakeId] = await this.redis.hlen(key);
          }
        }),
      );
      return counts;
    } catch (error) {
      this.logger.error('Failed to get all lakes online count', error);
      return {};
    }
  }

  async getLastReadPointers(
    lakeId: string,
    userId: string,
  ): Promise<Record<string, string>> {
    const chatField = `${lakeId}:chat`;
    const systemField = `${lakeId}:system`;

    const values = await this.redis.hmget<Record<string, string>>(
      redisKeys.readPointers(userId),
      chatField,
      systemField,
    );

    if (!values) {
      return { chat: '', system: '' };
    }

    return {
      chat: values[chatField] || '',
      system: values[systemField] || '',
    };
  }

  async markAsRead(
    lakeId: string,
    userId: string,
    messageId: string,
    type: 'chat' | 'system',
  ): Promise<void> {
    await this.redis.hset(redisKeys.readPointers(userId), {
      [`${lakeId}:${type}`]: messageId,
    });
  }

  async deleteMessage(
    lakeId: string,
    messageId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const key = redisKeys.history(lakeId, 'chat');
      const raw = await this.redis.lrange<string>(key, 0, MAX_HISTORY - 1);
      if (!raw || raw.length === 0) return false;

      let targetItem: string | null = null;
      for (const item of raw) {
        const msg = typeof item === 'string' ? JSON.parse(item) : item;
        if (msg.id === messageId && msg.userId === userId) {
          targetItem = typeof item === 'string' ? item : JSON.stringify(item);
          break;
        }
      }

      if (!targetItem) return false;

      await this.redis.lrem(key, 1, targetItem);
      return true;
    } catch (error) {
      this.logger.error('Failed to delete message', error);
      return false;
    }
  }

  private async saveToHistory(
    lakeId: string,
    message: IChatMessage,
  ): Promise<void> {
    try {
      const type = message.type === 'system' ? 'system' : 'chat';
      const key = redisKeys.history(lakeId, type);
      await this.redis.lpush(key, JSON.stringify(message));
      await this.redis.ltrim(key, 0, MAX_HISTORY - 1);
    } catch (error) {
      this.logger.warn('Failed to save message to Redis history', error);
    }
  }
}
