import { Feather } from "@expo/vector-icons";
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

import { RoadmapCert, RoadmapProject, useApp } from "@/context/AppContext";

const STATUS_CONFIG = {
  "Not Started": { color: "#94a3b8", bg: "#f1f5f9", label: "Not Started" },
  "In Progress": { color: "#f59e0b", bg: "#fffbeb", label: "In Progress" },
  "Completed": { color: "#10b981", bg: "#f0fdf4", label: "Completed" },
};

export default function RoadmapScreen() {
  const { user, updateRoadmapCertStatus, updateRoadmapProjectStatus } = useApp();
  const [activeTab, setActiveTab] = useState<"certs" | "projects">("certs");
  const [expandedCert, setExpandedCert] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  if (!user) return null;

  const certs = user.roadmapCerts ?? [];
  const projects = user.roadmapProjects ?? [];

  const completedCerts = certs.filter((c) => c.status === "Completed").length;
  const inProgressCerts = certs.filter((c) => c.status === "In Progress").length;
  const totalGapsCloseable = certs.reduce((acc, c) => {
    c.gapsClosedIds.forEach((id) => acc.add(id));
    return acc;
  }, new Set<string>()).size;

  const handleCertStatus = (cert: RoadmapCert, status: RoadmapCert["status"]) => {
    if (status === "Completed") {
      Alert.alert(
        "Mark as Completed?",
        `Marking "${cert.title}" as completed will add these skills to your profile and recalculate your readiness score:\n\n${cert.gapsClosedNames.join(", ")}`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Mark Completed", style: "default", onPress: () => updateRoadmapCertStatus(cert.id, "Completed") },
        ]
      );
    } else {
      updateRoadmapCertStatus(cert.id, status);
    }
  };

  const projectedScore = user.readinessScore + certs
    .filter((c) => c.status === "In Progress")
    .reduce((sum, c) => sum + Math.round((c.gapsClosedIds.length / user.totalRequired) * 100), 0);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Your Roadmap</Text>
        <Text style={s.headerSub}>{user.targetCareer ?? "Career"} · Philippine Market</Text>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statNum}>{user.readinessScore}%</Text>
            <Text style={s.statLabel}>Current readiness</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: "#10b981" }]}>{Math.min(projectedScore, 100)}%</Text>
            <Text style={s.statLabel}>Projected (in progress)</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCard}>
            <Text style={[s.statNum, { color: "#1A5CDB" }]}>{totalGapsCloseable}</Text>
            <Text style={s.statLabel}>Gaps closeable</Text>
          </View>
        </View>
      </View>

      <View style={s.tabRow}>
        <TouchableOpacity style={[s.tab, activeTab === "certs" && s.tabActive]} onPress={() => setActiveTab("certs")}>
          <Feather name="award" size={15} color={activeTab === "certs" ? "#1A5CDB" : "#94a3b8"} />
          <Text style={[s.tabText, activeTab === "certs" && s.tabTextActive]}>
            Certifications ({certs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, activeTab === "projects" && s.tabActive]} onPress={() => setActiveTab("projects")}>
          <Feather name="code" size={15} color={activeTab === "projects" ? "#1A5CDB" : "#94a3b8"} />
          <Text style={[s.tabText, activeTab === "projects" && s.tabTextActive]}>
            Projects ({projects.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === "certs" && (
          <>
            {inProgressCerts > 0 && (
              <View style={s.inProgressBanner}>
                <View style={s.inProgressDot} />
                <Text style={s.inProgressText}>{inProgressCerts} certification{inProgressCerts !== 1 ? "s" : ""} in progress · Keep going!</Text>
              </View>
            )}
            {completedCerts > 0 && (
              <View style={s.completedBanner}>
                <Text style={s.completedText}>✅ {completedCerts} certification{completedCerts !== 1 ? "s" : ""} completed</Text>
              </View>
            )}

            {certs.map((cert, i) => {
              const expanded = expandedCert === cert.id;
              const status = STATUS_CONFIG[cert.status];
              return (
                <View key={cert.id} style={[s.certCard, cert.status === "In Progress" && s.certCardActive]}>
                  <TouchableOpacity style={s.certCardHeader} onPress={() => setExpandedCert(expanded ? null : cert.id)}>
                    <View style={s.certRankBadge}>
                      <Text style={s.certRankText}>{i + 1}</Text>
                    </View>
                    <View style={s.certHeaderLeft}>
                      <Text style={s.certTitle}>{cert.title}</Text>
                      <View style={s.certMetaRow}>
                        <Text style={s.certPlatform}>{cert.platform}</Text>
                        <Text style={s.certDot}>·</Text>
                        <Text style={s.certDuration}>{cert.duration}</Text>
                        {cert.free && <View style={s.freeTag}><Text style={s.freeTagText}>FREE</Text></View>}
                      </View>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={s.gapsClosedRow}>
                    <Feather name="check-circle" size={13} color="#10b981" />
                    <Text style={s.gapsClosedText}>
                      Closes {cert.gapsClosedIds.length} gap{cert.gapsClosedIds.length !== 1 ? "s" : ""}: {cert.gapsClosedNames.join(", ")}
                    </Text>
                  </View>

                  {expanded && (
                    <View style={s.certDetails}>
                      <View style={s.certDetailRow}>
                        <Feather name="star" size={13} color="#f59e0b" />
                        <Text style={s.certDetailText}>{cert.rating} ★  ·  {cert.enrolled} enrolled</Text>
                      </View>
                      <View style={s.certDetailRow}>
                        <Feather name="briefcase" size={13} color="#94a3b8" />
                        <Text style={s.certDetailText}>{cert.provider}</Text>
                      </View>
                    </View>
                  )}

                  <View style={s.certActions}>
                    {cert.status === "Not Started" && (
                      <TouchableOpacity style={s.actionBtnPrimary} onPress={() => handleCertStatus(cert, "In Progress")}>
                        <Text style={s.actionBtnPrimaryText}>Mark In Progress</Text>
                      </TouchableOpacity>
                    )}
                    {cert.status === "In Progress" && (
                      <>
                        <TouchableOpacity style={s.actionBtnSecondary} onPress={() => handleCertStatus(cert, "Not Started")}>
                          <Text style={s.actionBtnSecondaryText}>Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.actionBtnPrimary} onPress={() => handleCertStatus(cert, "Completed")}>
                          <Text style={s.actionBtnPrimaryText}>Mark Completed ✓</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {cert.status === "Completed" && (
                      <View style={s.completedRow}>
                        <Feather name="check-circle" size={14} color="#10b981" />
                        <Text style={s.completedLabel}>Skills added to your profile</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {activeTab === "projects" && (
          <>
            <View style={s.projectsNote}>
              <Feather name="info" size={13} color="#1A5CDB" />
              <Text style={s.projectsNoteText}>Projects close specific skill gaps and demonstrate practical ability to employers. Add them to your portfolio.</Text>
            </View>
            {projects.map((project, i) => {
              const expanded = expandedProject === project.id;
              const status = STATUS_CONFIG[project.status];
              return (
                <View key={project.id} style={s.projectCard}>
                  <TouchableOpacity style={s.projectHeader} onPress={() => setExpandedProject(expanded ? null : project.id)}>
                    <View style={s.projectRankBadge}>
                      <Text style={s.projectRankText}>{i + 1}</Text>
                    </View>
                    <View style={s.projectHeaderLeft}>
                      <Text style={s.projectTitle}>{project.title}</Text>
                      <Text style={s.projectTime}>{project.estimatedTime}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[s.statusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={s.gapsClosedRow}>
                    <Feather name="check-circle" size={13} color="#10b981" />
                    <Text style={s.gapsClosedText}>
                      Closes {project.gapsClosedIds.length} gap{project.gapsClosedIds.length !== 1 ? "s" : ""}: {project.gapsClosedNames.join(", ")}
                    </Text>
                  </View>

                  {expanded && (
                    <View style={s.projectDetails}>
                      <Text style={s.projectDesc}>{project.description}</Text>
                      {project.dataset && (
                        <View style={s.datasetRow}>
                          <Feather name="database" size={13} color="#94a3b8" />
                          <Text style={s.datasetText}>{project.dataset}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={s.certActions}>
                    {project.status === "Not Started" && (
                      <TouchableOpacity style={s.actionBtnPrimary} onPress={() => updateRoadmapProjectStatus(project.id, "In Progress")}>
                        <Text style={s.actionBtnPrimaryText}>Add to Plan</Text>
                      </TouchableOpacity>
                    )}
                    {project.status === "In Progress" && (
                      <>
                        <TouchableOpacity style={s.actionBtnSecondary} onPress={() => updateRoadmapProjectStatus(project.id, "Not Started")}>
                          <Text style={s.actionBtnSecondaryText}>Pause</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.actionBtnPrimary} onPress={() => updateRoadmapProjectStatus(project.id, "Completed")}>
                          <Text style={s.actionBtnPrimaryText}>Mark Done ✓</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {project.status === "Completed" && (
                      <View style={s.completedRow}>
                        <Feather name="check-circle" size={14} color="#10b981" />
                        <Text style={s.completedLabel}>Added to your portfolio</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  header: { backgroundColor: "#1A5CDB", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular", marginTop: 3, marginBottom: 16 },
  statsRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12, padding: 12 },
  statCard: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, color: "rgba(255,255,255,0.65)", fontFamily: "Inter_400Regular", marginTop: 2, textAlign: "center" },
  statDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.2)" },
  tabRow: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 13, borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: "#1A5CDB" },
  tabText: { fontSize: 13, color: "#94a3b8", fontFamily: "Inter_500Medium" },
  tabTextActive: { color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  scroll: { flex: 1 },
  inProgressBanner: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fffbeb", borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#fde68a" },
  inProgressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#f59e0b" },
  inProgressText: { fontSize: 13, color: "#92400e", fontFamily: "Inter_500Medium" },
  completedBanner: { backgroundColor: "#f0fdf4", borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#bbf7d0" },
  completedText: { fontSize: 13, color: "#15803d", fontFamily: "Inter_500Medium" },
  certCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  certCardActive: { borderColor: "#fde68a", borderWidth: 1.5 },
  certCardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  certRankBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginTop: 2 },
  certRankText: { fontSize: 12, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold" },
  certHeaderLeft: { flex: 1 },
  certTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 4 },
  certMetaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  certPlatform: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  certDot: { color: "#cbd5e1" },
  certDuration: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  freeTag: { backgroundColor: "#f0fdf4", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  freeTagText: { fontSize: 9, fontWeight: "700", color: "#15803d", fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start" },
  statusText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  gapsClosedRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginBottom: 10, paddingLeft: 4 },
  gapsClosedText: { flex: 1, fontSize: 12, color: "#15803d", fontFamily: "Inter_400Regular" },
  certDetails: { backgroundColor: "#f8faff", borderRadius: 8, padding: 10, marginBottom: 10, gap: 6 },
  certDetailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  certDetailText: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  certActions: { flexDirection: "row", gap: 8 },
  actionBtnPrimary: { flex: 1, backgroundColor: "#1A5CDB", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  actionBtnPrimaryText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  actionBtnSecondary: { backgroundColor: "#f1f5f9", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignItems: "center" },
  actionBtnSecondaryText: { color: "#64748b", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  completedRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  completedLabel: { fontSize: 12, color: "#10b981", fontFamily: "Inter_500Medium" },
  projectsNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#eff6ff", borderRadius: 10, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: "#bfdbfe" },
  projectsNoteText: { flex: 1, fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_400Regular" },
  projectCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0" },
  projectHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  projectRankBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginTop: 2 },
  projectRankText: { fontSize: 12, fontWeight: "700", color: "#64748b", fontFamily: "Inter_700Bold" },
  projectHeaderLeft: { flex: 1 },
  projectTitle: { fontSize: 15, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 3 },
  projectTime: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  projectDetails: { backgroundColor: "#f8faff", borderRadius: 8, padding: 10, marginBottom: 10 },
  projectDesc: { fontSize: 13, color: "#475569", fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 6 },
  datasetRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  datasetText: { fontSize: 12, color: "#94a3b8", fontFamily: "Inter_400Regular" },
});
