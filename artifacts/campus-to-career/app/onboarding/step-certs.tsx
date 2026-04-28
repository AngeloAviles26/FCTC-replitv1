import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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

const SKILL_SUGGESTIONS = [
  "Python", "SQL", "Data Analysis", "Machine Learning", "Cloud Computing",
  "Networking", "Cybersecurity", "Web Development", "Project Management",
  "JavaScript", "Java", "React", "AWS", "Azure", "Power BI", "Tableau",
];

const SUGGESTED_CERTS = [
  { title: "Google Data Analytics Certificate", issuer: "Google / Coursera" },
  { title: "AWS Cloud Practitioner", issuer: "Amazon Web Services" },
  { title: "Microsoft Power BI Data Analyst", issuer: "Microsoft" },
  { title: "CompTIA IT Fundamentals (ITF+)", issuer: "CompTIA" },
  { title: "Python for Everybody", issuer: "University of Michigan / Coursera" },
  { title: "Meta Front-End Developer", issuer: "Meta / Coursera" },
  { title: "IBM Data Science Professional", issuer: "IBM / Coursera" },
];

function CertImageModal({ visible, cert, onClose, onSaved }: {
  visible: boolean;
  cert: Certification | null;
  onClose: () => void;
  onSaved: (certId: string, uri: string) => void;
}) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera Permission", "Please allow camera access to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!imageUri || !cert) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSaved(cert.id, imageUri);
      setImageUri(null);
      onClose();
    }, 700);
  };

  const handleClose = () => {
    setImageUri(null);
    onClose();
  };

  if (!cert) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ms.overlay}>
        <View style={ms.sheet}>
          <View style={ms.handle} />
          <View style={ms.header}>
            <View style={{ flex: 1 }}>
              <Text style={ms.title}>Upload Certificate Photo</Text>
              <Text style={ms.sub} numberOfLines={2}>{cert.title}</Text>
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={22} color="#64748b" />
            </TouchableOpacity>
          </View>

          {imageUri ? (
            <View style={ms.previewWrap}>
              <Image source={{ uri: imageUri }} style={ms.previewImg} resizeMode="contain" />
              <TouchableOpacity style={ms.changeBtn} onPress={pickImage}>
                <Feather name="refresh-ccw" size={13} color="#1A5CDB" />
                <Text style={ms.changeBtnText}>Change image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={ms.pickRow}>
              <TouchableOpacity style={ms.pickCard} onPress={takePhoto}>
                <View style={ms.pickIcon}><Feather name="camera" size={22} color="#1A5CDB" /></View>
                <Text style={ms.pickTitle}>Take Photo</Text>
                <Text style={ms.pickSub}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={ms.pickCard} onPress={pickImage}>
                <View style={ms.pickIcon}><Feather name="image" size={22} color="#1A5CDB" /></View>
                <Text style={ms.pickTitle}>Gallery</Text>
                <Text style={ms.pickSub}>JPG, PNG</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={ms.noteBox}>
            <Feather name="shield" size={13} color="#10b981" />
            <Text style={ms.noteText}>Uploading a certificate image marks it as verified in your profile, giving it higher weight in gap analysis.</Text>
          </View>

          <TouchableOpacity style={[ms.saveBtn, !imageUri && { opacity: 0.4 }]} onPress={handleSave} disabled={!imageUri || saving}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={ms.saveBtnText}>Save Certificate Photo ✓</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function StepCertsScreen() {
  const { addCertification, removeCertification, updateCertificationImage, updateOnboardingStep, user } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [date, setDate] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [uploadTarget, setUploadTarget] = useState<Certification | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const addSkill = (s: string) => {
    if (!s.trim() || skills.includes(s.trim())) return;
    setSkills((prev) => [...prev, s.trim()]);
    setSkillInput("");
  };

  const saveCert = () => {
    if (!title) return;
    const cert: Certification = {
      id: Date.now().toString(), title, issuer, date, skills, verified: false,
    };
    addCertification(cert);
    setTitle(""); setIssuer(""); setDate(""); setSkills([]); setShowForm(false);
  };

  const addSuggested = (sug: { title: string; issuer: string }) => {
    const cert: Certification = {
      id: Date.now().toString(), title: sug.title, issuer: sug.issuer,
      date: "", skills: [], verified: false,
    };
    addCertification(cert);
  };

  const handleNext = () => {
    updateOnboardingStep("projects");
    router.push("/onboarding/step-projects");
  };

  const handleImageSaved = (certId: string, uri: string) => {
    updateCertificationImage(certId, uri);
  };

  const certs = user?.certifications ?? [];
  const addedTitles = new Set(certs.map((c) => c.title));

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      <View style={s.progressBar}>
        <View style={[s.progressFill, { width: "75%" }]} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Feather name="arrow-left" size={20} color="#64748b" />
          </TouchableOpacity>
          <Text style={s.step}>STEP 3 OF 4</Text>
          <Text style={s.title}>Certifications</Text>
          <Text style={s.subtitle}>
            Add any completed certifications. Upload a photo to verify them — verified certs carry higher confidence weight in your gap analysis.
          </Text>
        </View>

        {certs.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Your Certifications ({certs.length})</Text>
            {certs.map((c) => (
              <View key={c.id} style={s.certCard}>
                {c.imageUri ? (
                  <Image source={{ uri: c.imageUri }} style={s.certThumb} />
                ) : (
                  <View style={s.certBadge}><Text style={s.certBadgeText}>CERT</Text></View>
                )}
                <View style={s.certLeft}>
                  <Text style={s.certTitle}>{c.title}</Text>
                  <Text style={s.certIssuer}>{c.issuer || "Self-declared"}</Text>
                  {c.skills.length > 0 && (
                    <Text style={s.certSkills}>{c.skills.join(" · ")}</Text>
                  )}
                </View>
                <View style={s.certRight}>
                  {c.imageUri || c.verified ? (
                    <View style={s.verifiedBadge}>
                      <Feather name="check" size={11} color="#10b981" />
                    </View>
                  ) : (
                    <TouchableOpacity style={s.uploadBtn} onPress={() => {
                      setUploadTarget(c);
                      setShowUploadModal(true);
                    }}>
                      <Feather name="upload" size={14} color="#1A5CDB" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => removeCertification(c.id)}>
                    <Feather name="trash-2" size={15} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={s.uploadHintBox}>
              <Feather name="info" size={13} color="#1A5CDB" />
              <Text style={s.uploadHintText}>Tap the upload icon on any cert to attach a photo of your certificate for verification.</Text>
            </View>
          </View>
        )}

        {!showForm && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>Quick Add</Text>
            {SUGGESTED_CERTS.map((sug) => {
              const added = addedTitles.has(sug.title);
              return (
                <TouchableOpacity key={sug.title} style={[s.suggestedRow, added && { opacity: 0.5 }]}
                  onPress={() => !added && addSuggested(sug)} disabled={added}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.sugTitle}>{sug.title}</Text>
                    <Text style={s.sugIssuer}>{sug.issuer}</Text>
                  </View>
                  {added
                    ? <Feather name="check-circle" size={20} color="#10b981" />
                    : <View style={s.addCircle}><Text style={s.addPlus}>+</Text></View>
                  }
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={s.manualBtn} onPress={() => setShowForm(true)}>
              <Feather name="plus" size={16} color="#1A5CDB" />
              <Text style={s.manualBtnText}>Add a Different Certification</Text>
            </TouchableOpacity>
          </View>
        )}

        {showForm && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>New Certification</Text>
            <View style={s.formCard}>
              <Text style={s.label}>Certification Title *</Text>
              <TextInput style={s.input} value={title} onChangeText={setTitle}
                placeholder="e.g. AWS Certified Cloud Practitioner" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Issuer / Platform</Text>
              <TextInput style={s.input} value={issuer} onChangeText={setIssuer}
                placeholder="e.g. Amazon Web Services, Coursera" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Date Completed</Text>
              <TextInput style={s.input} value={date} onChangeText={setDate}
                placeholder="e.g. March 2024" placeholderTextColor="#94a3b8" />

              <Text style={s.label}>Skills Covered</Text>
              <View style={s.skillsWrap}>
                {skills.map((sk) => (
                  <TouchableOpacity key={sk} style={s.skillChip} onPress={() => setSkills(skills.filter((x) => x !== sk))}>
                    <Text style={s.skillChipText}>{sk} ×</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.skillInputRow}>
                <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={skillInput} onChangeText={setSkillInput}
                  placeholder="Add a skill..." placeholderTextColor="#94a3b8"
                  onSubmitEditing={() => addSkill(skillInput)} returnKeyType="done" />
                <TouchableOpacity style={s.addSkillBtn} onPress={() => addSkill(skillInput)}>
                  <Text style={{ color: "#fff", fontFamily: "Inter_700Bold" }}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={s.quickSkills}>
                {SKILL_SUGGESTIONS.map((sk) => (
                  <TouchableOpacity key={sk} style={s.quickSkillChip} onPress={() => addSkill(sk)}>
                    <Text style={s.quickSkillText}>{sk}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.formBtns}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowForm(false)}>
                  <Text style={s.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.saveBtn, !title && { opacity: 0.5 }]} onPress={saveCert} disabled={!title}>
                  <Text style={s.saveBtnText}>Save Certification</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <View style={s.footerInner}>
          <Text style={s.footerHint}>{certs.length} cert{certs.length !== 1 ? "s" : ""} added</Text>
          <TouchableOpacity style={s.nextBtn} onPress={handleNext}>
            <Text style={s.nextBtnText}>{certs.length === 0 ? "Skip →" : "Continue →"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CertImageModal
        visible={showUploadModal}
        cert={uploadTarget}
        onClose={() => { setShowUploadModal(false); setUploadTarget(null); }}
        onSaved={handleImageSaved}
      />
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
  certCard: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: "#e8f0fd" },
  certLeft: { flex: 1 },
  certBadge: { backgroundColor: "#eff6ff", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  certBadgeText: { fontSize: 9, fontWeight: "700", color: "#1A5CDB", fontFamily: "Inter_700Bold" },
  certThumb: { width: 36, height: 36, borderRadius: 6, backgroundColor: "#f1f5f9" },
  certTitle: { fontSize: 13, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  certIssuer: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  certSkills: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular", marginTop: 3 },
  certRight: { flexDirection: "column", alignItems: "center", gap: 8 },
  verifiedBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", alignItems: "center", justifyContent: "center" },
  uploadBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#bfdbfe" },
  uploadHintBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#eff6ff", borderRadius: 10, padding: 10, marginTop: 4, borderWidth: 1, borderColor: "#bfdbfe" },
  uploadHintText: { flex: 1, fontSize: 12, color: "#1A5CDB", fontFamily: "Inter_400Regular" },
  suggestedRow: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  sugTitle: { fontSize: 14, fontWeight: "600", color: "#0f172a", fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  sugIssuer: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular" },
  addCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#eff6ff", borderWidth: 1.5, borderColor: "#1A5CDB", alignItems: "center", justifyContent: "center" },
  addPlus: { color: "#1A5CDB", fontSize: 18, fontWeight: "700", lineHeight: 22 },
  manualBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: "#1A5CDB", borderStyle: "dashed", marginTop: 4 },
  manualBtnText: { color: "#1A5CDB", fontSize: 14, fontFamily: "Inter_600SemiBold" },
  formCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#e2e8f0" },
  label: { fontSize: 13, fontWeight: "600", color: "#1e293b", marginBottom: 6, fontFamily: "Inter_600SemiBold", marginTop: 10 },
  input: { backgroundColor: "#f8faff", borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#0f172a", marginBottom: 4, fontFamily: "Inter_400Regular" },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  skillChip: { backgroundColor: "#1A5CDB", borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  skillChipText: { color: "#fff", fontSize: 12, fontFamily: "Inter_500Medium" },
  skillInputRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  addSkillBtn: { backgroundColor: "#1A5CDB", borderRadius: 10, width: 44, alignItems: "center", justifyContent: "center" },
  quickSkills: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  quickSkillChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  quickSkillText: { fontSize: 11, color: "#475569", fontFamily: "Inter_500Medium" },
  formBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1.5, borderColor: "#e2e8f0", alignItems: "center" },
  cancelBtnText: { color: "#64748b", fontFamily: "Inter_600SemiBold" },
  saveBtn: { flex: 2, backgroundColor: "#1A5CDB", padding: 12, borderRadius: 10, alignItems: "center" },
  saveBtnText: { color: "#fff", fontFamily: "Inter_700Bold" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f8faff", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 32 },
  footerInner: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  footerHint: { fontSize: 13, color: "#64748b", fontFamily: "Inter_400Regular" },
  nextBtn: { backgroundColor: "#1A5CDB", paddingHorizontal: 28, paddingVertical: 13, borderRadius: 12 },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});

const ms = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#e2e8f0", alignSelf: "center", marginBottom: 16 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  sub: { fontSize: 12, color: "#64748b", fontFamily: "Inter_400Regular", marginTop: 3 },
  pickRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  pickCard: { flex: 1, backgroundColor: "#f8faff", borderRadius: 14, padding: 16, alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: "#e2e8f0" },
  pickIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  pickTitle: { fontSize: 13, fontWeight: "700", color: "#0f172a", fontFamily: "Inter_700Bold" },
  pickSub: { fontSize: 11, color: "#94a3b8", fontFamily: "Inter_400Regular" },
  previewWrap: { alignItems: "center", marginBottom: 14 },
  previewImg: { width: "100%", height: 160, borderRadius: 12, backgroundColor: "#f1f5f9" },
  changeBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  changeBtnText: { fontSize: 13, color: "#1A5CDB", fontFamily: "Inter_600SemiBold" },
  noteBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: "#bbf7d0" },
  noteText: { flex: 1, fontSize: 12, color: "#15803d", fontFamily: "Inter_400Regular" },
  saveBtn: { backgroundColor: "#1A5CDB", borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
