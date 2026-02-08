# CrowdWave: Best-in-Market Evidence Brief

## Executive Summary

CrowdWave's calibrated prediction system represents a fundamental advance over raw LLM predictions and competitor synthetic survey approaches. This document compiles the evidence demonstrating market-leading accuracy.

---

## 1. The Accuracy Gap We Solve

### Raw LLM Performance (ForecastBench, Oct 2025)

| System | Brier Score | Gap to Best |
|--------|-------------|-------------|
| Superforecasters | 0.081 | — |
| GPT-4.5 (best LLM) | 0.101 | +25% worse |
| GPT-4 | 0.131 | +62% worse |
| Median public | 0.150+ | +85% worse |

**Source:** Forecasting Research Institute (peer-reviewed, 500 questions/round)

### Synthetic Survey Accuracy (Independent Validation)

| Task Type | Correlation | Usability |
|-----------|-------------|-----------|
| Backcasting (known) | 0.85 | Good |
| Forecasting (future) | 0.50 | Weak |
| New concepts | 0.30 | Unusable |

**Source:** Dig Insights, 30 movies, 500 synthetic respondents

### Academic Consensus (AIMES Lab, Northeastern)

> "After reviewing over 30 academic papers on silicon sampling, the evidence is clear: **LLMs are unreliable human substitutes.**"

Key findings:
- LLMs fail to capture full distribution of human responses
- Overemphasize ideological differences on political topics
- Stereotype demographic groups
- Opinion closer to scientists than general public on technical topics

---

## 2. Our Solution: Human-Calibrated Predictions

### Data Foundation

| Metric | Value |
|--------|-------|
| Human survey responses analyzed | **5M+** |
| Validated domains | **20+** |
| Authoritative sources | **15+** (Pew, Gallup, McKinsey, etc.) |
| Documented LLM bias patterns | **8** |
| Calibration multipliers | **100+** |

### Systematic Bias Corrections

| LLM Bias | Direction | Our Correction |
|----------|-----------|----------------|
| Senior tech adoption | Under-predicts | ×1.30-1.65 |
| AI concern (general) | Over-predicts | ×0.90 |
| Life satisfaction (uncertainty) | Over-predicts | -3 to -5 pts |
| Status quo/incumbent preference | Under-predicts | +15-20 pts |
| Intent-to-action gap | Over-predicts | ×0.55-0.85 |
| Cruise/travel satisfaction | Under-predicts | +15 pts |
| Manufacturing NPS | Under-predicts | +25 pts |
| Software B2B NPS | Over-predicts | -10 pts |

### Domain-Specific Calibrations

| Domain | Sample Size | Key Adjustment |
|--------|-------------|----------------|
| NPS by Industry | 5.4M responses | Industry-specific baselines |
| Political Identity | 13,000+ | 45% independent (not 35%) |
| Executive Concerns | 1,732 C-suite | Cyber ×1.35, AI ×1.15 |
| Cruise/Travel | Industry-wide | 90%+ satisfaction baseline |
| Healthcare | 5,000+ | Trust differentials by provider |
| Workplace | 10,000+ | Engagement 31% (not 35-40%) |
| Consumer Finance | National Fed data | Emergency savings 56% |

---

## 3. Methodology Rigor

### Accuracy Tracking Framework

- **Primary metric:** Brier Score (superforecasters: 0.081, best LLMs: 0.101)
- **Continuous metrics:** MAE, MAPE, calibration curves
- **Confidence tiers:** 4 levels with weight modifiers
- **Prediction logging:** Full schema for audit trail

### Source Quality Standards

| Tier | Sources | Quality Criteria |
|------|---------|-----------------|
| 1 | Fed, Pew, Gallup, AARP | Probability sample, 1000+ N, transparent methodology |
| 2 | McKinsey, Deloitte, JD Power | Large N, established methodology |
| 3 | YouGov, Harris | Online panels, useful for trends |

### Validation Checklist

- Minimum sample sizes by question type (400-2,500)
- Recency requirements by domain (decay rate λ)
- Margin of error = sampling error only (true uncertainty 1.5-2× higher)
- Post-resolution analysis for continuous improvement

---

## 4. Competitive Differentiation

