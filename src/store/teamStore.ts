import { create } from "zustand";
import { Team } from "@/types";
import { seedTeams } from "@/mockData";

interface TeamStore {
  teams: Team[];
  nextId: number;
  addTeam: (name: string) => void;
  getTeam: (id: number) => Team | undefined;
}

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: seedTeams,
  nextId: seedTeams.length + 1,
  addTeam: (name) =>
    set((s) => ({
      teams: [...s.teams, { id: s.nextId, name: name }],
      nextId: s.nextId + 1,
    })),
  getTeam: (id) => get().teams.find((t) => t.id === id),
}));
