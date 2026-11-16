import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { ActionButton } from "../componentes/ActionButton";
import { Screen, ScreenTitle } from "../componentes/Screen";
import { useWeather } from "../context/WeatherContext";
import { parseThreshold } from "../domain/forecast";
import { searchPlaces } from "../services/openMeteo";
import { colors, fonts, ui } from "../styles/theme";
import type { RootTabs } from "../types/navigation";
import type { Place } from "../types/weather";

type Search = { status: "idle" | "loading" } | { status: "error"; message: string } |
  { status: "done"; places: Place[] };

export function PreferencesScreen({ navigation }: BottomTabScreenProps<RootTabs, "Preferências">) {
  const { place, threshold, ready, storageError, choosePlace, changeThreshold } = useWeather();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<Search>({ status: "idle" });
  const [thresholdInput, setThresholdInput] = useState(String(threshold));
  const [thresholdFeedback, setThresholdFeedback] = useState<"applied" | "invalid">();
  const searchRequest = useRef<AbortController | null>(null);

  useEffect(() => () => searchRequest.current?.abort(), []);
  useEffect(() => setThresholdInput(String(threshold)), [threshold]);

  function changeQuery(text: string) {
    searchRequest.current?.abort();
    setQuery(text);
    setSearch({ status: "idle" });
  }

  async function findPlaces() {
    const name = query.trim();
    if (name.length < 3) {
      setSearch({ status: "error", message: "Digite pelo menos três caracteres." });
      return;
    }

    Keyboard.dismiss();
    searchRequest.current?.abort();
    const controller = new AbortController();
    searchRequest.current = controller;
    setSearch({ status: "loading" });

    try {
      const places = await searchPlaces(name, controller.signal);
      if (!controller.signal.aborted) setSearch({ status: "done", places });
    } catch {
      if (!controller.signal.aborted) {
        setSearch({ status: "error", message: "A busca falhou. Confira a conexão e tente novamente." });
      }
    }
  }

  function selectPlace(result: Place) {
    changeQuery("");
    Keyboard.dismiss();
    choosePlace(result);
    navigation.navigate("Painel");
  }

  function applyThreshold() {
    const value = parseThreshold(thresholdInput);
    if (value === null) {
      setThresholdFeedback("invalid");
      return;
    }

    Keyboard.dismiss();
    setThresholdInput(String(value));
    changeThreshold(value);
    setThresholdFeedback("applied");
  }

  return (
    <Screen>
      <ScreenTitle title="Preferências" description="Localidade monitorada e limite dos alertas de chuva." />
      {storageError &&
        <Text accessibilityLiveRegion="polite" style={[ui.body, ui.error]}>
          Houve um erro ao salvar no dispositivo. Tente aplicar a configuração novamente.
        </Text>
      }

      <View style={[ui.card, styles.card]}>
        <Text accessibilityRole="header" style={ui.sectionTitle}>Localidade</Text>
        <View style={styles.current}>
          <View style={styles.locationIcon}>
            <Ionicons name="location-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.currentText}>
            <Text style={ui.small}>Localidade atual</Text>
            <Text style={ui.label}>{place.name}, {place.state}</Text>
          </View>
        </View>
        <View style={styles.field}>
          <Text style={ui.label}>Buscar localidade brasileira</Text>
          <TextInput
            accessibilityLabel="Nome da localidade"
            value={query}
            onChangeText={changeQuery}
            onSubmitEditing={() => { if (ready && search.status !== "loading") void findPlaces(); }}
            placeholder="Ex. Campinas"
            placeholderTextColor={colors.muted}
            selectionColor={colors.accent}
            enterKeyHint="search"
            autoCapitalize="words"
            maxLength={100}
            style={[ui.input, search.status === "error" && styles.invalid]}
          />
        </View>
        <ActionButton
          label="Buscar"
          disabled={!ready || search.status === "loading"}
          onPress={() => { void findPlaces(); }}
          secondary
        />
        {search.status === "loading" &&
          <View accessibilityLiveRegion="polite" style={styles.loading}>
            <ActivityIndicator color={colors.accent} size="small" />
            <Text style={ui.body}>Buscando localidades…</Text>
          </View>
        }
        {search.status === "error" &&
          <Text accessibilityLiveRegion="polite" style={[ui.body, ui.error]}>{search.message}</Text>
        }
        {search.status === "done" && (
          search.places.length === 0 ? (
            <Text accessibilityLiveRegion="polite" style={ui.body}>
              Nenhuma localidade encontrada. Experimente outro nome.
            </Text>
          ) : (
            <View style={styles.results}>
              {search.places.map((result) =>
                <Pressable
                  key={result.id}
                  accessibilityRole="button"
                  accessibilityLabel={"Selecionar " + result.name + ", " + result.state}
                  onPress={() => selectPlace(result)}
                  style={({ pressed }) => [styles.result, pressed && styles.pressed]}
                >
                  <View style={styles.currentText}>
                    <Text style={ui.label}>{result.name}</Text>
                    <Text style={ui.small}>{result.state}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.accent} />
                </Pressable>,
              )}
            </View>
          )
        )}
      </View>

      <View style={[ui.card, styles.card]}>
        <View style={styles.field}>
          <Text accessibilityRole="header" style={ui.sectionTitle}>Limite de alerta</Text>
          <Text style={ui.body}>Uma hora gera alerta quando a chance de chuva atinge esse percentual.</Text>
        </View>
        <View style={styles.field}>
          <Text style={ui.label}>Probabilidade mínima</Text>
          <View style={styles.limitRow}>
            <TextInput
              accessibilityLabel="Probabilidade mínima em porcentagem"
              value={thresholdInput}
              onChangeText={(text) => { setThresholdInput(text); setThresholdFeedback(undefined); }}
              onSubmitEditing={() => { if (ready) applyThreshold(); }}
              editable={ready}
              inputMode="numeric"
              enterKeyHint="done"
              maxLength={12}
              selectionColor={colors.accent}
              style={[ui.input, styles.limitInput, thresholdFeedback === "invalid" && styles.invalid]}
            />
            <Text style={styles.percent}>%</Text>
          </View>
        </View>
        <ActionButton label="Salvar limite" disabled={!ready} onPress={applyThreshold} />
        {thresholdFeedback === "invalid" &&
          <Text accessibilityLiveRegion="polite" style={[ui.body, ui.error]}>
            Informe um número inteiro de 1 a 100.
          </Text>
        }
        {thresholdFeedback === "applied" &&
          <Text accessibilityLiveRegion="polite" style={styles.success}>Limite aplicado.</Text>
        }
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  current: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    padding: 10,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  currentText: { flex: 1 },
  field: { gap: 5 },
  invalid: { borderColor: colors.danger },
  loading: { flexDirection: "row", alignItems: "center", gap: 8 },
  results: { gap: 4 },
  result: {
    minHeight: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 9,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.55 },
  limitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  limitInput: { width: 101 },
  percent: { color: colors.accent, fontFamily: fonts.semibold, fontSize: 17 },
  success: { color: colors.accent, fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
});
