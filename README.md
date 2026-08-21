# ChronoGhost 🏺⚡

> A serverless CSS archeology engine built on AWS Builder Center.

ChronoGhost strips runtime JavaScript bloat, trackers, and style overhead from modern websites to isolate the core semantic HTML artifact. It re-renders the excavated content inside retro viewports (Windows 95 Desktop & 1980s Phosphor CRT Terminal) alongside vintage 56k dial-up transfer telemetry.

---

## 🚀 Architecture

* **Compute:** **AWS Lambda (Node.js 20.x/24.x)** handles server-side URL fetching, DOM sanitation, and payload telemetry heuristics.
* **API Layer:** **AWS Lambda Function URL** configured with native CORS for low-latency public JSON ingress.
* **Frontend:** **AWS Amplify Hosting** serving HTML5, Tailwind CSS, and Web Audio API synthesizer for dial-up acoustic emulation.

---

## 🛠 Features

* 🏺 **DOM Extraction:** Strips `<script>`, `<style>`, `<iframe>`, and ad trackers.
* 📟 **56k Dial-Up Telemetry:** Computes byte-level payload reduction and simulates 1996 56k baud load times.
* 🌞🌚 **Dual-Theme Engine:** Windows 95 Classic (Light) vs. Green Phosphor CRT Terminal (Dark).
* 🔊 **Audio Synthesis:** Web Audio API generation of vintage modem handshake tones.

---

## 📦 Local Development

1. Open `frontend/app.js` and set `API_ENDPOINT` to your AWS Lambda Function URL.
2. Serve the `frontend/` directory with any static server:
   ```bash
   npx serve frontend