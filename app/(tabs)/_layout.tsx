import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0E0F12",
  orange: "#FF6A2B",
  muted: "#A6AAB4",
  stroke: "rgba(255,255,255,0.10)",
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: COLORS.bg,
          borderTopColor: COLORS.stroke,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },

        tabBarActiveTintColor: COLORS.orange,
        tabBarInactiveTintColor: COLORS.muted,

        tabBarLabelStyle: {
          fontWeight: "800",
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="matches"
        options={{
          title: "Matches",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cricket" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
