import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface StatusBadgeProps {
  status: "Not Started" | "In Progress" | "Completed";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = {
    "Not Started": { bg: "#f1f5f9", text: "#64748b" },
    "In Progress": { bg: "#dbeafe", text: "#1d4ed8" },
    Completed: { bg: "#dcfce7", text: "#16a34a" },
  };
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    alignSelf: "flex-start",
  },
  text: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
