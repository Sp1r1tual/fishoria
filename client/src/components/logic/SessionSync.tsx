import { useEffect, useRef } from 'react';

import type { WeatherType } from '@/common/types';

import { useAppSelector, useAppDispatch } from '@/hooks/core/useAppStore';
import {
  setWeather,
  setWeatherForecast,
  setLastWeatherUpdateHour,
} from '@/store/slices/gameSlice';

import { TimeManager } from '@/game/managers/TimeManager';

const generateRandomWeather = (): WeatherType => {
  const rand = Math.random();
  if (rand > 0.85) return 'rain';
  if (rand > 0.6) return 'cloudy';
  return 'clear';
};

export function SessionSync() {
  const dispatch = useAppDispatch();
  const weather = useAppSelector((s) => s.game.weather);
  const weatherForecast = useAppSelector((s) => s.game.weatherForecast);
  const lastWeatherUpdateHour = useAppSelector(
    (s) => s.game.lastWeatherUpdateHour,
  );
  const onlineMode = useAppSelector((s) => s.settings.onlineMode);

  const lastAutoSaveRef = useRef<number>(0);
  const stateRef = useRef({
    weatherForecast,
    lastWeatherUpdateHour,
    onlineMode,
  });

  useEffect(() => {
    stateRef.current = { weatherForecast, lastWeatherUpdateHour, onlineMode };
  }, [weatherForecast, lastWeatherUpdateHour, onlineMode]);

  useEffect(() => {
    const session = TimeManager.loadSessionData();
    const loadedForecast = session?.weatherForecast as
      | WeatherType[]
      | undefined;
    const loadedLastHour = session?.lastWeatherUpdateHour as number | undefined;

    if (session) {
      if (session.weather) {
        dispatch(setWeather(session.weather as WeatherType));
      }
      if (loadedForecast) {
        dispatch(setWeatherForecast(loadedForecast));
      }
      if (loadedLastHour !== undefined && loadedLastHour !== null) {
        dispatch(setLastWeatherUpdateHour(loadedLastHour));
      }
    }

    if (stateRef.current.onlineMode) return;

    const gTime = TimeManager.getTime('game');
    const currentHour = gTime.getUTCHours();

    const curForecast = loadedForecast || stateRef.current.weatherForecast;
    const lastUpdate =
      loadedLastHour !== undefined
        ? loadedLastHour
        : stateRef.current.lastWeatherUpdateHour;

    const isInvalid =
      lastUpdate === null ||
      isNaN(lastUpdate) ||
      !curForecast ||
      curForecast.length < 24;

    const diffWeather =
      lastUpdate !== null
        ? currentHour >= lastUpdate
          ? currentHour - lastUpdate
          : 24 - lastUpdate + currentHour
        : 0;

    if (isInvalid || diffWeather >= 24) {
      const newForecast: WeatherType[] = [];
      for (let i = 0; i < 24; i++) newForecast.push(generateRandomWeather());
      dispatch(setWeatherForecast(newForecast));
      dispatch(setLastWeatherUpdateHour(currentHour));
    } else if (diffWeather > 0) {
      const newForecast = [...curForecast.slice(diffWeather)];
      for (let i = 0; i < diffWeather; i++) {
        newForecast.push(generateRandomWeather());
      }
      dispatch(setWeatherForecast(newForecast));
      dispatch(setLastWeatherUpdateHour(currentHour));
    }
  }, [dispatch]);

  useEffect(() => {
    lastAutoSaveRef.current = TimeManager.getGameTimeHours();

    const interval = setInterval(() => {
      const gTime = TimeManager.getTime('game');
      const currentHour = gTime.getUTCHours();

      const diffAutoSave = Math.abs(
        TimeManager.getGameTimeHours() - lastAutoSaveRef.current,
      );
      if (diffAutoSave >= 0.5) {
        TimeManager.saveSessionData(
          weather,
          weatherForecast,
          lastWeatherUpdateHour,
        );
        lastAutoSaveRef.current = TimeManager.getGameTimeHours();
      }

      const {
        weatherForecast: curForecast,
        lastWeatherUpdateHour: lastUpdate,
        onlineMode: isOnline,
      } = stateRef.current;

      if (isOnline) return;

      const isInvalid =
        lastUpdate === null ||
        isNaN(lastUpdate) ||
        !curForecast ||
        curForecast.length < 24;

      const diffWeather =
        lastUpdate !== null
          ? currentHour >= lastUpdate
            ? currentHour - lastUpdate
            : 24 - lastUpdate + currentHour
          : 0;

      if (isInvalid || diffWeather >= 24) {
        const newForecast: WeatherType[] = [];
        for (let i = 0; i < 24; i++) newForecast.push(generateRandomWeather());

        dispatch(setWeatherForecast(newForecast));
        dispatch(setLastWeatherUpdateHour(currentHour));
      } else if (diffWeather > 0) {
        const newForecast = [...curForecast.slice(diffWeather)];
        for (let i = 0; i < diffWeather; i++) {
          newForecast.push(generateRandomWeather());
        }

        dispatch(setWeatherForecast(newForecast));
        dispatch(setLastWeatherUpdateHour(currentHour));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [weather, weatherForecast, lastWeatherUpdateHour, dispatch]);

  return null;
}
