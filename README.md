# 🌿 AquaSmart Monitor

**Modern IoT Dashboard for Aquascape & Aquarium Monitoring**

AquaSmart Monitor is a robust, real-time web dashboard designed to monitor and control aquascape ecosystems. Built with **React** and **TypeScript**, it integrates seamlessly with **Google Apps Script (GAS)** and **Google Sheets** as a serverless backend and database. 

The system features advanced visualization with multi-axis charts, fuzzy logic-based AI recommendations for water quality, and remote device control.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/frontend-React_19-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)
![Tailwind](https://img.shields.io/badge/style-Tailwind_CSS-38B2AC.svg)
![Backend](https://img.shields.io/badge/backend-Google_Apps_Script-4285F4.svg)

## ✨ Key Features

### 📊 Real-time Monitoring
- **Live Sensors:** Displays real-time data for Temperature (°C), pH, and TDS (ppm).
- **Status Indicators:** Visual cues (Green/Amber/Red) indicating if parameters are within ideal ranges.

### 🧠 Intelligent Analysis (Fuzzy Logic)
- **AI Recommendations:** Uses a fuzzy logic algorithm embedded in the backend to analyze sensor data combinations.
- **Actionable Insights:** Provides specific advice (e.g., "Water quality is good" or "Check heater") based on the fuzzy inference system.

### 📈 Historical Data Visualization
- **Multi-Axis Line Chart:** Visualizes Temperature, pH, and TDS on a single synchronized chart with independent Y-axes.
- **Zoom & Pan:** Includes a brush/slider tool to zoom into specific timeframes (1 Hour, 1 Day, 1 Week) to analyze data density without overlap.
- **Responsive Design:** Charts adapt to screen size and theme.

### 🎮 Device Control
- **Relay Switching:** Manual toggle for lights, pumps, or CO2 regulators (Relay 1 & Relay 2).
- **Scheduling:** Set automatic On/Off timers for connected devices directly from the UI.

### ⚙️ Admin & Configuration
- **Authentication:** Secure login modal for accessing control features and settings.
- **Calibration Settings:** Adjust sensor readings via the dashboard.
- **Fuzzy Rules Config:** Modify the logic rules and range definitions without touching the code.
- **Dark Mode:** Fully supported dark/light theme toggling.

## 🛠️ Tech Stack

**Frontend:**
*   **React 19:** Component-based UI library.
*   **TypeScript:** Type safety and developer experience.
*   **Tailwind CSS:** Utility-first styling for a modern, responsive design.
*   **Recharts:** Composable charting library for React.
*   **Lucide React:** Beautiful, consistent icons.
*   **React Router:** Single-page application routing.

**Backend (Serverless):**
*   **Google Apps Script (GAS):** Handles API requests (`doGet`, `doPost`).
*   **Google Sheets:** Acts as the database for logging sensor history and storing configuration.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/aquasmart-monitor.git
    cd aquasmart-monitor
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure API Endpoint**
    *   Open `services/api.ts`.
    *   Replace `API_URL` with your deployed Google Apps Script Web App URL.

4.  **Run the development server**
    ```bash
    npm start
    # or
    npm run dev
    ```

## ☁️ Backend Setup (Google Apps Script)

Since this project uses a custom GAS backend, you need to set up the Google Sheet side:

1.  Create a new **Google Sheet**.
2.  Go to **Extensions > Apps Script**.
3.  Copy the backend code (IoT logic) into `Code.gs`.
4.  **Deploy as Web App:**
    *   Click `Deploy` > `New deployment`.
    *   Select type: `Web app`.
    *   Execute as: `Me`.
    *   Who has access: `Anyone` (Required for the React app to access it without OAuth complexity).
5.  Copy the generated **Web App URL** and paste it into `services/api.ts` in the frontend code.

## 📂 Project Structure

```
src/
├── components/       # UI Components (Dashboard, Settings, Charts)
├── contexts/         # React Context (AuthContext)
├── services/         # API handling (fetch logic for GAS)
├── types/            # TypeScript interfaces
├── App.tsx           # Main App component & Routing
└── index.tsx         # Entry point
```

## 📸 Screenshots

*(Add screenshots of your dashboard here, e.g., the dark mode view and the settings panel)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Note:** The backend relies on a specific Google Sheet structure (Tabs for: Realtime, History, Rules, Ranges, Calibration). Ensure your Google Sheet columns match the expected JSON structure in `services/api.ts`.
