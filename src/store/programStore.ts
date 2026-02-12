import { create } from "zustand";
import { Program } from "@/types";
import { seedPrograms } from "@/mockData";

interface ProgramStore {
  programs: Program[];
  nextId: number;
  addProgram: (name: string) => void;
  getProgram: (id: number) => Program | undefined;
}

export const useProgramStore = create<ProgramStore>((set, get) => ({
  programs: seedPrograms,
  nextId: seedPrograms.length + 1,
  addProgram: (name) =>
    set((s) => ({
      programs: [...s.programs, { id: s.nextId, programName: name }],
      nextId: s.nextId + 1,
    })),
  getProgram: (id) => get().programs.find((p) => p.id === id),
}));
