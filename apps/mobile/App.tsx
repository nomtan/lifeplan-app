import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiFetch } from "./lib/api";
import { authClient } from "./lib/auth-client";

const tabs = ["ホーム", "プラン", "比較", "実績", "設定"];
const mobileCallbackURL = "lifeplan://";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Profile = {
  id: string;
  auth_user_id: string;
  display_name: string;
  birth_date: string;
  life_expectancy: number;
  created_at: string;
  updated_at: string;
};

function AuthScreen() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function submit() {
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    if (!emailPattern.test(normalizedEmail)) {
      setMessage("メールアドレスの形式を確認してください。");
      return;
    }

    if (mode === "sign-up" && !normalizedName) {
      setMessage("名前 / ニックネームを入力してください。");
      return;
    }

    const result =
      mode === "sign-in"
        ? await authClient.signIn.email({
            email: normalizedEmail,
            password,
            callbackURL: mobileCallbackURL,
          })
        : await authClient.signUp.email({
            name: normalizedName,
            email: normalizedEmail,
            password,
            callbackURL: mobileCallbackURL,
          });

    if (result.error) {
      setMessage(result.error.message ?? "認証に失敗しました。");
      return;
    }

    if (mode === "sign-up") {
      setEmail(normalizedEmail);
      setName(normalizedName);
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
            autoCorrect={false}
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

function ProfileOnboarding({
  initialName,
  onCompleted,
}: {
  initialName: string;
  onCompleted: (profile: Profile) => void;
}) {
  const [displayName, setDisplayName] = useState(initialName);
  const [birthDate, setBirthDate] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("90");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const normalizedName = displayName.trim();
    const normalizedBirthDate = birthDate.trim();
    const normalizedLifeExpectancy = Number(lifeExpectancy);

    if (!normalizedName) {
      setMessage("名前 / ニックネームを入力してください。");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthDate)) {
      setMessage("生年月日は YYYY-MM-DD 形式で入力してください。");
      return;
    }
    if (
      !Number.isInteger(normalizedLifeExpectancy) ||
      normalizedLifeExpectancy < 1 ||
      normalizedLifeExpectancy > 120
    ) {
      setMessage("想定寿命は1〜120歳で入力してください。");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const result = await apiFetch<{ profile: Profile }>("/api/profile", {
        method: "POST",
        body: JSON.stringify({
          displayName: normalizedName,
          birthDate: normalizedBirthDate,
          lifeExpectancy: normalizedLifeExpectancy,
        }),
      });
      onCompleted(result.profile);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "プロフィール登録に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.onboardingContent}>
        <Text style={styles.kicker}>初期設定</Text>
        <Text style={styles.authTitle}>あなたの基本情報</Text>
        <Text style={styles.description}>
          ライフプランの年表を作るために、最初に基本情報を登録します。
        </Text>

        <View style={styles.authCard}>
          <Text style={styles.fieldLabel}>名前 / ニックネーム</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="例: のむら"
          />

          <Text style={styles.fieldLabel}>生年月日</Text>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="1985-04-01"
          />

          <Text style={styles.fieldLabel}>想定寿命</Text>
          <TextInput
            keyboardType="number-pad"
            style={styles.input}
            value={lifeExpectancy}
            onChangeText={setLifeExpectancy}
            placeholder="90"
          />
          <Text style={styles.helper}>後からいつでも変更できます。</Text>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Button
            title={saving ? "保存中…" : "保存して次へ"}
            onPress={submit}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Dashboard({ profile }: { profile: Profile }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>Lifeplan</Text>
        <Text style={styles.title}>{profile.display_name}さんのライフプラン</Text>

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setProfileLoaded(false);
      setProfileError("");
      return;
    }

    let cancelled = false;
    setProfileLoading(true);
    setProfileError("");

    apiFetch<{ profile: Profile | null }>("/api/profile")
      .then((result) => {
        if (!cancelled) {
          setProfile(result.profile);
          setProfileLoaded(true);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setProfileError(
            error instanceof Error ? error.message : "プロフィールの取得に失敗しました。",
          );
          setProfileLoaded(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProfileLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  if (isPending || profileLoading || (session && !profileLoaded)) {
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

  if (profileError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.authWrap}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>プロフィールを取得できませんでした</Text>
            <Text style={styles.message}>{profileError}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <ProfileOnboarding
        initialName={session.user.name ?? ""}
        onCompleted={(nextProfile) => setProfile(nextProfile)}
      />
    );
  }

  return <Dashboard profile={profile} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f7f8" },
  content: { padding: 20, paddingBottom: 110 },
  onboardingContent: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  kicker: { color: "#71717a", fontWeight: "700", marginBottom: 8 },
  title: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    letterSpacing: -1.2,
    marginBottom: 24,
  },
  description: {
    color: "#52525b",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3f3f46",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  helper: {
    color: "#71717a",
    fontSize: 13,
    marginTop: -6,
  },
  message: {
    color: "#52525b",
    lineHeight: 20,
  },
  modeButton: {
    marginTop: 4,
  },
});
