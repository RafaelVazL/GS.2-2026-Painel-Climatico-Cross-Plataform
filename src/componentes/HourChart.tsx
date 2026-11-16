import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { forecastClock, formatNumber, formatProbability, HOUR_SECONDS } from "../domain/forecast";
import { colors, fonts, ui } from "../styles/theme";
import type { ForecastHour } from "../types/weather";

const PLOT_HEIGHT = 112;
const SLOT_WIDTH = 25;
const PROBABILITY_SLOT_WIDTH = 68;
const PROBABILITY_LABEL_HEIGHT = 20;

type HourChartProps = {
  hours: readonly ForecastHour[];
  timezone: string;
  metric: "probability" | "precipitation";
};

export function HourChart({ hours, timezone, metric }: HourChartProps) {
  const [selectedEnd, setSelectedEnd] = useState<number>();
  const clock = useMemo(() => forecastClock(timezone), [timezone]);
  const isProbability = metric === "probability";
  const title = isProbability ? "Chance de chuva" : "Precipitação prevista";
  const unit = isProbability ? "%" : " mm";
  const spokenUnit = isProbability ? " por cento" : " milímetros";
  const color = isProbability ? colors.accent : colors.precipitation;
  const formatValue = isProbability ? formatProbability : formatNumber.format;
  const values = hours.flatMap((hour) => hour[metric] === null ? [] : [hour[metric]]);
  const peak = values.length ? Math.max(...values) : null;
  const scale = isProbability ? 100 : Math.max(1, Math.ceil(peak ?? 0));
  const selected = hours.find((hour) => hour.endTime === selectedEnd);
  const selectedValue = selected?.[metric];

  return (
    <View style={[ui.card, styles.card]}>
      <View style={styles.heading}>
        <View style={[styles.legend, { backgroundColor: color }]} />
        <Text accessibilityRole="header" style={[ui.label, styles.title]}>{title}</Text>
        {peak !== null &&
          <Text style={[ui.small, { color }]}>
            {isProbability ? "Maior chance" : "Pico"} {formatValue(peak)}{unit}
          </Text>
        }
      </View>
      {peak === null ? (
        <Text style={ui.body}>Valores indisponíveis nos horários exibidos.</Text>
      ) : (
        <>
          {isProbability &&
            <Text style={ui.small}>Cada percentual indica a chance de chover no intervalo abaixo da barra.</Text>
          }
          <View style={styles.plotRow}>
            <View
              accessible={false}
              importantForAccessibility="no-hide-descendants"
              style={[styles.axis, isProbability && styles.probabilityAxis]}
            >
              {[scale, scale / 2, 0].map((value) =>
                <Text key={value} style={styles.axisLabel}>{formatValue(value)}{isProbability && "%"}</Text>,
              )}
            </View>
            <ScrollView horizontal nestedScrollEnabled style={styles.chartScroll}>
              <View style={[styles.plot, isProbability && styles.probabilityPlot]}>
                <View
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  pointerEvents="none"
                  style={[styles.grid, isProbability && styles.probabilityGrid]}
                >
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                </View>
                {hours.map((hour, index) => {
                  const value = hour[metric];
                  const active = hour.endTime === selectedEnd;
                  const interval = clock.interval(hour.endTime);
                  const spokenValue = value === null ? "valor indisponível" : formatValue(value) + spokenUnit;
                  const height = value === null ? 2 : Math.max(2, (value / scale) * (PLOT_HEIGHT - 2));
                  return (
                    <View key={hour.endTime} style={[styles.slot, isProbability && styles.probabilitySlot]}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={title + ", " + interval.spoken + ", " + spokenValue}
                        accessibilityState={{ selected: active }}
                        onPress={() => setSelectedEnd(hour.endTime)}
                        style={active && styles.selected}
                      >
                        <View style={[styles.target, isProbability && styles.probabilityTarget]}>
                          {isProbability &&
                            <Text
                              accessible={false}
                              importantForAccessibility="no"
                              style={[styles.probabilityLabel, value === null && styles.missingLabel]}
                            >
                              {value === null ? "Sem dado" : formatValue(value) + unit}
                            </Text>
                          }
                          <View
                            style={[
                              styles.bar,
                              isProbability && styles.probabilityBar,
                              { height, backgroundColor: value === null ? colors.border : color },
                              value === 0 && styles.zero,
                            ]}
                          />
                        </View>
                        {isProbability &&
                          <Text accessible={false} importantForAccessibility="no" style={styles.intervalLabel}>
                            {interval.time}
                          </Text>
                        }
                      </Pressable>
                      {!isProbability && index % 4 === 0 &&
                        <Text
                          accessible={false}
                          importantForAccessibility="no"
                          pointerEvents="none"
                          style={styles.tick}
                        >
                          {clock.hour(hour.endTime - HOUR_SECONDS)}
                        </Text>
                      }
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
          {selected &&
            <Text accessibilityLiveRegion="polite" style={ui.small}>
              {clock.interval(selected.endTime).spoken} · {
                typeof selectedValue === "number" ? formatValue(selectedValue) + unit : "Valor indisponível"
              }
            </Text>
          }
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 13 },
  heading: { flexDirection: "row", alignItems: "center", gap: 7 },
  legend: { width: 8, height: 8, borderRadius: 4 },
  title: { flex: 1 },
  plotRow: { flexDirection: "row" },
  axis: { height: PLOT_HEIGHT + 4, width: 31, justifyContent: "space-between" },
  probabilityAxis: { width: 36, marginTop: PROBABILITY_LABEL_HEIGHT },
  axisLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 10, lineHeight: 12 },
  chartScroll: { flex: 1 },
  plot: { flexDirection: "row", paddingBottom: 24, paddingRight: 14 },
  probabilityPlot: { paddingBottom: 0, paddingRight: 0 },
  grid: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: PLOT_HEIGHT,
    justifyContent: "space-between",
  },
  probabilityGrid: { top: PROBABILITY_LABEL_HEIGHT },
  gridLine: { borderTopColor: colors.border, borderTopWidth: 1 },
  slot: { width: SLOT_WIDTH },
  probabilitySlot: { width: PROBABILITY_SLOT_WIDTH },
  target: { height: PLOT_HEIGHT, alignItems: "center", justifyContent: "flex-end" },
  probabilityTarget: { height: PLOT_HEIGHT + PROBABILITY_LABEL_HEIGHT },
  probabilityLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  missingLabel: { color: colors.muted },
  selected: { backgroundColor: colors.surfaceRaised, borderRadius: 5 },
  bar: { width: 13, borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.9 },
  probabilityBar: { width: 19 },
  zero: { opacity: 0.43 },
  intervalLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
    textAlign: "center",
  },
  tick: {
    position: "absolute",
    top: PLOT_HEIGHT + 5,
    left: 2,
    width: SLOT_WIDTH * 2,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
  },
});
