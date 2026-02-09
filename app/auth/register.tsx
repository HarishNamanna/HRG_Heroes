import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Pressable,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { api } from "../services/api";

const COLORS = {
  bg: "#0E0F12",
  card: "#14161B",
  orange: "#FF6A2B",
  orangeSoft: "#FF8A55",
  text: "#F4F5F7",
  muted: "#A6AAB4",
  stroke: "rgba(255,255,255,0.10)",
};

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onRegister = async () => {
  if (!name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await api.post("/auth/signup", {
      name,
      email,
      password,
    });

    alert("Account created successfully ✅");
    router.replace("/auth/login");
  } catch (err: any) {
    console.log("Signup error:", err?.response?.data || err.message);

    alert(
      err?.response?.data?.message ||
        "Signup failed ❌ Please try again."
    );
  }
};


  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <Text style={styles.title}>Create account ✨</Text>
        <Text style={styles.subtitle}>
          Join HRG Heroes and start scoring matches instantly.
        </Text>

        <LinearGradient
          colors={["rgba(255,106,43,0.18)", "rgba(255,106,43,0.04)"]}
          style={styles.card}
        >
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="rgba(166,170,180,0.6)"
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="rgba(166,170,180,0.6)"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Create a strong password"
            placeholderTextColor="rgba(166,170,180,0.6)"
            style={styles.input}
            secureTextEntry
          />

          <Pressable onPress={onRegister} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Register</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/auth/login")}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>
              Already have an account? Login
            </Text>
          </Pressable>
        </LinearGradient>

        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 22 },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14.5,
    lineHeight: 20,
    marginBottom: 18,
  },

  card: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    backgroundColor: COLORS.card,
  },

  label: {
    color: "rgba(244,245,247,0.9)",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: COLORS.text,
    fontSize: 15,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  primaryBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  primaryBtnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryBtn: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  secondaryBtnText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "900",
  },

  backBtn: {
    marginTop: 16,
    alignSelf: "center",
  },

  backText: {
    color: COLORS.muted,
    fontWeight: "800",
  },
});
