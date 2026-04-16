import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
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
import { PriorityBadge } from "@/components/ui/PriorityBadge";

type Priority = "All" | "Critical" | "Important" | "Emerging";

export default function GapAnalysisScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { skillGaps } = useApp();
  const [filter, setFilter] = useState<Priority>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = filter === "All" ? skillGaps : skillGaps.filter((g) => g.priority === filter);

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
          <Text style={[styles.heading, { color: colors.foreground }]}>Skill Gap Analysis</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            {skillGaps.length} gaps identified for your target career
          </Text>
        </View>

        <View style={styles.summary}>
          {(["Critical", "Important", "Emerging"] as const).map((p) => {
            const count = skillGaps.filter((g) => g.priority === p).length;
            const config = {
              Critical: { color: "#dc2626", bg: "#fee2e2" },
              Important: { color: "#d97706", bg: "#fef3c7" },
              Emerging: { color: "#16a34a", bg: "#dcfce7" },
            };
            const c = config[p];
            return (
              <View key={p} style={[styles.summaryChip, { backgroundColor: c.bg }]}>
                <Text style={[styles.summaryCount, { color: c.color }]}>{count}</Text>
                <Text style={[styles.summaryLabel, { color: c.color }]}>{p}</Text>
              </View>
            );
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {(["All", "Critical", "Important", "Emerging"] as Priority[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f ? colors.primary : colors.card,
                  borderColor: filter === f ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f ? "#fff" : colors.mutedForeground },
                ]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filtered.map((gap) => (
            <Pressable
              key={gap.id}
              onPress={() => setExpanded(expanded === gap.id ? null : gap.id)}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: expanded === gap.id ? colors.primary : colors.border },
              ]}
              activeOpacity={0.85}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardLeft}>
                  <Text style={[styles.skillName, { color: colors.foreground }]}>{gap.skill}</Text>
                  <PriorityBadge priority={gap.priority} />
                </View>
                <View style={styles.cardRight}>
                  <View style={[styles.demandBadge, { backgroundColor: colors.blueLight }]}>
                    <Text style={[styles.demandText, { color: colors.primary }]}>{gap.demand}%</Text>
                  </View>
                  <Text style={[styles.demandLabel, { color: colors.mutedForeground }]}>SDI</Text>
                </View>
              </View>

              <View style={[styles.progressBar, { backgroundColor: colors.blueLight }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${gap.demand}%`,
                      backgroundColor:
                        gap.priority === "Critical"
                          ? "#dc2626"
                          : gap.priority === "Important"
                          ? "#d97706"
                          : colors.success,
                    },
                  ]}
                />
              </View>

              {expanded === gap.id && (
                <View style={styles.expandedContent}>
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <Text style={[styles.description, { color: colors.mutedForeground }]}>
                    {gap.description}
                  </Text>
                  <Pressable
                    style={[styles.addRoadmapBtn, { backgroundColor: colors.blueLight }]}
                  >
                    <Feather name="plus" size={14} color={colors.primary} />
                    <Text style={[styles.addRoadmapText, { color: colors.primary }]}>
                      Add to Roadmap
                    </Text>
                  </Pressable>
                </View>
              )}

              <View style={styles.chevronRow}>
                <Feather
                  name={expanded === gap.id ? "chevron-up" : "chevron-down"}
                  size={16}
                  color={colors.mutedForeground}
                />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: { padding: 20, paddingBottom: 12 },
  heading: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sub: { fontSize: 14, fontFamily: "Inter_400Regular" },
  summary: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryChip: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
  },
  summaryCount: { fontSize: 22, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  filterRow: { marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
  },
  filterText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 16, gap: 10 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  cardLeft: { flex: 1, gap: 6 },
  skillName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  cardRight: { alignItems: "center", marginLeft: 12 },
  demandBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginBottom: 2 },
  demandText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  demandLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  progressBar: { height: 6, borderRadius: 100, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 100 },
  expandedContent: { marginTop: 4 },
  divider: { height: 1, marginVertical: 10 },
  description: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  addRoadmapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  addRoadmapText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  chevronRow: { alignItems: "center", marginTop: 6 },
});