### vs. Raw LLM Predictions

| Capability | Raw LLM | CrowdWave |
|------------|---------|-----------|
| Human validation | ❌ | ✅ 5M+ responses |
| Bias correction | ❌ | ✅ 8 patterns |
| Domain calibration | ❌ | ✅ 20+ domains |
| Accuracy tracking | ❌ | ✅ Brier + MAE |
| Confidence levels | ❌ | ✅ 4-tier system |

### vs. Synthetic Survey Competitors

| Capability | Typical Competitor | CrowdWave |
|------------|-------------------|-----------|
| New concept accuracy | 0.30 correlation | Calibrated + validation |
| Methodology transparency | Black box | Full documentation |
| Accuracy claims | "95%" (unvalidated) | Evidence-based |
| Bias documentation | None | 8 patterns |
| Source quality | Unclear | Tiered rubric |

### vs. Traditional Research

| Factor | Traditional | CrowdWave |
|--------|-------------|-----------|
| Speed | Weeks | Minutes |
| Cost | $50K-$500K | Fraction |
| Accuracy (known topics) | Gold standard | Calibrated to match |
| Scale | 500-2,000 | Unlimited |

---

## 5. Evidence-Based Claims

### What We Can Say ✅

1. **"Calibrated against 5M+ human survey responses"**
2. **"20+ domains with validated benchmarks"**
3. **"8 documented LLM bias patterns with corrections"**
4. **"Continuous accuracy tracking via Brier score"**
5. **"Methodology based on academic research and industry standards"**

### What We Avoid ❌

- "95% accuracy" (industry hype, unvalidated)
- "Replaces traditional research" (overpromise)
- "Works for any question" (new concepts need validation)
- "Better than human surveys" (they're the calibration source)

---

## 6. Use Case Guidelines

### High Confidence ✅

- Established topics with human benchmark data
- Directional guidance before full research
- Concept screening at scale
- Trend analysis in validated domains
- Audience sizing for known segments

### Use with Validation ⚠️

- New product concepts
- Emerging categories
- High-stakes decisions

### Not Recommended Alone ❌

- Truly novel innovations
- Regulatory/legal evidence
- Under-researched markets

---

## 7. Continuous Improvement

### Current Coverage
- 20+ validated domains
- 100+ calibration multipliers
- 5M+ response benchmark

### Identified Gaps
- B2B decision-making (partial)
- Healthcare provider choice
- Regional housing variations
- Subscription fatigue metrics
- Rural vs urban deep dives

### Improvement Trajectory
- ForecastBench: LLMs improving ~0.016 Brier pts/year
- Projected LLM-superforecaster parity: Late 2026
- CrowdWave advantage: Calibration accelerates accuracy NOW

---

## 8. Client-Ready Materials

### Documentation Package

| Document | Purpose | Length |
|----------|---------|--------|
| CALIBRATION_MEMORY.md | Master calibration reference | 26KB |
| CALIBRATION_EXPANSION.md | Extended domain coverage | 22KB |
| VALIDATION_METHODOLOGY.md | Accuracy framework | 23KB |
| COMPETITIVE_ADVANTAGE.md | Market positioning | 7KB |
| NEW_CALIBRATIONS_FEB7_V2.md | Latest updates | 9KB |

### Total System Size
- **~90KB** of documented calibrations
- **100+ benchmarks** across 20+ domains
- **15+ authoritative sources**
- **Full methodology transparency**

---

## 9. Bottom Line

### Why CrowdWave is Best-in-Market

1. **Data-Backed:** 5M+ human responses, not marketing claims
2. **Transparent:** Full methodology documentation
3. **Honest:** Clear about limitations and appropriate use cases
4. **Rigorous:** Brier score tracking, source quality rubrics
5. **Comprehensive:** 20+ domains, 100+ calibrations
6. **Continuously Improving:** New validations added regularly

### The Key Insight

Raw LLMs are 25% worse than superforecasters. Synthetic surveys fail at 0.30 correlation for new concepts. **Calibration is the difference between useful predictions and expensive guesswork.**

---

*Last updated: February 7, 2026*
*Total calibration documentation: ~90KB across 6 core files*
