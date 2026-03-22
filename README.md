# Project Status Tracker

A comprehensive, modern dashboard application for monitoring program and team updates in real-time. Built with React, TypeScript, and Tailwind CSS.

## 📋 Overview

Project Status Tracker provides an intuitive interface for:
- 📊 Real-time dashboard with KPI cards and data visualizations
- 📋 Program and team management
- 🔄 Status update tracking (RED, AMBER, GREEN)
- 📈 Performance analytics and trends
- 🔍 Advanced filtering and search capabilities
- 🌓 Dark/Light theme support

## ✨ Features

### Dashboard
- KPI summary cards (Programs, Teams, Total Updates, Last 7 Days)
- Status distribution pie chart
- Updates trend line chart
- Program performance bar chart (Top 5)
- Team workload bar chart (Top 5)
- Advanced filtering with date ranges

### Programs
- View all programs with update counts
- Search and filter programs
- Add new programs
- Backend API integration

### Teams
- Manage teams and track updates
- Search functionality
- Add new teams
- Backend API integration

### Updates
- Track status updates across programs and teams
- Filter by status (RED, AMBER, GREEN)
- Date range filtering
- Real-time search and sorting

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Visualization**: Recharts
- **State Management**: Zustand
- **Build Tool**: Vite
- **HTTP Client**: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/srivarsshamk/PROJECT-STATUS-TRACKER.git
cd PROJECT-STATUS-TRACKER/angular-app-ace

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build
# or
bun run build
```

## 🔌 API Integration

The project connects to a Spring Boot backend with the following endpoints:

```
Base URL: http://localhost:8080/api

Programs:
  GET    /programs           - Get all programs
  GET    /programs/search    - Search programs
  POST   /programs           - Create new program

Teams:
  GET    /teams              - Get all teams
  GET    /teams/search       - Search teams
  POST   /teams              - Create new team

Updates:
  GET    /updates            - Get all updates
  GET    /updates/filter     - Filter updates by status, program, team, date range
  POST   /updates            - Create new update
```

## 📁 Project Structure

```
angular-app-ace/
├── src/
│   ├── api/                # API call functions
│   │   ├── programApi.ts   # Program API endpoints
│   │   ├── teamApi.ts      # Team API endpoints
│   │   └── updateApi.ts    # Update API endpoints
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Programs.tsx
│   │   ├── Teams.tsx
│   │   └── Updates.tsx
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── lib/                # Utility functions
│   ├── hooks/              # Custom React hooks
│   └── App.tsx
├── public/                 # Static assets
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Theming

The application supports both light and dark themes with automatic detection and manual toggle. Theme preference is managed through the theme store and applied to all components including charts and visualizations.

## 📝 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run test      # Run tests
npm run preview   # Preview production build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 📞 Support

For issues and questions, please open an issue on the [GitHub repository](https://github.com/srivarsshamk/PROJECT-STATUS-TRACKER).

---

Built with ❤️
