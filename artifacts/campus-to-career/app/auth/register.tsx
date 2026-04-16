import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const PROGRAMS = ["BSIT", "BSCS", "BSECE", "BSEE", "BSCpE"];
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [program, setProgram] = useState("BSIT");
  const [yearLevel, setYearLevel] = useState("1st Year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError("");
    const ok = await register({ name, email, password, program, yearLevel });
    setLoading(false);
    if (ok) router.replace("/(tabs)/");
    else setError("Registration failed. Try again.");
  };

  const Field = ({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = "default" as any }) => (
    <>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        />
      </View>
    </>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>

          <Text style={[styles.heading, { color: colors.foreground }]}>Create account</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Join and discover your career path
          </Text>

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: "#fee2e2" }]}>
              <Text style={{ color: "#dc2626", fontSize: 13, fontFamily: "Inter_500Medium" }}>{error}</Text>
            </View>
          ) : null}

          <Field label="Full Name" value={name} onChangeText={setName} placeholder="Juan dela Cruz" />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@university.edu.ph" keyboardType="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} placeholder="Create a strong password" secureTextEntry />

          <Text style={[styles.label, { color: colors.foreground }]}>Program</Text>
          <View style={styles.chipRow}>
            {PROGRAMS.map((p) => (
              <Pressable
                key={p}
                onPress={() => setProgram(p)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: program === p ? colors.primary : colors.card,
                    borderColor: program === p ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: program === p ? "#fff" : colors.foreground },
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Year Level</Text>
          <View style={styles.chipRow}>
            {YEAR_LEVELS.map((y) => (
              <Pressable
                key={y}
                onPress={() => setYearLevel(y)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: yearLevel === y ? colors.primary : colors.card,
                    borderColor: yearLevel === y ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: yearLevel === y ? "#fff" : colors.foreground },
                  ]}
                >
                  {y}
                </Text>
              </Pressable>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? "Creating account..." : "Create Account"}</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <Text style={[styles.rowText, { color: colors.mutedForeground }]}>Already have an account? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.rowLink, { color: colors.primary }]}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24 },
  backBtn: { marginBottom: 20, width: 36 },
  heading: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 6 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 24 },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 14 },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: "center",
  },
  input: { fontSize: 15, fontFamily: "Inter_400Regular" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  errorBox: { padding: 12, borderRadius: 10, marginBottom: 8 },
  btn: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  rowText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  rowLink: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
