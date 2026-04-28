import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

import { Certification, useApp } from "@/context/AppContext";

const SOURCE_CONFIG = {
  "course": { color: "#1A5CDB", bg: "#eff6ff", label: "Course" },
  "self-declared": { color: "#f59e0b", bg: "#fffbeb", label: "Self-declared" },
  "certification": { color: "#10b981", bg: "#f0fdf4", label: "Certified" },
  "project": { color: "#8b5cf6", bg: "#f5f3ff", label: "Project" },
};

const DEPTH_COLOR = { Advanced: "#10b981", Proficient: "#3b82f6", Intermediate: "#f59e0b", Foundational: "#94a3b8" };

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
  const [semester, setSemester] = useState("Fall Semester 2023");

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
    setEntries((prev) => prev.map((e, i) => i === editIdx ? { ...e, grade: editGrade, status: "PENDING" } : e));
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
                  <Text style={ms.sheetTitle}>Scan Grades via OCR</Text>
                  <Text style={ms.sheetSub}>Upload a photo of your grade sheet or transcript</Text>
                </View>
                <TouchableOpacity onPress={handleClose}><Feather name="x" size={22} color="#64748b" /></TouchableOpacity>
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
                  "Ensure the document is flat and well-lit",
                  "Hold the camera directly above the document",
                  "All text must be readable and unobstructed",
                  "Both Filipino (Filipino grading: 1.0–5.0) and percentage format are supported",
                ].map((t, i) => (
                  <View key={i} style={ms.tipRow}>
                    <Text style={ms.tipBullet}>•</Text>
                    <Text style={ms.tipText}>{t}</Text>
                  </View>
                ))}
              </View>
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
                  {["Detecting document edges", "Extracting course codes", "Reading grade values", "Verifying with PUP BSIT catalog"].map((step, i) => (
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
                  <Text style={ms.resultsSem}>{semester}</Text>
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
                    <View style={[ms.entryStatusBadge, { backgroundColor: entry.status === "VERIFIED" ? "#f0fdf4" : "#fffbeb" }]}>
                      <Text style={[ms.entryStatusText, { color: entry.status === "VERIFIED" ? "#15803d" : "#92400e" }]}>{entry.status}</Text>
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
                  <Text style={ms.applyBtnText}>Apply Grades to Profile →</Text>
                </TouchableOpacity>
              </View>
              <Text style={ms.resultsNote}>Grades will be grade-weighted and used to credit skills in your profile.</Text>
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
                <View key={i} style={[ms.editEntryRow, i === editIdx && ms.editEntryRowActive]}>
                  <View style={ms.entryAbbrBox}>
                    <Text style={ms.entryAbbr}>{entry.abbr}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={ms.entryName}>{entry.name}</Text>
                    <Text style={ms.entryCode}>{entry.code}</Text>
                  </View>
                  <TouchableOpacity onPress={() => { setEditIdx(i); setEditGrade(entry.grade); }}>
                    <View style={[ms.editGradeBox, i === editIdx && ms.editGradeBoxActive]}>
                      <Text style={[ms.editGradeText, i === editIdx && ms.editGradeTextActive]}>{entry.grade}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
              {editIdx !== null && (
                <View style={ms.editInputArea}>
                  <Text style={ms.editInputLabel}>Editing: {entries[editIdx]?.name}</Text>
                  <TextInput style={ms.editInput} value={editGrade} onChangeText={setEditGrade}
                    keyboardType="decimal-pad" placeholder="1.00 – 5.00"
                    placeholderTextColor="#94a3b8" autoFocus />
                  <Text style={ms.editInputHint}>PUP grading scale: 1.00 (Excellent) → 5.00 (Failed)</Text>
                  <TouchableOpacity style={ms.saveEditBtn} onPress={saveEdit}>
                    <Text style={ms.saveEditBtnText}>Save Grade</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function CertUploadModal({ visible, cert, onClose, onSaved }: {
  visible: boolean;
  cert: Certification | null;
  onClose: () => void;
  onSaved: (certId: string, uri: string) => void;
}) {
  const [imageUri, setImageUri] = useState<string | null>(cert?.imageUri ?? null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission", "Please allow camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!imageUri || !cert) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      onSaved(cert.id, imageUri);
      onClose();
    }, 800);
  };

  if (!cert) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={ms.overlay}>
        <View style={[ms.sheet, { maxHeight: "75%" }]}>
          <View style={ms.handle} />
          <View style={ms.header}>
            <View style={{ flex: 1 }}>
              <Text style={ms.sheetTitle}>Upload Certificate</Text>
              <Text style={ms.sheetSub} numberOfLines={1}>{cert.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={22} color="#64748b" /></TouchableOpacity>
          </View>

          {imageUri ? (
            <View style={ms.certPreviewWrap}>
              <Image source={{ uri: imageUri }} style={ms.certPreviewImg} resizeMode="contain" />
              <TouchableOpacity style={ms.changeImgBtn} onPress={pickImage}>
                <Feather name="refresh-ccw" size={14} color="#1A5CDB" />
                <Text style={ms.changeImgText}>Change image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={ms.pickRow}>
              <TouchableOpacity style={ms.pickCard} onPress={takePhoto}>
                <View style={ms.pickIconBox}><Feather name="camera" size={24} color="#1A5CDB" /></View>
                <Text style={ms.pickCardTitle}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ms.pickCard} onPress={pickImage}>
                <View style={ms.pickIconBox}><Feather name="image" size={24} color="#1A5CDB" /></View>
                <Text style={ms.pickCardTitle}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={ms.uploadNote}>
            <Feather name="shield" size={13} color="#10b981" />
            <Text style={ms.uploadNoteText}>Uploading a certificate image marks this certification as verified in your profile.</Text>
          </View>

          <TouchableOpacity style={[ms.applyBtn, { marginTop: 4 }, !imageUri && { opacity: 0.4 }]}
            onPress={handleSave} disabled={!imageUri || uploading}>
            {uploading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={ms.applyBtnText}>Save Certificate Image ✓</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { user, logout, addCourse, addCertification, updateCertificationImage } = useApp();
  const [activeSection, setActiveSection] = useState<"overview" | "courses" | "skills" | "certs" | "projects">("overview");
  const [showOcr, setShowOcr] = useState(false);
  const [showCertUpload, setShowCertUpload] = useState(false);
  const [uploadTargetCert, setUploadTargetCert] = useState<Certification | null>(null);

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

  const handleOcrApply = (entries: OcrEntry[]) => {
    entries.forEach((e) => {
      const grade = parseFloat(e.grade);
      if (isNaN(grade) || grade > 3.0) return;
      const existing = (user.courses ?? []).find((c) => c.name.toLowerCase().includes(e.name.split(" ")[0].toLowerCase()));
      if (!existing) {
        addCourse({
          id: `ocr-${Date.now()}-${e.code}`,
          name: e.name,
          code: e.code,
          grade: grade,
          depthLevel: grade <= 1.5 ? "Advanced" : grade <= 2.0 ? "Proficient" : grade <= 2.75 ? "Intermediate" : "Foundational",
          skillsCredited: [],
          credits: e.credits,
        } as any);
      }
    });
    Alert.alert("Grades Applied!", `${entries.filter((e) => parseFloat(e.grade) <= 3.0).length} courses added to your profile. Skills will be recalculated.`);
  };

  const handleCertImageSaved = (certId: string, uri: string) => {
    updateCertificationImage?.(certId, uri);
    Alert.alert("Certificate Uploaded", "Your certificate image has been saved and the certification is now marked as verified.");
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
            <TouchableOpacity style={s.scanBtn} onPress={() => setShowOcr(true)}>
              <View style={s.scanBtnIcon}>
                <Feather name="camera" size={18} color="#1A5CDB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.scanBtnTitle}>Scan Grades via OCR</Text>
                <Text style={s.scanBtnSub}>Upload a photo of your grade sheet · auto-extracts course data</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#1A5CDB" />
            </TouchableOpacity>

            {(user.courses ?? []).length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>📚</Text>
                <Text style={s.emptyText}>No courses added yet</Text>
                <Text style={s.emptyHint}>Use the scanner above or go through Onboarding to add your grades</Text>
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
            <TouchableOpacity style={s.scanBtn} onPress={() => {
              const firstCert = (user.certifications ?? [])[0];
              if (!firstCert) {
                Alert.alert("No Certifications", "Add a certification first before uploading an image.");
                return;
              }
              setUploadTargetCert(firstCert);
              setShowCertUpload(true);
            }}>
              <View style={s.scanBtnIcon}>
                <Feather name="upload" size={18} color="#1A5CDB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.scanBtnTitle}>Upload Certificate Image</Text>
                <Text style={s.scanBtnSub}>Attach a photo of your certificate to verify it</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#1A5CDB" />
            </TouchableOpacity>

            {(user.certifications ?? []).length === 0 ? (
              <View style={s.emptyState}>
                <Text style={s.emptyIcon}>🎓</Text>
                <Text style={s.emptyText}>No certifications added yet</Text>
              </View>
            ) : (
              (user.certifications ?? []).map((c) => (
                <View key={c.id} style={s.certItem}>
                  <View style={s.certItemLeft}>
                    {c.imageUri ? (
                      <Image source={{ uri: c.imageUri }} style={s.certThumb} />
                    ) : (
                      <View style={s.certBadge}><Text style={s.certBadgeText}>CERT</Text></View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={s.certItemTitle}>{c.title}</Text>
                      <Text style={s.certItemIssuer}>{c.issuer}</Text>
                      {c.date ? <Text style={s.certItemDate}>{c.date}</Text> : null}
                      {c.skills.length > 0 && <Text style={s.certItemSkills}>{c.skills.join(" · ")}</Text>}
                    </View>
                  </View>
                  <View style={s.certRightCol}>
                    {(c.verified || c.imageUri) && (
                      <View style={s.verifiedBadge}><Feather name="check" size={12} color="#10b981" /></View>
                    )}
                    <TouchableOpacity style={s.uploadCertBtn} onPress={() => {
                      setUploadTargetCert(c);
                      setShowCertUpload(true);
                    }}>
                      <Feather name="upload" size={13} color="#1A5CDB" />
                    </TouchableOpacity>
                  </View>
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

      <GradeOcrModal visible={showOcr} onClose={() => setShowOcr(false)} onApply={handleOcrApply} />
      <CertUploadModal
        visible={showCertUpload}
        cert={uploadTargetCert}
        onClose={() => { setShowCertUpload(false); setUploadTargetCert(null); }}
        onSaved={handleCertImageSaved}
      />
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
  scanBtn: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#eff6ff", borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1.5, borderColor: "#bfdbfe" },
  scanBtnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#bfdbfe" },
  scanBtnTitle: { fontSize: 14, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold" },
  scanBtnSub: { fontSize: 11, color: "#3b82f6", fontFamily: "Inter_400Regular", marginTop: 2 },
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
  emptyState: { alignItems: "center", paddingVertical: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 15, color: "#94a3b8", fontFamily: "Inter_500Medium" },
  emptyHint: { fontSize: 12, color: "#cbd5e1", fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 6, paddingHorizontal: 20 },
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
  certThumb: { width: 40, height: 40, borderRadius: 6, backgroundColor: "#f1f5f9" },
  certItemTitle: { fontSize: 13, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold" },
  certItemIssuer: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", marginTop: 2 },
  certItemDate: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  certItemSkills: { fontSize: 11, color: "#1A5CDB", fontFamily: "Inter_400Regular", marginTop: 3 },
  certRightCol: { alignItems: "center", gap: 8, marginLeft: 8 },
  verifiedBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", alignItems: "center", justifyContent: "center" },
  uploadCertBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#bfdbfe" },
  projectItem: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  projectItemTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 4 },
  projectItemDesc: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", marginBottom: 8 },
  projectTagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  projectTag: { backgroundColor: "#f5f3ff", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  projectTagText: { fontSize: 11, color: "#7c3aed", fontFamily: "Inter_500Medium" },
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
  tipsBox: { backgroundColor: "#f8faff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  tipsTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold", marginBottom: 10 },
  tipRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  tipBullet: { color: "#1A5CDB", fontSize: 13 },
  tipText: { flex: 1, fontSize: 12, color: "#475569", fontFamily: "Inter_400Regular" },
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
  applyBtn: { flex: 1, backgroundColor: "#1A5CDB", borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
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
  certPreviewWrap: { alignItems: "center", marginBottom: 16 },
  certPreviewImg: { width: "100%", height: 180, borderRadius: 12, backgroundColor: "#f1f5f9" },
  changeImgBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  changeImgText: { fontSize: 13, color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  uploadNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#bbf7d0" },
  uploadNoteText: { flex: 1, fontSize: 12, color: "#15803d", fontFamily: "Inter_400Regular" },
});
