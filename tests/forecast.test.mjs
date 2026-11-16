import assert from "node:assert/strict";
import test from "node:test";
import {
  confidenceLevel,
  forecastClock,
  HOUR_SECONDS,
  parseThreshold,
  rainAlerts,
  upcomingHours,
} from "../src/domain/forecast.ts";

test("inclui a probabilidade no limite exato e ignora a probabilidade ausente", () => {
  const hours = [
    { endTime: 1, probability: 69, precipitation: 8 },
    { endTime: 2, probability: 70, precipitation: null },
    { endTime: 3, probability: null, precipitation: 5 },
    { endTime: 4, probability: 80, precipitation: 1 },
  ];
  assert.deepEqual(rainAlerts(hours, 70), [hours[1], hours[3]]);
  assert.deepEqual(rainAlerts(hours, 81), []);
});

test("classifica a confiança nos limites de 50% e 80%", () => {
  assert.deepEqual([49, 50, 79, 80].map(confidenceLevel), ["Baixa", "Moderada", "Moderada", "Alta"]);
});

test("descarta intervalos encerrados e limita a previsão a 48 janelas", () => {
  const now = Date.parse("2026-11-16T03:00:00Z") / 1_000;
  const hours = Array.from({ length: 60 }, (_, index) => ({
    endTime: now + (index - 1) * HOUR_SECONDS,
    probability: 70,
    precipitation: 3,
  }));
  assert.deepEqual(upcomingHours(hours, now), hours.slice(2, 50));
  assert.deepEqual(upcomingHours(hours, hours.at(-1).endTime), []);
});

test("formata a janela anterior ao timestamp mesmo na virada do dia no fuso local", () => {
  const midnight = Date.parse("2026-11-16T03:00:00Z") / 1_000;
  const clock = forecastClock("America/Sao_Paulo");
  const interval = clock.interval(midnight);
  assert.equal(interval.time, "23:00–00:00");
  assert.match(interval.date, /15.*16/);
  assert.match(interval.spoken, /15.*23:00.*16.*00:00/);
});

test("aceita apenas limites inteiros de 1 a 100", () => {
  assert.deepEqual(["1", " 70 ", "100"].map(parseThreshold), [1, 70, 100]);
  for (const input of ["", "0", "101", "70.5", "70,5", "-4", "1e2"]) {
    assert.equal(parseThreshold(input), null);
  }
});
