import Ionicons from "@expo/vector-icons/Ionicons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useWeather } from "../context/WeatherContext";
import { forecastClock } from "../domain/forecast";
import { colors, ui } from "../styles/theme";
import { ActionButton } from "./ActionButton";

export function ForecastFeedback() {
  const { forecast, hours, loading, saved, refresh } = useWeather();

  if (hours.length === 0) {
    if (loading) {
      return (
        <View accessibilityLiveRegion="polite" style={[ui.card, styles.empty]}>
          <ActivityIndicator color={colors.accent} />
          <Text style={ui.body}>Consultando a previsão…</Text>
        </View>
      );
    }

    return (
      <View accessibilityLiveRegion="polite" style={[ui.card, styles.empty]}>
        <Ionicons name="cloud-offline-outline" size={27} color={colors.warning} />
        <Text style={ui.sectionTitle}>Previsão indisponível</Text>
        <Text style={[ui.body, styles.center]}>Confira a conexão e consulte a previsão novamente.</Text>
        <ActionButton label="Tentar novamente" onPress={refresh} secondary />
      </View>
    );
  }

  if (!saved || !forecast) return null;
  const consulted = forecastClock(forecast.timezone).consultedAt(forecast.consultedAt);

  return (
    <View accessibilityLiveRegion="polite" style={[ui.card, styles.notice]}>
      <Ionicons name="cloud-offline-outline" size={22} color={colors.warning} />
      <View style={styles.noticeBody}>
        <Text style={[ui.label, styles.noticeTitle]}>Previsão salva</Text>
        <Text style={ui.small}>
          Última consulta em {consulted}. {loading ? "Atualizando…" : "A atualização falhou."}
        </Text>
        {!loading && <ActionButton label="Tentar novamente" onPress={refresh} secondary />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", paddingVertical: 24, gap: 10 },
  center: { textAlign: "center" },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  noticeBody: { flex: 1, gap: 5 },
  noticeTitle: { color: colors.warning },
});
