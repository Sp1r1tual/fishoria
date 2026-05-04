import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

export type WeatherType = 'clear' | 'cloudy' | 'rain';

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);
  private readonly gameTimeSpeedMultiplier = 20;

  private virtualStartTime: number;
  private realStartTime: number;

  private weather: WeatherType = 'clear';
  private weatherForecast: WeatherType[] = [];
  private lastWeatherUpdateHour: number = -1;

  constructor() {
    this.initGameTime();
    this.generateForecast();
  }

  onModuleInit() {}

  private initGameTime() {
    this.realStartTime = Date.now();
    const date = new Date();
    date.setUTCHours(5, 0, 0, 0);
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
    date.setUTCHours(hour, 0, 0, 0);
    this.virtualStartTime = date.getTime();
    this.realStartTime = Date.now();
  }

  public setWeather(weather: WeatherType) {
    this.weather = weather;
    if (this.weatherForecast.length > 0) {
      this.weatherForecast[0] = weather;
    }
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
    const currentHour = this.getGameTimeAsDate().getUTCHours();
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
