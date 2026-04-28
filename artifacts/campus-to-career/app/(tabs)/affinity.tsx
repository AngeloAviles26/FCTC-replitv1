import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

export default function AffinityScreen() {
  const { user } = useApp();
  const clusters = user.affinityClusters ?? [];
  const careers = user.affinityCareers ?? [];
  const topCluster = clusters[0];

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#1A5CDB", "#3b82f6"]} style={s.hero}>
          <View style={s.heroIconWrap}>
            <Text style={s.heroIcon}>🧠</Text>
          </View>
          <Text style={s.heroTitle}>Career Affinity Indicator</Text>
          <Text style={s.heroSub}>Based on your academic performance clusters</Text>

          {topCluster && (
            <View style={s.heroBadge}>
              <Feather name="star" size={12} color="#1A5CDB" />
              <Text style={s.heroBadgeText}>Strongest: {topCluster.name}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={s.section}>
          <Text style={s.sectionLabel}>YOUR ACADEMIC CLUSTERS</Text>
          {clusters.map((cluster, i) => (
            <View key={cluster.name} style={[s.clusterCard, i === 0 && s.clusterCardTop]}>
              <View style={[s.rankBadge, i === 0 && s.rankBadgeTop]}>
                <Text style={[s.rankText, i === 0 && s.rankTextTop]}>{i === 0 ? "★" : i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.clusterHeaderRow}>
                  <Text style={s.clusterName}>{cluster.name}</Text>
                  {i === 0 && (
                    <View style={s.topPill}>
                      <Text style={s.topPillText}>TOP</Text>
                    </View>
                  )}
                </View>
                <Text style={s.clusterGrade}>Avg grade: {cluster.avgGrade.toFixed(2)}</Text>
                <View style={s.subjectsWrap}>
                  {cluster.subjects.map((subj) => (
                    <View key={subj} style={s.subjectChip}>
                      <Text style={s.subjectChipText}>{subj}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>CAREER PATHS ALIGNED WITH YOUR STRENGTHS</Text>
          <View style={s.careersCard}>
            {careers.map((career, idx) => (
              <View key={career.career} style={[s.careerRow, idx < careers.length - 1 && s.careerRowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={s.careerName}>{career.career}</Text>
                  <View style={s.starsRow}>
                    {[1, 2, 3].map((star) => (
                      <Text key={star} style={[s.star, { color: star <= career.stars ? "#f59e0b" : "#e2e8f0" }]}>★</Text>
                    ))}
                    <View style={[s.affinityPill, { backgroundColor: career.affinity === "Strong" ? "#dcfce7" : "#fef3c7" }]}>
                      <Text style={[s.affinityPillText, { color: career.affinity === "Strong" ? "#15803d" : "#a16207" }]}>{career.affinity}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {user.targetCareer && (
          <View style={s.confirmCard}>
            <Feather name="check-circle" size={18} color="#15803d" />
            <Text style={s.confirmText}>
              Your declared goal (<Text style={s.confirmBold}>{user.targetCareer}</Text>) aligns strongly with your demonstrated academic strengths. You are preparing for the right career.
            </Text>
          </View>
        )}

        <View style={s.noteCard}>
          <Feather name="info" size={14} color="#64748b" />
          <Text style={s.noteText}>This is a signal, not a verdict. Your declared goal always takes priority.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  scroll: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28, alignItems: "center" },
  heroIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  heroIcon: { fontSize: 28 },
  heroTitle: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", marginBottom: 6, textAlign: "center" },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular", marginBottom: 14, textAlign: "center" },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  heroBadgeText: { fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  clusterCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderColor: "#f1f5f9" },
  clusterCardTop: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  rankBadgeTop: { backgroundColor: "#1A5CDB" },
  rankText: { fontSize: 14, fontWeight: "700", color: "#64748b", fontFamily: "Inter_700Bold" },
  rankTextTop: { color: "#fff" },
  clusterHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  clusterName: { fontSize: 14, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", flex: 1 },
  topPill: { backgroundColor: "#1A5CDB", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  topPillText: { fontSize: 9, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  clusterGrade: { fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_500Medium", marginBottom: 8 },
  subjectsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  subjectChip: { backgroundColor: "#f8faff", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: "#e2e8f0" },
  subjectChipText: { fontSize: 11, color: "#64748b", fontFamily: "Inter_400Regular" },
  careersCard: { backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: "#f1f5f9" },
  careerRow: { paddingVertical: 14 },
  careerRowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  careerName: { fontSize: 15, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  star: { fontSize: 14 },
  affinityPill: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  affinityPillText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  confirmCard: { marginHorizontal: 16, marginTop: 16, backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderColor: "#bbf7d0" },
  confirmText: { flex: 1, fontSize: 13, color: "#15803d", fontFamily: "Inter_400Regular", lineHeight: 19 },
  confirmBold: { fontWeight: "700", fontFamily: "Inter_700Bold" },
  noteCard: { marginHorizontal: 16, marginTop: 12, flexDirection: "row", alignItems: "flex-start", gap: 8, paddingHorizontal: 4 },
  noteText: { flex: 1, fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular", fontStyle: "italic", lineHeight: 16 },
});
