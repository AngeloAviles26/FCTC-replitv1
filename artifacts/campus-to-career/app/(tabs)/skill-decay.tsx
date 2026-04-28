import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

export default function SkillDecayScreen() {
  const { user } = useApp();
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (!user) return null;

  const decays = (user.decayWarnings ?? []).filter((d) => !dismissed.includes(d.id));
  const allDismissed = (user.decayWarnings ?? []).filter((d) => dismissed.includes(d.id));

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <LinearGradient colors={["#1A5CDB", "#1558B0"]} style={s.headerGrad}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerLabel}>NOVELTY FEATURE</Text>
            <Text style={s.headerTitle}>Skill Decay Monitor</Text>
            <Text style={s.headerSub}>Trend regression on Philippine job market data</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={s.avatarBtn}>
            <Text style={s.avatarText}>{user.name.charAt(0)}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{decays.length}</Text>
            <Text style={s.statLbl}>Active Warnings</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>{(user.decayWarnings ?? []).length}</Text>
            <Text style={s.statLbl}>Skills Tracked</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statNum}>
              {decays.length > 0 ? Math.abs(decays[0].trendPerMonth) + "%" : "0%"}
            </Text>
            <Text style={s.statLbl}>Worst Decay/mo</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {decays.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>✅</Text>
            <Text style={s.emptyTitle}>No active decay warnings</Text>
            <Text style={s.emptySub}>Your skills are trending steadily in the Philippine market. We'll alert you when demand patterns shift.</Text>
          </View>
        )}

        {decays.map((d) => (
          <View key={d.id} style={s.decayCard}>
            <View style={s.decayCardHeader}>
              <View style={s.decaySkillRow}>
                <View style={s.warningDot} />
                <Text style={s.decaySkillName}>{d.skill}</Text>
                <View style={s.decayTrendBadge}>
                  <Text style={s.decayTrendText}>{d.trendPerMonth}%/mo</Text>
                </View>
              </View>
              <TouchableOpacity style={s.dismissBtn} onPress={() => setDismissed((p) => [...p, d.id])}>
                <Feather name="x" size={14} color="#94a3b8" />
                <Text style={s.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.decayRoleLabel}>Data Analyst · Philippine Market</Text>

            <Text style={s.sectionLabel}>SDI TREND HISTORY</Text>
            {d.history.map((h, i) => (
              <View key={i} style={s.historyRow}>
                <Text style={s.historyPeriod}>{h.period}</Text>
                <View style={s.historyBarWrap}>
                  <View style={[s.historyBar, {
                    width: `${h.value}%` as any,
                    backgroundColor: h.value > 30 ? "#94a3b8" : "#ef4444",
                  }]} />
                </View>
                <Text style={s.historyValue}>{h.value}%</Text>
              </View>
            ))}

            <View style={s.regressionBox}>
              <Text style={s.regressionTitle}>REGRESSION ANALYSIS</Text>
              <View style={s.regressionRow}>
                <Text style={s.regressionLabel}>Slope</Text>
                <Text style={s.regressionValue} >{d.trendPerMonth}% per month</Text>
              </View>
              <View style={s.regressionRow}>
                <Text style={s.regressionLabel}>R² fit quality</Text>
                <Text style={[s.regressionValue, { color: "#10b981" }]}>{d.rSquared} — very strong</Text>
              </View>
              <View style={s.regressionRow}>
                <Text style={s.regressionLabel}>3-month forecast</Text>
                <Text style={[s.regressionValue, { color: "#ef4444" }]}>~{d.forecastIn3Months}%</Text>
              </View>
            </View>

            <View style={s.replacementBox}>
              <Text style={s.replacementTitle}>RECOMMENDED REPLACEMENT</Text>
              <View style={s.replacementRow}>
                <Text style={s.replacementSkill}>{d.replacement}</Text>
                <View style={s.replacementTrendBadge}>
                  <Text style={s.replacementTrendText}>+{d.replacementTrend}%/mo ↑</Text>
                </View>
              </View>
              <Text style={s.replacementConfidence}>
                {Math.round(d.coOccurrenceConfidence * 100)}% of postings listing {d.skill} now prefer {d.replacement}
              </Text>
            </View>

            <TouchableOpacity style={s.addRoadmapBtn} onPress={() => router.push("/(tabs)/roadmap")}>
              <Feather name="map" size={15} color="#fff" />
              <Text style={s.addRoadmapBtnText}>Add {d.replacement} to Roadmap →</Text>
            </TouchableOpacity>
          </View>
        ))}

        {allDismissed.length > 0 && (
          <View style={s.dismissedSection}>
            <Text style={s.dismissedLabel}>DISMISSED ({allDismissed.length})</Text>
            {allDismissed.map((d) => (
              <View key={d.id} style={s.dismissedRow}>
                <Feather name="eye-off" size={14} color="#94a3b8" />
                <Text style={s.dismissedSkill}>{d.skill}</Text>
                <TouchableOpacity onPress={() => setDismissed((p) => p.filter((id) => id !== d.id))}>
                  <Text style={s.restoreText}>Restore</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>How Skill Decay Works</Text>
          <Text style={s.infoText}>
            We track the Skill Demand Index (SDI) of each skill you own against live Philippine job posting data. A linear regression model computes the trend slope per month. Skills with a negative slope and R² ≥ 0.7 trigger a warning.{"\n\n"}
            This gives you advance notice — typically 3–6 months before the shift becomes critical in the job market.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  scroll: { flex: 1 },
  headerGrad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  headerLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.6)", letterSpacing: 2, fontFamily: "Inter_700Bold", marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", marginTop: 3 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 10, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  statLbl: { fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
  emptyBox: { margin: 20, backgroundColor: "#fff", borderRadius: 16, padding: 28, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 8 },
  emptySub: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  decayCard: { margin: 16, marginBottom: 8, backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#fecaca", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  decayCardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 },
  decaySkillRow: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  warningDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444" },
  decaySkillName: { fontSize: 18, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", flex: 1 },
  decayTrendBadge: { backgroundColor: "#fef2f2", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: "#fecaca" },
  decayTrendText: { fontSize: 13, fontWeight: "700", color: "#ef4444", fontFamily: "Inter_700Bold" },
  dismissBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "#f8faff", borderRadius: 8 },
  dismissText: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  decayRoleLabel: { fontSize: 12, color: "#94a3b8", fontFamily: "Inter_400Regular", marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  historyPeriod: { fontSize: 11, color: "#64748b", fontFamily: "Inter_400Regular", width: 58 },
  historyBarWrap: { flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  historyBar: { height: 8, borderRadius: 4 },
  historyValue: { fontSize: 12, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", width: 32, textAlign: "right" },
  regressionBox: { backgroundColor: "#f8faff", borderRadius: 12, padding: 14, marginTop: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  regressionTitle: { fontSize: 10, fontWeight: "700", color: "#94a3b8", letterSpacing: 1.2, marginBottom: 10, fontFamily: "Inter_700Bold" },
  regressionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  regressionLabel: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  regressionValue: { fontSize: 13, fontWeight: "700", color: "#ef4444", fontFamily: "Inter_700Bold" },
  replacementBox: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#bbf7d0", marginBottom: 14 },
  replacementTitle: { fontSize: 10, fontWeight: "700", color: "#64748b", letterSpacing: 1.2, marginBottom: 10, fontFamily: "Inter_700Bold" },
  replacementRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  replacementSkill: { fontSize: 18, fontWeight: "700", color: "#15803d", fontFamily: "Inter_700Bold" },
  replacementTrendBadge: { backgroundColor: "#dcfce7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  replacementTrendText: { fontSize: 13, fontWeight: "700", color: "#15803d", fontFamily: "Inter_700Bold" },
  replacementConfidence: { fontSize: 12, color: "#166534", fontFamily: "Inter_400Regular" },
  addRoadmapBtn: { backgroundColor: "#1A5CDB", borderRadius: 12, paddingVertical: 13, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  addRoadmapBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  dismissedSection: { marginHorizontal: 16, marginBottom: 8, backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  dismissedLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  dismissedRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#f8faff" },
  dismissedSkill: { flex: 1, fontSize: 13, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  restoreText: { fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  infoBox: { margin: 16, backgroundColor: "#eff6ff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  infoTitle: { fontSize: 13, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold", marginBottom: 8 },
  infoText: { fontSize: 12, color: "#3b82f6", fontFamily: "Inter_400Regular", lineHeight: 19 },
});
