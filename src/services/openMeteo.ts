import { FORECAST_HOURS, upcomingHours } from "../domain/forecast";
import type { Forecast, ForecastHour, Place } from "../types/weather";
import { isPlace, isRecord, isTimezone, numberInRange } from "./weatherData";

const STATES: Readonly<Record<string, string>> = {
  Acre: "AC",
  Alagoas: "AL",
  Amapá: "AP",
  Amazonas: "AM",
  Bahia: "BA",
  Ceará: "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  Goiás: "GO",
  Maranhão: "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  Pará: "PA",
  Paraíba: "PB",
  Paraná: "PR",
  Pernambuco: "PE",
  Piauí: "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  Rondônia: "RO",
  Roraima: "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  Sergipe: "SE",
  Tocantins: "TO",
};

async function requestJson(url: string, signal: AbortSignal): Promise<unknown> {
  const request = new AbortController();
  const abort = () => request.abort();
  if (signal.aborted) abort();
  signal.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 10_000);

  try {
    const response = await fetch(url, { signal: request.signal });
    if (!response.ok) throw new Error("Open-Meteo HTTP " + response.status);
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal.removeEventListener("abort", abort);
  }
}

export async function searchPlaces(name: string, signal: AbortSignal): Promise<Place[]> {
  const query = encodeURIComponent(name);
  const result = await requestJson(
    "https://geocoding-api.open-meteo.com/v1/search?name=" + query + "&countryCode=BR&language=pt&count=10",
    signal,
  );
  if (!isRecord(result)) throw new Error("Resposta de localidades inválida");
  if (result.results === undefined) return [];
  if (!Array.isArray(result.results)) throw new Error("Lista de localidades inválida");

  return result.results.flatMap((row: unknown) => {
    if (!isRecord(row) || row.country_code !== "BR") return [];
    const name = typeof row.admin1 === "string"
      ? row.admin1.trim().replace(/^(?:Estado d[eo]|State of)\s+/i, "")
      : "";
    const place = {
      id: row.id,
      name: row.name,
      state: (Object.hasOwn(STATES, name) ? STATES[name] : name) || "Estado indisponível",
      latitude: row.latitude,
      longitude: row.longitude,
    };
    return isPlace(place) ? [place] : [];
  });
}

export async function loadForecast(place: Place, signal: AbortSignal): Promise<Forecast> {
  const coordinates = "&latitude=" + place.latitude + "&longitude=" + place.longitude;
  const result = await requestJson(
    "https://api.open-meteo.com/v1/forecast?hourly=precipitation_probability,precipitation" +
    "&timezone=auto&timeformat=unixtime&forecast_hours=" + (FORECAST_HOURS + 1) + coordinates,
    signal,
  );

  if (!isRecord(result) || !isTimezone(result.timezone) || !isRecord(result.hourly)) {
    throw new Error("Resposta de previsão inválida");
  }

  const { time, precipitation_probability: probabilities, precipitation: amounts } = result.hourly;
  if (!Array.isArray(time) || !Array.isArray(probabilities) || !Array.isArray(amounts) ||
      time.length !== probabilities.length || time.length !== amounts.length) {
    throw new Error("Série horária inválida");
  }

  const hours = time.map((endTime: unknown, index): ForecastHour => {
    if (!numberInRange(endTime, 1, 8_640_000_000_000) || !Number.isInteger(endTime)) {
      throw new Error("Horário inválido");
    }
    const probability: unknown = probabilities[index];
    const precipitation: unknown = amounts[index];
    return {
      endTime,
      probability: numberInRange(probability, 0, 100) ? probability : null,
      precipitation: numberInRange(precipitation, 0, Number.MAX_VALUE) ? precipitation : null,
    };
  });

  const consultedAt = Math.floor(Date.now() / 1_000);
  const validHours = upcomingHours(hours, consultedAt);
  if (!validHours.some((hour) => hour.probability !== null || hour.precipitation !== null)) {
    throw new Error("Previsão indisponível");
  }

  return { placeId: place.id, timezone: result.timezone, consultedAt, hours: validHours };
}
