<div align="center">
  <img src="public/assets/logo.png" width="200" alt="Novartis ITSE Logo">
  
  # Novartis ITSE Dashboard v2
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/mrigankad/novartisitsev2/)

  **The next generation of Operational Excellence for Novartis ITSM data.**
</div>

---

## 🚀 Overview

The **Novartis ITSE Dashboard v2** is a sophisticated, real-time operational dashboard designed to optimize ITSM workflows. It provides a comprehensive view of service health, performance metrics, and team productivity through high-fidelity data visualizations.

---

## 📊 Core Modules

### 1. Executive Overview
*   **KPI Tracking:** Real-time visibility into Ticket Volume, SLA Compliance, and MTTR.
*   **Compliance Monitoring:** Deep-dive into SLA Met vs. Breached trends.
*   **Dynamic Trend Analysis:** Visual representation of ticket inflow and backlog movement.

### 2. Operational Intelligence ("My Dashboard")
*   **Regional Distribution:** Breakdown of performance across NA, EMEA, APAC, and LATAM.
*   **Priority Heatmaps:** Real-time status of Critical (P1) and High (P2) incidents.
*   **Resolver Performance:** Tracking lead resolvers and assignment group efficiency.

### 3. Advanced Analytics & Reporting
*   **Excel-Style Leaderboards:** High-performance tables with advanced sorting and filtering.
*   **Drill-down Capabilities:** Access granular ticket-level details directly from charts.
*   **Universal Export:** Seamlessly export any dashboard view to **Excel** or **PDF**.

---

## 🏗️ Architecture

```mermaid
graph TD
    A[ITSM Data Sources] --> B{Data Integration Layer}
    B --> C[Real-time Cache - IndexedDB]
    C --> D[React Application]
    D --> E[KPI Calculation Engine]
    E --> F[Interactive Visualizations]
    F --> G[Drill-down Insights]
```

---

## 🛠️ Tech Stack

- **Framework:** React 18 with TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS & Lucide Icons
- **UI Components:** Radix UI primitives
- **Visualization:** Recharts (High-performance charting)
- **Data Management:** Custom context-based state management with IndexedDB caching

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/mrigankad/novartisitsev2.git

# Navigate to directory
cd novartisitsev2

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 💎 Features at a Glance

| Feature | Description | Status |
| :--- | :--- | :--- |
| **SLA Tracking** | Real-time calculation of P3/P4 SLA compliance. | ✅ Active |
| **Global Filters** | Cross-filtering by Region, Group, and Date Range. | ✅ Active |
| **Drilldown** | Comprehensive modal views for every data point. | ✅ Active |
| **Export Engine** | High-fidelity Excel and PDF generation. | ✅ Active |

---

<div align="center">
  <sub>Built with ❤️ for Novartis Operational Excellence.</sub>
</div>
