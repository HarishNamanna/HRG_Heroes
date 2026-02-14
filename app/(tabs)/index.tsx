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
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMatches, getMatchSummary } from "../services/matchService";

const COLORS = {
  bg: "#0E0F12",
  card: "#14161B",
  orange: "#FF6A2B",
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

  tossWonBy?: string;
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

  const [matches, setMatches] = useState<MatchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  const { width } = Dimensions.get("window");
  const slideAnim = useRef(new Animated.Value(width)).current;

  // Sidebar animation
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

  // Helpers
const getTeamNameFromId = (item: MatchCard, teamId?: string) => {
  if (!teamId) return "--";
  console.log("T",teamId);

  if (teamId === item.teamA._id) return item.teamA.name;
  if (teamId === item.teamB._id) return item.teamB.name;

  return "--";
};



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

  // ✅ REAL API FETCH
  const loadMatches = async () => {
    try {
      setLoading(true);

      const matchList = await getMatches();
      console.log("Fetched matches:", matchList);

      const safeList = Array.isArray(matchList) ? matchList : [];

      const enriched: MatchCard[] = await Promise.all(
        safeList.map(async (m: any) => {
          // base match
          const base: MatchCard = {
            _id: m._id,
            name: m.name,
            status: m.status,
            oversPerInnings: m.oversPerInnings,
            format: m.format,

            teamA: {
              _id: m.teamA?._id || m.teamA,
              name: m.teamA?.name || "Team A",
            },

            teamB: {
              _id: m.teamB?._id || m.teamB,
              name: m.teamB?.name || "Team B",
            },
          };

          // try summary
          try {
            const summary = await getMatchSummary(m._id);
console.log("Summary for match", m._id, summary);
            // scores
            base.teamA.score = summary?.teamA?.score;
            base.teamA.overs = summary?.teamA?.overs;

            base.teamB.score = summary?.teamB?.score;
            base.teamB.overs = summary?.teamB?.overs;

            // match meta
            base.electedTo = summary?.electedTo;
            base.innings = summary?.innings;
            base.crr = summary?.crr;
            base.rrr = summary?.rrr;
            base.runsNeeded = summary?.runsNeeded;
            base.ballsLeft = summary?.ballsLeft;
            base.result = summary?.result;

            // tossWonBy is a teamId from backend
            if (summary?.tossWonBy) {
              base.tossWonBy =
                summary.tossWonBy === base.teamA._id ? "teamA" : "teamB";
            }
          } catch (err) {
            // if summary fails, ignore (scheduled match)
          }

          return base;
        })
      );

      // Optional sorting: show LIVE first
      enriched.sort((a, b) => {
        const order = { inprogress: 0, scheduled: 1, completed: 2 };
        return order[a.status] - order[b.status];
      });

      setMatches(enriched);
    } catch (err: any) {
      console.log("Load matches error:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadMatches();
    } finally {
      setRefreshing(false);
    }
  };

  // performers (dummy for now)
  const batPerformers = useMemo(
    () => [
      {
        name: "Harish N",
        team: "HRG Heroes",
        value: "184 runs",
        sub: "SR 162.4 • 3 inns",
      },
      {
        name: "Karthik",
        team: "Thunder Kings",
        value: "142 runs",
        sub: "SR 148.2 • 2 inns",
      },
      {
        name: "Rohan",
        team: "Dream Strikers",
        value: "118 runs",
        sub: "Avg 59.0 • 2 inns",
      },
    ],
    []
  );

  const bowlPerformers = useMemo(
    () => [
      {
        name: "Praveen",
        team: "Warriors XI",
        value: "9 wkts",
        sub: "Econ 5.8 • 3 matches",
      },
      {
        name: "Sagar",
        team: "HRG Heroes",
        value: "7 wkts",
        sub: "Best 4/18 • 2 matches",
      },
      {
        name: "Naveen",
        team: "Night Riders",
        value: "6 wkts",
        sub: "Econ 6.2 • 2 matches",
      },
    ],
    []
  );

  const fieldPerformers = useMemo(
    () => [
      {
        name: "Akash",
        team: "Dream Strikers",
        value: "6 dismissals",
        sub: "4 catches • 2 run-outs",
      },
      {
        name: "Harish N",
        team: "HRG Heroes",
        value: "5 dismissals",
        sub: "3 catches • 2 stumpings",
      },
      {
        name: "Ravi",
        team: "Thunder Kings",
        value: "4 dismissals",
        sub: "4 catches",
      },
    ],
    []
  );

  const performers =
    tab === "bat" ? batPerformers : tab === "bowl" ? bowlPerformers : fieldPerformers;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 26 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.orangeSoft}
          />
        }
      >
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

        {/* Matches */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Matches</Text>

          <Pressable onPress={loadMatches}>
            <Text style={styles.seeAll}>Refresh</Text>
          </Pressable>
        </View>

        {loading ? (
          <Text style={{ color: COLORS.muted, marginBottom: 12 }}>
            Loading matches...
          </Text>
        ) : matches.length === 0 ? (
          <Text style={{ color: COLORS.muted, marginBottom: 12 }}>
            No matches found
          </Text>
        ) : (
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
                      <Text style={styles.statusText}>
                        {getStatusLabel(item.status)}
                      </Text>
                    </View>

                    <View style={styles.formatPill}>
                      <Text style={styles.formatText}>
                        {item.format ?? "MATCH"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.matchName}>{item.name}</Text>

                  <Text style={styles.matchTeams} numberOfLines={1}>
                    {item.teamA.name}{" "}
                    <Text style={{ color: "rgba(166,170,180,0.85)" }}>vs</Text>{" "}
                    {item.teamB.name}
                  </Text>

                  {/* Scorecard */}
                  <View style={styles.scoreCardBox}>
                    {/* Toss */}
                    {item.tossWonBy && item.electedTo ? (
  <Text style={styles.tossLine} numberOfLines={1}>
    Toss:{" "}
    <Text style={styles.tossStrong}>
      {getTeamNameFromId(item, item.tossWonBy)}
    </Text>{" "}
    chose to{" "}
    <Text style={styles.tossOrange}>{item.electedTo}</Text>
  </Text>
) : (
  <Text style={styles.tossLine}>Toss: hey</Text>
)}


                    {/* Teams */}
                    <View style={{ marginTop: 10, gap: 10 }}>
                      {/* Team A */}
                      <View style={styles.teamRow}>
                        <Text style={styles.teamNameLine} numberOfLines={1}>
                          {item.teamA.name}
                        </Text>

                        <View style={styles.scoreRight}>
                          <Text style={styles.teamScoreBig}>
                            {item.teamA.score ?? "0/0"}
                          </Text>
                          <Text style={styles.teamOvers}>
                            ({item.teamA.overs ?? "0"})
                          </Text>
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
                            <Text style={styles.teamScoreBig}>
                              {item.teamB.score ?? "0/0"}
                            </Text>
                            <Text style={styles.teamOvers}>
                              ({item.teamB.overs ?? "0"})
                            </Text>
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
                            CRR{" "}
                            <Text style={styles.metaStrong}>
                              {item.crr ?? "--"}
                            </Text>
                          </Text>
                          <View style={styles.dotSepSmall} />
                          <Text style={styles.metaChip}>
                            1st Innings • {item.oversPerInnings} overs
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.metaBottomRow}>
                          <Text style={styles.metaChip}>
                            Need{" "}
                            <Text style={styles.metaStrong}>
                              {item.runsNeeded ?? "--"}
                            </Text>{" "}
                            in{" "}
                            <Text style={styles.metaStrong}>
                              {item.ballsLeft ?? "--"}
                            </Text>{" "}
                            balls
                          </Text>

                          <View style={styles.dotSepSmall} />

                          <Text style={styles.metaChip}>
                            RRR{" "}
                            <Text style={styles.metaStrong}>
                              {item.rrr ?? "--"}
                            </Text>{" "}
                            • CRR{" "}
                            <Text style={styles.metaStrong}>
                              {item.crr ?? "--"}
                            </Text>
                          </Text>
                        </View>
                      )
                    ) : (
                      <Text style={styles.completedLine}>
                        {item.status === "scheduled"
                          ? "Match not started"
                          : item.result ?? "Match completed"}
                      </Text>
                    )}

                    {/* <Pressable
                      style={styles.viewScorePill}
                      onPress={() => router.push(`/matches/${item._id}`)}
                    >
                      <Text style={styles.viewScoreText}>
                        View scorecard →
                      </Text>
                    </Pressable> */}
                  </View>
                </LinearGradient>
              </Pressable>
            )}
          />
        )}

        {/* Host CTA */}
        <LinearGradient
          colors={["rgba(255,106,43,0.22)", "rgba(255,106,43,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hostCard}
        >
          <View style={styles.hostLeft}>
            <Text style={styles.hostTitle}>Want to host a match?</Text>
            <Text style={styles.hostSub}>
              Start for free. Score live. Share instantly.
            </Text>
          </View>

          <Pressable
            style={styles.hostBtn}
            onPress={() => router.push("/create-match/matches")}
          >
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
                <Text style={styles.myPerfSub}>
                  Weekly summary • Last 7 days
                </Text>
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
              <Text style={styles.myPerfHint}>
                Keep scoring to climb the weekly leaderboard.
              </Text>

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
            <Pressable
              onPress={() => setTab("bat")}
              style={[styles.tabChip, tab === "bat" && styles.tabChipActive]}
            >
              <Text
                style={[styles.tabText, tab === "bat" && styles.tabTextActive]}
              >
                Bat
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTab("bowl")}
              style={[styles.tabChip, tab === "bowl" && styles.tabChipActive]}
            >
              <Text
                style={[styles.tabText, tab === "bowl" && styles.tabTextActive]}
              >
                Bowl
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTab("field")}
              style={[styles.tabChip, tab === "field" && styles.tabChipActive]}
            >
              <Text
                style={[styles.tabText, tab === "field" && styles.tabTextActive]}
              >
                Field
              </Text>
            </Pressable>
          </View>

          <View style={styles.performerList}>
            {performers.map((p, idx) => (
              <View
                key={p.name}
                style={[
                  styles.performerRow,
                  idx !== performers.length - 1 && styles.performerRowBorder,
                ]}
              >
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

        <Animated.View
          style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
        >
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
              <Ionicons
                name="help-circle-outline"
                size={18}
                color={COLORS.text}
              />
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

/* ========= STYLES ========= */
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
