# Accuracy Analysis by Question Type

## Overview
This document tracks simulation accuracy across different question formats and identifies where errors concentrate.

---

## Question Type Matrix

### 1. CLOSED-ENDED SCALES (Likert 1-5, 1-7)

| Domain | Tested | MAE | Notes |
|--------|--------|-----|-------|
| Satisfaction (general) | ✅ | ~3 pts | Slight optimism inflation |
| Satisfaction (healthcare) | ⚠️ Partial | ~4 pts | Gratitude bias under-corrected |
| Concern/Worry | ✅ | ~4 pts | LLM under-predicts intensity |
| Likelihood (intent) | ⚠️ Partial | ~5 pts | Intent-action gap critical |
| Trust/Confidence | ✅ | ~2 pts | Well-calibrated |
| Comfort (novel tech) | ✅ | ~3 pts | Apply ×0.90 for AI |

**Key Vector:** Emotional intensity scales have highest error. LLM defaults to moderate responses.

---

### 2. BINARY CHOICE (Yes/No, A vs B)

| Domain | Tested | Accuracy | Notes |
|--------|--------|----------|-------|
| Status quo vs change | ⚠️ Partial | ~85% | LLM under-weights inertia |
| Human vs AI preference | ⚠️ Partial | ~80% | Rapidly shifting |
| Free vs paid | ❌ Not tested | — | Need validation |
| Natural vs synthetic | ❌ Not tested | — | Need validation |

**Key Vector:** Status quo bias is consistently under-estimated.

---

### 3. RANKING / MULTI-SELECT

| Domain | Tested | Rank Match | Notes |
|--------|--------|------------|-------|
| CEO priorities | ✅ | ~70% top-3 | Political/regulatory under-weighted |
| Consumer concerns | ⚠️ Partial | ~65% | Need more data |
| Feature importance | ❌ Not tested | — | Need validation |

**Key Vector:** Rankings work well for consensus items, poorly for politically-charged items.

---

### 4. OPEN-ENDED RESPONSES

| Domain | Tested | Theme Match | Notes |
|--------|--------|-------------|-------|
| Product feedback | ⚠️ Partial | ~60% | Themes accurate, vocabulary too polished |
| Concern verbatims | ❌ Not tested | — | Need validation |
| Recommendation reasons | ❌ Not tested | — | Need validation |

**Key Vector:** LLM generates overly articulate responses. Real humans use simpler language, more typos, shorter responses.

---

## Accuracy Drop-off Zones

### HIGH ACCURACY (MAE ≤ 3 pts)
- Trust/confidence in institutions
- Political party identification
- Basic demographic behaviors (already own X)
- Awareness questions

### MEDIUM ACCURACY (MAE 3-5 pts)
- Satisfaction scales
- General concern levels
- Technology adoption (with calibration)
- Ranking top-3 items

### LOW ACCURACY (MAE > 5 pts) ⚠️
- Emotional bonding intensity
- Intent-to-action predictions
- Novel/emerging behaviors (without priors)
- Polarized political topics
- Price sensitivity (income-dependent)

---

## Domains Needing Validation

### Priority 1 (High-frequency use cases)
- [ ] Consumer purchase intent
- [ ] Brand preference / NPS
- [ ] Price sensitivity / willingness to pay
- [ ] Feature importance ranking

### Priority 2 (Specialized audiences)
- [ ] B2B decision-makers
- [ ] Healthcare patients
- [ ] Parents (child-related decisions)
- [ ] High-income ($200K+)

### Priority 3 (Emerging topics)
- [ ] AI/automation attitudes
- [ ] Climate/sustainability
- [ ] Remote work preferences
- [ ] Mental health stigma

---

## Open-End Realism Checklist

Real responses should include:
- [ ] 20-25% very short/non-substantive ("N/A", "nothing", "idk")
- [ ] Typos and grammatical errors (~15% of responses)
- [ ] Varied vocabulary levels (not everyone is articulate)
- [ ] Sentence fragments
- [ ] Emoji/informal language for younger demos
- [ ] Repetition of question wording
- [ ] Off-topic tangents (~5-10%)

---

---

## NEW DOMAIN CALIBRATIONS (Feb 7, 2026)

### A. NPS / Recommendation (0-10 Scale)

**Source:** Industry benchmarks (Retently, QuestionPro 2025)

| Industry | Average NPS | Promoter % | Detractor % |
|----------|-------------|------------|-------------|
| B2B Software/SaaS | +41 | ~55% | ~14% |
| Logistics/Transport | +40 | ~54% | ~14% |
| Retail | +25-35 | ~45-50% | ~15-20% |
| Telecom | +5-15 | ~35-40% | ~25-30% |
| Healthcare | +35-45 | ~50-55% | ~10-15% |

