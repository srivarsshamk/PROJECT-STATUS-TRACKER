import { create } from "zustand";
import { Update, RagCode } from "@/types";
import { seedUpdates } from "@/mockData";

interface UpdateStore {
  updates: Update[];
  nextId: number;
  addUpdate: (data: Omit<Update, "id">) => void;
}

export const useUpdateStore = create<UpdateStore>((set) => ({
  updates: seedUpdates,
  nextId: seedUpdates.length + 1,
  addUpdate: (data) =>
    set((s) => ({
      updates: [{ ...data, id: s.nextId }, ...s.updates],
      nextId: s.nextId + 1,
    })),
}));
