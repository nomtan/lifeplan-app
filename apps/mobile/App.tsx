import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { authClient } from "./lib/auth-client";

const tabs = ["ホーム", "プラン", "比較", "実績", "設定"];
const mobileCallbackURL = "lifeplan://";

function AuthScreen() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    setMessage("");

    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({
            email,
            password,
            callbackURL: mobileCallbackURL,
          })
        : await authClient.signUp.email({
            name,
            email,
            password,
            callbackURL: mobileCallbackURL,
          });

    if (result.error) {
      setMessage(result.error.message ?? "認証に失敗しました。");
      return;
    }

    if (mode === "sign-up") {
      setMessage("確認メールを送信しました。メール内のリンクを開いてください。");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.authWrap}>
        <View style={styles.authCard}>
          <Text style={styles.kicker}>Lifeplan</Text>
          <Text style={styles.authTitle}>
            {mode === "sign-in" ? "ログイン" : "アカウント作成"}
          </Text>

          {mode === "sign-up" ? (
            <TextInput
              placeholder="名前 / ニックネーム"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          ) : null}

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="メールアドレス"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            placeholder="パスワード"
            secureTextEntry
            style={styles.input}
            value={password}
            onChangeText={setPassword}
          />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Button
            title={mode === "sign-in" ? "ログイン" : "アカウントを作成"}
            onPress={submit}
          />

          <View style={styles.modeButton}>
            <Button
              title={
                mode === "sign-in"
                  ? "アカウントを作成する"
                  : "ログイン画面へ戻る"
              }
              onPress={() =>
                setMode(mode === "sign-in" ? "sign-up" : "sign-in")
              }
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Dashboard() {
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

export default function App() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>読み込み中…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return <Dashboard />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f7f8" },
  content: { padding: 20, paddingBottom: 110 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  kicker: { color: "#71717a", fontWeight: "700", marginBottom: 8 },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1.2,
    marginBottom: 24,
  },
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
  iconDot: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: "#d4d4d8",
  },
  tabText: { fontSize: 11, fontWeight: "600" },
  authWrap: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  authCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 22,
    gap: 14,
  },
  authTitle: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  message: {
    color: "#52525b",
    lineHeight: 20,
  },
  modeButton: {
    marginTop: 4,
  },
});
