import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const tabs = ["ホーム", "プラン", "比較", "実績", "設定"];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Lifeplan</Text>
        <Text style={styles.title}>人生のお金を、見える形に。</Text>

        <View style={styles.grid}>
          {[
            ["現金", "320万円"],
            ["投資資産", "680万円"],
            ["負債", "1,850万円"],
            ["純資産", "-850万円"],
          ].map(([label, value]) => (
            <View style={styles.card} key={label}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.heading}>ライフプラン</Text>
        <View style={styles.planCard}>
          <Text style={styles.label}>現在プラン</Text>
          <Text style={styles.planTitle}>最終資産 4,820万円</Text>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <View style={styles.tab} key={tab}>
            <View style={styles.iconDot} />
            <Text style={styles.tabText}>{tab}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f7f8" },
  content: { padding: 20, paddingBottom: 110 },
  kicker: { color: "#71717a", fontWeight: "700", marginBottom: 8 },
  title: { fontSize: 34, lineHeight: 42, fontWeight: "800", letterSpacing: -1.2, marginBottom: 24 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "48%", backgroundColor: "#fff", borderRadius: 20, padding: 18 },
  label: { color: "#71717a", fontSize: 14 },
  value: { fontSize: 22, fontWeight: "800", marginTop: 10 },
  heading: { fontSize: 22, fontWeight: "800", marginTop: 34, marginBottom: 14 },
  planCard: { backgroundColor: "#fff", borderRadius: 22, padding: 20 },
  planTitle: { marginTop: 8, fontSize: 24, fontWeight: "800" },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 82,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
  },
  tab: { flex: 1, alignItems: "center", gap: 6 },
  iconDot: { width: 20, height: 20, borderRadius: 6, backgroundColor: "#d4d4d8" },
  tabText: { fontSize: 11, fontWeight: "600" },
});
