import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Pressable,
  FlatList,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  bg: "#0E0F12", // charcoal black
  card: "#14161B",
  orange: "#FF6A2B", // sunset orange
  orangeSoft: "#FF8A55",
  text: "#F4F5F7",
  muted: "#A6AAB4",
  stroke: "rgba(255,255,255,0.10)",
};

type MatchCard = {
  _id: string;
  name: string;
  status: "scheduled" | "inprogress" | "completed";
  oversPerInnings: number;
  format?: string;

  teamA: { _id: string; name: string; score?: string; overs?: string };
  teamB: { _id: string; name: string; score?: string; overs?: string };

  // optional match context
  tossWonBy?: "teamA" | "teamB";
  electedTo?: "bat" | "bowl";

  innings?: 1 | 2;

  crr?: string;
  rrr?: string;
  runsNeeded?: number;
  ballsLeft?: number;

  result?: string;
};

type PerformerTab = "bat" | "bowl" | "field";

export default function HomeScreen() {
  const [tab, setTab] = useState<PerformerTab>("bat");
  const [menuOpen, setMenuOpen] = useState(false);

  const { width } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(width)).current;

  const router = useRouter();

  // ✅ helper
  const getTeamName = (item: MatchCard, who: "teamA" | "teamB") => {
    return who === "teamA" ? item.teamA.name : item.teamB.name;
  };

  // ✅ Mock matches (UI-ready)
  const matches: MatchCard[] = useMemo(
    () => [
      {
        _id: "m1",
        name: "Final",
        format: "T20",
        status: "inprogress",
        oversPerInnings: 20,

        teamA: {
          _id: "a1",
          name: "Dream Strikers",
          score: "176/7",
          overs: "20.0",
        },
        teamB: {
          _id: "b1",
          name: "Thunder Kings",
          score: "135/4",
          overs: "16.2",
        },

        tossWonBy: "teamA",
        electedTo: "bat",
        innings: 2,

        crr: "8.32",
        rrr: "10.10",
        runsNeeded: 42,
        ballsLeft: 22,
      },

      {
        _id: "m2",
        name: "Semi Final",
        format: "T20",
        status: "completed",
        oversPerInnings: 20,

        teamA: { _id: "a2", name: "HRG Heroes", score: "162/6", overs: "20.0" },
        teamB: { _id: "b2", name: "Warriors XI", score: "148/9", overs: "20.0" },

        tossWonBy: "teamB",
        electedTo: "bowl",
        innings: 2,

        result: "HRG Heroes won by 14 runs",
      },

      {
        _id: "m3",
        name: "League Match",
        format: "ODI",
        status: "scheduled",
        oversPerInnings: 50,

        teamA: { _id: "a3", name: "Royal Blasters" },
        teamB: { _id: "b3", name: "Night Riders" },

        tossWonBy: "teamA",
        electedTo: "bat",
        innings: 1,
      },

      {
        _id: "m4",
        name: "Practice",
        format: "T10",
        status: "inprogress",
        oversPerInnings: 10,

        teamA: { _id: "a4", name: "Street Stars", score: "72/3", overs: "8.1" },
        teamB: { _id: "b4", name: "Gully Champs" },

        tossWonBy: "teamB",
        electedTo: "bowl",
        innings: 1,

        crr: "8.82",
      },
    ],
    []
  );

  useEffect(() => {
    if (menuOpen) {
      slideAnim.setValue(width);
      Animated.timing(slideAnim, {
        toValue: width - 280,
        duration: 240,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [menuOpen]);

  // performers
  const batPerformers = useMemo(
    () => [
      { name: "Harish N", team: "HRG Heroes", value: "184 runs", sub: "SR 162.4 • 3 inns" },
      { name: "Karthik", team: "Thunder Kings", value: "142 runs", sub: "SR 148.2 • 2 inns" },
      { name: "Rohan", team: "Dream Strikers", value: "118 runs", sub: "Avg 59.0 • 2 inns" },
    ],
    []
  );

  const bowlPerformers = useMemo(
    () => [
      { name: "Praveen", team: "Warriors XI", value: "9 wkts", sub: "Econ 5.8 • 3 matches" },
      { name: "Sagar", team: "HRG Heroes", value: "7 wkts", sub: "Best 4/18 • 2 matches" },
      { name: "Naveen", team: "Night Riders", value: "6 wkts", sub: "Econ 6.2 • 2 matches" },
    ],
    []
  );

  const fieldPerformers = useMemo(
    () => [
      { name: "Akash", team: "Dream Strikers", value: "6 dismissals", sub: "4 catches • 2 run-outs" },
      { name: "Harish N", team: "HRG Heroes", value: "5 dismissals", sub: "3 catches • 2 stumpings" },
      { name: "Ravi", team: "Thunder Kings", value: "4 dismissals", sub: "4 catches" },
    ],
    []
  );

  const performers = tab === "bat" ? batPerformers : tab === "bowl" ? bowlPerformers : fieldPerformers;

  const getStatusLabel = (status: string) => {
    if (status === "inprogress") return "LIVE";
    if (status === "completed") return "COMPLETED";
    if (status === "scheduled") return "UPCOMING";
    return status.toUpperCase();
  };

  const statusStyle = (status: string) => {
    if (status === "inprogress") return styles.statusLive;
    if (status === "completed") return styles.statusCompleted;
    return styles.statusUpcoming;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.name}>Harish 👋</Text>
          </View>

          <Pressable onPress={() => setMenuOpen(true)} style={styles.menuBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={COLORS.text} />
          </Pressable>
        </View>

        {/* Horizontal match scorecards */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Your matches</Text>
          <Pressable>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        <FlatList
          horizontal
          data={matches}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 18 }}
          style={{ marginLeft: -18, paddingLeft: 18 }}
          renderItem={({ item }) => (
            <Pressable style={styles.matchCardH}>
              <LinearGradient
                colors={["rgba(255,106,43,0.20)", "rgba(255,106,43,0.05)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.matchCardHInner}
              >
                {/* Top row */}
                <View style={styles.matchTopRow}>
                  <View style={[styles.statusPill, statusStyle(item.status)]}>
                    <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
                  </View>

                  <View style={styles.formatPill}>
                    <Text style={styles.formatText}>{item.format ?? "MATCH"}</Text>
                  </View>
                </View>

                <Text style={styles.matchName}>{item.name}</Text>

                <Text style={styles.matchTeams} numberOfLines={1}>
                  {item.teamA.name} <Text style={{ color: "rgba(166,170,180,0.85)" }}>vs</Text> {item.teamB.name}
                </Text>

                {/* Scorecard */}
                <View style={styles.scoreCardBox}>
                  {/* Toss */}
                  {item.tossWonBy && item.electedTo ? (
                    <Text style={styles.tossLine} numberOfLines={1}>
                      Toss: <Text style={styles.tossStrong}>{getTeamName(item, item.tossWonBy)}</Text> chose to{" "}
                      <Text style={styles.tossOrange}>{item.electedTo}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.tossLine}>Toss: --</Text>
                  )}

                  {/* Teams */}
                  <View style={{ marginTop: 10, gap: 10 }}>
                    {/* Team A */}
                    <View style={styles.teamRow}>
                      <Text style={styles.teamNameLine} numberOfLines={1}>
                        {item.teamA.name}
                      </Text>

                      <View style={styles.scoreRight}>
                        <Text style={styles.teamScoreBig}>{item.teamA.score ?? "--/--"}</Text>
                        <Text style={styles.teamOvers}>({item.teamA.overs ?? "--"})</Text>
                      </View>
                    </View>

                    {/* Team B */}
                    <View style={styles.teamRow}>
                      <Text style={styles.teamNameLine} numberOfLines={1}>
                        {item.teamB.name}
                      </Text>

                      {item.innings === 1 ? (
                        <Text style={styles.yetToBat}>Yet to bat</Text>
                      ) : (
                        <View style={styles.scoreRight}>
                          <Text style={styles.teamScoreBig}>{item.teamB.score ?? "--/--"}</Text>
                          <Text style={styles.teamOvers}>({item.teamB.overs ?? "--"})</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.scoreDivider} />

                  {/* Situation */}
                  {item.status === "inprogress" ? (
                    item.innings === 1 ? (
                      <View style={styles.metaBottomRow}>
                        <Text style={styles.metaChip}>
                          CRR <Text style={styles.metaStrong}>{item.crr ?? "--"}</Text>
                        </Text>
                        <View style={styles.dotSepSmall} />
                        <Text style={styles.metaChip}>1st Innings • {item.oversPerInnings} overs</Text>
                      </View>
                    ) : (
                      <View style={styles.metaBottomRow}>
                        <Text style={styles.metaChip}>
                          Need <Text style={styles.metaStrong}>{item.runsNeeded ?? "--"}</Text> in{" "}
                          <Text style={styles.metaStrong}>{item.ballsLeft ?? "--"}</Text> balls
                        </Text>

                        <View style={styles.dotSepSmall} />

                        <Text style={styles.metaChip}>
                          RRR <Text style={styles.metaStrong}>{item.rrr ?? "--"}</Text> • CRR{" "}
                          <Text style={styles.metaStrong}>{item.crr ?? "--"}</Text>
                        </Text>
                      </View>
                    )
                  ) : (
                    <Text style={styles.completedLine}>
                      {item.status === "scheduled" ? "Match not started" : item.result ?? "Match completed"}
                    </Text>
                  )}

                  <Pressable style={styles.viewScorePill}>
                    <Text style={styles.viewScoreText}>View scorecard →</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </Pressable>
          )}
        />

        {/* Host CTA */}
        <LinearGradient
          colors={["rgba(255,106,43,0.22)", "rgba(255,106,43,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hostCard}
        >
          <View style={styles.hostLeft}>
            <Text style={styles.hostTitle}>Want to host a match?</Text>
            <Text style={styles.hostSub}>Start for free. Score live. Share instantly.</Text>
          </View>

          <Pressable style={styles.hostBtn}>
            <Text style={styles.hostBtnText}>Start</Text>
          </Pressable>
        </LinearGradient>

        {/* My performance */}
        <View style={{ marginTop: 18 }}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>My performance</Text>
            <Pressable>
              <Text style={styles.seeAll}>This week</Text>
            </Pressable>
          </View>

          <LinearGradient
            colors={["rgba(255,106,43,0.20)", "rgba(255,106,43,0.05)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.myPerfCard}
          >
            <View style={styles.myPerfTop}>
              <View>
                <Text style={styles.myPerfName}>Harish Namanna</Text>
                <Text style={styles.myPerfSub}>Weekly summary • Last 7 days</Text>
              </View>

              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>🔥 In form</Text>
              </View>
            </View>

            <View style={styles.myPerfStats}>
              <View style={styles.myPerfStatBox}>
                <Text style={styles.myPerfLabel}>Runs</Text>
                <Text style={styles.myPerfValue}>184</Text>
              </View>

              <View style={styles.myPerfStatBox}>
                <Text style={styles.myPerfLabel}>Wickets</Text>
                <Text style={styles.myPerfValue}>7</Text>
              </View>

              <View style={styles.myPerfStatBox}>
                <Text style={styles.myPerfLabel}>Catches</Text>
                <Text style={styles.myPerfValue}>5</Text>
              </View>
            </View>

            <View style={styles.myPerfFooter}>
              <Text style={styles.myPerfHint}>Keep scoring to climb the weekly leaderboard.</Text>

              <Pressable style={styles.myPerfBtn}>
                <Text style={styles.myPerfBtnText}>View stats</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Top performers */}
        <View style={{ marginTop: 18 }}>
          <Text style={styles.sectionTitle}>Top performers of the week</Text>

          <View style={styles.tabRow}>
            <Pressable onPress={() => setTab("bat")} style={[styles.tabChip, tab === "bat" && styles.tabChipActive]}>
              <Text style={[styles.tabText, tab === "bat" && styles.tabTextActive]}>Bat</Text>
            </Pressable>

            <Pressable onPress={() => setTab("bowl")} style={[styles.tabChip, tab === "bowl" && styles.tabChipActive]}>
              <Text style={[styles.tabText, tab === "bowl" && styles.tabTextActive]}>Bowl</Text>
            </Pressable>

            <Pressable onPress={() => setTab("field")} style={[styles.tabChip, tab === "field" && styles.tabChipActive]}>
              <Text style={[styles.tabText, tab === "field" && styles.tabTextActive]}>Field</Text>
            </Pressable>
          </View>

          <View style={styles.performerList}>
            {performers.map((p, idx) => (
              <View key={p.name} style={[styles.performerRow, idx !== performers.length - 1 && styles.performerRowBorder]}>
                <View style={styles.rankCircle}>
                  <Text style={styles.rankText}>{idx + 1}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.performerName}>{p.name}</Text>
                  <Text style={styles.performerTeam}>{p.team}</Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.performerValue}>{p.value}</Text>
                  <Text style={styles.performerSub}>{p.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Sidebar */}
      <Modal visible={menuOpen} transparent animationType="none">
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)} />

        <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.sidebarTop}>
            <View style={styles.sidebarAvatar}>
              <Text style={styles.sidebarAvatarText}>H</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.sidebarName}>Harish</Text>
              <Text style={styles.sidebarEmail}>demo@hrgheroes.com</Text>
            </View>
          </View>

          <View style={styles.sidebarList}>
            <Pressable
              style={styles.sidebarItem}
              onPress={() => {
                setMenuOpen(false);
                router.push("/profile");
              }}
            >
              <Ionicons name="person-outline" size={18} color={COLORS.text} />
              <Text style={styles.sidebarItemText}>Profile</Text>
            </Pressable>

            <Pressable style={styles.sidebarItem}>
              <Ionicons name="settings-outline" size={18} color={COLORS.text} />
              <Text style={styles.sidebarItemText}>Settings</Text>
            </Pressable>

            <Pressable style={styles.sidebarItem}>
              <Ionicons name="help-circle-outline" size={18} color={COLORS.text} />
              <Text style={styles.sidebarItemText}>Help</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.logoutBtn}
            onPress={() => {
              setMenuOpen(false);
              router.replace("/");
            }}
          >
            <Ionicons name="log-out-outline" size={18} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </Animated.View>
      </Modal>
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

  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 12,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "900",
  },

  seeAll: {
    color: COLORS.orangeSoft,
    fontWeight: "900",
    fontSize: 13,
  },

  matchCardH: {
    width: 280,
    marginRight: 14,
  },

  matchCardHInner: {
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(20,22,27,0.88)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 10,
    overflow: "hidden",
  },

  matchTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
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

  statusUpcoming: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.10)",
  },

  statusText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.4,
  },

  formatPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  formatText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 0.4,
  },

  matchName: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 6,
  },

  matchTeams: {
    color: "rgba(244,245,247,0.92)",
    fontWeight: "800",
    fontSize: 13.5,
    marginBottom: 10,
  },

  // ===== Scorecard box =====

  scoreCardBox: {
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  tossLine: {
    color: "rgba(166,170,180,0.85)",
    fontSize: 12,
    fontWeight: "700",
  },

  tossStrong: {
    color: "#F4F5F7",
    fontWeight: "900",
  },

  tossOrange: {
    color: "rgba(255,106,43,0.95)",
    fontWeight: "900",
  },

  teamRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  teamNameLine: {
    flex: 1,
    color: "rgba(244,245,247,0.92)",
    fontSize: 13.5,
    fontWeight: "900",
  },

  scoreRight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },

  teamScoreBig: {
    color: "#F4F5F7",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.2,
  },

  teamOvers: {
    color: "rgba(166,170,180,0.85)",
    fontSize: 13,
    fontWeight: "800",
  },

  yetToBat: {
    color: "rgba(166,170,180,0.75)",
    fontSize: 13,
    fontWeight: "800",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  scoreDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    marginTop: 14,
    marginBottom: 12,
  },

  metaBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8,
  },

  metaChip: {
    color: "rgba(166,170,180,0.88)",
    fontSize: 12,
    fontWeight: "800",
  },

  metaStrong: {
    color: "#F4F5F7",
    fontWeight: "900",
  },

  dotSepSmall: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  completedLine: {
    color: "rgba(166,170,180,0.9)",
    fontSize: 12,
    fontWeight: "800",
  },

  viewScorePill: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,106,43,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,106,43,0.28)",
  },

  viewScoreText: {
    color: "rgba(255,106,43,0.95)",
    fontWeight: "900",
    fontSize: 12,
  },

  // ===== Host CTA =====
  hostCard: {
    marginTop: 18,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(20,22,27,0.88)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  hostLeft: { flex: 1, paddingRight: 12 },

  hostTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 4,
  },

  hostSub: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12.5,
    lineHeight: 18,
  },

  hostBtn: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },

  hostBtnText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 14,
  },

  // ===== My performance =====
  myPerfCard: {
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(20,22,27,0.88)",
  },

  myPerfTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 10,
  },

  myPerfName: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 4,
  },

  myPerfSub: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12.5,
  },

  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  badgeText: {
    color: COLORS.orangeSoft,
    fontWeight: "900",
    fontSize: 12,
  },

  myPerfStats: {
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

  myPerfStatBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  myPerfLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },

  myPerfValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  myPerfFooter: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  myPerfHint: {
    flex: 1,
    color: "rgba(166,170,180,0.92)",
    fontWeight: "700",
    fontSize: 12.5,
    lineHeight: 18,
  },

  myPerfBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,106,43,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,106,43,0.28)",
  },

  myPerfBtnText: {
    color: COLORS.orangeSoft,
    fontWeight: "900",
    fontSize: 13,
  },

  // ===== Performers =====
  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    marginBottom: 12,
  },

  tabChip: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  tabChipActive: {
    backgroundColor: "rgba(255,106,43,0.18)",
    borderColor: "rgba(255,106,43,0.30)",
  },

  tabText: {
    color: COLORS.muted,
    fontWeight: "900",
    fontSize: 13,
  },

  tabTextActive: { color: COLORS.text },

  performerList: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  performerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },

  performerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 32,
    backgroundColor: "rgba(255,106,43,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,106,43,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  rankText: {
    color: COLORS.orangeSoft,
    fontWeight: "900",
    fontSize: 13,
  },

  performerName: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 2,
  },

  performerTeam: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12,
  },

  performerValue: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 2,
  },

  performerSub: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12,
  },

  // ===== Sidebar =====
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  sidebar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "rgba(14,15,18,0.98)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.10)",
    paddingTop: 56,
    paddingHorizontal: 16,
  },

  sidebarTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  sidebarAvatar: {
    width: 46,
    height: 46,
    borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  sidebarAvatarText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 16,
  },

  sidebarName: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 15,
    marginBottom: 2,
  },

  sidebarEmail: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12,
  },

  sidebarList: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },

  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },

  sidebarItemText: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 14,
  },

  logoutBtn: {
    marginTop: "auto",
    marginBottom: 26,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,59,48,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.28)",
  },

  logoutText: {
    color: "#FF3B30",
    fontWeight: "900",
    fontSize: 14,
  },
});
