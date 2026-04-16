import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GapItem, useApp } from "@/context/AppContext";

const PRIORITY_CONFIG = {
  Critical: { color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" },
  Important: { color: "#f59e0b", bg: "#fffbeb", dot: "#f59e0b" },
  Emerging: { color: "#3b82f6", bg: "#eff6ff", dot: "#3b82f6" },
};

const TREND_ICON = { growing: { icon: "↑", color: "#10b981" }, stable: { icon: "→", color: "#94a3b8" }, declining: { icon: "↓", color: "#ef4444" } };

const FILTER_OPTIONS = ["All", "Critical", "Important", "Emerging"] as const;
type FilterType = typeof FILTER_OPTIONS[number];

export default function GapAnalysisScreen() {
  const { user } = useApp();
  const [filter, setFilter] = useState<FilterType>("All");
  const [selectedGap, setSelectedGap] = useState<GapItem | null>(null);

  if (!user) return null;

  const gaps = user.gapAnalysis ?? [];
  const openGaps = gaps.filter((g) => !g.youHave);
  const closedGaps = gaps.filter((g) => g.youHave);

  const filtered = filter === "All" ? openGaps : openGaps.filter((g) => g.priority === filter);

  const readinessScore = user.readinessScore;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.headerTitle}>Gap Analysis</Text>
              <Text style={s.headerSub}>{user.targetCareer ?? "Career"} · Philippine Market</Text>
            </View>
            <View style={s.postingsBadge}>
              <Text style={s.postingsText}>{user.targetCareerPostings.toLocaleString()}</Text>
              <Text style={s.postingsLabel}>postings</Text>
            </View>
          </View>

          <View style={s.readinessRow}>
            <View style={s.readinessBar}>
              <View style={[s.readinessFill, { width: `${readinessScore}%` as any }]} />
            </View>
            <Text style={s.readinessPct}>{readinessScore}%</Text>
          </View>
          <Text style={s.readinessLabel}>
            {user.skillsMatched} of {user.totalRequired} required skills matched · Entry-level filtered · Recency-weighted SDI
          </Text>
        </View>

        <View style={s.filterRow}>
          {FILTER_OPTIONS.map((f) => (
            <TouchableOpacity key={f} style={[s.filterChip, filter === f && s.filterChipActive]} onPress={() => setFilter(f)}>
              <Text style={[s.filterChipText, filter === f && s.filterChipTextActive]}>
                {f === "All" ? `All (${openGaps.length})` : `${f} (${openGaps.filter((g) => g.priority === f).length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filtered.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>SKILL GAPS — ranked by market demand (SDI)</Text>
            {filtered.map((gap) => {
              const conf = PRIORITY_CONFIG[gap.priority];
              const trend = TREND_ICON[gap.trend];
              return (
                <TouchableOpacity key={gap.id} style={s.gapCard} onPress={() => setSelectedGap(gap)}>
                  <View style={s.gapTop}>
                    <View style={s.gapLeft}>
                      <Text style={s.gapSkill}>{gap.skill}</Text>
                      <View style={s.gapMetaRow}>
                        <View style={[s.priorityBadge, { backgroundColor: conf.bg }]}>
                          <View style={[s.priorityDot, { backgroundColor: conf.dot }]} />
                          <Text style={[s.priorityText, { color: conf.color }]}>{gap.priority.toUpperCase()}</Text>
                        </View>
                        <Text style={[s.trendBadge, { color: trend.color }]}>
                          {trend.icon} {gap.trend}
                          {gap.trend !== "stable" && ` +${Math.abs(gap.trendValue)}%/mo`}
                        </Text>
                      </View>
                    </View>
                    <View style={s.gapRight}>
                      <Text style={[s.gapSdi, { color: conf.color }]}>{gap.sdi}%</Text>
                      <Text style={s.gapSdiSub}>of PH postings</Text>
                      <Feather name="chevron-right" size={16} color="#94a3b8" style={{ marginTop: 4 }} />
                    </View>
                  </View>
                  <View style={s.demandBar}>
                    <View style={[s.demandFill, { width: `${gap.sdi}%` as any, backgroundColor: conf.color + "60" }]} />
                  </View>
                  {gap.closedBy.length > 0 && (
                    <View style={s.closedByRow}>
                      <Feather name="award" size={12} color="#1A5CDB" />
                      <Text style={s.closedByText}>{gap.closedBy[0]}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>🎯</Text>
            <Text style={s.emptyTitle}>No gaps in this category</Text>
          </View>
        )}

        {closedGaps.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>✅ SKILLS YOU HAVE — matched to market requirements</Text>
            {closedGaps.map((gap) => (
              <View key={gap.id} style={s.matchedCard}>
                <View style={s.matchedLeft}>
                  <Feather name="check-circle" size={16} color="#10b981" />
                  <Text style={s.matchedSkill}>{gap.skill}</Text>
                </View>
                <Text style={s.matchedSdi}>{gap.sdi}%</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedGap} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHandle} />
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedGap && (() => {
                const conf = PRIORITY_CONFIG[selectedGap.priority];
                const trend = TREND_ICON[selectedGap.trend];
                return (
                  <>
                    <View style={s.detailHeader}>
                      <View>
                        <Text style={s.detailSkill}>{selectedGap.skill}</Text>
                        <View style={s.detailMeta}>
                          <View style={[s.priorityBadge, { backgroundColor: conf.bg }]}>
                            <Text style={[s.priorityText, { color: conf.color }]}>{selectedGap.priority.toUpperCase()}</Text>
                          </View>
                          <Text style={[s.trendBadge, { color: trend.color }]}>{trend.icon} {selectedGap.trend}</Text>
                          <Text style={[s.detailSdi, { color: conf.color }]}>{selectedGap.sdi}% demand</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => setSelectedGap(null)}>
                        <Feather name="x" size={22} color="#64748b" />
                      </TouchableOpacity>
                    </View>

                    <View style={s.whyBox}>
                      <Text style={s.whyTitle}>WHY IS THIS STILL A GAP?</Text>
                      <Text style={s.whySubtitle}>{selectedGap.sdi}% of entry-level {user?.targetCareer} postings specifically require:</Text>
                      {selectedGap.whatYouNeed.map((item, i) => (
                        <View key={i} style={s.needRow}>
                          <Text style={s.needBullet}>•</Text>
                          <Text style={s.needText}>{item}</Text>
                        </View>
                      ))}
                    </View>

                    {selectedGap.whatYouHave.length > 0 && (
                      <View style={s.haveBox}>
                        <Text style={s.haveTitle}>What you currently have:</Text>
                        {selectedGap.whatYouHave.map((item, i) => (
                          <View key={i} style={s.haveRow}>
                            <Text style={s.haveCheck}>✓</Text>
                            <Text style={s.haveText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {selectedGap.closedBy.length > 0 && (
                      <View style={s.certBox}>
                        <Text style={s.certBoxTitle}>🎯 HOW TO CLOSE THIS GAP</Text>
                        {selectedGap.closedBy.map((cert) => (
                          <View key={cert} style={s.certBoxRow}>
                            <Feather name="award" size={14} color="#1A5CDB" />
                            <Text style={s.certBoxText}>{cert}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedGap(null)}>
                      <Text style={s.closeBtnText}>Close</Text>
                    </TouchableOpacity>
                  </>
                );
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  scroll: { flex: 1 },
  header: { backgroundColor: "#1A5CDB", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginTop: 3 },
  postingsBadge: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  postingsText: { fontSize: 18, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  postingsLabel: { fontSize: 10, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  readinessRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  readinessBar: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" },
  readinessFill: { height: 8, backgroundColor: "#fff", borderRadius: 4 },
  readinessPct: { fontSize: 16, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold", minWidth: 40 },
  readinessLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular" },
  filterRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#f1f5f9" },
  filterChipActive: { backgroundColor: "#1A5CDB" },
  filterChipText: { fontSize: 12, color: "#475569", fontFamily: "Inter_500Medium" },
  filterChipTextActive: { color: "#fff" },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  gapCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  gapTop: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  gapLeft: { flex: 1 },
  gapSkill: { fontSize: 16, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 6 },
  gapMetaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  priorityBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  priorityDot: { width: 5, height: 5, borderRadius: 2.5 },
  priorityText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  trendBadge: { fontSize: 11, fontFamily: "Inter_500Medium" },
  gapRight: { alignItems: "flex-end", marginLeft: 12 },
  gapSdi: { fontSize: 24, fontWeight: "700", fontFamily: "Inter_700Bold" },
  gapSdiSub: { fontSize: 10, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  demandBar: { height: 4, backgroundColor: "#f1f5f9", borderRadius: 2, overflow: "hidden", marginBottom: 8 },
  demandFill: { height: 4, borderRadius: 2 },
  closedByRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  closedByText: { fontSize: 11, color: "#1A5CDB", fontFamily: "Inter_500Medium" },
  emptyState: { alignItems: "center", padding: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: "#64748b", fontFamily: "Inter_500Medium" },
  matchedCard: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, marginBottom: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#bbf7d0" },
  matchedLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  matchedSkill: { fontSize: 14, fontWeight: "600", color: "#15803d", fontFamily: "Inter_600SemiBold" },
  matchedSdi: { fontSize: 13, color: "#10b981", fontFamily: "Inter_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: "88%" },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e2e8f0", alignSelf: "center", marginBottom: 16 },
  detailHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  detailSkill: { fontSize: 22, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 6 },
  detailMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailSdi: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  whyBox: { backgroundColor: "#fff7ed", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#fed7aa" },
  whyTitle: { fontSize: 12, fontWeight: "700", color: "#c2410c", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontFamily: "Inter_700Bold" },
  whySubtitle: { fontSize: 13, color: "#7c2d12", fontFamily: "Inter_400Regular", marginBottom: 10 },
  needRow: { flexDirection: "row", gap: 6, marginBottom: 5 },
  needBullet: { fontSize: 13, color: "#c2410c", fontFamily: "Inter_700Bold" },
  needText: { flex: 1, fontSize: 13, color: "#7c2d12", fontFamily: "Inter_400Regular" },
  haveBox: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#bbf7d0" },
  haveTitle: { fontSize: 12, fontWeight: "700", color: "#15803d", marginBottom: 8, fontFamily: "Inter_700Bold" },
  haveRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  haveCheck: { color: "#10b981", fontSize: 13 },
  haveText: { flex: 1, fontSize: 13, color: "#166534", fontFamily: "Inter_400Regular" },
  certBox: { backgroundColor: "#eff6ff", borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: "#bfdbfe" },
  certBoxTitle: { fontSize: 12, fontWeight: "700", color: "#1A5CDB", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontFamily: "Inter_700Bold" },
  certBoxRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  certBoxText: { fontSize: 13, color: "#1558B0", fontFamily: "Inter_500Medium" },
  closeBtn: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  closeBtnText: { color: "#475569", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
