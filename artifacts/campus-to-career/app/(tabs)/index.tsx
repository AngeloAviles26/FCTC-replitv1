import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { useApp } from "@/context/AppContext";

function ReadinessRing({ score }: { score: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, { toValue: score, duration: 1200, useNativeDriver: false }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, circumference * (1 - score / 100)],
  });

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 140, height: 140 }}>
      <Svg width={140} height={140} style={{ position: "absolute" }}>
        <Circle cx={70} cy={70} r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={10} />
      </Svg>
      <Animated.View style={{ position: "absolute" }}>
        <Svg width={140} height={140}>
          <AnimatedCircle cx={70} cy={70} r={radius} fill="none" stroke="#fff" strokeWidth={10}
            strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset as any}
            transform="rotate(-90 70 70)" />
        </Svg>
      </Animated.View>
      <Text style={{ fontSize: 32, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" }}>{score}%</Text>
      <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_500Medium" }}>READINESS</Text>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const priorityConfig = {
  Critical: { color: "#ef4444", bg: "#fef2f2", label: "CRITICAL" },
  Important: { color: "#f59e0b", bg: "#fffbeb", label: "IMPORTANT" },
  Emerging: { color: "#3b82f6", bg: "#eff6ff", label: "EMERGING" },
};

const trendIcon = (trend: string, val: number) => {
  if (trend === "growing") return { icon: "↑", color: "#10b981" };
  if (trend === "declining") return { icon: "↓", color: "#ef4444" };
  return { icon: "→", color: "#94a3b8" };
};

export default function HomeScreen() {
  const { user, updateRoadmapCertStatus } = useApp();
  const [showDecay, setShowDecay] = useState(false);
  const [showAffinity, setShowAffinity] = useState(false);

  if (!user) return null;

  const topGaps = (user.gapAnalysis ?? []).filter((g) => !g.youHave).slice(0, 3);
  const matched = (user.gapAnalysis ?? []).filter((g) => g.youHave);
  const activeDecays = (user.decayWarnings ?? []).filter((d) => !d.dismissed);
  const inProgressCerts = user.roadmapCerts.filter((c) => c.status === "In Progress");

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={["#1A5CDB", "#1558B0", "#0f3d80"]} style={s.hero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.heroGreeting}>Hello, {user.name.split(" ")[0]} 👋</Text>
              <Text style={s.heroPub}>{user.university}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={s.avatarBtn}>
              <Text style={s.avatarText}>{user.name.charAt(0)}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.heroCenter}>
            <ReadinessRing score={user.readinessScore} />
            <View style={s.heroRight}>
              <View style={s.careerChip}>
                <Feather name="target" size={12} color="#1A5CDB" />
                <Text style={s.careerChipText}>{user.targetCareer ?? "Set your career"}</Text>
              </View>
              {user.targetCareerPostings > 0 && (
                <Text style={s.postingsText}>{user.targetCareerPostings.toLocaleString()} PH postings</Text>
              )}
              <Text style={s.matchedText}>
                {user.skillsMatched} of {user.totalRequired} skills matched
              </Text>
              {inProgressCerts.length > 0 && (
                <View style={s.inProgressChip}>
                  <View style={s.inProgressDot} />
                  <Text style={s.inProgressText}>{inProgressCerts.length} cert in progress</Text>
                </View>
              )}
            </View>
          </View>

          <View style={s.statsRow}>
            {[
              { label: "Gaps", value: (user.gapAnalysis ?? []).filter((g) => !g.youHave).length, icon: "alert-circle" },
              { label: "Skills", value: (user.courses ?? []).reduce((a, c) => a + c.skillsCredited.length, 0) + (user.additionalSkills ?? []).length, icon: "zap" },
              { label: "Roadmap", value: user.roadmapCerts.filter((c) => c.status !== "Not Started").length, icon: "map" },
            ].map((stat) => (
              <View key={stat.label} style={s.statCard}>
                <Text style={s.statValue}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {activeDecays.length > 0 && (
          <TouchableOpacity style={s.decayBanner} onPress={() => setShowDecay(true)}>
            <View style={s.decayBannerLeft}>
              <Text style={s.decayBannerIcon}>⚠</Text>
              <View>
                <Text style={s.decayBannerTitle}>Skill Decay Warning</Text>
                <Text style={s.decayBannerSub}>{activeDecays[0].skill} is declining at {Math.abs(activeDecays[0].trendPerMonth)}%/month · Tap to see analysis</Text>
              </View>
            </View>
            <Feather name="chevron-right" size={18} color="#dc2626" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={s.affinityCard} onPress={() => setShowAffinity(true)}>
          <View style={s.affinityLeft}>
            <Text style={s.affinityIcon}>🧠</Text>
            <View>
              <Text style={s.affinityTitle}>Career Affinity Indicator</Text>
              <Text style={s.affinitySub}>See which careers match your academic strengths</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color="#1A5CDB" />
        </TouchableOpacity>

        {topGaps.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Top Skill Gaps</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/gap-analysis")}>
                <Text style={s.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            {topGaps.map((gap) => {
              const conf = priorityConfig[gap.priority];
              const trend = trendIcon(gap.trend, gap.trendValue);
              return (
                <View key={gap.id} style={s.gapCard}>
                  <View style={s.gapLeft}>
                    <Text style={s.gapSkill}>{gap.skill}</Text>
                    <View style={s.gapMeta}>
                      <View style={[s.priorityBadge, { backgroundColor: conf.bg }]}>
                        <Text style={[s.priorityText, { color: conf.color }]}>{conf.label}</Text>
                      </View>
                      <Text style={[s.trendText, { color: trend.color }]}>{trend.icon} {gap.trendValue > 0 ? "+" : ""}{gap.trend}</Text>
                    </View>
                  </View>
                  <View style={s.gapRight}>
                    <Text style={s.gapSdi}>{gap.sdi}%</Text>
                    <Text style={s.gapSdiLabel}>demand</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {matched.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>✅ Skills You Have</Text>
            <View style={s.matchedWrap}>
              {matched.map((g) => (
                <View key={g.id} style={s.matchedChip}>
                  <Text style={s.matchedChipText}>{g.skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {user.roadmapCerts.filter((c) => c.status === "Not Started").length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Top Recommendation</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/roadmap")}>
                <Text style={s.seeAll}>View roadmap →</Text>
              </TouchableOpacity>
            </View>
            {(() => {
              const top = user.roadmapCerts.find((c) => c.status === "Not Started");
              if (!top) return null;
              return (
                <View style={s.topCertCard}>
                  <View style={s.topCertHeader}>
                    <Text style={s.topCertTitle}>{top.title}</Text>
                    <View style={s.topCertProvider}><Text style={s.topCertProviderText}>{top.provider}</Text></View>
                  </View>
                  <View style={s.gapsClosedRow}>
                    <Feather name="check-circle" size={14} color="#10b981" />
                    <Text style={s.gapsClosedText}>Closes {top.gapsClosedNames.length} gaps: {top.gapsClosedNames.join(", ")}</Text>
                  </View>
                  <View style={s.certMeta}>
                    <Text style={s.certMetaText}>{top.platform} · {top.duration}</Text>
                    {top.free && <View style={s.freeTag}><Text style={s.freeTagText}>FREE</Text></View>}
                  </View>
                  <TouchableOpacity style={s.startBtn} onPress={() => updateRoadmapCertStatus(top.id, "In Progress")}>
                    <Text style={s.startBtnText}>Mark In Progress</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        )}
      </ScrollView>

      <Modal visible={showDecay} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>⚠ Skill Decay Warning</Text>
              <TouchableOpacity onPress={() => setShowDecay(false)}>
                <Feather name="x" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            {activeDecays.map((d) => (
              <View key={d.id}>
                <View style={s.decaySkillRow}>
                  <Text style={s.decaySkillName}>{d.skill}</Text>
                  <View style={s.decayTrendBadge}>
                    <Text style={s.decayTrendText}>{d.trendPerMonth}%/mo</Text>
                  </View>
                </View>
                <Text style={s.decayRoleLabel}>Data Analyst · Philippine Market</Text>

                <Text style={s.decayChartTitle}>SDI TREND HISTORY</Text>
                {d.history.map((h, i) => (
                  <View key={i} style={s.historyRow}>
                    <Text style={s.historyPeriod}>{h.period}</Text>
                    <View style={s.historyBarWrap}>
                      <View style={[s.historyBar, { width: `${h.value}%` as any, backgroundColor: h.value > 30 ? "#94a3b8" : "#ef4444" }]} />
                    </View>
                    <Text style={s.historyValue}>{h.value}%</Text>
                  </View>
                ))}

                <View style={s.regressionBox}>
                  <Text style={s.regressionRow}>Slope: <Text style={{ color: "#ef4444" }}>{d.trendPerMonth}% per month</Text></Text>
                  <Text style={s.regressionRow}>R² fit quality: <Text style={{ color: "#10b981" }}>{d.rSquared} (very strong)</Text></Text>
                  <Text style={s.regressionRow}>Forecast in 3 months: <Text style={{ color: "#ef4444" }}>~{d.forecastIn3Months}%</Text></Text>
                </View>

                <View style={s.replacementBox}>
                  <Text style={s.replacementTitle}>RECOMMENDED REPLACEMENT</Text>
                  <View style={s.replacementRow}>
                    <Text style={s.replacementSkill}>{d.replacement}</Text>
                    <View style={s.replacementTrendBadge}><Text style={s.replacementTrendText}>+{d.replacementTrend}%/mo ↑</Text></View>
                  </View>
                  <Text style={s.replacementConfidence}>{Math.round(d.coOccurrenceConfidence * 100)}% of postings listing {d.skill} now prefer {d.replacement}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={s.addRoadmapBtn} onPress={() => setShowDecay(false)}>
              <Text style={s.addRoadmapBtnText}>Add Power BI to Roadmap →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAffinity} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>🧠 Career Affinity Indicator</Text>
              <TouchableOpacity onPress={() => setShowAffinity(false)}>
                <Feather name="x" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={s.affinityModalSub}>Based on your academic performance clusters</Text>

            {(user.affinityClusters ?? []).map((cluster, i) => (
              <View key={cluster.name} style={[s.clusterCard, i === 0 && s.clusterCardTop]}>
                <View style={s.clusterRankBadge}>
                  <Text style={s.clusterRankText}>{i === 0 ? "★" : "○"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.clusterName}>{cluster.name}</Text>
                  <Text style={s.clusterGrade}>Avg grade: {cluster.avgGrade.toFixed(2)}</Text>
                  <Text style={s.clusterSubjects}>{cluster.subjects.join(", ")}</Text>
                </View>
              </View>
            ))}

            <Text style={s.affinityPathsTitle}>CAREER PATHS ALIGNED WITH YOUR STRENGTHS</Text>
            {(user.affinityCareers ?? []).map((career) => (
              <View key={career.career} style={s.affinityCareerRow}>
                <Text style={s.affinityCareerName}>{career.career}</Text>
                <View style={s.affinityStars}>
                  {[1, 2, 3].map((star) => (
                    <Text key={star} style={{ fontSize: 14, color: star <= career.stars ? "#f59e0b" : "#e2e8f0" }}>★</Text>
                  ))}
                  <Text style={[s.affinityLabel, { color: career.affinity === "Strong" ? "#10b981" : "#f59e0b" }]}>
                    {career.affinity}
                  </Text>
                </View>
              </View>
            ))}

            {user.targetCareer && (
              <View style={s.affinityConfirm}>
                <Text style={s.affinityConfirmText}>✅ Your declared goal ({user.targetCareer}) aligns strongly with your demonstrated academic strengths. You are preparing for the right career.</Text>
              </View>
            )}

            <Text style={s.affinityNote}>Note: This is a signal, not a verdict. Your declared goal always takes priority.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  scroll: { flex: 1 },
  hero: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  heroGreeting: { fontSize: 18, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  heroPub: { fontSize: 11, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", marginTop: 2 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroCenter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  heroRight: { flex: 1, paddingLeft: 20, gap: 8 },
  careerChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, alignSelf: "flex-start" },
  careerChipText: { fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  postingsText: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  matchedText: { fontSize: 13, color: "rgba(255,255,255,0.9)", fontFamily: "Inter_500Medium" },
  inProgressChip: { flexDirection: "row", alignItems: "center", gap: 5 },
  inProgressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981" },
  inProgressText: { fontSize: 11, color: "#10b981", fontFamily: "Inter_500Medium" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 10, alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginTop: 2 },
  decayBanner: { margin: 16, marginBottom: 0, backgroundColor: "#fef2f2", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#fecaca" },
  decayBannerLeft: { flexDirection: "row", alignItems: "flex-start", gap: 10, flex: 1 },
  decayBannerIcon: { fontSize: 22 },
  decayBannerTitle: { fontSize: 14, fontWeight: "700", color: "#dc2626", fontFamily: "Inter_700Bold" },
  decayBannerSub: { fontSize: 12, color: "#ef4444", fontFamily: "Inter_400Regular", marginTop: 2, flex: 1 },
  affinityCard: { margin: 16, marginTop: 10, backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#bfdbfe" },
  affinityLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  affinityIcon: { fontSize: 24 },
  affinityTitle: { fontSize: 14, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold" },
  affinitySub: { fontSize: 12, color: "#3b82f6", fontFamily: "Inter_400Regular", marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  gapCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  gapLeft: { flex: 1 },
  gapSkill: { fontSize: 15, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  gapMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  priorityBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  priorityText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  trendText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  gapRight: { alignItems: "flex-end" },
  gapSdi: { fontSize: 22, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  gapSdiLabel: { fontSize: 10, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  matchedWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  matchedChip: { backgroundColor: "#f0fdf4", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#bbf7d0" },
  matchedChipText: { fontSize: 12, color: "#15803d", fontFamily: "Inter_500Medium" },
  topCertCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#e8f0fd" },
  topCertHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 },
  topCertTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", flex: 1, marginRight: 8 },
  topCertProvider: { backgroundColor: "#eff6ff", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  topCertProviderText: { fontSize: 11, color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  gapsClosedRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 8 },
  gapsClosedText: { fontSize: 12, color: "#15803d", fontFamily: "Inter_400Regular", flex: 1 },
  certMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  certMetaText: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  freeTag: { backgroundColor: "#f0fdf4", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "#bbf7d0" },
  freeTagText: { fontSize: 10, fontWeight: "700", color: "#15803d", fontFamily: "Inter_700Bold" },
  startBtn: { backgroundColor: "#1A5CDB", borderRadius: 10, paddingVertical: 11, alignItems: "center" },
  startBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: "90%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e2e8f0", alignSelf: "center", marginBottom: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  decaySkillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2, marginTop: 10 },
  decaySkillName: { fontSize: 18, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  decayTrendBadge: { backgroundColor: "#fef2f2", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  decayTrendText: { fontSize: 13, fontWeight: "700", color: "#ef4444", fontFamily: "Inter_700Bold" },
  decayRoleLabel: { fontSize: 12, color: "#94a3b8", fontFamily: "Inter_400Regular", marginBottom: 14 },
  decayChartTitle: { fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8, fontFamily: "Inter_700Bold" },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  historyPeriod: { fontSize: 11, color: "#64748b", fontFamily: "Inter_400Regular", width: 58 },
  historyBarWrap: { flex: 1, height: 8, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" },
  historyBar: { height: 8, borderRadius: 4 },
  historyValue: { fontSize: 12, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", width: 32, textAlign: "right" },
  regressionBox: { backgroundColor: "#f8faff", borderRadius: 10, padding: 12, marginTop: 10, marginBottom: 12 },
  regressionRow: { fontSize: 13, color: "#0f172a", fontFamily: "Inter_400Regular", marginBottom: 4 },
  replacementBox: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#bbf7d0", marginBottom: 14 },
  replacementTitle: { fontSize: 11, fontWeight: "700", color: "#64748b", letterSpacing: 1, marginBottom: 8, fontFamily: "Inter_700Bold" },
  replacementRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  replacementSkill: { fontSize: 16, fontWeight: "700", color: "#15803d", fontFamily: "Inter_700Bold" },
  replacementTrendBadge: { backgroundColor: "#dcfce7", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  replacementTrendText: { fontSize: 12, fontWeight: "700", color: "#15803d", fontFamily: "Inter_700Bold" },
  replacementConfidence: { fontSize: 12, color: "#166534", fontFamily: "Inter_400Regular" },
  addRoadmapBtn: { backgroundColor: "#1A5CDB", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  addRoadmapBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  affinityModalSub: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular", marginBottom: 16 },
  clusterCard: { backgroundColor: "#f8faff", borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  clusterCardTop: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  clusterRankBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  clusterRankText: { fontSize: 12, color: "#64748b" },
  clusterName: { fontSize: 13, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  clusterGrade: { fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_500Medium", marginTop: 2 },
  clusterSubjects: { fontSize: 11, color: "#64748b", fontFamily: "Inter_400Regular", marginTop: 2 },
  affinityPathsTitle: { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginTop: 14, marginBottom: 8, fontFamily: "Inter_700Bold" },
  affinityCareerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  affinityCareerName: { fontSize: 15, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold" },
  affinityStars: { flexDirection: "row", alignItems: "center", gap: 2 },
  affinityLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginLeft: 4 },
  affinityConfirm: { backgroundColor: "#f0fdf4", borderRadius: 10, padding: 12, marginTop: 12, borderWidth: 1, borderColor: "#bbf7d0" },
  affinityConfirmText: { fontSize: 13, color: "#15803d", fontFamily: "Inter_400Regular", lineHeight: 19 },
  affinityNote: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular", marginTop: 10, fontStyle: "italic" },
});
