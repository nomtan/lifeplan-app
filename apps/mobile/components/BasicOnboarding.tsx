import { useState } from "react";
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { apiFetch } from "../lib/api";

type FamilyMember = {
  name: string;
  relationship: string;
  birthDate: string;
  lifeExpectancy: string;
};

type MoneyItem = {
  name: string;
  monthlyAmount: string;
};

const emptyFamily = (): FamilyMember => ({
  name: "",
  relationship: "",
  birthDate: "",
  lifeExpectancy: "90",
});

const emptyMoney = (): MoneyItem => ({ name: "", monthlyAmount: "" });

export function BasicOnboarding({ onCompleted }: { onCompleted: () => void }) {
  const [step, setStep] = useState(0);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [incomes, setIncomes] = useState<MoneyItem[]>([{ name: "給与", monthlyAmount: "" }]);
  const [expenses, setExpenses] = useState<MoneyItem[]>([{ name: "生活費", monthlyAmount: "" }]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function next() {
    setMessage("");
    setStep((current) => Math.min(current + 1, 2));
  }

  function back() {
    setMessage("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function finish() {
    setSaving(true);
    setMessage("");

    try {
      await apiFetch("/api/onboarding/basic", {
        method: "POST",
        body: JSON.stringify({
          familyMembers: familyMembers
            .filter((item) => item.name.trim())
            .map((item) => ({
              name: item.name.trim(),
              relationship: item.relationship.trim(),
              birthDate: item.birthDate.trim(),
              lifeExpectancy: Number(item.lifeExpectancy || 90),
            })),
          incomes: incomes
            .filter((item) => item.name.trim() && item.monthlyAmount.trim())
            .map((item) => ({
              name: item.name.trim(),
              monthlyAmount: Number(item.monthlyAmount),
            })),
          expenses: expenses
            .filter((item) => item.name.trim() && item.monthlyAmount.trim())
            .map((item) => ({
              name: item.name.trim(),
              monthlyAmount: Number(item.monthlyAmount),
            })),
        }),
      });
      onCompleted();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "初期設定の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>初期設定 {step + 2} / 4</Text>
        <Text style={styles.title}>{["家族情報", "毎月の収入", "毎月の支出"][step]}</Text>
        <Text style={styles.description}>
          {[
            "配偶者やお子さまなど、ライフプランに含めたい家族を登録します。いない場合はスキップできます。",
            "手取りベースの月額を登録してください。後から賞与や副収入も追加できます。",
            "毎月のおおよその生活費を登録してください。住宅費などの詳細は次のステップで設定します。",
          ][step]}
        </Text>

        {step === 0 ? (
          <View style={styles.stack}>
            {familyMembers.map((member, index) => (
              <View style={styles.card} key={`family-${index}`}>
                <Text style={styles.cardTitle}>家族 {index + 1}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="名前 / ニックネーム"
                  value={member.name}
                  onChangeText={(value) =>
                    setFamilyMembers((items) =>
                      items.map((item, i) => (i === index ? { ...item, name: value } : item)),
                    )
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="続柄（例: 配偶者、子）"
                  value={member.relationship}
                  onChangeText={(value) =>
                    setFamilyMembers((items) =>
                      items.map((item, i) => (i === index ? { ...item, relationship: value } : item)),
                    )
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="生年月日 YYYY-MM-DD"
                  value={member.birthDate}
                  onChangeText={(value) =>
                    setFamilyMembers((items) =>
                      items.map((item, i) => (i === index ? { ...item, birthDate: value } : item)),
                    )
                  }
                />
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  placeholder="想定寿命"
                  value={member.lifeExpectancy}
                  onChangeText={(value) =>
                    setFamilyMembers((items) =>
                      items.map((item, i) => (i === index ? { ...item, lifeExpectancy: value } : item)),
                    )
                  }
                />
                <Button
                  title="この家族を削除"
                  onPress={() => setFamilyMembers((items) => items.filter((_, i) => i !== index))}
                />
              </View>
            ))}
            <Button title="家族を追加" onPress={() => setFamilyMembers((items) => [...items, emptyFamily()])} />
          </View>
        ) : null}

        {step === 1 ? (
          <MoneyEditor title="収入" items={incomes} setItems={setIncomes} addLabel="収入を追加" />
        ) : null}

        {step === 2 ? (
          <MoneyEditor title="支出" items={expenses} setItems={setExpenses} addLabel="支出を追加" />
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.actions}>
          {step > 0 ? <Button title="戻る" onPress={back} /> : <View />}
          {step < 2 ? (
            <Button title={step === 0 && familyMembers.length === 0 ? "スキップ" : "次へ"} onPress={next} />
          ) : (
            <Button title={saving ? "保存中…" : "初期設定を完了"} onPress={finish} disabled={saving} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MoneyEditor({
  title,
  items,
  setItems,
  addLabel,
}: {
  title: string;
  items: MoneyItem[];
  setItems: React.Dispatch<React.SetStateAction<MoneyItem[]>>;
  addLabel: string;
}) {
  return (
    <View style={styles.stack}>
      {items.map((item, index) => (
        <View style={styles.card} key={`${title}-${index}`}>
          <Text style={styles.cardTitle}>{title} {index + 1}</Text>
          <TextInput
            style={styles.input}
            placeholder={title === "収入" ? "例: 給与" : "例: 生活費"}
            value={item.name}
            onChangeText={(value) =>
              setItems((current) => current.map((row, i) => (i === index ? { ...row, name: value } : row)))
            }
          />
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="月額（円）"
            value={item.monthlyAmount}
            onChangeText={(value) =>
              setItems((current) =>
                current.map((row, i) => (i === index ? { ...row, monthlyAmount: value.replace(/[^0-9]/g, "") } : row)),
              )
            }
          />
          {items.length > 1 ? (
            <Button title="削除" onPress={() => setItems((current) => current.filter((_, i) => i !== index))} />
          ) : null}
        </View>
      ))}
      <Button title={addLabel} onPress={() => setItems((current) => [...current, emptyMoney()])} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7f7f8" },
  content: { padding: 20, paddingBottom: 40 },
  kicker: { color: "#71717a", fontWeight: "700", marginBottom: 8 },
  title: { fontSize: 30, fontWeight: "800", marginBottom: 8 },
  description: { color: "#52525b", fontSize: 15, lineHeight: 22, marginBottom: 20 },
  stack: { gap: 14 },
  card: { backgroundColor: "#fff", borderRadius: 22, padding: 18, gap: 12 },
  cardTitle: { fontSize: 17, fontWeight: "800" },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  actions: { marginTop: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  message: { color: "#52525b", lineHeight: 20, marginTop: 16 },
});
