import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { ReadinessRing } from "@/components/ui/ReadinessRing";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, skillGaps, roadmap, readinessScore } = useApp();

  const criticalCount = skillGaps.filter((g) => g.priority === "Critical").length;
  const inProgressCount = roadmap.filter((r) => r.status === "In Progress").length;
  const completedCount = roadmap.filter((r) => r.status === "Completed").length;

  const topGaps = skillGaps.filter((g) => g.priority === "Critical").slice(0, 3);

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
        <LinearGradient
          colors={[colors.primary, colors.blueDark]}
          style={[styles.heroBg, { paddingTop: Platform.OS !== "web" ? insets.top + 16 : 16 }]}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{user?.name?.split(" ")[0] ?? "Student"}</Text>
            </View>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) ?? "S"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.ringSection}>
              <ReadinessRing score={readinessScore} size={120} strokeWidth={9} />
              <Text style={[styles.ringLabel, { color: colors.mutedForeground }]}>
                Career Readiness
              </Text>
            </View>
            <View style={styles.heroInfo}>
              <View style={[styles.infoChip, { backgroundColor: colors.blueLight }]}>
                <Feather name="target" size={12} color={colors.primary} />
                <Text style={[styles.infoChipText, { color: colors.primary }]}>
                  {user?.targetCareer ?? "Data Analyst"}
                </Text>
              </View>
              <Text style={[styles.programText, { color: "#fff" }]}>
                {user?.program} · {user?.yearLevel}
              </Text>
              <Text style={[styles.summaryText, { color: "rgba(255,255,255,0.75)" }]}>
                {criticalCount} critical gaps to address
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.metricsRow}>
          <MetricCard
            label="Skill Gaps"
            value={`${skillGaps.length}`}
            icon="alert-circle"
            color="#ef4444"
            bg="#fee2e2"
            colors={colors}
          />
          <MetricCard
            label="In Progress"
            value={`${inProgressCount}`}
            icon="clock"
            color={colors.primary}
            bg={colors.blueLight}
            colors={colors}
          />
          <MetricCard
            label="Completed"
            value={`${completedCount}`}
            icon="check-circle"
            color={colors.success}
            bg="#dcfce7"
            colors={colors}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Critical Skill Gaps
            </Text>
            <Pressable onPress={() => router.push("/(tabs)/gap-analysis")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </Pressable>
          </View>
          {topGaps.map((gap) => (
            <Pressable
              key={gap.id}
              style={[styles.gapCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push("/(tabs)/gap-analysis")}
              activeOpacity={0.8}
            >
              <View style={styles.gapLeft}>
                <Text style={[styles.gapSkill, { color: colors.foreground }]}>{gap.skill}</Text>
                <Text style={[styles.gapDesc, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {gap.description}
                </Text>
              </View>
              <View style={styles.gapRight}>
                <Text style={[styles.gapDemand, { color: colors.primary }]}>{gap.demand}%</Text>
                <Text style={[styles.gapDemandLabel, { color: colors.mutedForeground }]}>demand</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          </View>
          <View style={styles.actionsRow}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/roadmap")}
              activeOpacity={0.85}
            >
              <Feather name="map" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>View Roadmap</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}
              onPress={() => router.push("/(tabs)/gap-analysis")}
              activeOpacity={0.85}
            >
              <Feather name="bar-chart-2" size={18} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>Gap Analysis</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricCard({ label, value, icon, color, bg, colors }: any) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.metricIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  heroBg: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular" },
  userName: { fontSize: 22, color: "#fff", fontFamily: "Inter_700Bold" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 18, color: "#fff", fontFamily: "Inter_700Bold" },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  ringSection: { alignItems: "center" },
  ringLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 6 },
  heroInfo: { flex: 1, gap: 8 },
  infoChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  infoChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  programText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    paddingTop: 20,
  },
  metricCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 11, fontFamily: "Inter_500Medium", textAlign: "center" },
  section: { paddingHorizontal: 16, marginBottom: 4 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  seeAll: { fontSize: 13, fontFamily: "Inter_500Medium" },
  gapCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  gapLeft: { flex: 1, marginRight: 12 },
  gapSkill: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  gapDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  gapRight: { alignItems: "center" },
  gapDemand: { fontSize: 20, fontFamily: "Inter_700Bold" },
  gapDemandLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
