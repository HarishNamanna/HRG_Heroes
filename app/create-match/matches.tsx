import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  createPlayer,
  createTeam,
  createMatch,
  doToss,
  startMatch,
} from "../services/matchService";


const COLORS = {
  bg: "#0E0F12",
  card: "#14161B",
  orange: "#FF6A2B",
  orangeSoft: "#FF8A55",
  text: "#F4F5F7",
  muted: "#A6AAB4",
  stroke: "rgba(255,255,255,0.10)",
};

type Step = 1 | 2 | 3 | 4 | 5;

export default function CreateMatchWizard() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);

  // Step 1: Teams
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [loading, setLoading] = useState(false);


  // Step 2: Players
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  const [playerAInput, setPlayerAInput] = useState("");
  const [playerBInput, setPlayerBInput] = useState("");

  // Step 3: Match details
  const [format, setFormat] = useState<"T20" | "ODI" | "T10">("T20");
  const [overs, setOvers] = useState("20");

  // Step 4: Toss
  const [tossWonBy, setTossWonBy] = useState<"A" | "B">("A");
  const [electedTo, setElectedTo] = useState<"bat" | "bowl">("bat");

  const steps = useMemo(
    () => [
      { id: 1, label: "Teams" },
      { id: 2, label: "Players" },
      { id: 3, label: "Details" },
      { id: 4, label: "Toss" },
      { id: 5, label: "Ready" },
    ],
    []
  );

  const canGoNext = () => {
    if (step === 1) return teamAName.trim() && teamBName.trim();
    if (step === 2) return teamAPlayers.length >= 2 && teamBPlayers.length >= 2;
    if (step === 3) return Number(overs) > 0;
    if (step === 4) return true;
    return true;
  };

const next = () => {
  if (!canGoNext()) {
    Alert.alert("Incomplete", "Please fill the required details.");
    return;
  }

  setStep((prev) => {
    if (prev === 1) return 2;
    if (prev === 2) return 3;
    if (prev === 3) return 4;
    if (prev === 4) return 5;
    return 5;
  });
};

const back = () => {
  if (step === 1) return router.back();

  setStep((prev) => {
    if (prev === 5) return 4;
    if (prev === 4) return 3;
    if (prev === 3) return 2;
    if (prev === 2) return 1;
    return 1;
  });
};


  const addPlayerA = () => {
    const name = playerAInput.trim();
    if (!name) return;
    setTeamAPlayers((p) => [...p, name]);
    setPlayerAInput("");
  };

  const addPlayerB = () => {
    const name = playerBInput.trim();
    if (!name) return;
    setTeamBPlayers((p) => [...p, name]);
    setPlayerBInput("");
  };

  const removePlayerA = (name: string) => {
    setTeamAPlayers((p) => p.filter((x) => x !== name));
  };

  const removePlayerB = (name: string) => {
    setTeamBPlayers((p) => p.filter((x) => x !== name));
  };

  // ✅ Step 5: Later you will call backend here
