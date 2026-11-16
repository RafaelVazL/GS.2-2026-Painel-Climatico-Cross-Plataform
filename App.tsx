import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useWeather, WeatherProvider } from "./src/context/WeatherContext";
import { AlertsScreen } from "./src/screens/AlertsScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { PreferencesScreen } from "./src/screens/PreferencesScreen";
import { colors, fonts } from "./src/styles/theme";
import type { RootTabs } from "./src/types/navigation";

const Tabs = createBottomTabNavigator<RootTabs>();

const tabIcons = {
  Painel: "grid-outline",
  Alertas: "notifications-outline",
  Preferências: "options-outline",
} as const;

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    border: colors.border,
    text: colors.text,
    notification: colors.accent,
  },
};

function Navigation() {
  const { alerts } = useWeather();
  return (
    <NavigationContainer theme={navigationTheme}>
      <Tabs.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarHideOnKeyboard: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          tabBarIcon: ({ color, size }) => <Ionicons name={tabIcons[route.name]} size={size} color={color} />,
          sceneStyle: styles.scene,
        })}
      >
        <Tabs.Screen name="Painel" component={DashboardScreen} />
        <Tabs.Screen
          name="Alertas"
          component={AlertsScreen}
          options={{
            tabBarBadge: alerts.length || undefined,
            tabBarBadgeStyle: styles.badge,
          }}
        />
        <Tabs.Screen name="Preferências" component={PreferencesScreen} />
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [loaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Ionicons.font,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <WeatherProvider>
        {loaded || fontError ? (
          <Navigation />
        ) : (
          <View style={styles.loading}>
            <ActivityIndicator accessibilityLabel="Carregando painel" color={colors.accent} />
          </View>
        )}
      </WeatherProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  scene: { backgroundColor: colors.background },
  tabLabel: { fontFamily: fonts.medium, fontSize: 11 },
  tabBar: { backgroundColor: colors.surface, borderTopColor: colors.border },
  badge: { backgroundColor: colors.accent, color: colors.accentInk, fontSize: 10, fontFamily: fonts.bold },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
