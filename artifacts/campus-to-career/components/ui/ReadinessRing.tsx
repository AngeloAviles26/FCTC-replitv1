import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ReadinessRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ReadinessRing({ score, size = 140, strokeWidth = 10 }: ReadinessRingProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, { duration: 1200 });
  }, [score]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const getScoreColor = () => {
    if (score >= 75) return colors.success;
    if (score >= 50) return colors.primary;
    return colors.warning;
  };

  const getLabel = () => {
    if (score >= 75) return "Ready";
    if (score >= 50) return "On Track";
    return "Developing";
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.blueLight}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.score, { color: colors.foreground }]}>{score}%</Text>
        <Text style={[styles.label, { color: getScoreColor() }]}>{getLabel()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  svg: {},
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  score: { fontSize: 30, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 2 },
});
