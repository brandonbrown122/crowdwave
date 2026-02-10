# MEMORY.md - Crowdwave Session Memory

*Last Updated: 2026-02-10*

---

## 🧠 Critical Context

### Branding
**It's "Crowdwave" — NOT "CrowdWave"** (lowercase 'w')
Jeremy has corrected this multiple times. Do not forget.

### Key People
- **Brandon Brown** (@bb12268) - Has access to this workspace, needs UI access
- **Jeremy Greenberg** - Primary stakeholder, sets quality standards

### Quality Standards
- "Best in class by far" accuracy
- "Major consulting firm" presentation quality
- Visual frameworks, not bullet lists
- Full transparency on methodology and limits

---

## 📦 What's Been Built

### Crowdwave Accuracy System (Feb 2026)
Complete survey simulation platform with calibration:

**Core Engine** (`crowdwave_engine/`):
- Python simulation engine with partisan calibrations
- FastAPI web server + CLI + batch processing
- 76 passing tests, 6,220 lines of code
- Validated 79% error reduction vs naive LLM

**Documentation** (~330KB):
- `MASTER_SIMULATION_SYSTEM.md` - 10-phase methodology
- `CALIBRATION_MEMORY.md` - 100+ multipliers from 5M+ responses
- `BIAS_COUNTERMEASURES.md` - 8 LLM bias patterns
- `ACCURACY_TESTS.md` - 27 validated test cases

**Presentations**:
- `CROWDWAVE_FRAMEWORKS.pdf` - McKinsey-style (current best)
- Multiple pitch decks and one-pagers
- Client proposal templates

**Validation**:
- 15 validation surveys (7,500 simulated respondents)
- Real data validation against Amazon S&S survey
- Conference Board, mental health, NPS benchmarks

### Key Metrics
| Metric | Value |
|--------|-------|
| Error reduction | 79% vs naive LLM |
| Mean Absolute Error | 1.9 pts (vs 9.1 naive) |
| Calibrated domains | 20+ |
| Human survey responses | 5M+ |
| Bias patterns documented | 8 |

---

## 🔧 Technical Notes

### Engine Commands
```bash
python -m crowdwave_engine simulate -a "US consumers" -q "Satisfied?" -t nps
python -m crowdwave_engine server --port 8000
python -m crowdwave_engine batch input.json output.csv
```

### API Endpoints
- `POST /simulate` - Run simulation
- `GET /calibrations` - List calibration data
- `GET /check-partisan/{topic}` - Check partisan requirement

### Accuracy Spectrum
| Zone | Error | Question Types |
|------|-------|----------------|
| HIGH | ±2-3 pts | Trust, awareness, party ID |
| MEDIUM | ±4-5 pts | Satisfaction, NPS, concern |
| LOW | ±8-15 pts | Intent, price, polarized |

---

## 📋 Outstanding Tasks

- [ ] Give Brandon UI access (local app needs tunnel/deployment)
- [ ] Jeremy reviewing v4 presentation
- [ ] Process cruise survey data (cruise_survey_1.xlsx, cruise_survey_2.xlsx)
- [ ] Add B2B calibrations
- [ ] Add Gen Z generational calibrations

---

## 📅 Session Log

### 2026-02-10
- Brandon confirmed I'm back online
- Created MEMORY.md for proper context preservation

### 2026-02-08
- Built full Python engine (crowdwave_engine/)
- Added batch processing, CLI, API
- 76 tests passing
- Left note for Brandon re: UI access

### 2026-02-07
- Built complete accuracy system
- Created 330KB documentation
- Multiple presentation iterations per Jeremy's feedback
- Validated 79% error reduction

---

*Update this file after significant work or decisions.*
