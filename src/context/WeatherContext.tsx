import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { rainAlerts, upcomingHours, type AlertHour } from "../domain/forecast";
import { loadForecast } from "../services/openMeteo";
import { readSavedWeather, saveForecast, savePreferences } from "../services/storage";
import type { Forecast, ForecastHour, Place, Preferences } from "../types/weather";

const DEFAULT_PREFERENCES: Preferences = {
  place: {
    id: 3448439,
    name: "São Paulo",
    state: "SP",
    latitude: -23.5505,
    longitude: -46.6333,
  },
  threshold: 70,
};

type Weather = {
  place: Place;
  threshold: number;
  ready: boolean;
  storageError: boolean;
  forecast: Forecast | null;
  hours: ForecastHour[];
  alerts: AlertHour[];
  loading: boolean;
  saved: boolean;
  choosePlace: (place: Place) => void;
  changeThreshold: (threshold: number) => void;
  refresh: () => void;
};

const WeatherContext = createContext<Weather | null>(null);

const nowInSeconds = () => Math.floor(Date.now() / 1_000);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [request, setRequest] = useState<{ placeId: number; status: "loading" | "live" | "error" } | null>(null);
  const [storageError, setStorageError] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [now, setNow] = useState(nowInSeconds);
  const preferenceWrites = useRef(Promise.resolve());
  const forecastWrites = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;
    readSavedWeather().then(
      (saved) => {
        if (!active) return;
        setForecast(saved.forecast);
        setPreferences(saved.preferences ?? DEFAULT_PREFERENCES);
      },
      () => {
        if (active) setPreferences(DEFAULT_PREFERENCES);
      },
    );
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!preferences) return;
    preferenceWrites.current = preferenceWrites.current
      .then(() => savePreferences(preferences))
      .then(() => setStorageError(false), () => setStorageError(true));
  }, [preferences]);

  const selectedPlace = preferences?.place;
  useEffect(() => {
    if (!selectedPlace) return;
    const controller = new AbortController();
    const placeId = selectedPlace.id;
    setRequest({ placeId, status: "loading" });

    loadForecast(selectedPlace, controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        setForecast(result);
        setRequest({ placeId, status: "live" });
        forecastWrites.current = forecastWrites.current
          .then(() => saveForecast(result))
          .catch(() => undefined);
      },
      () => {
        if (!controller.signal.aborted) setRequest({ placeId, status: "error" });
      },
    );
    return () => controller.abort();
  }, [selectedPlace, refreshCount]);

  const refresh = useCallback(() => {
    setNow(nowInSeconds());
    setRefreshCount((count) => count + 1);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(nowInSeconds()), 30_000);
    const subscription = AppState.addEventListener("change", (status) => {
      if (status === "active") refresh();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [refresh]);

  const { place, threshold } = preferences ?? DEFAULT_PREFERENCES;
  const currentForecast = forecast?.placeId === place.id ? forecast : null;
  const hours = useMemo(() => upcomingHours(currentForecast?.hours ?? [], now), [currentForecast, now]);
  const alerts = useMemo(() => rainAlerts(hours, threshold), [hours, threshold]);
  const loading = !preferences || request?.placeId !== place.id || request.status === "loading";
  const saved = hours.length > 0 && (request?.placeId !== place.id || request.status !== "live");

  function choosePlace(place: Place) {
    setPreferences((current) => ({ ...(current ?? DEFAULT_PREFERENCES), place }));
  }

  function changeThreshold(threshold: number) {
    setPreferences((current) => ({ ...(current ?? DEFAULT_PREFERENCES), threshold }));
  }

  return (
    <WeatherContext.Provider value={{
      place, threshold, ready: preferences !== null, storageError, forecast: currentForecast,
      hours, alerts, loading, saved, choosePlace, changeThreshold, refresh,
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const weather = useContext(WeatherContext);
  if (!weather) throw new Error("WeatherProvider ausente");
  return weather;
}
