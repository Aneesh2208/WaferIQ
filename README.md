# WaferIQ

AI-powered semiconductor yield intelligence platform that simulates production runs, generates realistic wafer defects, and diagnoses root causes using dual AI models and a neural network.

Built with LLaMA 3 (via LM Studio), TensorFlow.js, and a case-based reasoning database that gets smarter with every analysis. Runs 100% locally — no API costs, no cloud dependencies, complete privacy.

---

## How It Works

1. **AI Model 1** (LLaMA 3) generates a realistic defect scenario with spatial patterns and die distribution
2. **ML Engine** (TensorFlow.js) classifies the defect using a 36-feature neural network trained on 50,000 simulated wafers
3. **AI Model 2** (LLaMA 3) performs detective-style root cause analysis, cross-referencing a growing knowledge base
4. **Financial engine** calculates revenue, costs, and profit across quality tiers
5. **Knowledge base** saves every analysis — the system learns and improves over time

```
Browser (Vanilla JS)               Backend (Express)
┌──────────────────────┐           ┌──────────────────────┐
│  Wafer Renderer       │           │  /api/ai endpoint    │
│  ML Pattern Engine    │ ────────▶ │  LM Studio proxy     │
│  Financial Calculator │           │  LLaMA 3 8B Instruct │
│  Case Database        │           └──────────────────────┘
│  Glassmorphism UI     │
└──────────────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js** v18+
- **LM Studio** with a LLaMA 3 8B Instruct model loaded and local server running on port 1234
  - Download from [lmstudio.ai](https://lmstudio.ai)

### Setup

```bash
git clone https://github.com/your-username/WaferIQ.git
cd WaferIQ
npm install
node server.js
```

Open `http://localhost:3000` and click **START PRODUCTION RUN**.

First run trains the ML model (~30 seconds). Subsequent runs are faster.

> **Important:** Don't open `index.html` directly from file explorer — the backend must serve it.

---

## Project Structure

```
WaferIQ/
├── server.js                          Express backend → LM Studio proxy
├── index.html                         Main UI
├── css/styles.css                     Glassmorphism UI theme
├── js/
│   ├── config.js                      API endpoint + pricing constants
│   ├── app.js                         Main orchestrator
│   ├── ai-defect-generator.js         AI Model 1: defect generation via LLM
│   ├── ai-defect-analyzer.js          AI Model 2: root cause diagnosis via LLM
│   ├── ml-pattern-recognition.js      TensorFlow.js neural network (128→64→21)
│   ├── wafer-database.js              Case database with cosine similarity search
│   ├── wafer.js                       Canvas renderer, 20+ defect visualizations
│   ├── financials.js                  Revenue/cost calculations
│   └── training-data.js               Training metadata
└── data/
    └── wafer-database-seed.json       15 pre-populated expert cases
```

---

## Knowledge Base

WaferIQ uses case-based reasoning that improves with use:

- Every analysis is saved to `localStorage` automatically
- New analyses are cross-referenced against past cases using cosine similarity on spatial features
- Statistical patterns (edge vs center vs hybrid, severity distributions) are tracked
- The AI uses accumulated insights to make better diagnoses over time

### Sharing Trained Data via Git

The database lives in your browser by default. To persist it in your repo:

1. Click **Export DB** in the UI
2. Save the downloaded file as `data/wafer-database-seed.json`
3. Commit and push

```bash
cp ~/Downloads/wafer-database-backup-*.json data/wafer-database-seed.json
git add data/wafer-database-seed.json
git commit -m "Update trained database"
git push
```

When someone clones the repo, the seed file loads automatically on startup and merges with any existing local data. No data is lost.

---

## Defect Library

20 defect patterns + perfect runs, including 30% hybrid/multi-stage defects:

| Category | Defects |
|----------|---------|
| **Spatial** | Edge Die Failure, Center Contamination, Radial Pattern, Cluster Failure, Random Scatter |
| **Process** | Etch Non-Uniformity, Ion Implantation Drift, Lithography Misalignment, CVD Defect, Photoresist Residue |
| **Physical** | Scratch Pattern, Micro-crack Propagation, Thermal Stress Fracture, Wafer Bow, Metal Delamination |
| **Other** | Plasma Damage, Cross-Contamination, Incomplete Oxide, Step Coverage Failure, Polysilicon Grain Boundaries |

Each defect has a unique spatial visualization on the wafer map. Hybrid defects combine two types for novel patterns the AI must reason through independently.

---

## Financial Model

| Parameter | Value |
|-----------|-------|
| Premium die | $285 |
| Standard die | $175 |
| Economy die | $95 |
| 300mm wafer cost | $14,500 |
| Labor per die | $4.50 |
| QC per run | $850 |
| Dead die loss | $12.50 |

---

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5 Canvas, CSS3 with glassmorphism
- **AI**: LLaMA 3 8B Instruct via LM Studio (OpenAI-compatible API)
- **ML**: TensorFlow.js — 36-feature neural network, in-browser training
- **Backend**: Express.js with JSON extraction and retry logic
- **Database**: localStorage + JSON seed files, cosine similarity search

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 500 error from AI backend | Make sure LM Studio is running with server started on port 1234 |
| Invalid JSON from model | The server has auto-retry logic; if persistent, try a different LLaMA 3 variant |
| Slow first run | ML model trains 50K samples on first run — subsequent runs skip training |
| Page loads but nothing works | Access via `http://localhost:3000`, not `file:///` |

---

## License

MIT
