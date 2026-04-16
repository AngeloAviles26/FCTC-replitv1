import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface PriorityBadgeProps {
  priority: "Critical" | "Important" | "Emerging";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colors = useColors();

  const config = {
    Critical: { bg: "#fee2e2", text: "#dc2626", label: "Critical" },
    Important: { bg: "#fef3c7", text: "#d97706", label: "Important" },
    Emerging: { bg: "#dcfce7", text: "#16a34a", label: "Emerging" },
  };

  const c = config[priority];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{c.label}</Text>
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
  text: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
});
