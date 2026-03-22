// Core data models for the Project Status Tracker

export interface Program {
  id: number;
  name: string;
  updates?: number;
}

export interface Team {
  id: number;
  name: string;
  updates?: number;
}

export type RagCode = "RED" | "GREEN" | "AMBER";

export interface Update {
  id: number;
  programId: number;
  teamId: number;
  createdAt: string;
  updateText: string;
  updatedBy: string;
  ragCode: RagCode;
}

// Filter state used on Dashboard & Updates pages
export interface UpdateFilters {
  programId: number | null;
  teamId: number | null;
  ragCode: RagCode | null;
  dateFrom: string;
  dateTo: string;
}
