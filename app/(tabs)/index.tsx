import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  bg: "#0E0F12", // charcoal black
  card: "#14161B",
  orange: "#FF6A2B", // sunset orange
  orangeSoft: "#FF8A55",
  text: "#F4F5F7",
  muted: "#A6AAB4",
  stroke: "rgba(255,255,255,0.10)",
};

type Match = {
  id: string;
  title: string;
  subtitle: string;
  score: string;
  overs: string;
  status: "LIVE" | "COMPLETED";
};

export default function HomeScreen() {
  const matches: Match[] = useMemo(
    () => [
      {
        id: "1",
        title: "HRG Heroes vs Warriors",
        subtitle: "T20 • City Ground",
        score: "128/4",
        overs: "17.2 overs",
        status: "LIVE",
      },
      {
        id: "2",
        title: "Weekend League Final",
        subtitle: "T20 • Arena Stadium",
        score: "176/7",
        overs: "20 overs",
        status: "COMPLETED",
      },
      {
        id: "3",
        title: "Practice Match",
        subtitle: "10 overs • Turf",
        score: "92/3",
        overs: "10 overs",
        status: "COMPLETED",
      },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.name}>Harish 👋</Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>H</Text>
          </View>
        </View>

        {/* Hero CTA */}
        <LinearGradient
          colors={["rgba(255,106,43,0.24)", "rgba(255,106,43,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>READY TO SCORE</Text>
            </View>

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>T20</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>Start a new match</Text>
          <Text style={styles.heroSub}>
            Set teams, toss, overs, and begin ball-by-ball scoring in seconds.
          </Text>

          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>+ Start Match</Text>
          </Pressable>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Matches</Text>
              <Text style={styles.heroStatValue}>18</Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Teams</Text>
              <Text style={styles.heroStatValue}>6</Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroStat}>
              <Text style={styles.heroStatLabel}>Win %</Text>
              <Text style={styles.heroStatValue}>62</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionCard}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionTitle}>Teams</Text>
            <Text style={styles.actionSub}>Manage players</Text>
          </Pressable>

          <Pressable style={styles.actionCard}>
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionTitle}>Tournaments</Text>
            <Text style={styles.actionSub}>Coming soon</Text>
          </Pressable>

          <Pressable style={styles.actionCard}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSub}>App & account</Text>
          </Pressable>
        </View>

        {/* Recent Matches */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent matches</Text>
          <Pressable>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => (
            <Pressable style={styles.matchCard}>
              <View style={styles.matchTopRow}>
                <Text style={styles.matchTitle}>{item.title}</Text>

                <View
                  style={[
                    styles.statusPill,
                    item.status === "LIVE"
                      ? styles.statusLive
                      : styles.statusCompleted,
                  ]}
                >
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.matchSubtitle}>{item.subtitle}</Text>

              <View style={styles.matchBottomRow}>
                <Text style={styles.matchScore}>{item.score}</Text>
                <Text style={styles.matchOvers}>{item.overs}</Text>

                <View style={{ flex: 1 }} />

                <Text style={styles.resume}>
                  {item.status === "LIVE" ? "Resume →" : "View →"}
                </Text>
              </View>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  welcome: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "700",
  },

  name: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },

  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 16,
  },

  heroCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(20,22,27,0.88)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 18,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(20,22,27,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: COLORS.orange,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  liveText: {
    color: "rgba(244,245,247,0.92)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  heroBadgeText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 12,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },

  heroSub: {
    color: "rgba(166,170,180,0.95)",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },

  primaryBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.orange,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
    marginBottom: 16,
  },

  primaryBtnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  heroStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  heroStat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  heroStatLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },

  heroStatValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },

  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  actionCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  actionIcon: {
    fontSize: 20,
    marginBottom: 10,
  },

  actionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4,
  },

  actionSub: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "700",
  },

  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 12,
  },

  seeAll: {
    color: COLORS.orangeSoft,
    fontWeight: "900",
    fontSize: 13,
  },

  matchCard: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
  },

  matchTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 10,
  },

  matchTitle: {
    flex: 1,
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 14.5,
  },

  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  statusLive: {
    backgroundColor: "rgba(255,106,43,0.14)",
    borderColor: "rgba(255,106,43,0.35)",
  },

  statusCompleted: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.12)",
  },

  statusText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.4,
  },

  matchSubtitle: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12.5,
    marginBottom: 12,
  },

  matchBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  matchScore: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 18,
  },

  matchOvers: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12.5,
  },

  resume: {
    color: COLORS.orangeSoft,
    fontWeight: "900",
    fontSize: 13,
  },
});
