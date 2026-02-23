# Standard Operating Procedure (SOP): Novartis ITSE Analytics Dashboard

**Document ID:** SOP-ITSE-2026-001  
**Version:** 1.1  
**Effective Date:** February 23, 2026  
**Owner:** IT Service Excellence Team  

---

## 1. Introduction & Purpose
The Novartis ITSE Dashboard is a real-time analytics platform designed to provide visibility into Incident Management performance. It transforms ServiceNow data into actionable insights, helping teams monitor ticket volumes, resolution efficiency, and SLA compliance.

### 1.1 Core Objectives
*   **Identify operational bottlenecks** (e.g., high backlog, excessive reassignments).
*   **Monitor SLA compliance** across different priority levels (P1-P4).
*   **Trace performance trends** (MTTR, Ticket Inflow).
*   **Rank team performance** via Leaderboards.

---

## 2. Landing on the Dashboard
When you first land on the dashboard (`/`), you are presented with a high-level operational overview.

![Overview Main Placeholder]

### 2.1 Layout Structure
The interface consists of several key components:
*   **Global Header:** Contains Novartis branding, tab navigation (Overview, My Dashboard, Leaderboards), and the Export menu.
*   **Sticky Global Filters (Slicers):** A persistent bar for slicing data by Date, Status, Priority, Region, Group, and Assignee.
*   **KPI Summary Row:** Six critical metrics providing an "at-a-glance" health check.
*   **Data Visualization Section:** Interactive charts including MTTR Trends, SLA Tracking, and Backlog distribution.

### 2.2 Global Filter Options
| Filter Type | Available Options |
| :--- | :--- |
| **Date Range** | Today, Last 7d, 30d, 90d, MTD, QTD, YTD, or Custom |
| **Ticket Status** | Open, Resolved, or All |
| **Priority** | P1 (Critical) to P4 (Low) |
| **Region** | NA, EMEA, APAC, LATAM, Other |
| **Group / Assignee** | Specific teams or individual support personnel |

---

## 3. Key Performance Indicators (KPIs)
Each KPI card displays a metric value, trend comparison, and a status indicator (Green/Orange/Red).

| KPI Name | Description | Red Flags |
| :--- | :--- | :--- |
| **Total Tickets** | Total inflow of incidents in the period. | Large spikes (Major Outage). |
| **Backlog Tickets** | Number of currently open/active tickets. | Growth > 10% week-over-week. |
| **SLA Met %** | % resolved within defined SLA window. | Drop below 90% (Orange) or 80% (Red). |
| **MTTR** | Mean Time To Resolve in hours. | High values suggest skill gaps. |
| **Re-open Rate** | % of resolved tickets that were reopened. | Rate > 5% (Poor quality). |
| **High-Hop** | Tickets reassigned 3 or more times. | > 15% of total backlog. |

---

## 4. Working with Charts & Visualizations
The dashboard provides multiple analytical lenses. Each visualization supports interactive drill-downs.

### 4.1 Feature Highlight: Trend Chart Navigation
The MTTR and Backlog trend charts now feature **Left/Right Navigation** to handle high-density data (Daily/Hourly views).
*   Use the **Chevron buttons** to page through the timeline.
*   The chart displays a window of 15 data points for maximum clarity.

![Trend Navigation Placeholder]

### 4.2 Interactive Drill-Down
1.  Click on any data point in a chart (e.g., a specific agent's bar).
2.  A **Drill-Down Modal** opens showing the specific ticket list.
3.  Filter or Export this specific subset as needed.

![Drill Down Placeholder]

---

## 5. Operational Workflow
Follow this 5-step process to drive continuous improvement:

1.  **Filter for Focus:** Scope the data to your specific Region or Assignment Group.
2.  **Identify Bottlenecks:** Look for Red/Orange KPIs or aging tickets.
3.  **Investigate (Drill-Down):** Click chart segments to see the actual tickets causing the issue.
4.  **Review Leaderboards:** Switch to the **Leaderboards** tab to benchmark team performance.
5.  **Export & Report:** Use the **Export** button to generate Excel or PDF reports for stakeholders.

---

## 6. Document Control & Approval

| Field | Value |
| :--- | :--- |
| **Document ID** | SOP-ITSE-2026-001 |
| **Effective Date** | February 23, 2026 |
| **Owner** | IT Service Excellence Team |

**Approval Signatures:**  
*   ITSE Team Lead: _________________________ Date: __________  
*   IT Manager: _________________________ Date: __________  