**Calibration Rule:**
- Promoters (9-10): typically 40-55% of customers
- Passives (7-8): typically 25-35%
- Detractors (0-6): typically 15-25%
- Avoid predicting extreme NPS (>+60 or <0) without strong priors

---

### B. Willingness to Pay Premium

**Source:** JLL 2025, Nature 2025, MDPI research

| Context | % Willing to Pay Premium |
|---------|-------------------------|
| Quality experiences | 69% (up from 65% in 2024) |
| Eco-friendly products | 66% globally, 72% Europe |
| Sustainability/inclusivity | 49-52% |
| Premium by country: | |
| - India | 20% premium acceptable |
| - Brazil | 16% |
| - China | 15% |
| - US | 11% |
| - Germany | 9% |
| - UK | 8% |

**Calibration Rule:**
- Base willingness to pay premium: ~50-55% (general pop)
- Sustainability premium: 10-12% average acceptable
- Apply country modifiers for international studies

---

### C. National Concerns Ranking (Pew Feb 2025)

**Source:** Pew Research Center, N=5,086

| Issue | % "Very Big Problem" | Partisan Gap |
|-------|---------------------|--------------|
| Money in politics | 70% | Low |
| Affordability of healthcare | 67% | Low |
| Inflation | 63% | 20 pts (R>D) |
| Federal deficit | 57% | Moderate |
| Partisan cooperation | 56% | Low |
| Poverty | 53% | 25 pts (D>R) |
| Drug addiction | 51% | Low |
| Moral values | 50% | Low |
| Illegal immigration | 48% overall | **50 pts (R>D)** |
| Gun violence | ~52% overall | **35 pts (D>R)** |
| Climate change | ~45% overall | **40 pts (D>R)** |
| Racism | 35% overall | **40 pts (D>R)** |
| Unemployment | ~25% | Low |

**Calibration Rule:**
- Economic issues: relatively bipartisan, predict 55-70%
- Social issues: MUST segment by party (gaps of 20-50 pts)
- Don't average across partisans on polarized topics

---

### D. Open-End Response Quality Benchmarks

**Source:** SurveyMonkey, DISQO research

| Response Type | Typical % |
|---------------|-----------|
| Skip/blank | 10-15% |
| "N/A" / "nothing" / "none" | 8-12% |
| Single word or phrase | 15-20% |
| 1-2 sentences (functional) | 35-45% |
| 3+ sentences (substantive) | 15-25% |
| Long/detailed (4+ sentences) | 5-10% |
| Off-topic/irrelevant | 5-8% |

**Calibration Rule:**
- 20-25% of open-ends should be low-quality/non-substantive
- Include typos in ~15% of responses
- Vary vocabulary by education level
- Avoid uniform sentence length

---

## Updated Accuracy Drop-off Analysis

### WHERE ACCURACY IS STRONG ✅
| Question Type | Domain | MAE |
|--------------|--------|-----|
| Scale (1-5) | Trust/confidence | 2-3 pts |
| Scale (1-5) | Satisfaction (general) | 3-4 pts |
| Binary | Awareness questions | <3 pts |
| Ranking | Consensus economic issues | Top-3 match 70%+ |
| % Agreement | Bipartisan issues | 3-5 pts |

### WHERE ACCURACY DROPS ⚠️
| Question Type | Domain | MAE | Fix |
|--------------|--------|-----|-----|
| Scale (1-5) | Emotional intensity | 5-8 pts | Apply ×1.25 intensity multiplier |
| Binary | Status quo vs change | 10-15 pts | Apply 60-70% status quo bias |
| Ranking | Politically polarized | Poor | MUST segment by party |
| % Agreement | Polarized issues | 15-25 pts | Never predict overall avg |
| Open-end | Response realism | N/A | Force 20% low-quality responses |
| Intent | Purchase/action | 15-25 pts | Apply intent-action gap (×0.3) |

### WHERE ACCURACY FAILS ❌
| Question Type | Domain | Issue |
|--------------|--------|-------|
| Novel behaviors | No priors | Cannot predict without anchors |
| Emerging attitudes | Fast-changing | Calibrations outdated quickly |
| Cultural specifics | Non-US | US priors don't transfer |
| Small segments | N<100 | High variance, low confidence |

---

## Next Steps

1. ✅ Added NPS/recommendation calibrations
2. ✅ Added willingness-to-pay benchmarks  
3. ✅ Added national concerns ranking data
4. ✅ Added open-end quality benchmarks
5. ⏳ Need to test: purchase intent, feature ranking
6. ⏳ Need to validate: partisan segmentation accuracy
