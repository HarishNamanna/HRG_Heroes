import React, { useMemo, useState } from "react";
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
  bg: "#0E0F12",
  card: "#14161B",
  orange: "#FF6A2B",
  orangeSoft: "#FF8A55",
  text: "#F4F5F7",
  muted: "#A6AAB4",
  stroke: "rgba(255,255,255,0.10)",
};

type TabKey = "ongoing" | "completed" | "mine";

type Match = {
  _id: string;
  name: string;
  teamA: string;
  teamB: string;
  format: string;
  oversPerInnings: number;
  status: "ongoing" | "completed";
  createdByMe?: boolean;

  // dummy score preview
  scoreA: string;
  oversA: string;
  scoreB?: string;
  oversB?: string;
  result?: string;
};

export default function Matches() {
  const [tab, setTab] = useState<TabKey>("ongoing");

  // ✅ Dummy match data (later replace with backend)
  const matches: Match[] = useMemo(
    () => [
      {
        _id: "m1",
        name: "Final",
        teamA: "Dream Strikers",
        teamB: "Thunder Kings",
        format: "T20",
        oversPerInnings: 20,
        status: "ongoing",
        createdByMe: true,
        scoreA: "128/4",
        oversA: "17.2",
      },
      {
        _id: "m2",
        name: "Semi Final",
        teamA: "HRG Heroes",
        teamB: "Warriors XI",
        format: "T20",
        oversPerInnings: 20,
        status: "completed",
        createdByMe: true,
        scoreA: "176/7",
        oversA: "20.0",
        scoreB: "164/9",
        oversB: "20.0",
        result: "HRG Heroes won by 12 runs",
      },
      {
        _id: "m3",
        name: "Street Night Match",
        teamA: "Gully Champs",
        teamB: "Street Stars",
        format: "6 Overs",
        oversPerInnings: 6,
        status: "completed",
        createdByMe: false,
        scoreA: "54/2",
        oversA: "6.0",
        scoreB: "49/4",
        oversB: "6.0",
        result: "Gully Champs won by 5 runs",
      },
      {
        _id: "m4",
        name: "Weekend League",
        teamA: "Royal Blasters",
        teamB: "Night Riders",
        format: "10 Overs",
        oversPerInnings: 10,
        status: "ongoing",
        createdByMe: false,
        scoreA: "72/3",
        oversA: "8.4",
      },
      {
        _id: "m5",
        name: "Practice Match",
        teamA: "HRG Heroes",
        teamB: "Turf Titans",
        format: "T20",
        oversPerInnings: 10,
        status: "completed",
        createdByMe: true,
        scoreA: "92/3",
        oversA: "10.0",
        scoreB: "88/6",
        oversB: "10.0",
        result: "HRG Heroes won by 4 runs",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    if (tab === "ongoing") return matches.filter((m) => m.status === "ongoing");
    if (tab === "completed") return matches.filter((m) => m.status === "completed");
    return matches.filter((m) => m.createdByMe);
  }, [tab, matches]);

  const renderMatch = ({ item }: { item: Match }) => {
    const isLive = item.status === "ongoing";

    return (
      <Pressable style={styles.matchCard}>
        <LinearGradient
          colors={["rgba(255,106,43,0.14)", "rgba(255,106,43,0.03)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.matchInner}
        >
          {/* Top Row */}
          <View style={styles.topRow}>
            <View style={[styles.statusPill, isLive ? styles.live : styles.completed]}>
              <Text style={styles.statusText}>{isLive ? "LIVE" : "COMPLETED"}</Text>
            </View>

            <View style={styles.formatPill}>
              <Text style={styles.formatText}>{item.format}</Text>
            </View>
          </View>

          {/* Match title */}
          <Text style={styles.matchName}>{item.name}</Text>

          {/* Teams */}
          {/* <Text style={styles.teams} numberOfLines={1}>
            {item.teamA}{" "}
            <Text style={{ color: "rgba(166,170,180,0.85)" }}>vs</Text>{" "}
            {item.teamB}
          </Text> */}

          {/* Score area */}
          <View style={styles.scoreBox}>
  {/* Team A row */}
  <View style={styles.scoreTeamRow}>
    <Text style={styles.teamName} numberOfLines={1}>
      {item.teamA}
    </Text>

    <Text style={styles.teamScore}>
      {item.scoreA}{" "}
      <Text style={styles.teamOvers}>({item.oversA})</Text>
    </Text>
  </View>

  {/* Divider */}
  {item.scoreB && <View style={styles.scoreDivider} />}

  {/* Team B row */}
  {item.scoreB && (
    <View style={styles.scoreTeamRow}>
      <Text style={styles.teamName} numberOfLines={1}>
        {item.teamB}
      </Text>

      <Text style={styles.teamScore}>
        {item.scoreB}{" "}
        <Text style={styles.teamOvers}>({item.oversB})</Text>
      </Text>
    </View>
  )}
</View>


          {/* Result */}
          {item.result && (
  <View style={styles.resultRow}>
    <Text style={styles.resultText} numberOfLines={1}>
      {item.result}
    </Text>

    <Pressable onPress={() => {}}>
      <Text style={styles.viewScoreText}>View score →</Text>
    </Pressable>
  </View>
)}

        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Matches</Text>

          <Pressable style={styles.newBtn}>
            <Text style={styles.newBtnText}>+ New</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setTab("ongoing")}
            style={[styles.tabChip, tab === "ongoing" && styles.tabChipActive]}
          >
            <Text style={[styles.tabText, tab === "ongoing" && styles.tabTextActive]}>
              Ongoing
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTab("completed")}
            style={[styles.tabChip, tab === "completed" && styles.tabChipActive]}
          >
            <Text style={[styles.tabText, tab === "completed" && styles.tabTextActive]}>
              Completed
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setTab("mine")}
            style={[styles.tabChip, tab === "mine" && styles.tabChipActive]}
          >
            <Text style={[styles.tabText, tab === "mine" && styles.tabTextActive]}>
              My matches
            </Text>
          </Pressable>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderMatch}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 26 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No matches here yet</Text>
              <Text style={styles.emptySub}>
                Start a match and it will show up in this list.
              </Text>

              <Pressable style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>+ Start Match</Text>
              </Pressable>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "900",
  },

  newBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,106,43,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,106,43,0.28)",
  },

  newBtnText: {
    color: COLORS.orangeSoft,
    fontWeight: "900",
    fontSize: 13,
  },

  tabRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
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

  tabTextActive: {
    color: COLORS.text,
  },

  matchCard: {
    marginBottom: 12,
  },

  matchInner: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(20,22,27,0.88)",
  },

  topRow: {
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
  scoreBox: {
  borderRadius: 18,
  paddingVertical: 14,
  paddingHorizontal: 14,
  backgroundColor: "rgba(255,255,255,0.03)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  gap: 12,
},

scoreTeamRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

teamName: {
  flex: 1,
  color: "rgba(244,245,247,0.92)",
  fontWeight: "900",
  fontSize: 13.5,
},

teamScore: {
  color: "#F4F5F7",
  fontWeight: "900", // ✅ only upto 900
  fontSize: 19,
  letterSpacing: 0.2,
},

teamOvers: {
  color: "rgba(166,170,180,0.85)",
  fontWeight: "800",
  fontSize: 13,
},

scoreDivider: {
  height: 1,
  backgroundColor: "rgba(255,255,255,0.06)",
},


  live: {
    backgroundColor: "rgba(255,106,43,0.14)",
    borderColor: "rgba(255,106,43,0.35)",
  },

  completed: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.12)",
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
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 6,
  },

  teams: {
    color: "rgba(244,245,247,0.92)",
    fontWeight: "800",
    fontSize: 18,
    marginBottom: 12,
  },

