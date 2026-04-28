import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Project, useApp } from "@/context/AppContext";

const TECH_TAGS = [
  "Python", "SQL", "MySQL", "PostgreSQL", "PHP", "Java", "JavaScript",
  "React", "Node.js", "HTML/CSS", "MongoDB", "Firebase", "Flask", "Django",
  "pandas", "NumPy", "Excel", "Power BI", "Tableau", "R", "Git", "REST API",
  "Android", "iOS", "React Native", "Figma",
];

export default function StepProjectsScreen() {
  const { addProject, removeProject, updateOnboardingStep, user } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const saveProject = () => {
    if (!projTitle) return;
    const p: Project = {
      id: Date.now().toString(), title: projTitle,
      description: projDesc, skills: selectedTags,
    };
    addProject(p);
    setProjTitle(""); setProjDesc(""); setSelectedTags([]); setShowForm(false);
  };

  const handleNext = () => {
    updateOnboardingStep("career");
    router.push("/onboarding/career-input");
  };

  const projects = user?.projects ?? [];

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: "100%" }]} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#64748b" />
          </TouchableOpacity>
          <Text style={s.step}>STEP 4 OF 4</Text>
          <Text style={s.title}>Projects</Text>
          <Text style={s.subtitle}>
            Add academic or personal projects. Project-credited skills are weighted between course-credited and self-declared — they show initiative.
          </Text>
        </View>

        {projects.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Your Projects ({projects.length})</Text>
            {projects.map((p) => (
              <View key={p.id} style={s.projectCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.projTitle}>{p.title}</Text>
                  {p.description ? <Text style={s.projDesc}>{p.description}</Text> : null}
                  {p.skills.length > 0 && (
                    <View style={s.tagRow}>
                      {p.skills.map((tag) => (
                        <View key={tag} style={s.tagChip}>
                          <Text style={s.tagChipText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => removeProject(p.id)} style={{ paddingLeft: 12 }}>
                  <Feather name="trash-2" size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {!showForm && (
          <View style={s.section}>
            <TouchableOpacity style={s.addProjectBtn} onPress={() => setShowForm(true)}>
              <Feather name="plus-circle" size={20} color="#1A5CDB" />
              <Text style={s.addProjectText}>Add a Project</Text>
            </TouchableOpacity>

            <View style={s.examplesBox}>
              <Text style={s.examplesTitle}>Project Ideas for Your Portfolio</Text>
              {[
                { name: "Library Management System", tags: ["MySQL", "PHP"] },
                { name: "Attendance Tracker App", tags: ["React Native", "Firebase"] },
                { name: "Sales Data Dashboard", tags: ["Python", "pandas", "Tableau"] },
                { name: "Student Grade Calculator", tags: ["JavaScript", "HTML/CSS"] },
                { name: "Inventory System", tags: ["Java", "MySQL"] },
              ].map((ex) => (
                <TouchableOpacity key={ex.name} style={s.exampleRow} onPress={() => {
                  setProjTitle(ex.name); setSelectedTags(ex.tags); setShowForm(true);
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.exampleName}>{ex.name}</Text>
                    <Text style={s.exampleTags}>{ex.tags.join(" · ")}</Text>
                  </View>
                  <Feather name="arrow-right" size={16} color="#94a3b8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {showForm && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>New Project</Text>
            <View style={s.formCard}>
              <Text style={s.label}>Project Title *</Text>
              <TextInput style={s.input} value={projTitle} onChangeText={setProjTitle}
                placeholder="e.g. Library Management System" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Description (optional)</Text>
              <TextInput style={[s.input, { height: 80, textAlignVertical: "top" }]}
                value={projDesc} onChangeText={setProjDesc} multiline
                placeholder="Brief description of what you built..." placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Technologies Used</Text>
              <View style={s.tagGrid}>
                {TECH_TAGS.map((tag) => (
                  <TouchableOpacity key={tag}
                    style={[s.techChip, selectedTags.includes(tag) && s.techChipSelected]}
                    onPress={() => toggleTag(tag)}>
                    <Text style={[s.techChipText, selectedTags.includes(tag) && { color: "#fff" }]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={s.formBtns}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { setShowForm(false); setProjTitle(""); setProjDesc(""); setSelectedTags([]); }}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, !projTitle && { opacity: 0.5 }]} onPress={saveProject} disabled={!projTitle}>
                  <Text style={s.saveBtnText}>Save Project</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <View style={s.footerInner}>
          <View>
            <Text style={s.footerHint}>{projects.length} project{projects.length !== 1 ? "s" : ""} added</Text>
            <Text style={s.footerSub}>Last step before your roadmap!</Text>
          </View>
          <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
            <Text style={s.nextBtnText}>Set Career Goal →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  progressBar: { height: 4, backgroundColor: "#e2e8f0" },
  progressFill: { height: 4, backgroundColor: "#1A5CDB" },
  scroll: { flex: 1 },
  header: { padding: 24, paddingBottom: 12 },
  backBtn: { marginBottom: 12 },
  step: { fontSize: 11, fontWeight: "700", color: "#1A5CDB", letterSpacing: 1.5, marginBottom: 8, fontFamily: "Inter_700Bold" },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular", lineHeight: 21 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  projectCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: "row", borderWidth: 1, borderColor: "#e8f0fd" },
  projTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  projDesc: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", marginBottom: 6 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  tagChip: { backgroundColor: "#eff6ff", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagChipText: { fontSize: 11, color: "#1A5CDB", fontFamily: "Inter_500Medium" },
  addProjectBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderWidth: 2, borderColor: "#1A5CDB", borderStyle: "dashed", borderRadius: 12, padding: 16, marginBottom: 16 },
  addProjectText: { color: "#1A5CDB", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  examplesBox: { backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  examplesTitle: { fontSize: 13, fontWeight: "700", color: "#64748b", marginBottom: 12, fontFamily: "Inter_700Bold" },
  exampleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  exampleName: { fontSize: 14, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold" },
  exampleTags: { fontSize: 12, color: "#94a3b8", fontFamily: "Inter_400Regular", marginTop: 2 },
  formCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  label: { fontSize: 13, fontWeight: "600", color: "#1e293b", marginBottom: 6, fontFamily: "Inter_600SemiBold", marginTop: 6 },
  input: { backgroundColor: "#f8faff", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#0f172a", fontFamily: "Inter_400Regular" },
  tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 12 },
  techChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, borderColor: "#e2e8f0", backgroundColor: "#f8faff" },
  techChipSelected: { backgroundColor: "#1A5CDB", borderColor: "#1A5CDB" },
  techChipText: { fontSize: 12, color: "#475569", fontFamily: "Inter_500Medium" },
  formBtns: { flexDirection: "row", gap: 10, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: "#e2e8f0", alignItems: "center" },
  cancelBtnText: { color: "#64748b", fontFamily: "Inter_600SemiBold" },
  saveBtn: { flex: 2, backgroundColor: "#1A5CDB", padding: 12, borderRadius: 10, alignItems: "center" },
  saveBtnText: { color: "#fff", fontFamily: "Inter_700Bold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f8faff", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingHorizontal: 20, paddingVertical: 14, paddingBottom: 32 },
  footerInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerHint: { fontSize: 13, color: "#0f172a", fontFamily: "Inter_600SemiBold" },
  footerSub: { fontSize: 11, color: "#64748b", fontFamily: "Inter_400Regular" },
  nextBtn: { backgroundColor: "#1A5CDB", paddingHorizontal: 22, paddingVertical: 13, borderRadius: 12 },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
