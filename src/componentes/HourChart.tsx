import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { forecastClock, formatNumber, HOUR_SECONDS } from "../domain/forecast";
import { colors, fonts, ui } from "../styles/theme";
import type { ForecastHour } from "../types/weather";

const PLOT_HEIGHT = 112;
const SLOT_WIDTH = 25;

type HourChartProps = {
  hours: readonly ForecastHour[];
  timezone: string;
  metric: "probability" | "precipitation";
};

export function HourChart({ hours, timezone, metric }: HourChartProps) {
  const [selectedEnd, setSelectedEnd] = useState<number>();
  const clock = useMemo(() => forecastClock(timezone), [timezone]);
  const probability = metric === "probability";
  const title = probability ? "Chance de chuva" : "Precipitação prevista";
  const unit = probability ? "%" : " mm";
  const spokenUnit = probability ? " por cento" : " milímetros";
  const color = probability ? colors.accent : colors.precipitation;
  const values = hours.flatMap((hour) => hour[metric] === null ? [] : [hour[metric]]);
  const peak = values.length ? Math.max(...values) : null;
  const scale = probability ? 100 : Math.max(1, Math.ceil(peak ?? 0));
  const selected = hours.find((hour) => hour.endTime === selectedEnd);
  const selectedValue = selected?.[metric];

  return (
    <View style={[ui.card, styles.card]}>
      <View style={styles.heading}>
        <View style={[styles.legend, { backgroundColor: color }]} />
        <Text accessibilityRole="header" style={[ui.label, styles.title]}>{title}</Text>
        {peak !== null &&
          <Text style={[ui.small, { color }]}>Pico {formatNumber.format(peak)}{unit}</Text>
        }
      </View>
      {peak === null ? (
        <Text style={ui.body}>Valores indisponíveis nos horários exibidos.</Text>
      ) : (
        <>
          <View style={styles.plotRow}>
            <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.axis}>
              {[scale, scale / 2, 0].map((value) =>
                <Text key={value} style={styles.axisLabel}>{formatNumber.format(value)}</Text>,
              )}
            </View>
            <ScrollView horizontal nestedScrollEnabled style={styles.chartScroll}>
              <View style={styles.plot}>
                <View
                  accessible={false}
                  importantForAccessibility="no-hide-descendants"
                  pointerEvents="none"
                  style={styles.grid}
                >
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                  <View style={styles.gridLine} />
                </View>
                {hours.map((hour, index) => {
                  const value = hour[metric];
                  const active = hour.endTime === selectedEnd;
                  const interval = clock.interval(hour.endTime);
                  const spokenValue = value === null ? "valor indisponível" : formatNumber.format(value) + spokenUnit;
                  const height = value === null ? 2 : Math.max(2, (value / scale) * (PLOT_HEIGHT - 2));
                  return (
                    <View key={hour.endTime} style={styles.slot}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={title + ", " + interval.spoken + ", " + spokenValue}
                        accessibilityState={{ selected: active }}
                        onPress={() => setSelectedEnd(hour.endTime)}
                        style={[styles.target, active && styles.selected]}
                      >
                        <View
                          style={[
                            styles.bar,
                            { height, backgroundColor: value === null ? colors.border : color },
                            value === 0 && styles.zero,
                          ]}
                        />
                      </Pressable>
                      {index % 4 === 0 &&
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
                typeof selectedValue === "number" ? formatNumber.format(selectedValue) + unit : "Valor indisponível"
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
  axisLabel: { color: colors.muted, fontFamily: fonts.medium, fontSize: 10, lineHeight: 12 },
  chartScroll: { flex: 1 },
  plot: { flexDirection: "row", paddingBottom: 24, paddingRight: 14 },
  grid: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: PLOT_HEIGHT,
    justifyContent: "space-between",
  },
  gridLine: { borderTopColor: colors.border, borderTopWidth: 1 },
  slot: { width: SLOT_WIDTH },
  target: { height: PLOT_HEIGHT, alignItems: "center", justifyContent: "flex-end" },
  selected: { backgroundColor: colors.surfaceRaised, borderRadius: 5 },
  bar: { width: 13, borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.9 },
  zero: { opacity: 0.43 },
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
