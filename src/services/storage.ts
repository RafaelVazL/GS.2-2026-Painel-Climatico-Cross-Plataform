import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Forecast, Preferences } from "../types/weather";
import { isForecast, isPreferences } from "./weatherData";

const PREFERENCES_KEY = "@painel-chuva/preferencias";
const FORECAST_KEY = "@painel-chuva/previsao";

function readValue(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function readSavedWeather() {
  const entries = new Map(await AsyncStorage.multiGet([PREFERENCES_KEY, FORECAST_KEY]));
  const preferences = readValue(entries.get(PREFERENCES_KEY));
  const forecast = readValue(entries.get(FORECAST_KEY));
  return {
    preferences: isPreferences(preferences) ? preferences : null,
    forecast: isForecast(forecast) ? forecast : null,
  };
}

export function savePreferences(preferences: Preferences) {
  return AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
}

export function saveForecast(forecast: Forecast) {
  return AsyncStorage.setItem(FORECAST_KEY, JSON.stringify(forecast));
}
