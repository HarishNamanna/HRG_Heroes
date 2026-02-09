import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import  { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#0E0F12", // charcoal black
  card: "#14161B",
  orange: "#FF6A2B", // sunset orange
  orangeSoft: "#FF8A55",
  text: "#F4F5F7",
  muted: "#A6AAB4",
  stroke: "rgba(255,255,255,0.08)",
};

export default function Onboarding() {
  const router = useRouter();
type Outcome = 0 | 1 | 2 | 3 | 4 | 6 | "W";

const [lastBall, setLastBall] = useState<Outcome>(1);

const ballAnim = useRef(new Animated.Value(0)).current; // for overlay
const scoreAnim = useRef(new Animated.Value(1)).current; // for score chip

const [score, setScore] = useState({
  runs: 128,
  wkts: 4,
  overs: 17,
  balls: 2,
  rr: "7.39",
});

const outcomes: Outcome[] = [0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 4, 4, 6, "W"];

const animateBallOverlay = () => {
  ballAnim.setValue(0);

  Animated.timing(ballAnim, {
    toValue: 1,
    duration: 520,
    easing: Easing.out(Easing.back(1.2)),
    useNativeDriver: true,
  }).start(() => {
    // fade out smoothly after pop
    Animated.timing(ballAnim, {
      toValue: 0,
      duration: 260,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  });
};

const animateScore = () => {
  scoreAnim.setValue(0);

  Animated.timing(scoreAnim, {
    toValue: 1,
    duration: 420,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
};

const nextBall = () => {
  const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

  // 1) Show ball result FIRST
  setLastBall(outcome);
  animateBallOverlay();

  // 2) Update score AFTER a short delay (feels real)
  setTimeout(() => {
    setScore((prev) => {
      let runs = prev.runs;
      let wkts = prev.wkts;
      let overs = prev.overs;
      let balls = prev.balls;

      // increment ball
      balls += 1;
      if (balls > 5) {
        balls = 0;
        overs += 1;
      }

      // apply outcome
      if (outcome === "W") {
        if (wkts < 9) wkts += 1;
      } else {
        runs += outcome;
      }

      // restart after 20 overs (keeps onboarding lively)
      if (overs >= 20) {
        return {
          runs: 12,
          wkts: 0,
          overs: 1,
          balls: 0,
          rr: "6.00",
        };
      }

      const totalBalls = overs * 6 + balls;
      const rr =
        totalBalls > 0 ? ((runs / totalBalls) * 6).toFixed(2) : "0.00";

      return { runs, wkts, overs, balls, rr };
    });

    animateScore();
  }, 420);
};


// const animateScore = () => {
//   scoreAnim.setValue(0);

//   Animated.timing(scoreAnim, {
//     toValue: 1,
//     duration: 420,
//     easing: Easing.out(Easing.cubic),
//     useNativeDriver: true,
//   }).start();
// };

useEffect(() => {
  const interval = setInterval(() => {
    nextBall();
  }, 1400);

  return () => clearInterval(interval);
}, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <View style={styles.container}>
        {/* Glow blobs */}
        <View style={styles.glowTopRight} />
        <View style={styles.glowBottomLeft} />

        {/* Header */}
        <View style={styles.topRow}>
          <Text style={styles.brand}>HRG Heroes</Text>

          <Pressable onPress={() => router.replace("/")}>
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        {/* Hero Card */}
        <View style={styles.heroWrap}>
  <LinearGradient
    colors={["rgba(255,106,43,0.22)", "rgba(255,106,43,0.04)"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.heroCard}
  >
    {/* Premium Hero */}
    {/* Bottom HUD Row */}
<View style={styles.heroArt}>
  {/* Stadium glow */}

  {/* Top pill */}
  <View style={styles.livePill}>
    <View style={styles.liveDot} />
    <Text style={styles.liveText}>LIVE MATCH EXPERIENCE</Text>
  </View>

  {/* Stumps (optional) */}


  {/* ✅ HUD Row should be INSIDE heroArt */}
  <View style={styles.hudRowTop}><Animated.View
      style={[
        styles.scoreChipInline,
        {
          transform: [
            {
              translateY: scoreAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [6, 0],
              }),
            },
          ],
          opacity: scoreAnim,
        },
      ]}
    >
      <Text style={styles.scoreChipText}>Current Score</Text>

      <Text style={styles.scoreChipBig}>
        {score.runs}/{score.wkts}
      </Text>

      <View style={styles.scoreRow}>
        <Text style={styles.scoreChipSmall}>
          {score.overs}.{score.balls} overs
        </Text>
        {/* <Text style={styles.scoreChipSmall}>RR {score.rr}</Text> */}
      </View>
    </Animated.View>
    {/* Ball outcome */}
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ballOutcomeInline,
        {
          opacity: ballAnim,
          transform: [
            {
              scale: ballAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Text
        style={[
          styles.ballOutcomeText,
          lastBall === "W" && { color: "#FF3B30" },
          lastBall === 6 && { color: COLORS.orange },
          lastBall === 4 && { color: "rgba(255,138,85,0.95)" },
        ]}
      >
        {lastBall === "W"
          ? "WICKET!"
          : lastBall === 6
          ? "SIX!"
          : lastBall === 4
          ? "FOUR!"
          : lastBall}
      </Text>

      <Text style={styles.ballOutcomeSub}>
        {lastBall === "W"
          ? "Big breakthrough"
          : lastBall === 6
          ? "Massive hit"
          : lastBall === 4
          ? "Cracking boundary"
          : lastBall === 0
          ? "Dot ball"
          : "Quick run"}
      </Text>
    </Animated.View>

    {/* Score chip */}
    
  </View>
</View>

{/* Now headline comes after heroArt */}
{/* <Text style={styles.headline}>
  Track every ball.
  {"\n"}
  Celebrate every run.
</Text>

<View style={styles.accentLine} />

<Text style={styles.subtext}>
  Premium scoring built for modern cricket. Create matches, manage teams, and
  keep every over perfectly tracked — in seconds.
</Text> */}




    {/* Headline */}
    <Text style={styles.headline}>
      Track every ball.
      {"\n"}
      Celebrate every run.
    </Text>

    {/* Accent underline */}
    <View style={styles.accentLine} />

    <Text style={styles.subtext}>
      Premium scoring built for modern cricket. Create matches, manage teams,
      and keep every over perfectly tracked — in seconds.
    </Text>

    {/* Mini stats */}
    <View style={styles.miniStats}>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Fast setup</Text>
        <Text style={styles.statValue}>10s</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Ball-by-ball</Text>
        <Text style={styles.statValue}>100%</Text>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Teams</Text>
        <Text style={styles.statValue}>∞</Text>
      </View>
    </View>
  </LinearGradient>
</View>


        {/* CTA */}
        <View style={styles.ctaWrap}>
          <Pressable
            onPress={() => router.push("/auth/login")}
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 },
            ]}
          >
            <Text style={styles.primaryBtnText}>Login</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/auth/register")}
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && { transform: [{ scale: 0.985 }], opacity: 0.92 },
            ]}
          >
            <Text style={styles.secondaryBtnText}>Register now</Text>
          </Pressable>

          <Text style={styles.footerHint}>
            By continuing, you agree to our{" "}
            <Text style={styles.link}>Terms</Text> &{" "}
            <Text style={styles.link}>Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
    backgroundColor: COLORS.bg,
  },

  glowTopRight: {
    position: "absolute",
    top: -120,
    right: -120,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: "rgba(255,106,43,0.22)",
    filter: "blur(0px)",
  },

  glowBottomLeft: {
    position: "absolute",
    bottom: -140,
    left: -140,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "rgba(255,106,43,0.12)",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 14,
  },

  brand: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.2,
  },

  skip: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: "600",
  },

