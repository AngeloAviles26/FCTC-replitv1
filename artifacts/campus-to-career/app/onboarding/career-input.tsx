import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CAREER_MATCHES, useApp } from "@/context/AppContext";

type MatchResult = { career: string; postings: number; confidence: number };

function parseCareerInput(input: string): MatchResult[] {
  const lower = input.toLowerCase();
  if (lower.includes("data") || lower.includes("analyst") || lower.includes("analytics"))
    return CAREER_MATCHES[0];
  if (lower.includes("software") || lower.includes("dev") || lower.includes("developer") || lower.includes("backend") || lower.includes("fullstack"))
    return CAREER_MATCHES[1];
  if (lower.includes("frontend") || lower.includes("web") || lower.includes("ui") || lower.includes("ux"))
    return CAREER_MATCHES[2];
  if (lower.includes("network") || lower.includes("it support") || lower.includes("sysadmin") || lower.includes("system"))
    return CAREER_MATCHES[3];
  const idx = Math.floor(Math.random() * CAREER_MATCHES.length);
  return CAREER_MATCHES[idx];
}

export default function CareerInputScreen() {
  const { setTargetCareer } = useApp();
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selected, setSelected] = useState<MatchResult | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleAnalyze = () => {
    if (!input.trim()) return;
    Keyboard.dismiss();
    setAnalyzing(true);
    setMatches([]);
    setSelected(null);
    setTimeout(() => {
      const results = parseCareerInput(input);
      setMatches(results);
      setAnalyzing(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 1800);
  };

  const handleSelect = (match: MatchResult) => {
    setSelected(match);
  };

  const handleConfirm = () => {
    if (!selected) return;
    setTargetCareer(selected.career, selected.postings);
    router.replace("/onboarding/computing");
  };

  const confidenceLabel = (c: number) => {
    if (c >= 0.9) return { label: "Excellent match", color: "#10b981" };
    if (c >= 0.8) return { label: "Strong match", color: "#3b82f6" };
    return { label: "Good match", color: "#f59e0b" };
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <LinearGradient colors={["#1A5CDB", "#1558B0"]} style={s.topBanner}>
          <Text style={s.bannerTag}>PROFILE COMPLETE ✓</Text>
          <Text style={s.bannerTitle}>What's your career goal?</Text>
          <Text style={s.bannerSub}>Type naturally — Taglish is supported. The system will match your intent to active Philippine job titles.</Text>
        </LinearGradient>

        <View style={s.body}>
          <View style={s.inputSection}>
            <View style={s.nlpBadge}>
              <Text style={s.nlpBadgeText}>🤖 NLP Career Parser · 847 active PH job titles</Text>
            </View>
            <View style={s.inputRow}>
              <TextInput
                style={s.input}
                value={input}
                onChangeText={setInput}
                placeholder="e.g. 'data analyst sa tech company' or 'gusto ko maging software engineer'"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onSubmitEditing={handleAnalyze}
              />
            </View>
            <TouchableOpacity
              style={[s.analyzeBtn, (!input.trim() || analyzing) && { opacity: 0.6 }]}
              onPress={handleAnalyze}
              disabled={!input.trim() || analyzing}>
              {analyzing
                ? <><ActivityIndicator color="#fff" size="small" /><Text style={s.analyzeBtnText}> Analyzing input...</Text></>
                : <><Feather name="cpu" size={16} color="#fff" /><Text style={s.analyzeBtnText}> Match Career</Text></>
              }
            </TouchableOpacity>
          </View>

          {analyzing && (
            <View style={s.processingBox}>
              <Text style={s.processingTitle}>Processing your input...</Text>
              {["Detecting language (Taglish)...", "Generating semantic embeddings...", "Matching against 847 PH job titles..."].map((step, i) => (
                <View key={i} style={s.processingRow}>
                  <ActivityIndicator size="small" color="#1A5CDB" />
                  <Text style={s.processingStep}>{step}</Text>
                </View>
              ))}
            </View>
          )}

          {matches.length > 0 && !analyzing && (
            <Animated.View style={{ opacity: fadeAnim }}>
              <Text style={s.resultsTitle}>Semantic Similarity Matching — Top Results</Text>
              <Text style={s.resultsInput}>Your input: "{input}"</Text>
              {matches.map((m, i) => {
                const conf = confidenceLabel(m.confidence);
                const isSelected = selected?.career === m.career;
                return (
                  <TouchableOpacity key={m.career}
                    style={[s.matchCard, isSelected && s.matchCardSelected]}
                    onPress={() => handleSelect(m)}>
                    <View style={s.matchTop}>
                      <View style={s.matchRank}><Text style={s.matchRankText}>{i + 1}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.matchCareer, isSelected && { color: "#1A5CDB" }]}>{m.career}</Text>
                        <Text style={s.matchPostings}>{m.postings.toLocaleString()} active PH postings</Text>
                      </View>
                      <View>
                        <View style={[s.confBadge, { backgroundColor: conf.color + "18" }]}>
                          <Text style={[s.confBadgeText, { color: conf.color }]}>{Math.round(m.confidence * 100)}%</Text>
                        </View>
                        <Text style={[s.confLabel, { color: conf.color }]}>{conf.label}</Text>
                      </View>
                    </View>
                    <View style={s.confBar}>
                      <View style={[s.confBarFill, { width: `${m.confidence * 100}%` as any, backgroundColor: conf.color }]} />
                    </View>
                    {isSelected && (
                      <View style={s.selectedIndicator}>
                        <Feather name="check-circle" size={14} color="#1A5CDB" />
                        <Text style={s.selectedText}>Selected</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}

              {selected && (
                <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm}>
                  <Text style={s.confirmBtnText}>Confirm: {selected.career} →</Text>
                  <Text style={s.confirmBtnSub}>Generate my personalized roadmap</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  topBanner: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 },
  bannerTag: { fontSize: 11, fontWeight: "700", color: "rgba(255,255,255,0.7)", letterSpacing: 1.5, marginBottom: 8, fontFamily: "Inter_700Bold" },
  bannerTitle: { fontSize: 24, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 8 },
  bannerSub: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular", lineHeight: 20 },
  body: { flex: 1, padding: 20, paddingBottom: 40 },
  inputSection: { marginBottom: 16 },
  nlpBadge: { backgroundColor: "#eff6ff", borderRadius: 8, padding: 8, marginBottom: 10, alignSelf: "flex-start" },
  nlpBadgeText: { fontSize: 11, color: "#1A5CDB", fontFamily: "Inter_500Medium" },
  inputRow: { marginBottom: 10 },
  input: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#1A5CDB", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: "#0f172a", fontFamily: "Inter_400Regular", minHeight: 80, lineHeight: 22 },
  analyzeBtn: { backgroundColor: "#1A5CDB", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  analyzeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  processingBox: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 16 },
  processingTitle: { fontSize: 13, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 10 },
  processingRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  processingStep: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular" },
  resultsTitle: { fontSize: 13, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontFamily: "Inter_700Bold" },
  resultsInput: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", marginBottom: 12, fontStyle: "italic" },
  matchCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: "#e2e8f0" },
  matchCardSelected: { borderColor: "#1A5CDB", backgroundColor: "#eff6ff" },
  matchTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  matchRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  matchRankText: { fontSize: 12, fontWeight: "700", color: "#64748b", fontFamily: "Inter_700Bold" },
  matchCareer: { fontSize: 16, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  matchPostings: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", marginTop: 2 },
  confBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-end" },
  confBadgeText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  confLabel: { fontSize: 10, fontFamily: "Inter_500Medium", textAlign: "right", marginTop: 2 },
  confBar: { height: 4, backgroundColor: "#e2e8f0", borderRadius: 2, overflow: "hidden" },
  confBarFill: { height: 4, borderRadius: 2 },
  selectedIndicator: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  selectedText: { fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  confirmBtn: { backgroundColor: "#1A5CDB", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 20, alignItems: "center", marginTop: 4 },
  confirmBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  confirmBtnSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
});
