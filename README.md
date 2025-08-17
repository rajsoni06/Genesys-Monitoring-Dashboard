# HCD – Health Check-up Dashboard 

Welcome to the **Genesys Cloud Health Check Dashboard (HCD)** — a professional, secure, and efficient tool designed to streamline daily health check operations for the PepsiCo project at Cognizant.

<img width="1919" height="865" alt="image" src="https://github.com/user-attachments/assets/2d08961d-116f-46e4-b86a-6600fde0bfb9" />

> ⚡ Designed to reduce 60–70 minutes of manual checks down to just 5 minutes!

---

## 🚀 Project Purpose

This dashboard was built to replace the manual health check email process. It provides a real-time view of campaign statuses, API checks, AWS schedulers, agent skill resets, and more — all in one centralized dashboard.

---

## 🧠 Use Case

As part of the Genesys Cloud support team at **Cognizant (Client: PepsiCo)**, we perform daily status checks across various tools like Genesys Cloud, AWS, TIBCO, and Siebel.

Instead of manually visiting 10+ URLs, this dashboard automates the process, offers analytics, historical records, CRUD operations, and access control for real-time collaboration across global teams.

---

## 🏗️ Tech Stack

- **Frontend**: Vite + React + TypeScript + TailwindCSS + ShadCN UI  
- **Backend**: Node.js / Express (planned for CRUD + APIs)
- **Database**: PostgreSQL / MongoDB (for storing daily dialer records & process statuses)
- **Authentication**: Planned SSO Integration (for Cognizant employees only)
- **Hosting**: GitHub Pages / AWS S3 / Vercel (deployment pending)

---

## 📊 Features

### ✅ Dashboard Sections

- **Home Page**  
  - Date & time: `DD-MM-YYYY HH:MM:SS`
  - Today's dialer records (from database or Excel/AWS)
  - Analytics Board showing % increases/decreases w/ arrow indicators
  - Donut chart showing overall process completion status
  - Quick Links + POC Dropdown
  - Welcome message with animated border/glass effect

- **Left Panel (Sidebar)**  
  - Collapsible & expandable navigation
  - Contains all navigation buttons (e.g., PP Chat, Twilio, AWS Scheduler)
  - Each button has a status icon:
    - ✅ Green Tick → Completed
    - 🟠 Orange Icon → In-progress/incomplete
  - Hover-based auto-expand

- **Right Panel (Browser-like Window)**  
  - Opens embedded URLs or internal React pages
  - Includes "Back" and "Forward" browser-style buttons

---

### 🔄 CRUD Operations

Each left-side button (e.g., AWS Scheduler, Twilio Flex, etc.) has a connected status.  
Users can **Create, Read, Update, Delete** the status from the backend.  
Changes reflect globally in real-time for all users.

---

### 📁 File Import / AWS Sync

- Upload **Outbound Dialer File Excel** or **CRT Excel Files** to parse and display data
- Option to fetch dialer data directly from **AWS S3 or RDS**
- Displayed on Home Page with analytics and stored for historical viewing

---

### 📅 Past Dialer Records

- React page with selectable past dates
- On selection, display stored dialer records from DB
- Compare with previous data using charts

---

### 🔐 Security

- Only **Cognizant employees** can access dashboard (SSO planned)
- CRUD actions and queue-clear triggers are **restricted** and **logged**
- Queue-clearing backend integrates securely with **Genesys Cloud API**

---

## 🧪 Feature Details

| Feature                          | Description                                                                 |
|----------------------------------|-----------------------------------------------------------------------------|
| 🔁 Left Panel Auto-Collapse      | Collapses when a button is clicked, expands on hover                       |
| ✅ Status Indicators             | Icons show completed/incomplete statuses for each section                  |
| 📂 Bulk Upload                  | Upload Excel for dialer records + Filter and store                         |
| ⏱️ Agent Queue Reset            | "Click to clear queues" button triggers backend API call                   |
| 🛠️ API Validation Panel         | Includes 3 buttons (Get Token, CRT_COT, Sales) each opens a specific URL   |
| 🌐 Quick Links Dropdown         | Hover/click to access essential tools (AWS, Genesys, SNOW, etc.)           |
| 🧑‍💼 POC Dropdown                | Month-wise list of current POCs for easy reference                         |
| 📈 Analytics & Charts           | Metrics comparison, upward/downward trends, donut chart                    |
| 🌙 Dark/Light Mode              | User toggle for preferred display mode                                     |
| 💎 Glassmorphism UI             | Used in welcome message & animated borders                                 |

--- 

## 📂 Project Structure 

Health-Check-Dashboard/
│
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/               # Route-based pages (Home, Past Records, API Validation)
│   ├── assets/              # Images, logos, icons
│   └── App.tsx             # Main application component
│
├── public/
├── tailwind.config.ts
├── vite.config.ts
├── package.json
├── tsconfig.json
└── README.md

## 💡 Upcoming Features
✅ Full backend integration (Node.js)

✅ MongoDB/PostgreSQL connection

✅ Deployment via AWS or Vercel

✅ Real-time updates with Socket.IO or polling

✅ Authentication with SSO (Cognizant only)

## 🧑‍💼 Maintainer
Raj Soni
Contractor | IT | PepsiCo (via Cognizant)
📍 1100 Reynolds Blvd, Winston-Salem, NC
📧 Raj.Soni.Contractor@pepsico.com


