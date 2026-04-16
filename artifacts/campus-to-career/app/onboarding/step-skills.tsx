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

import { ADDITIONAL_SKILLS_LIST, GradeDepth, SkillItem, useApp } from "@/context/AppContext";

export default function StepSkillsScreen() {
  const { setAdditionalSkills, updateOnboardingStep, user } = useApp();
  const [selected, setSelected] = useState<Set<string>>(
    new Set((user?.additionalSkills ?? []).map((s) => s.name))
  );
  const [customSkill, setCustomSkill] = useState("");
  const [search, setSearch] = useState("");

  const toggle = (skill: string) => {
    const next = new Set(selected);
    if (next.has(skill)) next.delete(skill); else next.add(skill);
    setSelected(next);
  };

  const addCustom = () => {
    if (!customSkill.trim()) return;
    const trimmed = customSkill.trim();
    setSelected((prev) => new Set([...prev, trimmed]));
    setCustomSkill("");
  };

  const handleNext = () => {
    const skills: SkillItem[] = Array.from(selected).map((name) => ({
      name, source: "self-declared", depth: "Proficient" as GradeDepth,
    }));
    setAdditionalSkills(skills);
    updateOnboardingStep("certs");
    router.push("/onboarding/step-certs");
  };

  const filtered = ADDITIONAL_SKILLS_LIST.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const courseSkills = new Set((user?.courses ?? []).flatMap((c) => c.skillsCredited));

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: "50%" }]} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#64748b" />
          </TouchableOpacity>
          <Text style={s.step}>STEP 2 OF 4</Text>
          <Text style={s.title}>Additional Skills</Text>
          <Text style={s.subtitle}>
            Select skills you know outside of formal courses — from personal projects, online tutorials, or self-study. These are stored as self-declared.
          </Text>
          {courseSkills.size > 0 && (
            <View style={s.note}>
              <Feather name="info" size={13} color="#1A5CDB" />
              <Text style={s.noteText}>Course-credited skills ({courseSkills.size}) are already in your profile. Only add skills beyond those.</Text>
            </View>
          )}
        </View>

        {selected.size > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Selected ({selected.size})</Text>
            <View style={s.selectedWrap}>
              {Array.from(selected).map((skill) => (
                <TouchableOpacity key={skill} style={s.selectedChip} onPress={() => toggle(skill)}>
                  <Text style={s.selectedChipText}>{skill}</Text>
                  <Feather name="x" size={12} color="#fff" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionLabel}>Add Custom Skill</Text>
          <View style={s.customRow}>
            <TextInput style={s.customInput} value={customSkill} onChangeText={setCustomSkill}
              placeholder="e.g. Power Query, Looker Studio..." placeholderTextColor="#94a3b8"
              onSubmitEditing={addCustom} returnKeyType="done" />
            <TouchableOpacity style={s.addBtn} onPress={addCustom}>
              <Text style={s.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Common IT Skills</Text>
          <View style={s.searchWrap}>
            <Feather name="search" size={15} color="#94a3b8" style={{ marginRight: 8 }} />
            <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
              placeholder="Search skills..." placeholderTextColor="#94a3b8" />
          </View>
          <View style={s.skillGrid}>
            {filtered.map((skill) => {
              const isSelected = selected.has(skill);
              const fromCourse = courseSkills.has(skill);
              return (
                <TouchableOpacity key={skill}
                  style={[s.skillChip, isSelected && s.skillChipSelected, fromCourse && s.skillChipCourse]}
                  onPress={() => !fromCourse && toggle(skill)} disabled={fromCourse}>
                  <Text style={[s.skillChipText, isSelected && s.skillChipTextSelected]}>
                    {fromCourse ? "✓ " : ""}{skill}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <View style={s.footerInner}>
          <Text style={s.footerHint}>{selected.size} skill{selected.size !== 1 ? "s" : ""} selected</Text>
          <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
            <Text style={s.nextBtnText}>{selected.size === 0 ? "Skip →" : "Continue →"}</Text>
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
  note: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 12, backgroundColor: "#eff6ff", borderRadius: 8, padding: 10 },
  noteText: { flex: 1, fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_400Regular" },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  selectedWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectedChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#1A5CDB", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  selectedChipText: { color: "#fff", fontSize: 13, fontFamily: "Inter_500Medium" },
  customRow: { flexDirection: "row", gap: 10 },
  customInput: { flex: 1, backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#0f172a", fontFamily: "Inter_400Regular" },
  addBtn: { backgroundColor: "#1A5CDB", borderRadius: 12, paddingHorizontal: 18, justifyContent: "center" },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: "#0f172a", fontFamily: "Inter_400Regular" },
  skillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: "#e2e8f0", backgroundColor: "#fff" },
  skillChipSelected: { backgroundColor: "#1A5CDB", borderColor: "#1A5CDB" },
  skillChipCourse: { backgroundColor: "#f0fdf4", borderColor: "#10b981" },
  skillChipText: { fontSize: 13, color: "#475569", fontFamily: "Inter_500Medium" },
  skillChipTextSelected: { color: "#fff" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f8faff", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32 },
  footerInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerHint: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular" },
  nextBtn: { backgroundColor: "#1A5CDB", paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