hudRowTop: {
  position: "absolute",
  left: 12,
  right: 12,
  top: 54, // sits under LIVE pill
  flexDirection: "row",
  gap: 12,
  alignItems: "stretch",
},

ballOutcomeInline: {
  flex: 1,
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: "rgba(20,22,27,0.70)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  justifyContent: "center",
  minHeight: 82,
},

scoreChipInline: {
  width: "48%",
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingVertical: 12,
  backgroundColor: "rgba(20,22,27,0.78)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  justifyContent: "center",
  minHeight: 82,
},




ballOutcomeText: {
  fontSize: 20,
  fontWeight: "900",
  letterSpacing: 0.4,
  color: COLORS.text,
},

ballOutcomeSub: {
  marginTop: 4,
  fontSize: 12,
  fontWeight: "700",
  color: "rgba(166,170,180,0.95)",
},

  heroWrap: {
    flex: 1,
    justifyContent: "center",
  },
  stadiumGlow: {
  position: "absolute",
  top: -80,
  left: -40,
  width: 220,
  height: 220,
  borderRadius: 220,
  backgroundColor: "rgba(255,106,43,0.14)",
},

stadiumGlow2: {
  position: "absolute",
  bottom: -90,
  right: -60,
  width: 260,
  height: 260,
  borderRadius: 260,
  backgroundColor: "rgba(255,106,43,0.10)",
},

