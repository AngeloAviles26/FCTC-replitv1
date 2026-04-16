import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="step-courses" />
      <Stack.Screen name="step-skills" />
      <Stack.Screen name="step-certs" />
      <Stack.Screen name="step-projects" />
      <Stack.Screen name="career-input" />
      <Stack.Screen name="computing" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
