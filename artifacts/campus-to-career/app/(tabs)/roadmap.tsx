import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp, type RoadmapItem } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Tab = "Certifications" | "Projects";

export default function RoadmapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { roadmap, updateRoadmapStatus } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>("Certifications");

  const items = roadmap.filter((r) => r.type === (activeTab === "Certifications" ? "Certification" : "Project"));
  const completed = items.filter((i) => i.status === "Completed").length;
  const total = items.length;

  const nextStatus = (current: RoadmapItem["status"]): RoadmapItem["status"] => {
    if (current === "Not Started") return "In Progress";
    if (current === "In Progress") return "Completed";
    return "Not Started";
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: 100,
            paddingTop: Platform.OS === "web" ? insets.top + 67 : 0,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.foreground }]}>Learning Roadmap</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Track your progress toward career readiness
          </Text>
        </View>

        <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressValue}>{completed}/{total} {activeTab}</Text>
          </View>
          <View style={styles.progressBarWrap}>
            <View style={[styles.progressBarBg]}>
              <View style={[styles.progressBarFill, { width: total > 0 ? `${(completed / total) * 100}%` : "0%" }]} />
            </View>
            <Text style={styles.progressPct}>{total > 0 ? Math.round((completed / total) * 100) : 0}%</Text>
          </View>
        </View>

        <View style={[styles.tabRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(["Certifications", "Projects"] as Tab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: colors.primary, borderRadius: 10 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? "#fff" : colors.mutedForeground },
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: item.status === "Completed" ? colors.success : item.status === "In Progress" ? colors.primary : colors.border,
                  borderLeftWidth: 3,
                },
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
                  {item.provider && (
                    <View style={styles.providerRow}>
                      <Feather name="award" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.provider, { color: colors.mutedForeground }]}>{item.provider}</Text>
                    </View>
                  )}
                  {item.duration && (
                    <View style={styles.providerRow}>
                      <Feather name="clock" size={12} color={colors.mutedForeground} />
                      <Text style={[styles.provider, { color: colors.mutedForeground }]}>{item.duration}</Text>
                    </View>
                  )}
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.skillsRow}>
                {item.skills.map((s) => (
                  <View key={s} style={[styles.skillChip, { backgroundColor: colors.blueLight }]}>
                    <Text style={[styles.skillText, { color: colors.primary }]}>{s}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => updateRoadmapStatus(item.id, nextStatus(item.status))}
                style={[
                  styles.progressBtn,
                  {
                    backgroundColor:
                      item.status === "Completed"
                        ? "#dcfce7"
                        : item.status === "In Progress"
                        ? colors.primary
                        : colors.blueLight,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Feather
                  name={item.status === "Completed" ? "rotate-ccw" : item.status === "In Progress" ? "check" : "play"}
                  size={14}
                  color={
                    item.status === "Completed"
                      ? colors.success
                      : item.status === "In Progress"
                      ? "#fff"
                      : colors.primary
                  }
                />
                <Text
                  style={[
                    styles.progressBtnText,
                    {
                      color:
                        item.status === "Completed"
                          ? colors.success
                          : item.status === "In Progress"
                          ? "#fff"
                          : colors.primary,
                    },
                  ]}
                >
                  {item.status === "Completed"
                    ? "Mark Incomplete"
                    : item.status === "In Progress"
                    ? "Mark Complete"
                    : "Start Learning"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <SkillDecaySection />
      </ScrollView>
    </View>
  );
}

function SkillDecaySection() {
  const colors = useColors();
  const { skillDecays } = useApp();

  return (
    <View style={[styles.decaySection, { borderTopColor: colors.border }]}>
      <View style={styles.decayHeader}>
        <Feather name="trending-down" size={16} color="#ef4444" />
        <Text style={[styles.decayTitle, { color: colors.foreground }]}>Skill Decay Alerts</Text>
      </View>
      {skillDecays.map((d) => (
        <View key={d.id} style={[styles.decayCard, { backgroundColor: "#fff5f5", borderColor: "#fecaca" }]}>
          <View style={styles.decayLeft}>
            <Text style={[styles.decaySkill, { color: colors.foreground }]}>{d.skill}</Text>
            <View style={styles.decayArrow}>
              <Feather name="arrow-down" size={12} color="#ef4444" />
              <Text style={{ color: "#ef4444", fontSize: 12, fontFamily: "Inter_600SemiBold" }}>
                {Math.abs(d.trend)}% declining
              </Text>
            </View>
          </View>
          <View style={styles.decayRight}>
            <Text style={[styles.decayLabel, { color: colors.mutedForeground }]}>Replace with</Text>
            <Text style={[styles.decayReplacement, { color: colors.primary }]}>{d.replacement}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { padding: 20, paddingBottom: 12 },
  heading: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  progressCard: {
    margin: 16,
    borderRadius: 16,
    padding: 18,
  },
  progressInfo: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  progressTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.85)" },
  progressValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
  progressBarWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  progressBarBg: { flex: 1, height: 8, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 100 },
  progressBarFill: { height: "100%", backgroundColor: "#fff", borderRadius: 100 },
  progressPct: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff", minWidth: 36, textAlign: "right" },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  list: { paddingHorizontal: 16, gap: 10 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  cardLeft: { flex: 1, gap: 4, marginRight: 10 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  provider: { fontSize: 12, fontFamily: "Inter_400Regular" },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skillChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  skillText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  progressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  progressBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  decaySection: { marginTop: 24, padding: 16, borderTopWidth: 1 },
  decayHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  decayTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  decayCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  decayLeft: { flex: 1 },
  decaySkill: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  decayArrow: { flexDirection: "row", alignItems: "center", gap: 4 },
  decayRight: { alignItems: "flex-end" },
  decayLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  decayReplacement: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
