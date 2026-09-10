# Geospatial Intelligence Platform

A full-stack React and Express application that provides Land Change & Development Intelligence. This platform allows users to analyze geospatial data, visualize land-cover transitions over time (e.g., vegetation shifts, built-up area changes), and generate AI-driven synthesis reports with predictive scenarios.

## 🚀 Features

- **Geospatial Visualization:** Interactive maps using Leaflet to explore custom Areas of Interest (AOI) or preset locations.
- **Land Change Analysis:** Computes differences between historical and current periods, analyzing development intensity, vegetation loss, and more.
- **AI Synthesis:** Integrates Google's Gemini AI to provide executive summaries of land change and grounded future projections based on observed trends.
- **Comprehensive Reporting:** Generates downloadable, HTML-based intelligence reports detailing statistics, transition classes, and data quality confidence levels.

## 💻 Tech Stack

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Language:** TypeScript
- **Bundler / Tooling:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Maps:** [Leaflet](https://leafletjs.com/)
- **Animations:** [Framer Motion](https://motion.dev/)
- **Icons:** Lucide React

### Backend
- **Server:** Node.js with [Express](https://expressjs.com/)
- **Language:** TypeScript (executed via `tsx` or bundled via `esbuild`)
- **AI Integration:** `@google/genai` (Google Gemini SDK)

### Database / Data Storage
**No external database (e.g., PostgreSQL, MongoDB) is currently used.**
- **Presets & Configurations:** Stored statically in TypeScript files (e.g., `src/data/presets.ts`).
- **Analysis Data:** Calculated dynamically on the fly within the `server/engine.ts` using predefined logic and simulated/mocked geospatial processing.
- **State Management:** Handled in-memory by React on the frontend and Express on the backend during a session.

## 🛠️ Project Structure

```text
├── src/
│   ├── components/      # React UI components (Maps, Sliders, Cards)
│   ├── data/            # Static data stores (presets.ts)
│   ├── App.tsx          # Main React Application entry
│   ├── main.tsx         # Frontend mounting point
│   ├── types.ts         # Global TypeScript interfaces
│   └── index.css        # Tailwind and global styles
├── server/
│   └── engine.ts        # Core backend analysis and geospatial logic
├── server.ts            # Express server configuration and API routes
├── vite.config.ts       # Vite build configuration
├── package.json         # Project dependencies and scripts
└── .env                 # Environment variables (e.g., API keys)
```

## ⚙️ Setup and Installation

1. **Install dependencies:**
   Ensure you have [Bun](https://bun.sh/) or [Node.js / npm](https://nodejs.org/) installed.
   ```bash
   npm install
   # or
   bun install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory (you can copy `.env.example` if it exists). Ensure you have necessary API keys (like `GEMINI_API_KEY` for Google GenAI).

3. **Start the Development Server:**
   This command starts both the Vite frontend and Express backend concurrently.
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Start the Production Server:**
   ```bash
   npm run start
   ```

## 📡 API Endpoints

- `GET /api/health` - Checks the status of the engine.
- `GET /api/presets` - Retrieves the list of available preset AOIs.
- `POST /api/preview` - Fast Stage 1 analysis (pre-flight checks, area calculation, data quality assessment).
- `POST /api/analyze` - Stage 2 full pipeline execution (generates transition stats, AI summaries, and scenarios).
- `POST /api/report` - Generates a downloadable HTML report based on the analysis.
