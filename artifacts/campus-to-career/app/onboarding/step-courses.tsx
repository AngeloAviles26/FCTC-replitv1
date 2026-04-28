import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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

type OcrEntry = {
  abbr: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
  status: "VERIFIED" | "PENDING";
};

const OCR_MOCK_RESULTS: OcrEntry[] = [
  { abbr: "DS", name: "Data Structures & Algorithms", code: "CS-301", credits: 4, grade: "1.25", status: "VERIFIED" },
  { abbr: "ML", name: "Machine Learning Intro", code: "CS-405", credits: 3, grade: "1.50", status: "VERIFIED" },
  { abbr: "ST", name: "Applied Statistics", code: "MA-202", credits: 3, grade: "2.25", status: "PENDING" },
  { abbr: "DB", name: "Database Management Systems", code: "CS-302", credits: 3, grade: "1.75", status: "VERIFIED" },
  { abbr: "WD", name: "Web Development Fundamentals", code: "CS-310", credits: 3, grade: "2.00", status: "PENDING" },
];

type OcrStep = "idle" | "scanning" | "results" | "editing";

function GradeOcrModal({ visible, onClose, onApply }: {
  visible: boolean;
  onClose: () => void;
  onApply: (entries: OcrEntry[]) => void;
}) {
  const [step, setStep] = useState<OcrStep>("idle");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [entries, setEntries] = useState<OcrEntry[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editGrade, setEditGrade] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setStep("scanning");
      setTimeout(() => {
        setEntries(OCR_MOCK_RESULTS.map((e) => ({ ...e })));
        setStep("results");
      }, 2200);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission", "Please allow camera access in settings to scan your grades.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setStep("scanning");
      setTimeout(() => {
        setEntries(OCR_MOCK_RESULTS.map((e) => ({ ...e })));
        setStep("results");
      }, 2200);
    }
  };

  const saveEdit = () => {
    if (editIdx === null) return;
    const g = parseFloat(editGrade);
    if (isNaN(g) || g < 1.0 || g > 5.0) {
      Alert.alert("Invalid Grade", "Please enter a grade between 1.00 and 5.00.");
      return;
    }
    setEntries((prev) =>
      prev.map((e, i) => i === editIdx ? { ...e, grade: editGrade, status: "PENDING" } : e)
    );
    setEditIdx(null);
    setStep("results");
  };

  const handleClose = () => {
    setStep("idle");
    setImageUri(null);
    setEntries([]);
    setEditIdx(null);
    onClose();
  };

  const handleApply = () => {
    onApply(entries);
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <View style={ms.handle} />

          {step === "idle" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={ms.header}>
                <View>
                  <Text style={ms.sheetTitle}>Scan Grade Sheet</Text>
                  <Text style={ms.sheetSub}>Upload a photo of your transcript or official grade sheet</Text>
                </View>
                <TouchableOpacity onPress={handleClose}>
                  <Feather name="x" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View style={ms.pickRow}>
                <TouchableOpacity style={ms.pickCard} onPress={takePhoto}>
                  <View style={ms.pickIconBox}>
                    <Feather name="camera" size={24} color="#1A5CDB" />
                  </View>
                  <Text style={ms.pickCardTitle}>Take a Photo</Text>
                  <Text style={ms.pickCardSub}>Camera · best results</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ms.pickCard} onPress={pickImage}>
                  <View style={ms.pickIconBox}>
                    <Feather name="image" size={24} color="#1A5CDB" />
                  </View>
                  <Text style={ms.pickCardTitle}>Choose from Gallery</Text>
                  <Text style={ms.pickCardSub}>JPG, PNG supported</Text>
                </TouchableOpacity>
              </View>

              <View style={ms.tipsBox}>
                <Text style={ms.tipsTitle}>📸 Tips for best results</Text>
                {[
                  "Lay the document flat on a clean surface",
                  "Ensure all course names and grades are fully visible",
                  "Good lighting — no shadows over the text",
                  "PUP grading scale (1.0–5.0) is automatically detected",
                ].map((t, i) => (
                  <View key={i} style={ms.tipRow}>
                    <Text style={ms.tipBullet}>•</Text>
                    <Text style={ms.tipText}>{t}</Text>
                  </View>
                ))}
              </View>

              <View style={ms.dividerRow}>
                <View style={ms.dividerLine} />
                <Text style={ms.dividerText}>or add manually below</Text>
                <View style={ms.dividerLine} />
              </View>

              <TouchableOpacity style={ms.manualFallback} onPress={handleClose}>
                <Feather name="list" size={16} color="#64748b" />
                <Text style={ms.manualFallbackText}>Pick courses from list instead</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {step === "scanning" && (
            <View style={ms.scanningBox}>
              {imageUri && <Image source={{ uri: imageUri }} style={ms.scanPreview} />}
              <View style={ms.scanOverlay}>
                <ActivityIndicator size="large" color="#1A5CDB" />
                <Text style={ms.scanningTitle}>Scanning grades...</Text>
                <Text style={ms.scanningSub}>Extracting course data from your document</Text>
                <View style={ms.scanSteps}>
                  {[
                    "Detecting document edges",
                    "Extracting course codes",
                    "Reading grade values",
                    "Verifying with PUP BSIT catalog",
                  ].map((step, i) => (
                    <View key={i} style={ms.scanStep}>
                      <View style={ms.scanStepDot} />
                      <Text style={ms.scanStepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {step === "results" && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={ms.resultsHeader}>
                <View>
                  <Text style={ms.resultsTitle}>Extracted Grades</Text>
                  <Text style={ms.resultsSem}>Fall Semester 2023</Text>
                </View>
                <TouchableOpacity style={ms.editDataBtn} onPress={() => {
                  setEditIdx(0);
                  setEditGrade(entries[0]?.grade ?? "");
                  setStep("editing");
                }}>
                  <Text style={ms.editDataBtnText}>EDIT DATA</Text>
                </TouchableOpacity>
              </View>

              {entries.map((entry, i) => (
                <View key={i} style={ms.entryCard}>
                  <View style={ms.entryAbbrBox}>
                    <Text style={ms.entryAbbr}>{entry.abbr}</Text>
                  </View>
                  <View style={ms.entryInfo}>
                    <Text style={ms.entryName}>{entry.name}</Text>
                    <Text style={ms.entryCode}>{entry.code} · {entry.credits} Credits</Text>
                  </View>
                  <View style={ms.entryRight}>
                    <Text style={ms.entryGrade}>{entry.grade}</Text>
                    <View style={[ms.entryStatusBadge, {
                      backgroundColor: entry.status === "VERIFIED" ? "#f0fdf4" : "#fffbeb",
                    }]}>
                      <Text style={[ms.entryStatusText, {
                        color: entry.status === "VERIFIED" ? "#15803d" : "#92400e",
                      }]}>{entry.status}</Text>
                    </View>
                  </View>
                </View>
              ))}

              <View style={ms.resultsBtns}>
                <TouchableOpacity style={ms.rescanBtn} onPress={() => setStep("idle")}>
                  <Feather name="refresh-ccw" size={14} color="#64748b" />
                  <Text style={ms.rescanText}>Scan again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ms.applyBtn} onPress={handleApply}>
                  <Text style={ms.applyBtnText}>Apply Grades →</Text>
                </TouchableOpacity>
              </View>
              <Text style={ms.resultsNote}>
                Courses will be grade-weighted and matched against the PUP BSIT skill catalog.
              </Text>
            </ScrollView>
          )}

          {step === "editing" && editIdx !== null && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={ms.header}>
                <Text style={ms.sheetTitle}>Edit Grades</Text>
                <TouchableOpacity onPress={() => { setStep("results"); setEditIdx(null); }}>
                  <Feather name="x" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
              {entries.map((entry, i) => (
                <TouchableOpacity key={i}
                  style={[ms.editEntryRow, i === editIdx && ms.editEntryRowActive]}
                  onPress={() => { setEditIdx(i); setEditGrade(entry.grade); }}>
                  <View style={ms.entryAbbrBox}>
                    <Text style={ms.entryAbbr}>{entry.abbr}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={ms.entryName}>{entry.name}</Text>
                    <Text style={ms.entryCode}>{entry.code}</Text>
                  </View>
                  <View style={[ms.editGradeBox, i === editIdx && ms.editGradeBoxActive]}>
                    <Text style={[ms.editGradeText, i === editIdx && ms.editGradeTextActive]}>
                      {entry.grade}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <View style={ms.editInputArea}>
                <Text style={ms.editInputLabel}>Editing: {entries[editIdx]?.name}</Text>
                <TextInput
                  style={ms.editInput}
                  value={editGrade}
                  onChangeText={setEditGrade}
                  keyboardType="decimal-pad"
                  placeholder="1.00 – 5.00"
                  placeholderTextColor="#94a3b8"
                  autoFocus
                />
                <Text style={ms.editInputHint}>PUP grading scale: 1.00 (Excellent) → 5.00 (Failed)</Text>
                <TouchableOpacity style={ms.saveEditBtn} onPress={saveEdit}>
                  <Text style={ms.saveEditBtnText}>Save Grade</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function StepCoursesScreen() {
  const { addCourse, removeCourse, updateOnboardingStep, user } = useApp();
  const [search, setSearch] = useState("");
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSE_LIST[0] | null>(null);
  const [showOcr, setShowOcr] = useState(false);

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

  const handleOcrApply = (entries: OcrEntry[]) => {
    let added = 0;
    entries.forEach((e) => {
      const grade = e.grade;
      const gradeNum = parseFloat(grade);
      if (isNaN(gradeNum) || gradeNum > 3.0) return;
      const depth = gradeToDepth(grade);
      if (!depth) return;
      const match = COURSE_LIST.find((cl) =>
        cl.name.toLowerCase().includes(e.name.split(" ")[0].toLowerCase()) ||
        cl.name.toLowerCase().includes(e.name.split(" ")[1]?.toLowerCase() ?? "")
      );
      const id = match?.id ?? `ocr-${e.code}`;
      if (addedIds.has(id)) return;
      addCourse({
        id,
        name: e.name,
        grade,
        depthLevel: depth,
        skillsCredited: match?.skills ?? [],
      });
      added++;
    });
    if (added > 0) {
      Alert.alert(
        "Grades Applied!",
        `${added} course${added !== 1 ? "s" : ""} added from your grade sheet. You can still add more below.`
      );
    }
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
            Scan your grade sheet or pick subjects manually. Your grade determines your skill depth — a 1.25 in Database Management credits SQL at Advanced level.
          </Text>
        </View>

        <View style={s.section}>
          <TouchableOpacity style={s.scanBanner} onPress={() => setShowOcr(true)}>
            <View style={s.scanBannerIcon}>
              <Feather name="camera" size={20} color="#1A5CDB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.scanBannerTitle}>Scan Grade Sheet via OCR</Text>
              <Text style={s.scanBannerSub}>Auto-extract all courses & grades from a photo</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#1A5CDB" />
          </TouchableOpacity>
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
          <View style={s.manualHeader}>
            <Text style={s.sectionLabel}>PUP BSIT Course List</Text>
            <Text style={s.manualHint}>add individually</Text>
          </View>
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

      <GradeOcrModal visible={showOcr} onClose={() => setShowOcr(false)} onApply={handleOcrApply} />
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
  scanBanner: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: "#bfdbfe" },
  scanBannerIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#bfdbfe" },
  scanBannerTitle: { fontSize: 14, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold" },
  scanBannerSub: { fontSize: 11, color: "#3b82f6", fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontFamily: "Inter_700Bold" },
  manualHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  manualHint: { fontSize: 11, color: "#cbd5e1", fontFamily: "Inter_400Regular" },
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

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, maxHeight: "92%" },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e2e8f0", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  sheetSub: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular", marginTop: 3 },
  pickRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  pickCard: { flex: 1, backgroundColor: "#f8faff", borderRadius: 14, padding: 16, alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: "#e2e8f0" },
  pickIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  pickCardTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", textAlign: "center" },
  pickCardSub: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular", textAlign: "center" },
  tipsBox: { backgroundColor: "#f8faff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 16 },
  tipsTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 10 },
  tipRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  tipBullet: { color: "#1A5CDB", fontSize: 13 },
  tipText: { flex: 1, fontSize: 12, color: "#475569", fontFamily: "Inter_400Regular" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e2e8f0" },
  dividerText: { fontSize: 12, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  manualFallback: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 12, backgroundColor: "#f8faff", borderWidth: 1, borderColor: "#e2e8f0" },
  manualFallbackText: { fontSize: 13, color: "#64748b", fontFamily: "Inter_500Medium" },
  scanningBox: { height: 340, position: "relative", borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  scanPreview: { width: "100%", height: "100%", position: "absolute" },
  scanOverlay: { flex: 1, backgroundColor: "rgba(255,255,255,0.93)", alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  scanningTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  scanningSub: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular", textAlign: "center" },
  scanSteps: { gap: 8, width: "100%", marginTop: 8 },
  scanStep: { flexDirection: "row", alignItems: "center", gap: 10 },
  scanStepDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#1A5CDB" },
  scanStepText: { fontSize: 12, color: "#475569", fontFamily: "Inter_400Regular" },
  resultsHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  resultsTitle: { fontSize: 22, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  resultsSem: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular", marginTop: 2 },
  editDataBtn: { backgroundColor: "#1A5CDB", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  editDataBtnText: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  entryCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#e2e8f0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  entryAbbrBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#1A5CDB", alignItems: "center", justifyContent: "center" },
  entryAbbr: { fontSize: 13, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 14, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 2 },
  entryCode: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  entryRight: { alignItems: "flex-end", gap: 4 },
  entryGrade: { fontSize: 22, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  entryStatusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  entryStatusText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  resultsBtns: { flexDirection: "row", gap: 10, marginTop: 4, marginBottom: 6 },
  rescanBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#f1f5f9", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14 },
  rescanText: { fontSize: 13, color: "#64748b", fontFamily: "Inter_600SemiBold" },
  applyBtn: { flex: 1, backgroundColor: "#1A5CDB", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  applyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  resultsNote: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular", textAlign: "center", paddingBottom: 8 },
  editEntryRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  editEntryRowActive: { backgroundColor: "#f8faff", borderRadius: 10, paddingHorizontal: 10, marginHorizontal: -10 },
  editGradeBox: { backgroundColor: "#f1f5f9", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editGradeBoxActive: { backgroundColor: "#1A5CDB" },
  editGradeText: { fontSize: 16, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  editGradeTextActive: { color: "#fff" },
  editInputArea: { backgroundColor: "#f8faff", borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  editInputLabel: { fontSize: 12, fontWeight: "600", color: "#64748b", fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  editInput: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#1A5CDB", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 22, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 8 },
  editInputHint: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 12 },
  saveEditBtn: { backgroundColor: "#1A5CDB", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  saveEditBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
