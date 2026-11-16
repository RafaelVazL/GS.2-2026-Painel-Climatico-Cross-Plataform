import type { ForecastHour } from "../types/weather";

export const HOUR_SECONDS = 3_600;
export const FORECAST_HOURS = 48;

export function upcomingHours(hours: readonly ForecastHour[], now: number) {
  return hours.filter((hour) => hour.endTime > now).slice(0, FORECAST_HOURS);
}

export type AlertHour = ForecastHour & { probability: number };

export function rainAlerts(hours: readonly ForecastHour[], threshold: number) {
  return hours.filter(
    (hour): hour is AlertHour =>
      hour.probability !== null && hour.probability >= threshold,
  );
}

export function confidenceLevel(probability: number) {
  if (probability >= 80) return "Alta";
  if (probability >= 50) return "Moderada";
  return "Baixa";
}

export function parseThreshold(input: string) {
  const trimmed = input.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value >= 1 && value <= 100 ? value : null;
}

export function forecastClock(timezone: string) {
  const day = new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    day: "2-digit",
    month: "short",
  });
  const time = new Intl.DateTimeFormat("pt-BR", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  function date(seconds: number) {
    return day.format(seconds * 1_000);
  }

  function hour(seconds: number) {
    return time.format(seconds * 1_000);
  }

  function interval(end: number) {
    const start = end - HOUR_SECONDS;
    const sameDay = date(start) === date(end);
    return {
      date: sameDay ? date(start) : date(start) + " a " + date(end),
      time: hour(start) + "–" + hour(end),
      spoken: sameDay
        ? date(start) + ", das " + hour(start) + " às " + hour(end)
        : date(start) + " às " + hour(start) + " até " + date(end) + " às " + hour(end),
    };
  }

  return {
    hour,
    interval,
    consultedAt: (seconds: number) => date(seconds) + ", " + hour(seconds),
  };
}

export const formatNumber = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

export function formatProbability(probability: number) {
  return probability.toString().replace(".", ",");
}
