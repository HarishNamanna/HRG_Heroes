import { api } from "./api";

// 1) Create player
export async function createPlayer(name: string) {
  const res = await api.post("/players", {
    name,
    battingStyle: "Right-handed",
  });
  return res.data;
}

// 2) Create team
export async function createTeam(name: string, playerIds: string[]) {
  const res = await api.post("/teams", {
    name,
    players: playerIds,
  });
  return res.data;
}

// 3) Create match
export async function createMatch(payload: {
  name: string;
  teamA: string;
  teamB: string;
  format: string;
  oversPerInnings: number;
}) {
  const res = await api.post("/matches", payload);
  return res.data;
}

// 4) Toss
export async function doToss(matchId: string, payload: { tossWonBy: string; electedTo: "bat" | "bowl" }) {
  const res = await api.post(`/matches/${matchId}/toss`, payload);
  return res.data;
}

// 5) Start match
export async function startMatch(matchId: string) {
  const res = await api.post(`/matches/${matchId}/start`);
  return res.data;
}

export const getMatches = async () => {
  const res = await api.get(`/matches`);
  return res.data;
};

export const getMatchSummary = async (matchId: string) => {
  const res = await api.get(`/matches/${matchId}/summary`);
  return res.data;
};

export const getPlayers = async () => {
  const res = await api.get(`/players`);
  return res.data;
};
