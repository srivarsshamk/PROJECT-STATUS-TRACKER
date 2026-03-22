import { Program, Team, Update } from "@/types";

export const seedPrograms: Program[] = [
  { id: 1, name: "Cloud Migration" },
  { id: 2, name: "Mobile App Redesign" },
  { id: 3, name: "Data Platform Upgrade" },
  { id: 4, name: "Security Hardening" },
  { id: 5, name: "Customer Portal v2" },
];

export const seedTeams: Team[] = [
  { id: 1, name: "Backend Engineering" },
  { id: 2, name: "Frontend Engineering" },
  { id: 3, name: "DevOps" },
  { id: 4, name: "QA & Testing" },
  { id: 5, name: "Product Design" },
];

export const seedUpdates: Update[] = [
  { id: 1, programId: 1, teamId: 3, createdAt: "2026-02-12T09:00:00Z", updateText: "Infrastructure provisioning completed. Moving to data migration phase.", updatedBy: "Alice Chen", ragCode: "GREEN" },
  { id: 2, programId: 1, teamId: 1, createdAt: "2026-02-11T14:30:00Z", updateText: "API layer migration blocked by legacy dependencies. Need resolution by EOW.", updatedBy: "Bob Smith", ragCode: "RED" },
  { id: 3, programId: 2, teamId: 2, createdAt: "2026-02-12T10:15:00Z", updateText: "Design system components 80% complete. On track for sprint delivery.", updatedBy: "Carol Diaz", ragCode: "GREEN" },
  { id: 4, programId: 2, teamId: 5, createdAt: "2026-02-10T16:00:00Z", updateText: "User research findings indicate navigation rework needed. Timeline may shift.", updatedBy: "Dan Lee", ragCode: "AMBER" },
  { id: 5, programId: 3, teamId: 1, createdAt: "2026-02-11T11:00:00Z", updateText: "New data pipeline architecture approved. Development starting next sprint.", updatedBy: "Eve Park", ragCode: "GREEN" },
  { id: 6, programId: 3, teamId: 4, createdAt: "2026-02-09T13:45:00Z", updateText: "Test coverage gaps identified in ETL modules. Expanding test suite.", updatedBy: "Frank Wu", ragCode: "AMBER" },
  { id: 7, programId: 4, teamId: 3, createdAt: "2026-02-12T08:00:00Z", updateText: "Critical vulnerability patched. Pen-test scheduled for next week.", updatedBy: "Grace Kim", ragCode: "RED" },
  { id: 8, programId: 4, teamId: 1, createdAt: "2026-02-10T09:30:00Z", updateText: "Authentication service hardened. MFA rollout progressing.", updatedBy: "Hank Zhou", ragCode: "GREEN" },
  { id: 9, programId: 5, teamId: 2, createdAt: "2026-02-11T15:00:00Z", updateText: "Customer portal dashboard wireframes approved. Dev starting Monday.", updatedBy: "Ivy Patel", ragCode: "GREEN" },
  { id: 10, programId: 5, teamId: 4, createdAt: "2026-02-08T10:00:00Z", updateText: "Regression test suite needs updating for new portal features.", updatedBy: "Jake Tan", ragCode: "AMBER" },
];
