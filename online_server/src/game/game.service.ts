import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { RedisService } from '../common/redis/redis.service';

export type WeatherType = 'clear' | 'cloudy' | 'rain';

const REDIS_KEY = 'fishoria:game_state';

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);
  private readonly gameTimeSpeedMultiplier = 20;

  private virtualStartTime: number;
  private realStartTime: number;

  private weather: WeatherType = 'clear';
  private weatherForecast: WeatherType[] = [];
  private lastWeatherUpdateHour: number = -1;

  constructor(private readonly redis: RedisService) {
    this.initGameTime();
    this.generateForecast();
  }

  async onModuleInit() {
    try {
      const savedStateStr = await this.redis.get<string>(REDIS_KEY);
      if (savedStateStr) {
        const savedState =
          typeof savedStateStr === 'string'
            ? JSON.parse(savedStateStr)
            : savedStateStr;

        if (savedState && savedState.virtualTime && savedState.savedAt) {
          const elapsedRealMs = Date.now() - savedState.savedAt;
          const elapsedVirtualMs = elapsedRealMs * this.gameTimeSpeedMultiplier;

          this.virtualStartTime = savedState.virtualTime + elapsedVirtualMs;
          this.realStartTime = Date.now();

          if (savedState.weather) this.weather = savedState.weather;
          if (savedState.weatherForecast)
            this.weatherForecast = savedState.weatherForecast;
          if (savedState.lastWeatherUpdateHour !== undefined) {
            this.lastWeatherUpdateHour = savedState.lastWeatherUpdateHour;
          }

          this.logger.log('Game state restored from Redis');
        }
      }
    } catch (e) {
      this.logger.error('Failed to load game state from Redis', e);
    }

    setInterval(() => {
      this.saveGameState();
    }, 60 * 1000);
  }

  private async saveGameState() {
    try {
      const state = {
        virtualTime: this.getGameTimeAsDate().getTime(),
        savedAt: Date.now(),
        weather: this.weather,
        weatherForecast: this.weatherForecast,
        lastWeatherUpdateHour: this.lastWeatherUpdateHour,
      };
      await this.redis.set(REDIS_KEY, JSON.stringify(state));
    } catch (e) {
      this.logger.error('Failed to save game state to Redis', e);
    }
  }

  private initGameTime() {
    this.realStartTime = Date.now();
    const date = new Date();
    date.setHours(8, 0, 0, 0);
    this.virtualStartTime = date.getTime();
  }

  private generateRandomWeather(): WeatherType {
    const rand = Math.random();
    if (rand > 0.85) return 'rain';
    if (rand > 0.6) return 'cloudy';
    return 'clear';
  }

  private generateForecast() {
    this.weatherForecast = [];
    for (let i = 0; i < 24; i++) {
      this.weatherForecast.push(this.generateRandomWeather());
    }
    this.weather = this.weatherForecast[0];
  }

  public setGameTime(hour: number) {
    const date = this.getGameTimeAsDate();
    date.setHours(hour, 0, 0, 0);
    this.virtualStartTime = date.getTime();
    this.realStartTime = Date.now();
    this.saveGameState();
  }

  public setWeather(weather: WeatherType) {
    this.weather = weather;
    if (this.weatherForecast.length > 0) {
      this.weatherForecast[0] = weather;
    }
    this.saveGameState();
  }

  public getGameTimeAsDate(): Date {
    const now = Date.now();
    const elapsedReal = now - this.realStartTime;
    const elapsedVirtual = elapsedReal * this.gameTimeSpeedMultiplier;
    return new Date(this.virtualStartTime + elapsedVirtual);
  }

  public getGameTimeHours(): number {
    return this.getGameTimeAsDate().getTime() / (1000 * 60 * 60);
  }

  public getGameState() {
    return {
      virtualTime: this.getGameTimeAsDate().getTime(),
      weather: this.weather,
      weatherForecast: this.weatherForecast,
      lastWeatherUpdateHour: this.lastWeatherUpdateHour,
    };
  }

  public updateStateIfNecessary() {
    const currentHour = this.getGameTimeAsDate().getHours();
    let changed = false;

    if (this.lastWeatherUpdateHour === -1) {
      this.lastWeatherUpdateHour = currentHour;
      changed = true;
    } else if (currentHour !== this.lastWeatherUpdateHour) {
      const diff =
        currentHour >= this.lastWeatherUpdateHour
          ? currentHour - this.lastWeatherUpdateHour
          : 24 - this.lastWeatherUpdateHour + currentHour;

      if (diff > 0 && diff < 24) {
        this.weatherForecast = this.weatherForecast.slice(diff);
        for (let i = 0; i < diff; i++) {
          this.weatherForecast.push(this.generateRandomWeather());
        }
      } else {
        this.generateForecast();
      }

      this.weather = this.weatherForecast[0];
      this.lastWeatherUpdateHour = currentHour;
      changed = true;
    }

    return changed;
  }
}
