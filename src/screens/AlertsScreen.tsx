import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { ForecastFeedback } from "../componentes/ForecastFeedback";
import { Screen, ScreenTitle } from "../componentes/Screen";
import { useWeather } from "../context/WeatherContext";
import { confidenceLevel, forecastClock, formatNumber, formatProbability, type AlertHour } from "../domain/forecast";
import { colors, fonts, ui } from "../styles/theme";

const confidenceColors = {
  Alta: colors.accent,
  Moderada: colors.warning,
  Baixa: colors.muted,
};

function AlertCard({
  alert, threshold, clock,
}: { alert: AlertHour; threshold: number; clock: ReturnType<typeof forecastClock> }) {
  const confidence = confidenceLevel(alert.probability);
  const interval = clock.interval(alert.endTime);
  const probability = formatProbability(alert.probability) + "%";
  const amount = alert.precipitation === null
    ? "Indisponível"
    : formatNumber.format(alert.precipitation) + " mm";

  return (
    <View style={[ui.card, styles.card]}>
      <View style={styles.cardHeader}>
        <View style={styles.icon}>
          <Ionicons name="rainy-outline" size={22} color={colors.accent} />
        </View>
        <View style={styles.interval}>
          <Text accessibilityRole="header" style={ui.sectionTitle}>{interval.time}</Text>
          <Text style={ui.small}>{interval.date}</Text>
        </View>
        <Text style={[styles.confidence, { color: confidenceColors[confidence] }]}>
          Confiança {confidence.toLowerCase()}
        </Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={ui.small}>Chance de chuva</Text>
          <Text style={styles.value}>{probability}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={ui.small}>Volume previsto</Text>
          <Text style={styles.value}>{amount}</Text>
        </View>
      </View>

      <View style={styles.description}>
        <Text style={ui.label}>Justificativa</Text>
        <Text style={ui.body}>A probabilidade prevista de {probability} atingiu o limite de {threshold}%.</Text>
      </View>
      <View style={styles.description}>
        <Text style={ui.label}>Limitação</Text>
        <Text style={ui.body}>A previsão representa uma área da grade do modelo. As condições podem variar dentro da localidade.</Text>
      </View>
    </View>
  );
}

export function AlertsScreen() {
  const { place, threshold, hours, forecast, alerts } = useWeather();
  const clock = forecast ? forecastClock(forecast.timezone) : null;
  const hasProbabilities = hours.some((hour) => hour.probability !== null);

  return (
    <Screen>
      <ScreenTitle title="Alertas" description={place.name + ", " + place.state + " · Limite de " + threshold + "%"} />
      <ForecastFeedback />
      {hours.length > 0 && alerts.length === 0 &&
        <View style={[ui.card, styles.empty]}>
          <Ionicons name="cloud-outline" size={27} color={colors.accent} />
          <Text style={ui.sectionTitle}>
            {hasProbabilities ? "Nenhum alerta previsto" : "Probabilidade indisponível"}
          </Text>
          <Text style={ui.body}>
            {hasProbabilities
              ? "As probabilidades disponíveis estão abaixo do limite configurado."
              : "Consulte o painel para ver os demais dados disponíveis."}
          </Text>
        </View>
      }
      {clock && alerts.length > 0 &&
        <>
          <Text style={ui.body}>
            {alerts.length === 1 ? "1 intervalo previsto com alerta." : alerts.length + " intervalos previstos com alerta."}
            {" "}Avalie se vale ajustar o horário das atividades externas.
          </Text>
          {alerts.map((alert) => <AlertCard key={alert.endTime} alert={alert} threshold={threshold} clock={clock} />)}
        </>
      }
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 13 },
  cardHeader: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 9 },
  interval: { flex: 1, minWidth: 92 },
  icon: {
    width: 41,
    height: 41,
    borderRadius: 12,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  confidence: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    fontFamily: fonts.semibold,
    fontSize: 12,
  },
  metrics: {
    flexDirection: "row",
    gap: 12,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  metric: { flex: 1, gap: 3 },
  value: { color: colors.text, fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  description: { gap: 3 },
  empty: { alignItems: "flex-start", gap: 7 },
});
