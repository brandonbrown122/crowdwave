# CrowdWave Validation Methodology

*A rigorous framework for prediction accuracy tracking and calibration validation*

> **Goal:** Make CrowdWave's calibration the most rigorous in the industry by combining best practices from polling science, superforecasting research, and prediction market methodology.

---

## Table of Contents
1. [Accuracy Tracking Framework](#1-accuracy-tracking-framework)
2. [Source Quality Scoring Rubric](#2-source-quality-scoring-rubric)
3. [Known LLM Bias Patterns](#3-known-llm-bias-patterns)
4. [Validation Checklist](#4-validation-checklist)
5. [Confidence Interval Guidelines](#5-confidence-interval-guidelines)
6. [References](#6-references)

---

## 1. Accuracy Tracking Framework

### 1.1 Core Metrics

#### Brier Score (Primary Metric)
The Brier Score measures the accuracy of probabilistic predictions. It is our **primary evaluation metric**.

```
Brier Score = (1/N) × Σ(prediction - outcome)²
```

**Interpretation:**
| Brier Score | Interpretation |
|-------------|----------------|
| 0.00 | Perfect prediction |
| 0.00-0.10 | Excellent (superforecaster level) |
| 0.10-0.20 | Good (expert level) |
| 0.20-0.25 | Fair (crowd average) |
| 0.25 | Random baseline (no predictive value) |
| >0.25 | Worse than random |

**Reference:** Superforecasters achieve ~0.081; best LLMs (GPT-4.5) achieve ~0.101 (Forecasting Research Institute, 2025).

#### Mean Absolute Error (MAE)
For continuous predictions (e.g., election margins):
```
MAE = (1/N) × Σ|predicted - actual|
```

**Benchmarks:**
- FiveThirtyEight polling average error: ~4.0 points for presidential elections (2000-2020)
- High-quality individual polls: ±3-4 points

#### Mean Absolute Percentage Error (MAPE)
For predictions expressed as percentages:
```
MAPE = (100/N) × Σ|predicted - actual| / actual
```

**Limitation:** Undefined when actual = 0. Use MAE for values near zero.

### 1.2 Calibration Curves

**Definition:** A calibration curve plots predicted probabilities against observed frequencies.

**Perfect calibration:** When you predict 70% probability, the event should occur 70% of the time.

**How to Generate:**
1. Bucket predictions (e.g., 0-10%, 10-20%, ... 90-100%)
2. Calculate actual resolution rate per bucket
3. Plot predicted vs. actual
4. Measure deviation from the diagonal (perfect calibration line)

**Calibration Error:**
```
Expected Calibration Error (ECE) = Σ(|bucket_size / total|) × |bucket_accuracy - bucket_confidence|
```

**Superforecaster standard:** Calibration within 2-3% of perfect across all buckets.

### 1.3 Prediction Logging Schema

Every prediction must be logged with the following fields:

```json
{
  "prediction_id": "uuid",
  "timestamp": "ISO-8601",
  "question": "Clear, unambiguous question text",
  "resolution_criteria": "Specific criteria for determining outcome",
  "resolution_date": "Expected resolution date",
  
  "prediction": {
    "probability": 0.72,
    "confidence_interval": [0.65, 0.79],
    "point_estimate": null
  },
  
  "sources": [
    {
      "source_id": "uuid",
      "source_type": "poll|market|expert|LLM|aggregate",
      "source_name": "Gallup",
      "source_quality_score": 8.5,
      "weight": 0.3,
      "timestamp": "ISO-8601",
      "raw_value": 0.73
    }
  ],
  
  "methodology": {
    "aggregation_method": "weighted_average|median|trimmed_mean",
    "adjustments_applied": ["recency_decay", "herding_correction"],
    "model_version": "v1.2.3"
  },
  
  "resolution": {
    "outcome": null,
    "resolved_at": null,
    "brier_score": null
  }
}
```

### 1.4 Scoring System for Prediction Confidence

#### Confidence Tiers

| Tier | Description | Typical Sources | Weight Modifier |
|------|-------------|-----------------|-----------------|
| **Tier 1: High Confidence** | Multiple high-quality sources agree, large sample sizes, recent data | 3+ quality polls, active prediction markets with >$100k volume | 1.0× |
| **Tier 2: Moderate Confidence** | Good sources with some uncertainty | 1-2 polls, moderate market activity | 0.7× |
| **Tier 3: Low Confidence** | Limited data, older sources, or disagreement | Single source, small sample, >30 days old | 0.4× |
| **Tier 4: Speculative** | Minimal reliable data | LLM estimates only, no external validation | 0.2× |

#### Confidence Score Formula

```
Confidence Score = Base_Score × Source_Quality × Recency × Agreement × Sample_Size

Where:
- Base_Score: Raw prediction (0-1)
- Source_Quality: 0.5-1.0 based on source tier
- Recency: exp(-λ × days_old), λ varies by domain
- Agreement: 1 - std_dev(sources) 
- Sample_Size: min(1, sqrt(n/1000)) for surveys
```

---

## 2. Source Quality Scoring Rubric

### 2.1 Polling Sources

Adapted from AAPOR transparency guidelines and FiveThirtyEight methodology.

| Criterion | Weight | 0 Points | 1 Point | 2 Points |
|-----------|--------|----------|---------|----------|
| **Sampling Method** | 25% | Opt-in/convenience | Probability-based with issues | True probability sample |
| **Sample Size** | 20% | <400 | 400-1000 | >1000 |
| **Methodology Transparency** | 15% | Black box | Partial disclosure | Full AAPOR compliance |
| **Track Record** | 20% | New/unknown | Mixed results | Proven accuracy |
| **Response Rate Disclosure** | 10% | Not disclosed | Disclosed | Disclosed + weighted |
| **Weighting Methodology** | 10% | Not disclosed | Basic | Sophisticated adjustment |

**Score Interpretation:**
- 9-10: A+ pollster (Pew, Gallup, high-quality university polls)
- 7-8.9: A/B pollster (most reputable national pollsters)
- 5-6.9: C pollster (use with caution, lower weight)
- <5: D/F pollster (exclude or heavily discount)

### 2.2 Prediction Market Sources

| Criterion | Weight | Low (1) | Medium (2) | High (3) |
|-----------|--------|---------|------------|----------|
| **Liquidity/Volume** | 30% | <$10k | $10k-$100k | >$100k |
| **Number of Traders** | 20% | <100 | 100-1000 | >1000 |
| **Market Duration** | 15% | <1 week | 1 week - 1 month | >1 month |
| **Market Type** | 15% | Play money | Real money (limited) | Real money (unrestricted) |
| **Resolution Clarity** | 20% | Ambiguous | Somewhat clear | Crystal clear |

**Score = Σ(criterion_score × weight) / 3, normalized to 0-10**

**Reference Platforms:**
- Polymarket: Generally high quality, real money, good liquidity
- Metaculus: Ensemble forecasting, excellent track record, no money
- Manifold: Play money, lower reliability but faster markets
- Kalshi: Regulated, real money, limited to US

### 2.3 LLM/AI Source Quality

| Criterion | Weight | Poor | Moderate | Good |
|-----------|--------|------|----------|------|
| **Model Capability** | 25% | GPT-3.5 or below | GPT-4 class | GPT-4.5+ / Claude Opus |
| **Retrieval Augmentation** | 20% | None | Basic search | Full RAG pipeline |
| **Reasoning Method** | 20% | Zero-shot | Few-shot | Chain-of-thought / ensemble |
| **Knowledge Cutoff** | 15% | >6 months | 1-6 months | <1 month |
| **Validation Against Experts** | 20% | None | Some testing | Calibrated on benchmark |

**Critical Note:** LLM predictions should NEVER be used as sole source for high-stakes decisions. They serve as one input among many.

### 2.4 Expert/Analyst Sources

| Criterion | Weight | Score Guidelines |
|-----------|--------|------------------|
| **Domain Expertise** | 30% | Years in field, credentials, publication record |
| **Prediction Track Record** | 30% | Documented accuracy on similar questions |
| **Independence** | 20% | Conflicts of interest, employer incentives |
| **Methodology Transparency** | 20% | Clear reasoning vs. "gut feeling" |

---

## 3. Known LLM Bias Patterns

### 3.1 Position Bias (Lost in the Middle)

**Description:** LLMs exhibit strong primacy bias (favoring information at the beginning) and recency bias (favoring information at the end), while **neglecting information in the middle** of their context window.

**Research:** Liu et al. (2023), "Lost in the Middle: How Language Models Use Long Contexts" - MIT/Stanford

**Impact on Predictions:**
- When synthesizing multiple sources, middle sources are underweighted
- In multi-option questions, first and last options are overrepresented

**Correction Factors:**
1. Randomize source order before presenting to LLM
2. Run multiple passes with shuffled order
3. Explicitly prompt for consideration of all sources equally
4. Use structured extraction rather than free-form synthesis

### 3.2 Source Framing Bias

**Description:** LLMs systematically favor or disfavor predictions based on how sources are labeled, regardless of content quality.

**Research:** Science Advances (2025), "Source framing triggers systematic bias in large language models"

**Examples:**
- "According to Fox News..." vs "According to a news source..."
- "A study from Harvard..." vs "A study found..."

**Correction Factors:**
1. Strip source labels before analysis when possible
2. Present information neutrally: "Source A reports X, Source B reports Y"
3. Cross-validate with source-blind prompting

### 3.3 Acquiescence Bias

**Description:** LLMs tend to agree with assertions in prompts, even when incorrect.

**Research:** Schoenegger et al. (2024), documented in crowd forecasting comparisons

**Impact:** Leading questions produce systematically biased predictions.

**Correction Factors:**
1. Use neutral framing: "What is the probability?" not "Isn't it likely that...?"
2. Test with inverted framings and average
3. Include explicit uncertainty options

### 3.4 Sycophancy and Anchoring

**Description:** LLMs anchor heavily on:
- Numbers presented in prompts
- User-expressed beliefs
- Prior model outputs

**Correction Factors:**
1. Avoid providing initial estimates before asking for LLM prediction
2. Use multiple independent runs
3. Vary prompt structure to detect anchoring effects
4. Calculate disagreement across prompt variants as uncertainty measure

### 3.5 Overconfidence Bias

**Description:** LLMs express higher confidence than warranted, especially:
- In their knowledge of recent events (may be outdated)
- When extrapolating from training data patterns
- For questions with high base-rate uncertainty

**Research:** Guo et al. (2024), "Bias in Large Language Models: Origin, Evaluation, and Mitigation"

**Correction Factors:**
1. Apply systematic confidence deflation: P_adjusted = P_raw × 0.8 + 0.1 (pulls toward 50%)
2. Require explicit uncertainty expressions
3. Validate against prediction market prices before using

### 3.6 Training Data Temporal Bias

**Description:** LLMs reflect world state at training cutoff, not current reality.

**Impact:**
- May reference defunct organizations as active
- Political/economic conditions may have changed
- Assume outdated polling data

**Correction Factors:**
1. Always include explicit date context
2. Provide recent context via RAG/search
3. Flag predictions in rapidly-changing domains
4. Apply larger uncertainty bands for volatile topics

### 3.7 Generalization Bias

**Description:** LLMs tend to over-generalize findings from specific studies, especially in summaries.

**Research:** Royal Society Open Science (2025), "Generalization bias in large language model summarization"

**Impact:** Nuanced findings become absolute statements.

**Correction Factors:**
1. Request specific confidence levels
2. Ask for caveats and limitations explicitly
3. Prefer structured outputs over free-form summaries

### 3.8 Demographic and Cultural Bias

**Description:** Systematic biases in predictions involving:
- Gender (occupational stereotypes)
- Race/ethnicity (reinforced stereotypes)
- Geographic regions (Western-centric worldview)
- Political orientation (varies by model)

**Correction Factors:**
1. For demographic questions, explicitly prompt for counterfactual consideration
2. Use demographically balanced prompting
3. Cross-validate with domain experts from relevant communities

---

## 4. Validation Checklist

### 4.1 Pre-Prediction Checklist

Before trusting ANY calibration source, verify:

#### Source Verification
- [ ] **Identity confirmed:** Can we verify the source is who they claim to be?
- [ ] **Track record accessible:** Is there documented historical accuracy?
- [ ] **Methodology disclosed:** Do we understand how they arrived at this estimate?
- [ ] **Conflicts declared:** Are financial/political interests disclosed?
- [ ] **Recency verified:** How old is this data? (See §4.3)

#### Question Quality
- [ ] **Unambiguous:** Is there only one reasonable interpretation?
- [ ] **Resolvable:** Will we know the answer definitively?
- [ ] **Time-bounded:** Is there a clear resolution date?
- [ ] **Base rate available:** Do we have historical context?

#### Statistical Validity
- [ ] **Sample size adequate:** Does it meet minimums for question type? (See §4.2)
- [ ] **Sampling method appropriate:** Probability vs. convenience?
- [ ] **Confidence interval provided:** Not just point estimate?
- [ ] **Margin of error realistic:** Accounts for total survey error, not just sampling?

### 4.2 Minimum Sample Sizes by Question Type

Based on statistical power analysis and industry standards:

| Question Type | Minimum N | Target N | Notes |
|---------------|-----------|----------|-------|
| **National binary (election)** | 400 | 1,000+ | ±5% MOE at minimum, ±3% at target |
| **State/regional binary** | 300 | 600+ | Higher MOE acceptable for smaller populations |
| **Subgroup analysis** | 100 | 400+ | Per subgroup; aggregation helps |
| **Multi-option (3+ choices)** | 600 | 1,200+ | Need adequate N per option |
| **Rare events (<10% base)** | 1,000 | 2,500+ | Need enough positive cases |
| **Trend detection** | 3 waves, 400 each | 5+ waves, 800 each | Consistency over time |

**Key Insight:** 1,000 respondents provides ±3% MOE at 95% CI regardless of population size (for populations >10,000). This is the gold standard for national polls.

**Warning Signs:**
- "Survey of 150 people" → Results not statistically meaningful
- "Online poll" without methodology → Likely convenience sample
- Subgroup claims from small main sample → Probably noise

### 4.3 Recency Requirements by Domain

Different domains have different "information decay" rates:

| Domain | Freshness Requirement | λ (decay rate) | Notes |
|--------|----------------------|----------------|-------|
| **Election horse-race** | <7 days | 0.15/day | Polls degrade rapidly near election |
| **Economic indicators** | <30 days | 0.03/day | Monthly data releases |
| **Public opinion (stable)** | <90 days | 0.01/day | Slow-moving attitudes |
| **Policy support** | <60 days | 0.02/day | Events can shift quickly |
| **Prediction markets** | <24 hours | 0.5/day | Prices update continuously |
| **Scientific consensus** | <1 year | 0.002/day | Slow to change |
| **Technology forecasts** | <6 months | 0.005/day | Rapid developments |
| **Geopolitical events** | <7 days | 0.1/day | Volatile, event-driven |

**Recency Weight Formula:**
```
Recency_Weight = exp(-λ × days_since_collection)
```

**Example:** An election poll from 10 days ago:
```
Weight = exp(-0.15 × 10) = exp(-1.5) = 0.22
```
→ Worth only 22% of a same-day poll.

### 4.4 Agreement/Disagreement Analysis

Before finalizing a prediction:

- [ ] **Count independent sources:** How many truly independent estimates?
- [ ] **Calculate spread:** What's the range and standard deviation?
- [ ] **Identify outliers:** Any source dramatically different? Investigate.
- [ ] **Check for herding:** Are sources clustering suspiciously? (May be copying each other)
- [ ] **Weight by quality:** Apply source quality scores before averaging

**Red Flags:**
- All sources within 1% of each other → Possible herding/copying
- One source 20%+ different from others → Either informed or broken
- Rapid convergence after one source publishes → Herding detected

### 4.5 Post-Resolution Analysis

After every resolved prediction:

- [ ] **Log actual outcome**
- [ ] **Calculate Brier score for this prediction**
- [ ] **Calculate prediction - outcome difference**
- [ ] **Identify which sources were most accurate**
- [ ] **Update source quality scores**
- [ ] **Document lessons learned**
- [ ] **Update calibration curves**

---

## 5. Confidence Interval Guidelines

### 5.1 Probability-Based Samples vs. Non-Probability

**For probability-based polls:**
- Report standard margin of error (MOE)
- Formula: MOE = z × √(p(1-p)/n)
- Use 95% confidence level (z = 1.96)

**For non-probability samples (online opt-in, etc.):**
- DO NOT use "margin of error" (per AAPOR guidelines)
- Use "credibility interval" instead
- These are Bayesian estimates, wider than MOE
- Ipsos standard: Non-probability credibility intervals are ~1.5× larger than probability MOE

### 5.2 Total Survey Error (TSE) Concept

**Important:** Margin of error only captures sampling error. Real error includes:

| Error Type | Description | Typical Magnitude |
|------------|-------------|-------------------|
| Sampling error | Statistical variation | ±3% for n=1000 |
| Coverage error | Missing population segments | ±1-2% |
| Nonresponse error | Different responders vs. non-responders | ±1-3% |
| Measurement error | Wording, order effects | ±1-2% |
| Processing error | Coding, weighting mistakes | ±0.5-1% |

**Realistic total error:** Often 1.5-2× the reported MOE.

**AAPOR Quote:** "There is no such thing as a measurable overall margin of error for a poll."

### 5.3 Recommended Confidence Interval Widths

Based on empirical analysis of prediction accuracy:

| Prediction Type | Base CI (95%) | With Source Uncertainty |
|-----------------|---------------|------------------------|
| High-quality poll aggregate | ±4% | ±6% |
| Single good poll | ±5% | ±8% |
| Prediction market (liquid) | ±5% | ±8% |
| Prediction market (illiquid) | ±10% | ±15% |
| Expert consensus | ±8% | ±12% |
| LLM estimate (calibrated) | ±15% | ±20% |
| LLM estimate (uncalibrated) | ±25% | ±35% |

### 5.4 Uncertainty Inflation Rules

When conditions suggest higher uncertainty, apply multipliers:

| Condition | CI Multiplier |
|-----------|---------------|
| Data >30 days old | 1.3× |
| Data >60 days old | 1.6× |
| Volatile topic (recent major events) | 1.5× |
| Limited sources (<3 independent) | 1.4× |
| High source disagreement (SD > 10%) | 1.5× |
| Novel question type (no base rate) | 2.0× |
| LLM without RAG | 1.8× |

### 5.5 Probability Extremes

Special handling for extreme probabilities:

**Near certainty (>95% or <5%):**
1. Be skeptical—rare events are often underestimated
2. Apply uncertainty stretching: Don't report above 97% or below 3% without exceptional evidence
3. Consider historical base rates of "sure things" failing

**Probability Winsorization:**
```
P_reported = max(0.03, min(0.97, P_raw))
```

Unless:
- 3+ independent high-quality sources agree
- Prediction market with >$1M volume
- Event is logically determined (e.g., past event)

---

## 6. References

### Academic Literature

1. **Tetlock, P.E. & Gardner, D.** (2015). *Superforecasting: The Art and Science of Prediction*. Crown Publishers.

2. **Liu, N.F., et al.** (2023). "Lost in the Middle: How Language Models Use Long Contexts." *Transactions of the Association for Computational Linguistics*.

3. **Guo, Y., et al.** (2024). "Bias in Large Language Models: Origin, Evaluation, and Mitigation." arXiv:2411.10915.

4. **Gallegos, I.O., et al.** (2024). "Bias and Fairness in Large Language Models: A Survey." *Computational Linguistics*, 50(3), 1097-1179.

5. **Schoenegger, P., et al.** (2024). "Wisdom of the Silicon Crowd: LLM Ensemble Prediction Capabilities Rival Human Crowd Accuracy." *PNAS*.

6. **Forecasting Research Institute** (2025). "How Well Can Large Language Models Predict the Future?" ForecastBench analysis.

### Industry Standards

7. **AAPOR** (American Association for Public Opinion Research). "Margin of Sampling Error/Credibility Interval" guidelines.

8. **Pew Research Center** (2023). "Polling Landscape Methodology."

9. **FiveThirtyEight** (2023). "How Our Polling Averages Work" and "How Our Pollster Ratings Work."

10. **Gallup** (2024). "How Does Gallup Polling Work?"

### Prediction Market Sources

11. **Polymarket** (2025). "How Accurate is Polymarket?" accuracy documentation.

12. **Metaculus** (2023). "Why I Reject the Comparison of Metaculus to Prediction Markets."

13. **Good Judgment Project**. "Ten Commandments for Aspiring Superforecasters."

### LLM-Specific Research

14. **MIT News** (2025). "Unpacking the Bias of Large Language Models" - Position bias research.

15. **Science Advances** (2025). "Source Framing Triggers Systematic Bias in Large Language Models."

16. **Royal Society Open Science** (2025). "Generalization Bias in Large Language Model Summarization of Scientific Research."

---

## Appendix A: Quick Reference Card

### Golden Rules

1. **Never rely on a single source** — minimum 3 independent sources for any prediction
2. **Recency matters** — apply appropriate decay based on domain
3. **Sample size is not optional** — reject surveys under 400 respondents for meaningful claims
4. **LLMs are calibration aids, not oracles** — always validate with external data
5. **Report uncertainty honestly** — wide intervals are better than overconfident narrow ones
6. **Track everything** — every prediction must be logged for post-hoc analysis
7. **Update source quality scores** — after resolution, adjust weights based on performance

### Quick Source Quality Guide

| Source Type | Trust Level | Requires Validation |
|-------------|-------------|---------------------|
| A+ Pollster (Pew, Gallup, etc.) | High | Cross-check if single source |
| Liquid prediction market | High | Check for manipulation |
| B/C Pollster | Medium | Requires corroboration |
| Metaculus aggregate | Medium-High | Check forecaster count |
| Expert estimate | Medium | Verify independence |
| LLM with RAG | Low-Medium | Always validate externally |
| LLM without RAG | Low | Never use as primary source |
| Social media sentiment | Very Low | Directional signal only |

### Minimum Standards for Publication

Before CrowdWave publishes any prediction:

- [ ] At least 3 independent sources consulted
- [ ] Source quality scores assigned to each
- [ ] Recency weights applied
- [ ] LLM biases explicitly addressed in methodology
- [ ] Confidence interval provided (not just point estimate)
- [ ] Resolution criteria documented
- [ ] Prediction logged in system for tracking

---

*Document Version: 1.0*
*Last Updated: 2025-02-07*
*Author: CrowdWave Validation Framework*
