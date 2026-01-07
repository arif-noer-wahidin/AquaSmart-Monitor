# 🌿 AquaSmart Monitor

**Next-Generation IoT Dashboard for Smart Aquascape & Aquarium Management**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React_19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Build-Vite_5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Backend](https://img.shields.io/badge/Backend-Google_Apps_Script-4285F4?logo=google-sheets)](https://developers.google.com/apps-script)

**AquaSmart Monitor** is a comprehensive, open-source web application designed to automate the monitoring and control of aquatic ecosystems. By leveraging **Fuzzy Logic AI**, it analyzes water quality parameters (Temperature, pH, TDS) in real-time to provide actionable insights, ensuring optimal health for your flora and fauna.

Designed for hobbyists and professionals, this system utilizes a **serverless architecture** (Google Apps Script & Sheets) to provide a powerful, zero-cost backend solution.

### 🌐 Official Links & Resources
*   **Aquascape Information & Plants**: [https://www.tanamanaquascape.id](https://www.tanamanaquascape.id)
*   **Developer Portfolio**: [https://www.arifnoerwahidin.my.id](https://www.arifnoerwahidin.my.id)

---

## 🚀 Key Features

### 📊 Real-Time Water Quality Monitoring
*   **Live Sensor Data:** Instant visualization of **Temperature (°C)**, **pH levels**, and **Total Dissolved Solids (TDS)**.
*   **Smart Indicators:** Visual status alerts (Optimal, Warning, Critical) based on configurable thresholds.
*   **Responsive Design:** Fully optimized for Desktop, Tablet, and Mobile devices using Tailwind CSS.

### 🧠 AI-Powered Analysis (Fuzzy Logic)
*   **Intelligent Recommendations:** Uses the Mamdani Fuzzy Inference System to interpret complex sensor data.
*   **Automated Decision Support:** Instead of raw numbers, get advice like "Perform Water Change," "Check Heater," or "Water Quality Optimal."
*   **Configurable Rules:** Modify fuzzy logic rules and membership functions directly from the Settings dashboard.

### 🎮 Remote Device Control & Automation
*   **IoT Relay Control:** Manually toggle lights, pumps, CO2 solenoids, or skimmers from anywhere.
*   **Precision Scheduling:** Built-in timers allow you to schedule device operations (e.g., "Light ON at 08:00, OFF at 18:00").
*   **Secure Access:** Protected by robust authentication to prevent unauthorized control.

### 📈 Historical Data & Analytics
*   **Interactive Charts:** Powered by **Recharts**, featuring multi-axis visualization to correlate Temperature, pH, and TDS trends over time.
*   **Zoom & Pan:** Drill down into specific timeframes (1 Hour, 24 Hours, 1 Week) with an interactive brush tool.
*   **CSV Export:** Download your water quality history for offline analysis or backup.

### ⚙️ Advanced System Management
*   **Sensor Calibration:** Calibrate your sensors via the UI without reflashing hardware code.
*   **Dark Mode:** Built-in theme switcher for comfortable viewing at night.
*   **Range Configuration:** Customize min/max safety limits for your specific tank inhabitants.

---

## 🏗️ System Architecture

This project uses a modern, cost-effective architecture:

1.  **Hardware (IoT Device):** ESP32/ESP8266 sends sensor data to the Google Apps Script Web App.
2.  **Backend (Google Apps Script):** Acts as the API controller. It processes `doGet` and `doPost` requests and runs the Fuzzy Logic algorithm.
3.  **Database (Google Sheets):** Stores historical data, configuration rules, and calibration values.
4.  **Frontend (React + Vite):** The user interface hosted on Cloudflare Pages (or similar).
5.  **Proxy Layer:** Uses Cloudflare Functions (or local proxy) to handle CORS and securely route requests to Google Apps Script.

---

## 🛠️ Tech Stack

*   **Core:** React 19, TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS, PostCSS
*   **Icons:** Lucide React
*   **Charts:** Recharts
*   **Routing:** React Router DOM (HashRouter)
*   **State Management:** React Context API
*   **Backend:** Google Apps Script (GAS)
*   **Data Storage:** Google Sheets

---

## 📦 Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   npm or yarn

### 2. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/aquasmart-monitor.git
cd aquasmart-monitor

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Backend Setup (Google Apps Script)
1.  Create a new **Google Sheet**.
2.  Rename the tabs to: `Realtime`, `History`, `Rules`, `Ranges`, `Calibrations`.
3.  Go to **Extensions > Apps Script**.
4.  Copy the backend `.gs` code (not included in this repo, check the `backend` folder if available or contact author).
5.  **Deploy as Web App:**
    *   Description: "v1"
    *   Execute as: **Me** (your email)
    *   Who has access: **Anyone**
6.  Copy the **Deployment URL**.

### 4. Configuration (Environment Variables)
This project uses a Proxy to communicate with Google Apps Script to avoid CORS issues and hide the backend URL.

**For Local Development:**
Create a `.env` file in the root directory.

**For Production (Cloudflare Pages):**
1.  Deploy your repo to Cloudflare Pages.
2.  Go to **Settings > Environment variables**.
3.  Add the following variables:
    *   `GAS_API_URL`: Your Google Apps Script Web App URL.
    *   `ADMIN_USER`: Your desired admin username.
    *   `ADMIN_PASS`: Your desired admin password.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://www.arifnoerwahidin.my.id">Arif Noer Wahidin</a>
</p>