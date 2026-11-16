import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ForecastFeedback } from "../componentes/ForecastFeedback";
import { HourChart } from "../componentes/HourChart";
import { Screen } from "../componentes/Screen";
import { useWeather } from "../context/WeatherContext";
import { FORECAST_HOURS, forecastClock, formatNumber } from "../domain/forecast";
import { colors, fonts, ui } from "../styles/theme";
import type { RootTabs } from "../types/navigation";

export function DashboardScreen({ navigation }: BottomTabScreenProps<RootTabs, "Painel">) {
  const { place, threshold, forecast, alerts, hours, loading, saved, refresh } = useWeather();
  const clock = forecast ? forecastClock(forecast.timezone) : null;
  const nextAlert = alerts[0];
  const interval = nextAlert && clock?.interval(nextAlert.endTime);
  const hasProbabilities = hours.some((hour) => hour.probability !== null);

  return (
    <Screen refreshing={loading && hours.length > 0} onRefresh={refresh}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text accessibilityRole="header" style={ui.title}>Painel Municipal de Chuva</Text>
        </View>
        <Image
          accessible
          accessibilityLabel="FIAP"
          resizeMode="contain"
          source={require("../../assets/fiap-logo.png")}
          style={styles.logo}
        />
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Trocar localidade. Atual " + place.name + ", " + place.state}
          onPress={() => navigation.navigate("Preferências")}
          style={({ pressed }) => [styles.location, pressed && styles.pressed]}
        >
          <Ionicons name="location-outline" color={colors.accent} size={20} />
          <Text style={[ui.label, styles.locationName]}>{place.name}, {place.state}</Text>
          <Ionicons name="chevron-down" color={colors.muted} size={16} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Atualizar previsão"
          accessibilityState={{ disabled: loading }}
          disabled={loading}
          onPress={refresh}
          style={({ pressed }) => [styles.refresh, (pressed || loading) && styles.pressed]}
        >
          <Ionicons name="refresh" color={colors.accent} size={21} />
        </Pressable>
      </View>

      {!saved && hours.length > 0 && forecast && clock &&
        <Text style={[ui.small, styles.timestamp]}>
          Consulta em {clock.consultedAt(forecast.consultedAt)}{loading ? " · Atualizando…" : ""}
        </Text>
      }

      <ForecastFeedback />

      {forecast && hours.length > 0 &&
        <>
          <LinearGradient
            colors={["#183951", "#182745", "#17243A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[ui.card, styles.hero]}
          >
            <View style={styles.heroTop}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroLabel}>Próximo alerta</Text>
                {nextAlert && interval ? (
                  <>
                    <Text style={styles.heroTime}>{interval.time}</Text>
                    <Text style={ui.body}>{interval.date} · {formatNumber.format(nextAlert.probability)}% de chance de chuva</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.heroEmpty}>
                      {hasProbabilities ? "Nenhum alerta previsto" : "Probabilidade indisponível"}
                    </Text>
                    {hasProbabilities && <Text style={ui.body}>Limite configurado em {threshold}%.</Text>}
                  </>
                )}
              </View>
              <View style={styles.weatherIcon}>
                <Ionicons name={nextAlert ? "rainy-outline" : "cloud-outline"} color={colors.accent} size={34} />
              </View>
            </View>
            {nextAlert &&
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation.navigate("Alertas")}
                style={({ pressed }) => [styles.details, pressed && styles.pressed]}
              >
                <Text style={styles.detailsLabel}>Ver alertas</Text>
                <Ionicons name="arrow-forward" size={17} color={colors.accent} />
              </Pressable>
            }
          </LinearGradient>

          <View style={styles.chartHeading}>
            <Text accessibilityRole="header" style={ui.sectionTitle}>
              {hours.length === FORECAST_HOURS ? "Próximas 48 horas" : "Previsão por hora"}
            </Text>
            <Text style={ui.small}>Deslize os gráficos para ver mais horários.</Text>
          </View>
          <HourChart key={place.id + "-probability"} hours={hours} timezone={forecast.timezone} metric="probability" />
          <HourChart key={place.id + "-precipitation"} hours={hours} timezone={forecast.timezone} metric="precipitation" />

          <Pressable
            accessibilityRole="link"
            onPress={() => {
              void Linking.openURL("https://open-meteo.com/").catch(() => undefined);
            }}
            style={styles.credit}
          >
            <Text style={ui.small}>Dados meteorológicos por Open-Meteo</Text>
            <Ionicons name="open-outline" size={13} color={colors.muted} />
          </Pressable>
        </>
      }
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  identity: { flex: 1 },
  logo: { width: 104, height: 69, marginTop: -13, marginRight: -9 },
  controls: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  location: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  locationName: { flex: 1 },
  refresh: {
    width: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.58 },
  timestamp: { marginTop: -8 },
  hero: { padding: 17, gap: 10, borderColor: "#33506A" },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 14, justifyContent: "space-between" },
  heroCopy: { flex: 1, gap: 5 },
  heroLabel: { color: colors.accent, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 19 },
  heroTime: { color: colors.text, fontFamily: fonts.bold, fontSize: 31, lineHeight: 38 },
  heroEmpty: { color: colors.text, fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  weatherIcon: {
    width: 57,
    height: 57,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29465F",
  },
  details: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 7, minHeight: 44 },
  detailsLabel: { color: colors.accent, fontFamily: fonts.semibold, fontSize: 14 },
  chartHeading: { gap: 3 },
  credit: { minHeight: 44, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 5 },
});
