# 🤖 AI Semiconductor Yield Intelligence Platform

## Dual AI + ML System (LM Studio LLaMA 3 + TensorFlow.js) - 100% FREE

A production-style semiconductor defect simulation and diagnosis platform using:

- 🔴 **LM Studio (LLaMA 3 8B)** - Defect Generation AI
- 🔵 **LM Studio (LLaMA 3 8B)** - Root Cause Analysis AI
- 🧠 **TensorFlow.js** - Pattern Classification ML
- 📊 Financial Modeling + Visualization

**NO API COSTS** - Runs 100% locally using free open-source LLaMA 3 via LM Studio!

---

# 🏗 System Architecture

```
Frontend (HTML + JS)
        ↓
Node.js Backend (Express)
        ↓
LM Studio (localhost:1234)
        ↓
LLaMA 3 8B Model
        ↓
AI Response → Parsed → Rendered in UI
```

### Execution Flow

1. 🔴 **AI Model 1** (LLaMA 3) generates realistic wafer defect distribution
2. 🧠 **ML Model** (TensorFlow.js) classifies spatial defect pattern
3. 🔵 **AI Model 2** (LLaMA 3) performs technical root cause diagnosis
4. 💰 **Financial Engine** computes yield economics and ROI
5. 🎨 **UI** renders interactive wafer map + analytics dashboard

✅ No presets
✅ No fake responses
✅ Live AI inference through local LLaMA 3
✅ Zero API costs - 100% free!

---

# 🔐 Local-First Architecture

- ✅ **Zero API keys required** - Runs 100% locally
- ✅ **No cloud dependencies** - All AI runs on your machine
- ✅ **Complete privacy** - Your data never leaves your computer
- ✅ **No rate limits** - Use unlimited, free AI inference
- ✅ **Production-ready structure** - Express backend + frontend

This is NOT a static HTML demo - it requires:
1. LM Studio running locally (port 1234)
2. Node.js backend server (port 3000)

---

# 💰 Semiconductor Economic Model (2026 Estimates)

### Revenue Tiers
- Premium: $285 / die
- Standard: $175 / die
- Economy: $95 / die

### Costs
- 200mm wafer: $8,500
- 300mm wafer: $14,500
- 450mm wafer: $22,000
- Labor: $4.50 / die
- Misc: $3.20 / die
- QC: $850 / run
- Dead die loss: $12.50 / failed die

---

# 🧠 AI Components

## 🔴 AI Model 1 — Defect Generator (LM Studio - LLaMA 3 8B Instruct)
- **20+ unique defect types** with random generation
- Spatially aware defect modeling (edge, center, radial, cluster patterns)
- Structured JSON output with retry logic
- Temperature tuned for maximum variability and unpredictability
- **Catastrophic defects** (Thermal Stress Fracture, CVD failures) with up to 85% failure rates
- Each run is unique - no repeated patterns!

## 🧠 ML Model — TensorFlow.js Neural Network
- Dense neural network (browser-based)
- 7+ pattern classifications
- 95%+ pattern recognition accuracy
- Trained on 1,000,000+ synthetic scenarios
- Runs fully client-side - no backend needed

## 🔵 AI Model 2 — Defect Analyzer (LM Studio - LLaMA 3 8B Instruct)
- World-class semiconductor diagnostician persona
- **Detailed root cause analysis** (3-5 specific causes per defect)
- Processing step failure identification
- Technical + simplified dual-level explanations
- **Actionable manufacturing recommendations** with specific parameters
- Dynamic confidence scoring (85-99%) based on severity
- Never repeats analysis - creative and thorough every time

---

# 📁 Project Structure

```
semiconductor-yield-platform/
├── server.js
├── package.json
├── .env
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── config.js
│   ├── ai-defect-generator.js
│   ├── ai-defect-analyzer.js
│   ├── ml-pattern-recognition.js
│   ├── wafer.js
│   ├── financials.js
│   ├── training-data.js
│   └── app.js
└── README.md
```

---

# 🚀 How To Run (Step-by-Step)

