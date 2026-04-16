import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [targetCareer, setTargetCareer] = useState(user?.targetCareer ?? "");
  const [newSkill, setNewSkill] = useState("");

  const handleLogout = () => {
    if (Platform.OS === "web") {
      logout();
      router.replace("/auth/login");
      return;
    }
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  const handleSave = () => {
    updateUser({ targetCareer });
    setEditing(false);
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...(user?.skills ?? []), newSkill.trim()];
    updateUser({ skills: updated });
    setNewSkill("");
  };

  if (!user) return null;

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
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={styles.badgeText}>{user.program}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Text style={styles.badgeText}>{user.yearLevel}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <Feather name="target" size={16} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Target Career</Text>
              </View>
              <Pressable onPress={() => (editing ? handleSave() : setEditing(true))}>
                <Feather name={editing ? "check" : "edit-2"} size={16} color={colors.primary} />
              </Pressable>
            </View>
            {editing ? (
              <TextInput
                style={[styles.editInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
                value={targetCareer}
                onChangeText={setTargetCareer}
                autoFocus
              />
            ) : (
              <Text style={[styles.careerText, { color: colors.primary }]}>{user.targetCareer}</Text>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <Feather name="code" size={16} color={colors.primary} />
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Skills</Text>
              </View>
              <Text style={[styles.countBadge, { backgroundColor: colors.blueLight, color: colors.primary }]}>
                {user.skills.length}
              </Text>
            </View>
            <View style={styles.skillsGrid}>
              {user.skills.map((s) => (
                <Pressable
                  key={s}
                  onLongPress={() => {
                    const updated = user.skills.filter((sk) => sk !== s);
                    updateUser({ skills: updated });
                  }}
                  style={[styles.skillTag, { backgroundColor: colors.blueLight }]}
                >
                  <Text style={[styles.skillTagText, { color: colors.primary }]}>{s}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.addRow}>
              <TextInput
                style={[styles.addInput, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
                value={newSkill}
                onChangeText={setNewSkill}
                placeholder="Add a skill..."
                placeholderTextColor={colors.mutedForeground}
                onSubmitEditing={addSkill}
                returnKeyType="done"
              />
              <Pressable onPress={addSkill} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                <Feather name="plus" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderLeft}>
              <Feather name="award" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Certifications</Text>
            </View>
            {user.certifications.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No certifications yet</Text>
            ) : (
              user.certifications.map((c) => (
                <View key={c} style={styles.listItem}>
                  <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.listItemText, { color: colors.foreground }]}>{c}</Text>
                </View>
              ))
            )}
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeaderLeft}>
              <Feather name="folder" size={16} color={colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Projects</Text>
            </View>
            {user.projects.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No projects yet</Text>
            ) : (
              user.projects.map((p) => (
                <View key={p} style={styles.listItem}>
                  <View style={[styles.dot, { backgroundColor: colors.accent }]} />
                  <Text style={[styles.listItemText, { color: colors.foreground }]}>{p}</Text>
                </View>
              ))
            )}
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutBtn, { borderColor: colors.destructive }]}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={16} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  heroBg: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: { fontSize: 32, fontFamily: "Inter_700Bold", color: "#fff" },
  name: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 4 },
  email: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginBottom: 14 },
  badges: { flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#fff" },
  body: { padding: 16, gap: 12 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  countBadge: { fontSize: 12, fontFamily: "Inter_700Bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  careerText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  editInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, fontFamily: "Inter_400Regular" },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  skillTagText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  addRow: { flexDirection: "row", gap: 8 },
  addInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, fontFamily: "Inter_400Regular" },
  addBtn: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  listItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 7, height: 7, borderRadius: 100 },
  listItemText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