livePill: {
  position: "absolute",
  top: 14,
  left: 14,
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
  fontWeight: "800",
  letterSpacing: 0.6,
},

pitch: {
  position: "absolute",
  width: "88%",
  height: 120,
  borderRadius: 24,
  backgroundColor: "rgba(255,255,255,0.04)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  bottom: 18,
  left: "6%",
  overflow: "hidden",
},

pitchStripe: {
  height: 40,
  width: "100%",
  backgroundColor: "rgba(255,255,255,0.06)",
},

bat: {
  position: "absolute",
  width: 92,
  height: 16,
  borderRadius: 16,
  backgroundColor: "rgba(244,245,247,0.85)",
  transform: [{ rotate: "-18deg" }],
  left: 46,
  top: 92,
},

batHandle: {
  position: "absolute",
  width: 34,
  height: 10,
  borderRadius: 10,
  backgroundColor: "rgba(244,245,247,0.65)",
  transform: [{ rotate: "-18deg" }],
  left: 32,
  top: 103,
},

ballTrail1: {
  position: "absolute",
  width: 110,
  height: 110,
  borderRadius: 110,
  right: 10,
  top: 12,
  backgroundColor: "rgba(255,106,43,0.08)",
},

ballTrail2: {
  position: "absolute",
  width: 70,
  height: 70,
  borderRadius: 70,
  right: 28,
  top: 32,
  backgroundColor: "rgba(255,106,43,0.12)",
},

scoreRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginTop: 2,
},

dotSep: {
  width: 5,
  height: 5,
  borderRadius: 5,
  backgroundColor: "rgba(166,170,180,0.7)",
},

accentLine: {
  width: 64,
  height: 4,
  borderRadius: 4,
  backgroundColor: "rgba(255,106,43,0.9)",
  marginTop: 8,
  marginBottom: 12,
},

miniStats: {
  marginTop: 16,
  borderRadius: 18,
  backgroundColor: "rgba(255,255,255,0.03)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 14,
  paddingHorizontal: 14,
},

statBox: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
},

statLabel: {
  color: "rgba(166,170,180,0.9)",
  fontSize: 12,
  fontWeight: "700",
  marginBottom: 6,
},

statValue: {
  color: COLORS.text,
  fontSize: 16,
  fontWeight: "900",
  letterSpacing: 0.2,
},

statDivider: {
  width: 1,
  height: 28,
  backgroundColor: "rgba(255,255,255,0.08)",
},


  heroCard: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.stroke,
    padding: 18,
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },

  heroArt: {
    height: 210,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(14,15,18,0.65)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  stumpsWrap: {
    position: "absolute",
    left: 18,
    bottom: 18,
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-end",
  },

  stump: {
    width: 10,
    height: 72,
    borderRadius: 8,
    backgroundColor: "rgba(244,245,247,0.85)",
  },

  bails: {
    position: "absolute",
    top: -8,
    left: 0,
    right: 0,
    height: 10,
    borderRadius: 10,
    backgroundColor: "rgba(244,245,247,0.75)",
  },

  ball: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: COLORS.orange,
    position: "absolute",
    right: 24,
    top: 32,
    shadowColor: COLORS.orange,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },

 


  scoreChipText: {
    color: COLORS.muted,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 4,
  },

  scoreChipBig: {
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 22,
    marginBottom: 2,
  },

  scoreChipSmall: {
    color: COLORS.muted,
    fontWeight: "600",
    fontSize: 12,
  },

  headline: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 10,
  },

  subtext: {
    color: COLORS.muted,
    fontSize: 14.5,
    lineHeight: 21,
  },

  ctaWrap: {
    paddingTop: 14,
    paddingBottom: 18,
    gap: 12,
  },

  primaryBtn: {
    backgroundColor: COLORS.orange,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.orange,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 10,
  },

  primaryBtnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  secondaryBtn: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  secondaryBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  footerHint: {
    color: "rgba(166,170,180,0.85)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  link: {
    color: COLORS.orangeSoft,
    fontWeight: "700",
  },
});
