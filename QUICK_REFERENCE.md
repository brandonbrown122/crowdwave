# Crowdwave Calibration Quick Reference

**Version 2.0 | February 2026**

---

## Calibration Multipliers at a Glance

### Demographic Adjustments

| Segment | Emotional | Digital | Price Sensitivity |
|---------|----------:|--------:|------------------:|
| Women 60+ | ×1.30 | ×1.35 | ×0.85 |
| Women 18–59 | ×1.10 | ×1.00 | ×1.00 |
| Adults 50–69 | — | ×1.30 | — |
| Adults 70–79 | — | ×1.40 | — |
| Adults 80+ | — | ×1.50 | — |

### Construct Corrections

| Construct | Bias | Correction |
|-----------|------|------------|
| Senior tech adoption | Under | ×1.30–1.65 |
| Life satisfaction (uncertainty) | Over | −3 to −4 pts |
| AI concern (general pop) | Over | ×0.90 |
| AI concern (executives) | Under | ×1.15 |
| Status quo preference | Under | +10–15 pts |
| Purchase intent → action | Over | ×0.30 |
| Cyber concern (executives) | Under | ×1.35 |
| Business transformation | Under | ×1.65 |
| Institutional trust | Over | −5 to −10 pts |

### Executive Role Modifiers

| Factor | CEO | CFO | CHRO | CMO | Tech |
|--------|----:|----:|-----:|----:|-----:|
| Cyber | ×1.30 | ×1.40 | ×1.60 | ×0.90 | ×1.55 |
| AI | ×0.90 | ×1.05 | ×1.40 | ×1.10 | ×1.20 |
| Transform | ×1.50 | ×1.15 | ×1.70 | ×1.40 | ×1.40 |
| Uncertainty | ×1.35 | ×1.50 | ×1.50 | ×1.25 | ×0.85 |

### NPS Industry Benchmarks

| Industry | Median NPS | LLM Default | Adjust |
|----------|:----------:|:-----------:|:------:|
| Manufacturing | 65 | 35–40 | +25 |
| Healthcare B2C | 70 | 40–45 | +25 |
| Retail/Ecommerce | 55 | 40–45 | +10 |
| Fintech | 46 | 40 | +6 |
| Software B2B | 29 | 35–40 | −8 |
| Education B2B | 16 | 35–40 | −22 |
| All Industries | 42 | 35 | +7 |

---

## Domain Coverage Checklist

### ✅ Fully Calibrated (±3–5 pts)
- [ ] Senior digital adoption (AARP, N=3,838)
- [ ] Political identity/affiliation (Gallup, N=13,000+)
- [ ] NPS by industry (Survicate, N=5.4M)
- [ ] Trust in scientists (Pew, N=5,111)
- [ ] Life satisfaction/well-being (Gallup, N=5,876)
- [ ] Cruise/travel CX (CLIA, industry census)
- [ ] Hotel satisfaction (JD Power, N=39,219)
- [ ] Pet ownership—Women segments (N=173)

### ✅ Calibrated (±5–8 pts)
- [ ] Executive/C-Suite concerns (Conf. Board, N=1,732)
- [ ] AI attitudes & concern (YouGov/Pew)
- [ ] Employee engagement (Gallup)
- [ ] Brand loyalty/switching (CapitalOne)
- [ ] National concerns—US (Pew, N=5,086)
- [ ] Institutional trust (Edelman, N=33,000)
- [ ] B2B buying behavior (Forrester)

### ⚠️ Partial Calibration (±8–12 pts)
- [ ] Mental health solutions (N=873, single study)
- [ ] Subscription services (N=49, qualitative)
- [ ] Healthcare decisions
- [ ] Consumer products (general)

### ❌ Not Calibrated — Use Caution
- [ ] Purchase intent (apply ×0.30)
- [ ] Open-ended responses
- [ ] Rare events (<5% base rate)
- [ ] Rapidly evolving topics

---

## Confidence Levels by Question Type

| Question Type | Base Accuracy | Key Issue | Confidence |
|---------------|:-------------:|-----------|:----------:|
| Scales (1–5) | Medium-High | Emotional intensity under-predicted | 🟢 |
| Binary choice | Medium | Status quo bias under-estimated | 🟡 |
| Ranking | Medium | Good for consensus, poor for polarized | 🟡 |
| NPS (0–10) | Medium-High | Use industry benchmarks | 🟢 |
| Open-ends | Low-Medium | Responses too polished | 🟠 |
| Purchase intent | Low | Intent-action gap critical | 🔴 |
| Rare events | Low | Insufficient signal | 🔴 |

---

## When to Use Synthetic Predictions

### ✅ USE FOR

| Use Case | Why It Works |
|----------|--------------|
| **Rapid hypothesis generation** | Directional guidance in hours |
| **Research design optimization** | Pre-test before expensive fieldwork |
| **Continuous monitoring** | Monthly tracking between waves |
| **Segment exploration** | Cost-prohibitive to field traditionally |
| **Executive decision support** | Quick, evidence-based input |
| **Competitive intelligence** | Broad landscape assessment |

### ❌ DO NOT USE FOR

| Situation | Why Not |
|-----------|---------|
| **Regulatory/legal evidence** | Requires formal human data |
| **Rare events (<5%)** | Insufficient calibration data |
| **Micro-local decisions** | Need local primary research |
| **Final high-stakes confirmation** | Validate with traditional research |
| **Uncalibrated domains** | Uncertainty too high |
| **Polarized political topics** | Must segment by party—never average |

---

## Quick Accuracy Checks

### Before You Trust a Prediction

1. **Is the domain calibrated?** Check list above
2. **Is the sample adequate?** Minimum N=400 for claims
3. **Are sources recent?** Apply decay rates:
   - Elections: <7 days (λ=0.15/day)
   - Economics: <30 days (λ=0.03/day)
   - Stable attitudes: <90 days (λ=0.01/day)
4. **Applied correct multipliers?** Check demographic + construct
5. **Widened CI appropriately?** See uncertainty rules below

### Uncertainty Inflation

| Condition | CI Multiplier |
|-----------|:-------------:|
| Data >30 days old | 1.3× |
| Data >60 days old | 1.6× |
| Volatile topic | 1.5× |
| <3 sources | 1.4× |
| High disagreement | 1.5× |
| Novel question | 2.0× |

---

## Partisan Topics — Always Segment

| Topic | R–D Gap |
|-------|:-------:|
| Illegal immigration | 50 pts |
| Climate change | 40 pts |
| Racism | 40 pts |
| Gun violence | 35 pts |
| Poverty | 25 pts |
| Inflation | 20 pts |

⚠️ **Never report a single "average" for these topics**

---

## Performance Benchmarks

| Metric | Crowdwave | Superforecasters | Random |
|--------|:---------:|:----------------:|:------:|
| Brier Score | 0.12–0.15 | 0.081 | 0.25 |
| MAE | ±4–6 pts | ±3–4 pts | ±15+ pts |
| Calibration Error | 0.032 | <0.02 | >0.10 |

---

**Need Full Methodology?** See `ACCURACY_WHITEPAPER.md`  
**Documenting Results?** Use `VALIDATION_REPORT_TEMPLATE.md`

*Crowdwave Research Division | February 2026*