//  `   `
//     flexDirection: "row",
//     gap: 12,
//     borderRadius: 18,
//     paddingVertical: 14,
//     paddingHorizontal: 14,
//     backgroundColor: "rgba(255,255,255,0.03)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.08)",
//     alignItems: "center",
//   },

  scoreLine: {
    color: COLORS.muted,
    fontWeight: "800",
    fontSize: 12.5,
  },

  scoreStrong: {
    color: COLORS.text,
    fontWeight: "900",
  },

  overText: {
    marginTop: 4,
    color: "rgba(166,170,180,0.85)",
    fontWeight: "700",
    fontSize: 12,
  },

  viewBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,106,43,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,106,43,0.28)",
    alignItems: "center",
    justifyContent: "center",
  },

  viewBtnText: {
    color: COLORS.orangeSoft,
    fontWeight: "900",
    fontSize: 13,
  },

  

  empty: {
    marginTop: 28,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 6,
  },

  emptySub: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },

  primaryBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
resultRow: {
  marginTop: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
},

resultText: {
  flex: 1,
  color: COLORS.muted,
  fontWeight: "700",
  fontSize: 12.5,
},

viewScoreText: {
  color: COLORS.orangeSoft,
  fontWeight: "900",
  fontSize: 12.5,
},

  primaryBtnText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 14,
  },
});
