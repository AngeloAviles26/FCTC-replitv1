import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { COURSE_LIST, Course, gradeToDepth, useApp } from "@/context/AppContext";

const GRADES = ["1.00", "1.25", "1.50", "1.75", "2.00", "2.25", "2.50", "2.75", "3.00"];

export default function StepCoursesScreen() {
  const { addCourse, removeCourse, updateOnboardingStep, user } = useApp();
  const [search, setSearch] = useState("");
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSE_LIST[0] | null>(null);

  const filtered = COURSE_LIST.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const addedIds = new Set((user?.courses ?? []).map((c) => c.id));

  const pickCourse = (course: typeof COURSE_LIST[0]) => {
    setSelectedCourse(course);
    setShowGradePicker(true);
  };

  const confirmGrade = (grade: string) => {
    if (!selectedCourse) return;
    const depth = gradeToDepth(grade);
    if (!depth) return;
    const c: Course = {
      id: selectedCourse.id, name: selectedCourse.name,
      grade, depthLevel: depth, skillsCredited: selectedCourse.skills,
    };
    addCourse(c);
    setShowGradePicker(false);
    setSelectedCourse(null);
  };

  const handleNext = () => {
    updateOnboardingStep("skills");
    router.push("/onboarding/step-skills");
  };

  const depthColor = (d: string) => {
    if (d === "Advanced") return "#10b981";
    if (d === "Proficient") return "#3b82f6";
    if (d === "Intermediate") return "#f59e0b";
    return "#94a3b8";
  };

  const courses = user?.courses ?? [];

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: "25%" }]} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.step}>STEP 1 OF 4</Text>
          <Text style={s.title}>Courses & Grades</Text>
          <Text style={s.subtitle}>
            Select subjects you've completed. Your grade determines your skill depth — a 1.25 in Database Management credits SQL at Advanced level.
          </Text>
        </View>

        {courses.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Added ({courses.length})</Text>
            {courses.map((c) => (
              <View key={c.id} style={s.addedCard}>
                <View style={s.addedLeft}>
                  <Text style={s.addedName}>{c.name}</Text>
                  <View style={s.addedMeta}>
                    <View style={[s.depthBadge, { backgroundColor: depthColor(c.depthLevel) + "22" }]}>
                      <Text style={[s.depthText, { color: depthColor(c.depthLevel) }]}>{c.depthLevel}</Text>
                    </View>
                    <Text style={s.gradeText}>Grade: {c.grade}</Text>
                  </View>
                  <Text style={s.skillsList}>{c.skillsCredited.join(" · ")}</Text>
                </View>
                <TouchableOpacity onPress={() => removeCourse(c.id)} style={s.removeBtn}>
                  <Feather name="x" size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={s.section}>
          <Text style={s.sectionLabel}>PUP BSIT Course List</Text>
          <View style={s.searchWrap}>
            <Feather name="search" size={15} color="#94a3b8" style={s.searchIcon} />
            <TextInput style={s.searchInput} value={search} onChangeText={setSearch}
              placeholder="Search subjects..." placeholderTextColor="#94a3b8" />
          </View>
          {filtered.map((course) => {
            const added = addedIds.has(course.id);
            return (
              <TouchableOpacity key={course.id} style={[s.courseRow, added && s.courseRowAdded]}
                onPress={() => !added && pickCourse(course)} disabled={added}>
                <View style={s.courseLeft}>
                  <Text style={[s.courseName, added && { color: "#94a3b8" }]}>{course.name}</Text>
                  <Text style={s.courseSkills}>{course.skills.slice(0, 3).join(", ")}</Text>
                </View>
                {added
                  ? <Feather name="check-circle" size={20} color="#10b981" />
                  : <View style={s.addCircle}><Text style={s.addPlus}>+</Text></View>
                }
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={s.footer}>
        <View style={s.footerInner}>
          <Text style={s.footerHint}>{courses.length} course{courses.length !== 1 ? "s" : ""} added</Text>
          <TouchableOpacity style={[s.nextBtn, courses.length === 0 && s.nextBtnDisabled]} onPress={handleNext}>
            <Text style={s.nextBtnText}>{courses.length === 0 ? "Skip for now" : "Continue →"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showGradePicker} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowGradePicker(false)}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Select Your Grade</Text>
            {selectedCourse && <Text style={s.modalSubtitle}>{selectedCourse.name}</Text>}
            <View style={s.gradeInfo}>
              <Text style={s.gradeInfoText}>1.00–1.50 = Advanced · 1.51–2.00 = Proficient · 2.01–2.75 = Intermediate · 2.76–3.00 = Foundational</Text>
            </View>
            <FlatList
              data={GRADES}
              keyExtractor={(g) => g}
              numColumns={3}
              renderItem={({ item: g }) => {
                const depth = gradeToDepth(g);
                return (
                  <TouchableOpacity style={s.gradeBtn} onPress={() => confirmGrade(g)}>
                    <Text style={s.gradeBtnNum}>{g}</Text>
                    {depth && <Text style={[s.gradeBtnDepth, { color: depthColor(depth) }]}>{depth}</Text>}
                  </TouchableOpacity>
                );
              }}
              contentContainerStyle={{ gap: 8, padding: 4 }}
              columnWrapperStyle={{ gap: 8 }}
            />
            <TouchableOpacity style={s.modalCancel} onPress={() => setShowGradePicker(false)}>
              <Text style={s.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8faff" },
  progressBar: { height: 4, backgroundColor: "#e2e8f0", marginBottom: 0 },
  progressFill: { height: 4, backgroundColor: "#1A5CDB", borderRadius: 2 },
  scroll: { flex: 1 },
  header: { padding: 24, paddingBottom: 16 },
  step: { fontSize: 11, fontWeight: "700", color: "#1A5CDB", letterSpacing: 1.5, marginBottom: 8, fontFamily: "Inter_700Bold" },
  title: { fontSize: 26, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#64748b", fontFamily: "Inter_400Regular", lineHeight: 21 },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  addedCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "flex-start", borderWidth: 1, borderColor: "#e8f0fd" },
  addedLeft: { flex: 1 },
  addedName: { fontSize: 14, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  addedMeta: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  depthBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  depthText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  gradeText: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  skillsList: { fontSize: 12, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  removeBtn: { padding: 4, marginLeft: 8 },
  searchWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: "#0f172a", fontFamily: "Inter_400Regular" },
  courseRow: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  courseRowAdded: { opacity: 0.5 },
  courseLeft: { flex: 1 },
  courseName: { fontSize: 14, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  courseSkills: { fontSize: 12, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  addCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#eff6ff", borderWidth: 1.5, borderColor: "#1A5CDB", alignItems: "center", justifyContent: "center" },
  addPlus: { color: "#1A5CDB", fontSize: 18, fontWeight: "700", lineHeight: 22 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f8faff", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32 },
  footerInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerHint: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular" },
  nextBtn: { backgroundColor: "#1A5CDB", paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
  nextBtnDisabled: { backgroundColor: "#94a3b8" },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular", marginBottom: 12 },
  gradeInfo: { backgroundColor: "#eff6ff", borderRadius: 8, padding: 10, marginBottom: 16 },
  gradeInfoText: { fontSize: 11, color: "#1A5CDB", fontFamily: "Inter_400Regular", lineHeight: 17 },
  gradeBtn: { flex: 1, backgroundColor: "#f8faff", borderRadius: 12, padding: 14, alignItems: "center", borderWidth: 1.5, borderColor: "#e2e8f0" },
  gradeBtnNum: { fontSize: 18, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  gradeBtnDepth: { fontSize: 10, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  modalCancel: { marginTop: 16, alignItems: "center", padding: 12 },
  modalCancelText: { color: "#94a3b8", fontSize: 14, fontFamily: "Inter_500Medium" },
});
