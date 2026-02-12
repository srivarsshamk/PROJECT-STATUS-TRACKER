

# Project Status Tracker — Implementation Plan

## Overview
A professional project status tracking dashboard with Programs, Teams, and RAG-status Updates management. Fully client-side with mock data, Zustand state management, and a formal grey/yellow/white color scheme.

---

## Design & Theme
- **Color palette**: Grey backgrounds, white cards, yellow accents for branding, with RAG indicators (Red, Amber/Yellow, Green)
- **Style**: Clean corporate dashboard — formal, professional, minimal
- **Dark/light theme toggle** with consistent styling in both modes
- **Fully responsive**: sidebar navigation on desktop, collapsible menu on mobile

---

## Pages & Features

### 1. Dashboard (Home)
- Summary cards: total programs, total teams, recent updates count
- Latest updates table with RAG color badges
- Quick filters panel (program, team, RAG status, date range)
- Sorting by date

### 2. Programs Page
- List all programs in a searchable table
- "Add Program" button opens a modal form
- Click a program to view its details and related updates

### 3. Teams Page
- List all teams in a searchable table
- "Add Team" button opens a modal form
- Click a team to view its details and related updates

### 4. Updates Page
- Full updates history table with RAG badges
- Filter panel: by program, team, RAG status, date range
- "Add Update" modal form (select program, team, RAG, enter text)
- Shows latest update per program/team combination highlighted

---

## UX Details
- Modal dialogs for all create forms
- Toast notifications on create/delete actions
- Empty state illustrations when no data exists
- Loading skeletons on initial render
- Dark/light theme toggle in the header

---

## Architecture
- `/types` — TypeScript interfaces (Program, Team, Update)
- `/mockData` — Seed data with example programs, teams, and updates
- `/store` — Zustand stores for programs, teams, and updates
- `/components` — Reusable UI pieces (RAG badge, filter panel, data tables, modals, layout)
- `/pages` — Dashboard, Programs, Teams, Updates pages
- Sidebar + header layout with navigation

