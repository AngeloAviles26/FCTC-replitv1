import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";

const SOURCE_CONFIG = {
  "course": { color: "#1A5CDB", bg: "#eff6ff", label: "Course" },
  "self-declared": { color: "#f59e0b", bg: "#fffbeb", label: "Self-declared" },
  "certification": { color: "#10b981", bg: "#f0fdf4", label: "Certified" },
  "project": { color: "#8b5cf6", bg: "#f5f3ff", label: "Project" },
};

const DEPTH_COLOR = { Advanced: "#10b981", Proficient: "#3b82f6", Intermediate: "#f59e0b", Foundational: "#94a3b8" };

export default function ProfileScreen() {
  const { user, logout } = useApp();
  const [activeSection, setActiveSection] = useState<"overview" | "courses" | "skills" | "certs" | "projects">("overview");

  if (!user) return null;

  const allSkills = [
    ...(user.courses ?? []).flatMap((c) =>
      c.skillsCredited.map((s) => ({ name: s, source: "course" as const, depth: c.depthLevel, courseName: c.name, grade: c.grade }))
    ),
    ...(user.additionalSkills ?? []).map((s) => ({ name: s.name, source: s.source, depth: s.depth, courseName: null, grade: null })),
    ...(user.certifications ?? []).flatMap((c) =>
      c.skills.map((s) => ({ name: s, source: "certification" as const, depth: "Advanced" as const, courseName: c.title, grade: null }))
    ),
    ...(user.projects ?? []).flatMap((p) =>
      p.skills.map((s) => ({ name: s, source: "project" as const, depth: "Proficient" as const, courseName: p.title, grade: null }))
    ),
  ];

  const uniqueSkillsCount = new Set(allSkills.map((s) => s.name.toLowerCase())).size;

  const courseCredits = allSkills.filter((s) => s.source === "course").length;
  const selfDeclared = allSkills.filter((s) => s.source === "self-declared").length;
  const certVerified = allSkills.filter((s) => s.source === "certification").length;
  const projectCredited = allSkills.filter((s) => s.source === "project").length;

  const profileCompleteness = Math.min(100, Math.round(
    (((user.courses ?? []).length > 0 ? 25 : 0) +
    ((user.additionalSkills ?? []).length > 0 ? 20 : 0) +
    ((user.certifications ?? []).length > 0 ? 30 : 0) +
    ((user.projects ?? []).length > 0 ? 25 : 0))
  ));

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  const SECTIONS = [
    { key: "overview", label: "Overview", icon: "user" },
    { key: "courses", label: "Courses", icon: "book-open" },
    { key: "skills", label: "Skills", icon: "zap" },
    { key: "certs", label: "Certs", icon: "award" },
    { key: "projects", label: "Projects", icon: "code" },
  ] as const;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <LinearGradient colors={["#1A5CDB", "#1558B0"]} style={s.heroCard}>
        <View style={s.heroRow}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={s.heroInfo}>
            <Text style={s.heroName}>{user.name}</Text>
            <Text style={s.heroProg}>{user.program} · {user.yearLevel}</Text>
            <Text style={s.heroUni} numberOfLines={1}>{user.university}</Text>
          </View>
        </View>

        <View style={s.heroStats}>
          {[
            { label: "Readiness", value: `${user.readinessScore}%` },
            { label: "Skills", value: uniqueSkillsCount },
            { label: "Courses", value: (user.courses ?? []).length },
            { label: "Certs", value: (user.certifications ?? []).length },
          ].map((stat) => (
            <View key={stat.label} style={s.heroStat}>
              <Text style={s.heroStatVal}>{stat.value}</Text>
              <Text style={s.heroStatLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.completenessRow}>
          <Text style={s.completenessLabel}>Profile completeness: {profileCompleteness}%</Text>
          <View style={s.completenessBar}>
            <View style={[s.completenessFill, { width: `${profileCompleteness}%` as any }]} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={s.tabScroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 6 }}>
        {SECTIONS.map((sec) => (
          <TouchableOpacity key={sec.key}
            style={[s.tabChip, activeSection === sec.key && s.tabChipActive]}
            onPress={() => setActiveSection(sec.key)}>
            <Feather name={sec.icon as any} size={13} color={activeSection === sec.key ? "#fff" : "#64748b"} />
            <Text style={[s.tabChipText, activeSection === sec.key && s.tabChipTextActive]}>{sec.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeSection === "overview" && (
          <>
            {user.targetCareer && (
              <View style={s.targetCareerCard}>
                <Text style={s.targetCareerLabel}>TARGET CAREER</Text>
                <Text style={s.targetCareerName}>{user.targetCareer}</Text>
                {user.targetCareerPostings > 0 && (
                  <Text style={s.targetCareerPostings}>{user.targetCareerPostings.toLocaleString()} active PH postings · Entry-level</Text>
                )}
              </View>
            )}

            <View style={s.skillSourceCard}>
              <Text style={s.cardTitle}>Skill Profile Summary</Text>
              {[
                { label: "Course-credited (grade-weighted)", count: courseCredits, color: "#1A5CDB" },
                { label: "Self-declared", count: selfDeclared, color: "#f59e0b" },
                { label: "Certification-verified", count: certVerified, color: "#10b981" },
                { label: "Project-credited", count: projectCredited, color: "#8b5cf6" },
              ].map((item) => (
                <View key={item.label} style={s.sourceRow}>
                  <View style={[s.sourceDot, { backgroundColor: item.color }]} />
                  <Text style={s.sourceLabel}>{item.label}</Text>
                  <Text style={[s.sourceCount, { color: item.color }]}>{item.count}</Text>
                </View>
              ))}
              <View style={s.sourceTotalRow}>
                <Text style={s.sourceTotalLabel}>Total unique skills</Text>
                <Text style={s.sourceTotalCount}>{uniqueSkillsCount}</Text>
              </View>
            </View>

            {(user.readinessHistory ?? []).length > 1 && (
              <View style={s.historyCard}>
                <Text style={s.cardTitle}>Readiness Progress</Text>
                {user.readinessHistory.map((h, i) => (
                  <View key={i} style={s.historyRow}>
                    <Text style={s.historyLabel}>{h.label}</Text>
                    <View style={s.historyBarWrap}>
                      <View style={[s.historyBar, { width: `${h.score}%` as any }]} />
                    </View>
                    <Text style={s.historyScore}>{h.score}%</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
              <Feather name="log-out" size={16} color="#ef4444" />
              <Text style={s.logoutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}

        {activeSection === "courses" && (
          <>
            {(user.courses ?? []).length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📚</Text>
                <Text style={s.emptyText}>No courses added yet</Text>
              </View>
            ) : (
              (user.courses ?? []).map((c) => (
                <View key={c.id} style={s.courseCard}>
                  <View style={s.courseHeader}>
                    <Text style={s.courseName}>{c.name}</Text>
                    <View style={s.gradeChip}>
                      <Text style={s.gradeChipText}>{c.grade}</Text>
                    </View>
                  </View>
                  <View style={[s.depthBadge, { backgroundColor: DEPTH_COLOR[c.depthLevel] + "18" }]}>
                    <Text style={[s.depthText, { color: DEPTH_COLOR[c.depthLevel] }]}>{c.depthLevel}</Text>
                  </View>
                  <View style={s.courseSkillsRow}>
                    {c.skillsCredited.map((sk) => (
                      <View key={sk} style={s.skillTag}>
                        <Text style={s.skillTagText}>{sk}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeSection === "skills" && (
          <>
            {allSkills.length === 0 ? (
              <View style={s.emptyState}><Text style={s.emptyIcon}>⚡</Text><Text style={s.emptyText}>No skills in profile yet</Text></View>
            ) : (
              <View style={s.skillsGrid}>
                {allSkills.map((sk, i) => {
                  const src = SOURCE_CONFIG[sk.source] ?? SOURCE_CONFIG["self-declared"];
                  return (
                    <View key={`${sk.name}-${i}`} style={[s.skillGridChip, { borderColor: src.color + "40", backgroundColor: src.bg }]}>
                      <Text style={[s.skillGridChipText, { color: src.color }]}>{sk.name}</Text>
                      <Text style={s.skillGridSrc}>{src.label}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {activeSection === "certs" && (
          <>
            {(user.certifications ?? []).length === 0 ? (
              <View style={s.emptyState}><Text style={s.emptyIcon}>🎓</Text><Text style={s.emptyText}>No certifications added yet</Text></View>
            ) : (
              (user.certifications ?? []).map((c) => (
                <View key={c.id} style={s.certItem}>
                  <View style={s.certItemLeft}>
                    <View style={s.certBadge}><Text style={s.certBadgeText}>CERT</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.certItemTitle}>{c.title}</Text>
                      <Text style={s.certItemIssuer}>{c.issuer}</Text>
                      {c.date ? <Text style={s.certItemDate}>{c.date}</Text> : null}
                      {c.skills.length > 0 && <Text style={s.certItemSkills}>{c.skills.join(" · ")}</Text>}
                    </View>
                  </View>
                  {c.verified && (
                    <View style={s.verifiedBadge}><Feather name="check" size={12} color="#10b981" /></View>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {activeSection === "projects" && (
          <>
            {(user.projects ?? []).length === 0 ? (
              <View style={s.emptyState}><Text style={s.emptyIcon}>💻</Text><Text style={s.emptyText}>No projects added yet</Text></View>
            ) : (
              (user.projects ?? []).map((p) => (
                <View key={p.id} style={s.projectItem}>
                  <Text style={s.projectItemTitle}>{p.title}</Text>
                  {p.description ? <Text style={s.projectItemDesc}>{p.description}</Text> : null}
                  <View style={s.projectTagRow}>
                    {p.skills.map((sk) => (
                      <View key={sk} style={s.projectTag}><Text style={s.projectTagText}>{sk}</Text></View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  heroCard: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  heroRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  heroInfo: { flex: 1 },
  heroName: { fontSize: 18, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  heroProg: { fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "Inter_500Medium", marginTop: 2 },
  heroUni: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "Inter_400Regular", marginTop: 2 },
  heroStats: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 10, padding: 10, marginBottom: 10 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatVal: { fontSize: 18, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  heroStatLabel: { fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", marginTop: 2 },
  completenessRow: { gap: 6 },
  completenessLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" },
  completenessBar: { height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, overflow: "hidden" },
  completenessFill: { height: 4, backgroundColor: "#fff", borderRadius: 2 },
  tabScroll: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", flexGrow: 0 },
  tabChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "#f1f5f9" },
  tabChipActive: { backgroundColor: "#1A5CDB" },
  tabChipText: { fontSize: 12, color: "#64748b", fontFamily: "Inter_500Medium" },
  tabChipTextActive: { color: "#fff" },
  scroll: { flex: 1 },
  targetCareerCard: { backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#bfdbfe" },
  targetCareerLabel: { fontSize: 10, fontWeight: "700", color: "#1A5CDB", letterSpacing: 1.2, marginBottom: 4, fontFamily: "Inter_700Bold" },
  targetCareerName: { fontSize: 20, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 4 },
  targetCareerPostings: { fontSize: 12, color: "#3b82f6", fontFamily: "Inter_400Regular" },
  skillSourceCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 12 },
  sourceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  sourceDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  sourceLabel: { flex: 1, fontSize: 13, color: "#475569", fontFamily: "Inter_400Regular" },
  sourceCount: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sourceTotalRow: { flexDirection: "row", alignItems: "center", paddingTop: 10 },
  sourceTotalLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold" },
  sourceTotalCount: { fontSize: 18, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  historyCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  historyLabel: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", width: 60 },
  historyBarWrap: { flex: 1, height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" },
  historyBar: { height: 6, backgroundColor: "#1A5CDB", borderRadius: 3 },
  historyScore: { fontSize: 12, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold", width: 34 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1.5, borderColor: "#fee2e2" },
  logoutText: { color: "#ef4444", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: "#94a3b8", fontFamily: "Inter_500Medium" },
  courseCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  courseHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 },
  courseName: { flex: 1, fontSize: 14, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginRight: 8 },
  gradeChip: { backgroundColor: "#eff6ff", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  gradeChipText: { fontSize: 13, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold" },
  depthBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginBottom: 8 },
  depthText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  courseSkillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  skillTag: { backgroundColor: "#f1f5f9", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  skillTagText: { fontSize: 11, color: "#475569", fontFamily: "Inter_500Medium" },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillGridChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  skillGridChipText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  skillGridSrc: { fontSize: 9, color: "#94a3b8", fontFamily: "Inter_400Regular", marginTop: 1 },
  certItem: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#e2e8f0" },
  certItemLeft: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  certBadge: { backgroundColor: "#eff6ff", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  certBadgeText: { fontSize: 9, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold" },
  certItemTitle: { fontSize: 13, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold" },
  certItemIssuer: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", marginTop: 2 },
  certItemDate: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  certItemSkills: { fontSize: 11, color: "#1A5CDB", fontFamily: "Inter_400Regular", marginTop: 3 },
  verifiedBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", alignItems: "center", justifyContent: "center" },
  projectItem: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  projectItemTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  projectItemDesc: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", marginBottom: 8 },
  projectTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  projectTag: { backgroundColor: "#f5f3ff", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  projectTagText: { fontSize: 11, color: "#7c3aed", fontFamily: "Inter_500Medium" },
});
