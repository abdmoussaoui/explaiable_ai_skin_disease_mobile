import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        headerTintColor: "#1261A0",
        headerTitleStyle: {
          fontWeight: "700",
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: "#F4F9FB",
        },
      }}
    >
      <Stack.Screen name="index" options={{ title: "DermaLens" }} />
      <Stack.Screen name="image-input" options={{ title: "Skin Scan" }} />
      <Stack.Screen name="result" options={{ title: "Result" }} />
      <Stack.Screen name="assistant" options={{ title: "Skin Assistant" }} />
      <Stack.Screen name="explanation" options={{ title: "DermaLens" }} />
      <Stack.Screen name="about" options={{ title: "About" }} />
    </Stack>
  );
}