const finish = async () => {
  try {
    setLoading(true);

    // 0) basic validation
    if (!teamAName.trim() || !teamBName.trim()) {
      Alert.alert("Missing", "Please enter both team names.");
      return;
    }

    if (teamAPlayers.length < 2 || teamBPlayers.length < 2) {
      Alert.alert("Missing", "Please add at least 2 players per team.");
      return;
    }

    const oversPerInnings = Number(overs);
    if (!oversPerInnings || oversPerInnings <= 0) {
      Alert.alert("Invalid overs", "Overs must be a valid number.");
      return;
    }

    // 1) Create players for Team A
    const teamAPlayerIds: string[] = [];
    for (const p of teamAPlayers) {
      const created = await createPlayer(p);
      teamAPlayerIds.push(created._id);
    }

    // 2) Create players for Team B
    const teamBPlayerIds: string[] = [];
    for (const p of teamBPlayers) {
      const created = await createPlayer(p);
      teamBPlayerIds.push(created._id);
    }

    // 3) Create Team A + Team B
    const createdTeamA = await createTeam(teamAName.trim(), teamAPlayerIds);
    const createdTeamB = await createTeam(teamBName.trim(), teamBPlayerIds);

    // 4) Create Match
    const createdMatch = await createMatch({
      name: `${teamAName.trim()} vs ${teamBName.trim()}`, // 👈 simple match name
      teamA: createdTeamA._id,
      teamB: createdTeamB._id,
      format,
      oversPerInnings,
    });

    // 5) Toss mapping (A/B -> teamId)
    const tossWonByTeamId =
      tossWonBy === "A" ? createdTeamA._id : createdTeamB._id;

    // 6) Toss
    await doToss(createdMatch._id, {
      tossWonBy: tossWonByTeamId,
      electedTo,
    });

    // 7) Start match
    await startMatch(createdMatch._id);

    Alert.alert("Match created 🎉", "Your match is ready to score.");

    // Later: navigate to scoring screen
    router.replace("/(tabs)");
    // Best later:
    // router.replace(`/match/${createdMatch._id}`);
  } catch (err: any) {
    console.log("Create match error:", err?.response?.data || err.message);
    Alert.alert(
      "Failed",
      err?.response?.data?.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={back} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={18} color={COLORS.text} />
          </Pressable>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Start a match</Text>
            <Text style={styles.subtitle}>Step {step} of 5</Text>
          </View>
        </View>

        {/* Stepper */}
        <View style={styles.stepper}>
          {steps.map((s) => {
            const active = s.id === step;
            const done = s.id < step;

            return (
              <View key={s.id} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    active && styles.stepDotActive,
                    done && styles.stepDotDone,
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={14} color="#111" />
                  ) : (
                    <Text style={styles.stepDotText}>{s.id}</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    active && { color: COLORS.text },
                  ]}
                >
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Card */}
        <LinearGradient
          colors={["rgba(255,106,43,0.18)", "rgba(255,106,43,0.04)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Step 1 */}
          {step === 1 && (
            <View style={{ gap: 14 }}>
              <Text style={styles.cardTitle}>Choose teams</Text>
              <Text style={styles.cardHint}>
                Enter both team names. You can edit later.
              </Text>

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Team A</Text>
                <TextInput
                  value={teamAName}
                  onChangeText={setTeamAName}
                  placeholder="Eg: HRG Heroes"
                  placeholderTextColor="rgba(166,170,180,0.55)"
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Team B</Text>
                <TextInput
                  value={teamBName}
                  onChangeText={setTeamBName}
                  placeholder="Eg: Thunder Kings"
                  placeholderTextColor="rgba(166,170,180,0.55)"
                  style={styles.input}
                />
              </View>
            </View>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <View style={{ gap: 18 }}>
              <Text style={styles.cardTitle}>Add players</Text>
              <Text style={styles.cardHint}>
                Add at least 2 players per team for now.
              </Text>

              {/* Team A */}
              <View style={styles.teamBox}>
                <Text style={styles.teamBoxTitle}>{teamAName || "Team A"}</Text>

                <View style={styles.playerRow}>
                  <TextInput
                    value={playerAInput}
                    onChangeText={setPlayerAInput}
                    placeholder="Player name"
                    placeholderTextColor="rgba(166,170,180,0.55)"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <Pressable onPress={addPlayerA} style={styles.addBtn}>
                    <Ionicons name="add" size={18} color="#111" />
                  </Pressable>
                </View>

                <View style={styles.chipsWrap}>
                  {teamAPlayers.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => removePlayerA(p)}
                      style={styles.playerChip}
                    >
                      <Text style={styles.playerChipText}>{p}</Text>
                      <Ionicons
                        name="close"
                        size={14}
                        color="rgba(244,245,247,0.75)"
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Team B */}
              <View style={styles.teamBox}>
                <Text style={styles.teamBoxTitle}>{teamBName || "Team B"}</Text>

                <View style={styles.playerRow}>
                  <TextInput
                    value={playerBInput}
                    onChangeText={setPlayerBInput}
                    placeholder="Player name"
                    placeholderTextColor="rgba(166,170,180,0.55)"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <Pressable onPress={addPlayerB} style={styles.addBtn}>
                    <Ionicons name="add" size={18} color="#111" />
                  </Pressable>
                </View>

                <View style={styles.chipsWrap}>
                  {teamBPlayers.map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => removePlayerB(p)}
                      style={styles.playerChip}
                    >
                      <Text style={styles.playerChipText}>{p}</Text>
                      <Ionicons
                        name="close"
                        size={14}
                        color="rgba(244,245,247,0.75)"
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <View style={{ gap: 14 }}>
              <Text style={styles.cardTitle}>Match details</Text>
              <Text style={styles.cardHint}>
                Set the match format and overs per innings.
              </Text>

              <View style={styles.row3}>
                {(["T10", "T20", "ODI"] as const).map((f) => {
                  const active = format === f;
                  return (
                    <Pressable
                      key={f}
                      onPress={() => setFormat(f)}
                      style={[
                        styles.formatChip,
                        active && styles.formatChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.formatChipText,
                          active && { color: COLORS.text },
                        ]}
                      >
                        {f}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>Overs per innings</Text>
                <TextInput
                  value={overs}
                  onChangeText={setOvers}
                  keyboardType="number-pad"
                  placeholder="Eg: 20"
                  placeholderTextColor="rgba(166,170,180,0.55)"
                  style={styles.input}
                />
              </View>
            </View>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <View style={{ gap: 14 }}>
              <Text style={styles.cardTitle}>Toss</Text>
              <Text style={styles.cardHint}>
                Choose who won the toss and what they elected.
              </Text>

              <Text style={styles.inputLabel}>Toss won by</Text>
              <View style={styles.row2}>
                <Pressable
                  onPress={() => setTossWonBy("A")}
                  style={[
                    styles.selectChip,
                    tossWonBy === "A" && styles.selectChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      tossWonBy === "A" && { color: COLORS.text },
                    ]}
                  >
                    {teamAName || "Team A"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setTossWonBy("B")}
                  style={[
                    styles.selectChip,
                    tossWonBy === "B" && styles.selectChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      tossWonBy === "B" && { color: COLORS.text },
                    ]}
                  >
                    {teamBName || "Team B"}
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.inputLabel}>Elected to</Text>
              <View style={styles.row2}>
                <Pressable
                  onPress={() => setElectedTo("bat")}
                  style={[
                    styles.selectChip,
                    electedTo === "bat" && styles.selectChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      electedTo === "bat" && { color: COLORS.text },
                    ]}
                  >
                    Bat first
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setElectedTo("bowl")}
                  style={[
                    styles.selectChip,
                    electedTo === "bowl" && styles.selectChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectChipText,
                      electedTo === "bowl" && { color: COLORS.text },
                    ]}
                  >
                    Bowl first
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <View style={{ gap: 14 }}>
              <Text style={styles.cardTitle}>Ready to start</Text>
              <Text style={styles.cardHint}>
                Review your setup. Next we’ll start scoring live.
              </Text>

              <View style={styles.summaryBox}>
                <Text style={styles.summaryLine}>
                  <Text style={styles.summaryKey}>Teams:</Text>{" "}
                  {teamAName} vs {teamBName}
                </Text>

                <Text style={styles.summaryLine}>
                  <Text style={styles.summaryKey}>Format:</Text> {format} •{" "}
                  {overs} overs
                </Text>

                <Text style={styles.summaryLine}>
                  <Text style={styles.summaryKey}>Toss:</Text>{" "}
                  {tossWonBy === "A" ? teamAName : teamBName} chose to{" "}
                  {electedTo}
                </Text>

                <Text style={styles.summaryLine}>
                  <Text style={styles.summaryKey}>Players:</Text>{" "}
                  {teamAPlayers.length} + {teamBPlayers.length}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Bottom buttons */}
        <View style={styles.bottomRow}>
          <Pressable onPress={back} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>Back</Text>
          </Pressable>

          {step < 5 ? (
            <Pressable
              onPress={next}
              style={[styles.primaryBtn, !canGoNext() && { opacity: 0.5 }]}
            >
              <Text style={styles.primaryText}>Next</Text>
              <Ionicons name="chevron-forward" size={16} color="#111" />
            </Pressable>
          ) : (
            <Pressable
  onPress={finish}
  disabled={loading}
  style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
>
  <Text style={styles.primaryText}>
    {loading ? "Creating..." : "Start match"}
  </Text>
  <Ionicons name="flash" size={16} color="#111" />
</Pressable>

          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: 18, paddingTop: 12 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 20,
  },

  subtitle: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12.5,
    marginTop: 2,
  },

  stepper: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  stepItem: { alignItems: "center", gap: 6 },

  stepDot: {
    width: 34,
    height: 34,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  stepDotActive: {
    borderColor: "rgba(255,106,43,0.45)",
    backgroundColor: "rgba(255,106,43,0.14)",
  },

  stepDotDone: {
    backgroundColor: COLORS.orange,
    borderColor: "rgba(255,106,43,0.55)",
  },

  stepDotText: {
    color: COLORS.muted,
    fontWeight: "900",
    fontSize: 12,
  },

  stepLabel: {
    color: "rgba(166,170,180,0.75)",
    fontWeight: "800",
    fontSize: 11.5,
  },

  card: {
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(20,22,27,0.88)",
  },

  cardTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 18,
  },

  cardHint: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12.5,
    lineHeight: 18,
  },

  inputWrap: { gap: 8 },

  inputLabel: {
    color: "rgba(244,245,247,0.85)",
    fontWeight: "800",
    fontSize: 12.5,
  },

  input: {
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    color: COLORS.text,
    fontWeight: "800",
  },

  teamBox: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },

  teamBoxTitle: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 14,
  },

  playerRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
  },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  playerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  playerChipText: {
    color: "rgba(244,245,247,0.90)",
    fontWeight: "800",
    fontSize: 12.5,
  },

  row3: { flexDirection: "row", gap: 10 },

  formatChip: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  formatChipActive: {
    backgroundColor: "rgba(255,106,43,0.16)",
    borderColor: "rgba(255,106,43,0.30)",
  },

  formatChipText: {
    color: COLORS.muted,
    fontWeight: "900",
    fontSize: 13,
  },

  row2: { flexDirection: "row", gap: 10 },

  selectChip: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  selectChipActive: {
    backgroundColor: "rgba(255,106,43,0.16)",
    borderColor: "rgba(255,106,43,0.30)",
  },

  selectChipText: {
    color: COLORS.muted,
    fontWeight: "900",
    fontSize: 13,
  },

  summaryBox: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 10,
  },

  summaryLine: {
    color: "rgba(244,245,247,0.88)",
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 18,
  },

  summaryKey: {
    color: COLORS.muted,
    fontWeight: "900",
  },

  bottomRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  secondaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 14,
  },

  primaryBtn: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },

  primaryText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 14,
  },
});
