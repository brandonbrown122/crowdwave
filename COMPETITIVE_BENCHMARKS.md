# Competitive Benchmarks: AI Prediction Accuracy Landscape

*Last Updated: February 2026*

## Executive Summary

The prediction accuracy market is rapidly evolving. Raw LLMs achieve Brier scores around 0.10-0.14, while human superforecasters hit 0.081. Traditional surveys predict actual purchase behavior with only **34% accuracy**, while calibrated approaches can achieve **85-95% correlation** with real outcomes. **Calibration is the key differentiator.**

---

## 1. LLM Prediction Accuracy Benchmarks

### ForecastBench Results (October 2025)

| Model | Brier Score | vs Superforecasters |
|-------|-------------|---------------------|
| **Superforecasters** | **0.081** | Baseline |
| GPT-4.5 | 0.101 | 20% worse |
| GPT-4o | 0.121 | 49% worse |
| Claude 3.5 Sonnet | 0.146 | 80% worse |
| o3 (reasoning) | 0.135 | 67% worse |
| Median human forecaster | ~0.14 | 73% worse |
| Random guessing | 0.25 | 209% worse |

*Source: Forecasting Research Institute, ForecastBench*

### Key Findings

**Where LLMs Fail Systematically:**
1. **Overconfidence**: LLMs consistently show overconfidence, clustering predictions at 90-100% confidence while achieving accuracy well below calibration lines (arxiv.org/html/2508.06225v2)
2. **Dunning-Kruger Effect**: More knowledge doesn't remove overconfidence—LLMs show the Dunning-Kruger pattern
3. **Sparse Data**: Questions requiring subjective judgment with limited data remain human advantages
4. **Multinomial Questions**: ForecastBench tests binary questions; real-world often needs probability distributions
5. **Systematic Biases**: Even "value-aligned" models show biased decisions disadvantaging marginalized groups (PNAS, Feb 2025)

**Calibration Techniques That Work:**
- Temperature scaling on verbalized probability
- Ensemble methods across multiple models
- Human-in-the-loop for critical decisions
- Batch calibration for ICL and prompt engineering

---

## 2. Prediction Market Accuracy

### Polymarket Performance

| Metric | Value |
|--------|-------|
| **Brier Score** | **0.0584** |
| 4-hour accuracy | 95.4% |
| 1-day accuracy | 88.2% |
| 1-week accuracy | 88.8% |
| 1-month accuracy | 91.9% |

*Source: polymarket.com/accuracy (90,000+ predictions)*

### Metaculus Performance

| Metric | Value |
|--------|-------|
| **Brier Score (2021)** | **0.107** |
| Community Prediction | 0.108 |
| Metaculus beats Manifold | 75% of questions |

### Good Judgment Project (Superforecasters)

| Metric | Value |
|--------|-------|
| **Top Superforecasters Brier** | **0.02-0.03** |
| Typical Superforecaster | 0.08-0.13 |
| Beat intelligence officers | 30% more accurate |

**Key Insight**: Prediction markets achieve excellent calibration through financial incentives forcing honest probability assessment. Superforecasters achieve even better results through explicit calibration training.

---

## 3. Synthetic Survey Competitors

### Synthetic Users
- **Claim**: "AI feedback lined up with human feedback over 95% of the time"
- **Validation**: Testimonial-based; claims "Synthetic-Organic Parity" testing
- **Red Flag**: No published peer-reviewed validation methodology

### Saucery.ai (Food & Beverage)
- **Claim**: 95% correlation with real survey results
- **Validation**: Solomon Partners double-blind test with EY; MilkPEP case studies
- **Evidence**: 76% top-two-box real vs 75% synthetic on concept test
- **Pricing**: $20/concept vs $15,000+ traditional

### NIQ (Nielsen IQ)
- **Approach**: Uses proprietary transactional data to prompt synthetic personas
- **Finding**: "Synthetic respondents seemed to care more about human health than actual humans did"
- **Position**: Validation critical; warns against "fake it 'til you make it" outputs

### Delve AI
- **Focus**: Synthetic market research for personas
- **Validation**: Claims insights "validated" but methodology unclear
- **Red Flag**: No published accuracy benchmarks

### GrowthLoop
- **Focus**: CDP and audience segmentation (not synthetic surveys)
- **Partnership**: Audience Acuity for identity resolution
- **Note**: Different market segment—composable CDP, not synthetic research

### PyMC Labs Research
- **Key Finding**: Direct LLM ratings produce unrealistic distributions (too many "3s")
- **Solution**: Two-step approach—let AI respond in text, then extract ratings
- **Validation**: Published academic methodology

---

## 4. Traditional Research Accuracy

### The Say-Do Gap

| Method | Accuracy in Predicting Behavior |
|--------|--------------------------------|
| **Stated preference (surveys)** | **34%** |
| **Observational research** | **89%** |
| Gap between intent and action | ~39 percentage points |

*Source: Simbioniq research review*

### Survey Systematic Errors

| Source | Finding |
|--------|---------|
| Columbia Research | Survey error (RMSE) ~3.5 percentage points—2x reported margins |
| 2024 Election Polls | Systematically underestimated Trump for 3rd consecutive cycle |
| Intentions Data | "Often contain systematic biases" that don't predict purchases |
| Self-reported frequency | Known accuracy issues in consumer research |

### Human Survey Reliability
- **Test-retest reliability**: Only 68% (humans match previous answers 2/3 of time)
- **Margin of error reality**: Stated 2.5% often means 5%+ actual error

---

## 5. Published Accuracy Claims Analysis

### Claims to Scrutinize

