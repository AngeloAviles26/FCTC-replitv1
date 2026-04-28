import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const PROGRAMS = ["BSIT", "BSCS", "BSIS", "BSCE", "BSECE"];
const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function RegisterScreen() {
  const { register } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [program, setProgram] = useState("BSIT");
  const [yearLevel, setYearLevel] = useState("3rd Year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      await register({ name, email, password, program, yearLevel, university: "Polytechnic University of the Philippines" });
      router.replace("/onboarding/step-courses");
    } catch {
      setError("Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <LinearGradient colors={["#1A5CDB", "#1558B0", "#0f3d80"]} style={s.header}>
        <Text style={s.logo}>🎓</Text>
        <Text style={s.title}>Create Account</Text>
        <Text style={s.subtitle}>Polytechnic University of the Philippines</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView style={s.form} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Text style={s.sectionTitle}>Personal Information</Text>

          <Text style={s.label}>Full Name</Text>
          <TextInput style={s.input} value={name} onChangeText={setName}
            placeholder="e.g. Juan dela Cruz" placeholderTextColor="#94a3b8" autoCapitalize="words" />

          <Text style={s.label}>Email Address</Text>
          <TextInput style={s.input} value={email} onChangeText={setEmail}
            placeholder="yourname@iskolar.pup.edu.ph" placeholderTextColor="#94a3b8"
            keyboardType="email-address" autoCapitalize="none" />

          <Text style={s.label}>Password</Text>
          <TextInput style={s.input} value={password} onChangeText={setPassword}
            placeholder="Create a secure password" placeholderTextColor="#94a3b8" secureTextEntry />

          <Text style={s.sectionTitle}>Academic Profile</Text>

          <Text style={s.label}>Program</Text>
          <View style={s.chipRow}>
            {PROGRAMS.map((p) => (
              <TouchableOpacity key={p} style={[s.chip, program === p && s.chipActive]} onPress={() => setProgram(p)}>
                <Text style={[s.chipText, program === p && s.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={s.label}>Year Level</Text>
          <View style={s.chipRow}>
            {YEAR_LEVELS.map((y) => (
              <TouchableOpacity key={y} style={[s.chip, yearLevel === y && s.chipActive]} onPress={() => setYearLevel(y)}>
                <Text style={[s.chipText, yearLevel === y && s.chipTextActive]}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {error ? <Text style={s.error}>{error}</Text> : null}

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Create Account →</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>Already have an account? Sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28, alignItems: "center" },
  logo: { fontSize: 36, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4, fontFamily: "Inter_400Regular", textAlign: "center" },
  form: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: "#1A5CDB", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 4, marginBottom: 14, fontFamily: "Inter_700Bold" },
  label: { fontSize: 14, fontWeight: "600", color: "#1e293b", marginBottom: 7, fontFamily: "Inter_600SemiBold" },
  input: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#1e293b", marginBottom: 16, fontFamily: "Inter_400Regular" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "#cbd5e1", backgroundColor: "#fff" },
  chipActive: { backgroundColor: "#1A5CDB", borderColor: "#1A5CDB" },
  chipText: { fontSize: 13, color: "#475569", fontFamily: "Inter_500Medium" },
  chipTextActive: { color: "#fff" },
  error: { color: "#ef4444", fontSize: 13, marginBottom: 12, textAlign: "center", fontFamily: "Inter_400Regular" },
  btn: { backgroundColor: "#1A5CDB", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  backBtn: { alignItems: "center", marginTop: 18 },
  backText: { color: "#1A5CDB", fontSize: 14, fontFamily: "Inter_500Medium" },
});
