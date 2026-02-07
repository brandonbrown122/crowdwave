# 🌊 Crowdwave - Synthetic Audience Research Platform

**Generate synthetic audience insights in minutes, not weeks.**

Built: February 5, 2026

---

## What Is Crowdwave?

Crowdwave is a synthetic data platform for market research. It generates realistic survey responses from AI-powered personas that match your target audience segments.

**Use cases:**
- Concept testing before expensive real panels
- Survey pre-testing and validation
- Rapid directional insights
- Hard-to-reach audience simulation

---

## Quick Start

### 1. Access the App
- **Public URL:** https://crowdwave.loca.lt (when tunnel is active)
- **Local:** http://localhost:3000

### 2. Workflow

```
📁 Upload Data Sources → 👥 Define Segments → 📋 Create Survey → 🚀 Run Simulation → 📊 Analyze Results
```

---

## Features

### 📁 Data Sources
Upload files to ground your synthetic personas in real data:
- **Excel (.xlsx, .xls)** — Customer data, survey results, behavioral data
- **PDF** — Research reports, personas, brand guidelines
- **Images** — Visual context for personas
- **Video** — Testimonials, focus group footage

### 👥 Audience Segments
Define target audiences with:

**Demographics:**
- Age range
- Gender distribution
- Income level
- Location
- Education
- Occupation

**Psychographics:**
- Values (e.g., sustainability, quality, innovation)
- Interests
- Pain points
- Goals

**Behaviors:**
- Purchase frequency
- Price sensitivity (0-1 scale)
- Brand loyalty (0-1 scale)
- Decision factors

### 📋 Survey Builder
Four question types supported:

| Type | Description | Example |
|------|-------------|---------|
| **Multiple Choice** | Select one option | "Which brand do you prefer?" |
| **Likert Scale** | 1-5, 1-7, or 1-10 rating | "Rate your satisfaction" |
| **Open-Ended** | Free text response | "Why did you choose this product?" |
| **Ranking** | Order items by preference | "Rank these features" |

### 🚀 Simulation
- Select one or more segments
- Set sample size (10-500 respondents)
- Choose a survey
- Run simulation

### 📊 Results
- **Insights Summary** — Key findings, cross-segment comparisons
- **Question Analysis** — Distributions, means, top themes
- **Respondent Data** — Individual-level responses
- **Confidence Scores** — Per-question accuracy assessment
- **CSV Export** — Full data download

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              Frontend (Next.js)             │
│              localhost:3000                 │
│  - Dashboard, Segments, Surveys, Results    │
└─────────────────┬───────────────────────────┘
                  │ HTTP
┌─────────────────▼───────────────────────────┐
│              Backend (Express)              │
│              localhost:3001                 │
│  - REST API, File Processing, Simulation    │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│              SQLite Database                │
│              crowdwave.db                   │
└─────────────────────────────────────────────┘
```

### Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Express.js, Node.js
- **Database:** SQLite (sql.js)
- **File Processing:** xlsx, pdf-parse
- **Tunnel:** localtunnel

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/data-sources` | Upload file |
| GET | `/api/data-sources` | List data sources |
| DELETE | `/api/data-sources/:id` | Delete data source |
| POST | `/api/segments` | Create segment |
| GET | `/api/segments` | List segments |
| PUT | `/api/segments/:id` | Update segment |
| DELETE | `/api/segments/:id` | Delete segment |
| POST | `/api/surveys` | Create survey |
| GET | `/api/surveys` | List surveys |
| DELETE | `/api/surveys/:id` | Delete survey |
| POST | `/api/simulate` | Run simulation |
| GET | `/api/simulate/:id/status` | Check simulation status |
| GET | `/api/results` | List all simulations |
| GET | `/api/results/:id` | Get simulation results |
| GET | `/api/results/:id/csv` | Download results as CSV |

---

## How It Works

### Persona Generation
1. Takes segment traits (demographics, psychographics, behaviors)
2. Adds variation for realistic distribution
3. Generates individual persona profiles
4. Each persona has unique characteristics within segment bounds

### Response Generation
1. Persona characteristics influence answer selection
2. **Multiple choice:** Weighted by values/interests alignment
3. **Likert:** Influenced by personality traits, adds variance
4. **Open-ended:** Themed responses based on pain points/goals
5. **Ranking:** Ordered by value alignment scores

### Confidence Scoring
Each question gets a confidence score (0-100) based on:
- Segment definition quality
- Sample size adequacy
- Data source grounding
- Response distribution realism

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm

### Start Backend
```bash
cd crowdwave-app/backend
npm install
npm start
# Runs on http://localhost:3001
```

### Start Frontend
```bash
cd crowdwave-app/frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Create Public Tunnel
```bash
npx localtunnel --port 3000 --subdomain crowdwave
# Creates https://crowdwave.loca.lt
```

---

## File Structure

```
crowdwave-app/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server
│   │   ├── db/
│   │   │   └── database.js       # SQLite setup
│   │   ├── routes/
│   │   │   ├── dataSources.js    # File upload endpoints
│   │   │   ├── segments.js       # Segment CRUD
│   │   │   ├── surveys.js        # Survey CRUD
│   │   │   └── simulations.js    # Simulation endpoints
│   │   └── services/
│   │       ├── personaEngine.js      # Persona generation
│   │       ├── responseGenerator.js  # Survey responses
│   │       ├── confidenceScorer.js   # Confidence calculation
│   │       ├── insightsGenerator.js  # Analysis & insights
│   │       ├── csvExporter.js        # CSV export
│   │       └── dataProcessor.js      # File processing
│   ├── uploads/                  # Uploaded files
│   ├── crowdwave.db              # SQLite database
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js           # Dashboard
│   │   │   ├── layout.js         # App layout
│   │   │   ├── data-sources/     # Data sources page
│   │   │   ├── segments/         # Segments page
│   │   │   ├── surveys/          # Survey builder
│   │   │   ├── simulate/         # Run simulation
│   │   │   └── results/          # Results pages
│   │   └── globals.css
│   ├── tailwind.config.js
│   ├── next.config.js
│   └── package.json
│
└── README.md
```

---

## Limitations & Recommendations

### Current Limitations
- Responses are rule-based, not LLM-generated (faster but less nuanced)
- No real-time LLM integration yet
- Video transcription not implemented
- Single-user (no auth)

### Best Practices
1. **Define segments thoroughly** — More detail = better personas
2. **Upload relevant data** — Grounds responses in reality
3. **Check confidence scores** — Low confidence = take results directionally
4. **Use for exploration** — Validate important findings with real research

### Confidence Score Guide
| Score | Level | Interpretation |
|-------|-------|----------------|
| 80-100 | High | Results suitable for decision-making (with validation) |
| 60-79 | Medium | Directionally useful |
| 40-59 | Low | Use for exploration and hypothesis generation |
| 0-39 | Very Low | Preliminary only |

---

## Future Enhancements

- [ ] LLM-powered response generation (Claude API integration)
- [ ] Real-time calibration against benchmark data
- [ ] Multi-user support with authentication
- [ ] Video transcription for data sources
- [ ] Advanced analytics dashboard
- [ ] A/B testing for messaging
- [ ] API rate limiting and quotas

---

## Credits

Built by Crowdwave team with Claude (Anthropic) assistance.

**Built in one session:** ~30 minutes from spec to working prototype.

---

## Support

Questions? Issues? Tag @crowdwave_clawdbot in the group chat.