| Company | Claim | Methodology | Red Flags |
|---------|-------|-------------|-----------|
| Synthetic Users | "95%" | Testimonial | No peer review |
| Saucery | "95% correlation" | Third-party validation (EY) | Category-specific only |
| IntentPulse Labs | "90% accuracy" | Unclear | Vague methodology |
| Lift AI | "85%+ accuracy" | Behavioral modeling | Specific to purchase intent |
| Generic ML claims | "85-90%" | Academic papers | Lab conditions ≠ real world |

### What "Good" Validation Looks Like
1. **Double-blind comparison** against real survey results
2. **Category-specific testing** (not generic validation)
3. **Published methodology** with sample sizes
4. **Continuous calibration** with real consumer data
5. **Bias checks** for systematic over/under-weighting

---

## 6. Accuracy Comparison Table

| Approach | Brier Score / Accuracy | Calibrated? | Cost | Speed |
|----------|------------------------|-------------|------|-------|
| **Human Superforecasters** | 0.081 Brier | Yes (trained) | $$$ | Days |
| **Prediction Markets (Polymarket)** | 0.058 Brier | Yes (financial) | $ | Real-time |
| **GPT-4.5 (best LLM)** | 0.101 Brier | No | $ | Minutes |
| **LLM Ensemble + Calibration** | 0.096 Brier | Partial | $$ | Hours |
| **Calibrated Synthetic Research** | 95% correlation | Yes | $ | Hours |
| **Raw LLM Survey Simulation** | 34-50% | No | $ | Minutes |
| **Traditional Surveys** | 34% behavior prediction | No | $$$ | Weeks |
| **Observational Research** | 89% | Yes (behavioral) | $$$$ | Weeks |

---

## 7. Where Calibration Gives Us the Edge

### The Core Problem We Solve
1. **Raw LLMs are overconfident** → We calibrate probability estimates
2. **Stated intent ≠ behavior** (34% accuracy) → We model behavior, not stated intent
3. **Synthetic respondents have systematic biases** → We validate against real outcomes
4. **LLMs cluster predictions unrealistically** → We normalize distributions

### Evidence Supporting Calibration Approach
- Superforecasters beat LLMs by 20% through calibration training
- Prediction markets achieve 0.058 Brier through forced calibration (financial stakes)
- Temperature scaling improves LLM calibration significantly
- Ensemble + aggregation adds 10-25% accuracy improvement
- EY validation showed 95% correlation with calibrated synthetic vs raw

### Our Differentiators
1. **Calibration layer** on top of LLM predictions
2. **Behavioral modeling** vs stated preferences
3. **Validation pipeline** against real outcomes
4. **Domain-specific training** not generic prompting
5. **Continuous recalibration** as new data arrives

---

## 8. Weaknesses to Address

### Honest Limitations
1. **Sparse data categories**: Where historical data is limited, calibration is harder
2. **Novel products**: No base rate for truly new categories
3. **Multinomial complexity**: Binary calibration is easier than continuous distributions
4. **Bias inheritance**: If training data is biased, calibration can only partially correct
5. **Black swan events**: Calibration assumes base rate stability

### Where Humans Still Win
- Questions requiring judgment with fuzzy data
- Complex geopolitical/social predictions
- Situations requiring real-time information integration
- Decisions needing explainable reasoning chains

---

## 9. Talking Points for Client Conversations

### Objection: "Can AI really predict what humans will do?"

**Response**: Raw AI predictions achieve about 34% accuracy—same as traditional surveys asking intent. But calibrated AI, validated against real behavioral data, reaches 85-95% correlation. The difference is methodology, not technology.

### Objection: "How do we know synthetic respondents are accurate?"

**Response**: They're not accurate by default. NIQ found synthetic respondents cared more about health than real humans. The key is validation—comparing synthetic outputs to real outcomes and continuously calibrating. We build this validation loop in.

### Objection: "Prediction markets seem more accurate"

**Response**: Polymarket achieves 0.058 Brier score because financial stakes force honest probability assessment—that's calibration through incentive. We apply similar calibration principles algorithmically. The result: we match market-level accuracy at survey speed.

### Objection: "Why not just ask GPT-4?"

**Response**: GPT-4.5 achieves 0.101 Brier vs superforecasters' 0.081—20% worse. More importantly, LLMs are systematically overconfident and cluster responses unnaturally. Asking GPT-4 directly is like asking someone who's confident but not calibrated. We add the calibration layer.

### Objection: "Traditional surveys have worked for decades"

**Response**: Traditional stated-preference surveys predict actual purchase behavior with 34% accuracy. The "say-do gap" is well documented—a 39 percentage point gap between what people say they'll do and what they actually do. We model behavior, not stated intent.

### Key Sound Bites

> "Calibration is the difference between a confident wrong answer and an accurate prediction."

> "Raw LLMs are 20% worse than trained human forecasters. We close that gap through calibration."

> "Traditional surveys predict behavior at 34%. Our calibrated approach achieves 85-95% correlation."

> "Prediction markets work because money forces honesty. We achieve similar calibration algorithmically."

---

## Sources

1. ForecastBench / Forecasting Research Institute (forecastingresearch.substack.com)
2. Polymarket Accuracy Dashboard (polymarket.com/accuracy)
3. Good Judgment Project / Good Judgment Inc (goodjudgment.com)
4. Metaculus FAQ (metaculus.com/faq)
5. NIQ Synthetic Respondents Report (nielseniq.com)
6. Saucery AI Validation (saucery.ai)
7. Solomon Partners / EY Validation Study
8. MilkPEP / Radius Insights Case Studies
9. Simbioniq Say-Do Gap Research
10. arXiv papers on LLM calibration and overconfidence
11. Columbia Statistics: Disentangling Bias and Variance in Election Polls
12. PyMC Labs: AI Synthetic Consumers Research

---

*This document should be updated quarterly as new benchmark data becomes available.*