## Prerequisites
- **Node.js** (v16 or higher)
- **LM Studio** ([Download here](https://lmstudio.ai/))
- **LLaMA 3 8B Instruct model** (download via LM Studio)

---

### 1️⃣ Download and Setup LM Studio

1. Download LM Studio from [lmstudio.ai](https://lmstudio.ai/)
2. Open LM Studio
3. Search for and download: **"llama-3-8b-instruct"**
4. Load the model in LM Studio
5. Start the **Local Server** (port 1234)
   - Click "Local Server" tab in LM Studio
   - Click "Start Server"
   - Verify it shows: `Server running at http://localhost:1234`

---

### 2️⃣ Install Node.js Dependencies

```bash
npm install
```

---

### 3️⃣ Start the Backend Server

```bash
npm run dev
```

You should see:
```
Local LLM backend running at http://localhost:3000
```

---

### 4️⃣ Open in Browser

Navigate to:
```
http://localhost:3000/index.html
```

⚠️ **IMPORTANT:** Do NOT open `index.html` directly from file explorer - it will not work!

---

### 5️⃣ Run Your First Analysis

1. Configure wafer parameters (default: 300mm, 100mm² die, N3 node)
2. Click **"START PRODUCTION RUN"**
3. Watch the AI models work:
   - 🧠 ML training
   - 🔴 AI Model 1 generates defects
   - 🔵 AI Model 2 analyzes and diagnoses
4. View results on the wafer map and financial dashboard

---

# 🧪 Example Console Flow

```
🚀 DUAL AI + ML ANALYSIS STARTING
🧠 Training ML Model...
🔴 AI MODEL 1: Defect Generator Starting...
💰 Calculating Financials...
🧠 ML Pattern Recognition...
🔵 AI MODEL 2: Defect Analyzer Starting...
✅ ANALYSIS COMPLETE
```

---

# 🌍 Deployment Strategy

## Local Development (Recommended)
- Run LM Studio locally for free unlimited AI inference
- Node.js backend on localhost:3000
- Frontend served through Express

## Cloud Deployment Options

**Option 1: Hybrid (Recommended for demos)**
- Deploy Node.js backend to Render / Railway / Fly.io
- Use **OpenAI API** instead of LM Studio for cloud deployment
- Update `server.js` to use `process.env.OPENAI_API_KEY`
- Serve frontend through same Node server

**Option 2: Fully Local (Zero Cost)**
- Package entire app with Electron
- Include portable LM Studio server
- Distribute as desktop application

⚠️ **Note:** Static hosting (GitHub Pages, Netlify) will NOT work because backend + LM Studio are required.

---

# 🎯 Why This Is Portfolio-Grade

✅ **Real AI integration** - Live LLaMA 3 inference (not mock responses)
✅ **Zero-cost AI** - 100% free local LLM via LM Studio
✅ **Dual AI + ML system** - Two AI models + neural network working together
✅ **ECE + semiconductor domain** - Industry-specific technical knowledge
✅ **20+ defect types** - Each with unique visualization patterns
✅ **True randomness** - No two production runs are the same
✅ **Modular architecture** - Clean, maintainable codebase
✅ **Professional UI/UX** - Interactive wafer maps, real-time analysis
✅ **Financial modeling** - Revenue, costs, yield economics
✅ **Complete privacy** - All data stays on your machine
✅ **Scalable backend** - Express server ready for cloud deployment  

---

# 🧩 Technical Stack

- **Node.js** (Express backend server)
- **LM Studio** (Local LLM inference server)
- **LLaMA 3 8B Instruct** (Meta's open-source AI model)
- **TensorFlow.js** (Browser-based ML)
- **HTML5 Canvas** (Wafer visualization)
- **Modular JavaScript** (ES6 modules)
- **OpenAI-compatible API** (LM Studio endpoint)

---

## Modeling Assumptions (Enhanced Random System)

### Defect Generation (AI Model 1)
- **20+ unique defect types** with unique spatial patterns
- **Perfect runs are RARE** (only 5% probability)
- Failure rates have **±40% random variation**:
  - Low: 3-7% (base 5% ± 2%)
  - Moderate: 8-16% (base 12% ± 4%)
  - High: 17.5-32.5% (base 25% ± 7.5%)
  - Critical: 35-55% (base 45% ± 10%)
- **Catastrophic defects** (Thermal Stress, CVD, Wafer Bow) can reach 85% failure
- **Clustering effects** add ±20% variation to failure distribution

### Quality Distribution (Die Classification)
- Premium: 35-65% of good dies (random variation)
- Standard: 10-30% of good dies
- Economy: Remainder of good dies
- Faulty: 45-75% of failed dies (salvageable)
- Dead: 25-55% of failed dies (total loss)

### Defect Visualization
Each defect type has a unique visual pattern:
- Edge failures, center contamination, radial patterns
- Scratch lines, spiral patterns, grid defects
- Concentric rings, gradient failures, random scatter
- Catastrophic widespread damage

### ML Pattern Recognition
- Trained on 1,000,000 synthetic scenarios
- 7+ pattern classifications with 95%+ accuracy
- Real-time browser-based inference

---

# 🔧 Troubleshooting

### "AI Backend Error: 500" or "Connection refused"
- ✅ Make sure LM Studio is running with server started (port 1234)
- ✅ Verify the model is loaded in LM Studio (llama-3-8b-instruct)
- ✅ Check that backend is running (`npm run dev`)

### "Model failed to produce valid JSON after retry"
- ✅ LLaMA 3 8B Instruct works best - avoid other models
- ✅ Increase temperature in `server.js` if responses are too rigid
- ✅ Check LM Studio console for model errors

### Wafer map shows no defects (all green)
- ✅ This was a bug - fixed in latest version
- ✅ Pull latest code from repository
- ✅ Perfect runs are now only 5% probability

### Page loads but nothing happens
- ✅ Open browser console (F12) - check for JavaScript errors
- ✅ Verify you're accessing `http://localhost:3000/index.html` not `file:///`
- ✅ Make sure all JS modules are loaded (check Network tab)

### Performance is slow
- ✅ LLaMA 3 8B requires GPU acceleration (RTX 4070 recommended)
- ✅ Reduce context window in LM Studio settings
- ✅ Use CPU mode if GPU unavailable (will be slower)

---

# 📜 License

MIT License

---

# 🎓 Educational Value

This project demonstrates:
- **Local LLM deployment** - How to run AI models locally without cloud costs
- **Structured LLM output** - Forcing AI to generate valid JSON
- **Multi-AI orchestration** - Coordinating multiple AI models for complex tasks
- **Domain-specific AI** - Applying AI to semiconductor manufacturing
- **Full-stack development** - Frontend, backend, AI integration
- **Real-world problem solving** - Defect detection and yield optimization

Perfect for portfolios, interviews, and technical demonstrations in:
- ECE / Semiconductor Engineering
- AI/ML Engineering
- Full-Stack Development
- DevOps / MLOps

---

**Built for serious semiconductor + AI portfolio demonstration.**

**100% FREE • 100% LOCAL • 100% PRIVATE** 🚀
