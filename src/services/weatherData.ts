import type { Forecast, ForecastHour, Place, Preferences } from "../types/weather";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function numberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function isPlace(value: unknown): value is Place {
  return isRecord(value) &&
    numberInRange(value.id, 1, Number.MAX_SAFE_INTEGER) &&
    Number.isInteger(value.id) &&
    typeof value.name === "string" &&
    value.name.length > 0 &&
    typeof value.state === "string" &&
    value.state.length > 0 &&
    numberInRange(value.latitude, -90, 90) &&
    numberInRange(value.longitude, -180, 180);
}

export function isTimezone(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  try {
    new Intl.DateTimeFormat("pt-BR", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

function isForecastHour(value: unknown): value is ForecastHour {
  return isRecord(value) &&
    numberInRange(value.endTime, 1, 8_640_000_000_000) &&
    Number.isInteger(value.endTime) &&
    (value.probability === null || numberInRange(value.probability, 0, 100)) &&
    (value.precipitation === null || numberInRange(value.precipitation, 0, Number.MAX_VALUE));
}

export function isForecast(value: unknown): value is Forecast {
  return isRecord(value) &&
    numberInRange(value.placeId, 1, Number.MAX_SAFE_INTEGER) &&
    numberInRange(value.consultedAt, 1, 8_640_000_000_000) &&
    isTimezone(value.timezone) &&
    Array.isArray(value.hours) &&
    value.hours.every(isForecastHour);
}

export function isPreferences(value: unknown): value is Preferences {
  return isRecord(value) &&
    isPlace(value.place) &&
    numberInRange(value.threshold, 1, 100) &&
    Number.isInteger(value.threshold);
}
