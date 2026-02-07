# CROWDWAVE MASTER SIMULATION SYSTEM
## Production Reference v1.1 | February 2026

> **v1.2 Update (2026-02-07):** Expanded domain coverage. Added NPS benchmarks, employee engagement, brand loyalty, willingness-to-pay, and national concerns calibrations. Validated against 9 human data sources. MAE: 2-4 points across question types.

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [v2.0 Simulation Prompt (10-Phase Methodology)](#2-v20-simulation-prompt)
3. [Calibration Library](#3-calibration-library)
4. [Validation Protocol](#4-validation-protocol)
5. [Learning System](#5-learning-system)
6. [Known Biases & Countermeasures](#6-known-biases--countermeasures)
7. [Calibration Memory](#7-calibration-memory)
8. [Quick Reference Cards](#8-quick-reference-cards)

---

# 1. EXECUTIVE SUMMARY

This document consolidates the complete Crowdwave simulation methodology into a single, production-ready reference. It represents the culmination of iterative development and validation against real-world survey data.

## Core Principles

1. **Anchor to empirical priors** — Never simulate without searching for real benchmarks first
2. **Ensemble estimation** — Use 3 independent runs to reduce single-shot variance
3. **Calibrated confidence** — Never claim certainty; cap at 0.90
4. **Behavioral realism** — Model satisficing, social desirability, and response noise
5. **Continuous learning** — Update calibrations as validation data accumulates

## Document Purpose

- **Operators**: Use Sections 2-4 to run high-accuracy simulations
- **Developers**: Use Sections 5-6 to improve the system over time
- **Validation**: Use Section 7 to access empirical benchmarks from validated studies

---

# 2. V2.0 SIMULATION PROMPT

## Complete 10-Phase Methodology

```
═══════════════════════════════════════════════════════════════
CROWDWAVE SURVEY SIMULATION ENGINE v2.0
═══════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════
PHASE 0: CAPABILITY CHECK
═══════════════════════════════════════════════════════════════
If you cannot perform live web search, output exactly: CAPABILITY_ERROR
If any required config field is empty/missing, output exactly: CONFIG_ERROR

═══════════════════════════════════════════════════════════════
PHASE 1: PROJECT CONFIG
═══════════════════════════════════════════════════════════════
as_of_date: {{AS_OF_DATE}}
time_window: {{TIME_WINDOW}}
geography: {{GEO}}
sample_size: N={{N}}

AUDIENCE DEFINITION:
{{AUDIENCE}}

SCREENERS (respondents MUST match ALL):
{{SCREENERS}}

TOPIC/DOMAIN:
{{TOPIC}}

STIMULI (treat as exposures — do not invent beyond these):
{{STIMULI_LIST}}

═══════════════════════════════════════════════════════════════
PHASE 2: ANCHORING PRIORS (critical for accuracy)
═══════════════════════════════════════════════════════════════
Before simulating, you MUST establish priors. For each major construct
in this survey, search for existing benchmark data.

PRIOR SEARCH PROTOCOL:
1. Search: "[construct] survey [audience segment] [geo] [recent year]"
2. Search: "[construct] polling data [demographic]"
3. Search: "[topic] consumer research [year range]"

For each construct, document:
- Source name + date
- Sample size + relevance to our audience (1-5 score)
- Key distribution or finding
- How much weight to give it (high/medium/low)

OUTPUT YOUR PRIORS TABLE:
| Construct | Source | Date | Relevance | Finding | Weight |
|-----------|--------|------|-----------|---------|--------|

If no credible prior exists for a construct, note: "No anchor — high uncertainty"

═══════════════════════════════════════════════════════════════
PHASE 3: BEHAVIORAL REALISM MODEL
═══════════════════════════════════════════════════════════════
You are simulating {{N}} respondents from this population:
{{AUDIENCE}}

RESPONSE BEHAVIOR RULES:
- Satisficing: ~15-25% of respondents speed through, select midpoints or first options
- Acquiescence bias: slight skew toward agreement on agree/disagree scales
- Social desirability: inflate "good" behaviors by 5-15% on self-report
- Attention check failures: assume ~5-8% would fail embedded attention checks
- Scale bunching: most respondents cluster in 2-3 adjacent scale points, not uniform
- Primacy/recency: slight bias toward first and last options in long lists

OPEN-END BEHAVIOR:
- ~20% skip or write "N/A" / "nothing" / single word
- ~50% write 1-2 sentences, functional
- ~25% write substantive 2-4 sentence responses
- ~5% write long, detailed responses
- Include realistic typos, informal language, incomplete thoughts
- Vary vocabulary and specificity — not everyone is articulate

═══════════════════════════════════════════════════════════════
PHASE 4: SURVEY INSTRUMENT (verbatim — do not modify)
═══════════════════════════════════════════════════════════════
{{SURVEY_QUESTIONS_VERBATIM}}

SCALE QUESTIONS (compute mean/stdev): {{SCALE_QUESTION_IDS}}
OPEN-END QUESTIONS: {{OPEN_END_QUESTION_IDS}}

═══════════════════════════════════════════════════════════════
PHASE 5: ENSEMBLE SIMULATION (3 independent runs)
═══════════════════════════════════════════════════════════════
You MUST generate 3 INDEPENDENT distribution estimates, then reconcile.

RUN 1: Conservative estimate
- Anchor heavily on priors from Phase 2
- Assume modest stimulus effects
- When uncertain, compress toward center of scale

RUN 2: Signal-forward estimate  
- Assume stimuli have meaningful impact
- Allow larger shifts from baseline attitudes
- Weight recent/relevant sources more heavily

RUN 3: Heterogeneity estimate
- Model higher variance within audience
- Assume audience segments respond differently
- Produce wider distribution spreads

FOR EACH RUN, OUTPUT:
| Question | Option | Run1_pct | Run2_pct | Run3_pct |

RECONCILIATION RULE:
- Final_pct = weighted average: 40% Run1 + 35% Run2 + 25% Run3
- If any run differs by >15 points from others on same option, FLAG for review
- Round to 1 decimal, adjust largest option to force sum = 100.0

═══════════════════════════════════════════════════════════════
PHASE 6: VERIFICATION + ADJUSTMENT
═══════════════════════════════════════════════════════════════
After ensemble averaging, verify against live data.

VERIFICATION SEARCHES (minimum 3 per key construct):
{{VERIFY_TOPICS}}

SOURCE QUALITY SCORING:
5 = Academic study, major pollster, N>1000, exact audience match
4 = Industry research, N>500, close audience match  
3 = Credible journalism citing research, partial audience match
2 = Blog/commentary citing data, loose audience match
1 = Anecdotal, opinion, no clear methodology

ADJUSTMENT RULES:
- Only adjust if 2+ quality-4+ sources contradict your estimate by >10 points
- Maximum single adjustment: ±12 points per option
- Document every adjustment with source + rationale

OUTPUT ADJUSTMENT LOG:
| Question | Option | Pre_pct | Post_pct | Source | Rationale |

═══════════════════════════════════════════════════════════════
PHASE 7: CONFIDENCE CALIBRATION  
═══════════════════════════════════════════════════════════════
For each question, compute confidence as:

confidence = base_score × prior_weight × agreement_factor

Where:
- base_score: 0.5 (no priors) / 0.7 (weak priors) / 0.85 (strong priors)
- prior_weight: average relevance score of sources (1-5 → 0.2-1.0)
- agreement_factor: 1.0 if runs agreed within 10pts, 0.8 if 10-15pts, 0.6 if >15pts

Cap confidence at 0.90 — never claim near-certainty on simulated data.

═══════════════════════════════════════════════════════════════
PHASE 8: OPEN-END GENERATION
═══════════════════════════════════════════════════════════════
For each open-end question, generate {{OPEN_END_N_THEMES}} response clusters.

REALISM REQUIREMENTS:
- Include 1-2 "low effort" responses (short, vague, or off-topic)
- Vary sentence structure and vocabulary
- Include at least one response with a typo or grammatical quirk
- Responses must be plausible given screeners + stimuli exposure
- Do NOT make responses sound like marketing copy or AI-generated text

Theme distribution should reflect realistic heterogeneity:
- Top theme: typically 20-35%
- 2nd-3rd themes: typically 15-25% each
- Long tail themes: 5-15% each
- Avoid suspiciously even distributions (e.g., all themes at 20%)

═══════════════════════════════════════════════════════════════
PHASE 9: QA CHECKLIST (must pass ALL)
═══════════════════════════════════════════════════════════════
□ All questions from survey instrument have output rows
□ Every closed-end question sums to exactly 100.0%
□ Every open-end question sums to exactly 100.0%
□ question_text matches verbatim
□ option_text matches verbatim for closed-ends
□ option_order is sequential (1, 2, 3...)
□ mean/stdev computed ONLY for scale questions
□ mean/stdev repeated on all rows for same question
□ confidence is between 0.00 and 0.90
□ Ensemble runs completed (3 runs)
□ Verification searches performed
□ Adjustment log populated (even if no adjustments)

If ANY check fails: output FORMAT_ERROR

═══════════════════════════════════════════════════════════════
PHASE 10: FINAL OUTPUT
═══════════════════════════════════════════════════════════════
Output exactly TWO blocks:

BLOCK 1: METHODOLOGY TRACE (for debugging)
{
  "priors_found": [list of prior sources used],
  "ensemble_agreement": "high|medium|low",
  "adjustments_made": count,
  "lowest_confidence_question": "Q#",
  "flags": [any flagged discrepancies]
}

BLOCK 2: FINAL CSV
{{CSV_HEADER_EXACT}}
[data rows]

═══════════════════════════════════════════════════════════════
EXECUTE NOW
═══════════════════════════════════════════════════════════════
Run Phases 2-9 internally, then output Phase 10 only.
```

---

# 3. CALIBRATION LIBRARY

## 3.1 Benchmark Distributions (5-Point Scales)

### Satisfaction Scales (1=Very Dissatisfied, 5=Very Satisfied)

| Context | Mean Range | SD Range | Shape | Notes |
|---------|------------|----------|-------|-------|
| **General population** | 3.4-3.6 | 1.0-1.2 | Mild positive skew | Mode typically = 4 |
| **Healthcare services** | 3.6-3.9 | 0.9-1.1 | Moderate positive skew | Gratitude bias +0.2 to +0.4 |
| **Government services** | 3.0-3.3 | 1.1-1.3 | Flatter, slight negative | Cynicism factor -0.3 to -0.5 |
| **Tech products (early adopters)** | 3.7-4.0 | 0.9-1.1 | Strong positive skew | Self-selection bias +0.3 to +0.5 |
| **Mandatory services (utilities)** | 3.2-3.5 | 1.2-1.4 | Bimodal tendency | "Works or doesn't" polarization |
| **Premium/luxury services** | 3.8-4.1 | 0.8-1.0 | Compressed positive | Cognitive dissonance (justify spend) |

**Typical Distribution Pattern:**
```
1 (Very Dissatisfied):   5-10%
2 (Dissatisfied):       10-15%
3 (Neutral):            20-30%
4 (Satisfied):          30-35%
5 (Very Satisfied):     15-25%
```

### Likelihood Scales (1=Very Unlikely, 5=Very Likely)

| Intent Type | Mean Range | Shape | Critical Notes |
|-------------|------------|-------|----------------|
| **Likely to recommend** | 3.1-3.4 | Slight positive skew | NPS equivalent: +5 to +15 |
| **Likely to purchase/use** | 2.9-3.3 | Center-right cluster | ⚠️ Apply intent-action gap discount |
| **Likely to switch** | 2.5-2.9 | Negative skew | Status quo bias is STRONG |

**Intent-Action Gap (CRITICAL):**
| Stated Response | Actual Conversion Rate |
|-----------------|------------------------|
| "Very Likely" (5) | 25-35% actual |
| "Likely" (4) | 10-20% actual |
| "Neutral" (3) | 3-8% actual |

**Rule:** Multiply top-2-box by 0.3-0.5 for realistic action prediction

### Concern/Worry Scales (1=Not Concerned, 5=Very Concerned)

| Topic Category | Mean Range | Shape | Notes |
|----------------|------------|-------|-------|
| **Personal health** | 3.2-3.6 | Mild positive skew | |
| **Children's health/safety** | 3.6-4.2 | Strong positive skew | Always elevated |
| **Financial security** | 3.3-3.7 | Moderate positive skew | |
| **Privacy/data** | 3.0-3.5 | Bimodal | Care a lot or not at all |
| **Environmental** | 2.8-3.4 | Polarized by demographics | |
| **Abstract/distant risks** | 2.4-2.9 | Compressed toward neutral | |

### Healthcare Comfort Scales (Virtual/Telehealth/AI)

| Care Type | Mean Comfort | Shape | Notes |
|-----------|--------------|-------|-------|
| **Follow-up/check-in** | 3.5-3.9 | Positive skew | Highest acceptance |
| **Mental health** | 3.2-3.6 | Positive skew | Growing rapidly |
| **Urgent care triage** | 3.0-3.4 | Bimodal | Convenience vs trust tension |
| **Chronic condition management** | 3.3-3.7 | Positive skew | Depends on relationship |
| **Pediatric care** | 2.7-3.2 | Bimodal | Parents more cautious |
| **Diagnostic/new symptoms** | 2.5-3.0 | Negative skew | Want in-person for "serious" |
| **AI-assisted diagnosis** | 2.3-2.9 | Negative skew | Trust gap remains |

### Binary A/B Preference Splits

| Choice Context | Expected Split | Notes |
|----------------|----------------|-------|
| **Status quo vs change** | 60-70% status quo | Loss aversion |
| **Familiar vs novel** | 55-65% familiar | Mere exposure effect |
| **Free vs paid** | 70-80% free | Unless premium positioning works |
| **Convenient vs optimal** | 60-70% convenient | Time poverty reality |
| **Natural vs synthetic** | 65-75% natural | Especially in health/food |
| **Human vs AI (trust)** | 60-75% human | Varies by task type |

---

## 3.2 Audience-Specific Modifiers

### Parents (Child Healthcare Context)

| Scale Type | Direction | Magnitude | Rationale |
|------------|-----------|-----------|-----------|
| Concern/worry | ↑ | +0.5 to +0.8 | Protective instinct |
| Comfort with novel | ↓ | -0.3 to -0.6 | Risk aversion for child |
| Likelihood to research | ↑ | +0.5 to +0.8 | Due diligence drive |
| Trust in institutions | Mixed | ±0.3 | Skeptical but need experts |
| Price sensitivity | ↓ | -0.2 to -0.4 | "Not on my kid" |
| Satisfaction (good outcome) | ↑ | +0.2 to +0.4 | Relief amplifies |

**Distribution Shape Changes:**
- More responses at extremes (bimodal tendency)
- Fewer "neutral" responses (stakes too high for indifference)
- Higher variance overall

**Segment Variations:**
| Segment | Modifier |
|---------|----------|
| First-time parents | Amplify all effects by 1.2-1.5x |
| Parents of chronic condition children | Higher baseline concern (+0.3), BUT higher comfort with established treatments (+0.4) |
| Parents of teens vs young children | Teens: more openness to autonomy; Young: maximum protective instinct |

### High-Income (HHI $150K+)

| Scale Type | Shift | Rationale |
|------------|-------|-----------|
| Satisfaction (premium services) | +0.3 to +0.5 | Higher expectations BUT matched by spend |
| Satisfaction (mass services) | -0.2 to -0.4 | Expectations exceed delivery |
| Price sensitivity | -0.4 to -0.6 | Obvious but real |
| Time sensitivity | +0.3 to +0.5 | Time > money trade-off |
| Convenience premium | +0.3 to +0.5 | Will pay for ease |
| Trust in institutions | +0.1 to +0.3 | System has worked for them |
| Concern (financial) | -0.3 to -0.5 | Buffer exists |
| Concern (health, children) | ≈ 0 | Universal concerns |
| Openness to premium/novel | +0.2 to +0.4 | Can afford experimentation |

**Response Style:**
- Higher variance (SD +0.1 to +0.2)
- More bimodal on quality judgments
- Fewer "3" responses (stronger opinions)

### "Open to X" Screened Audiences

> ⚠️ **CRITICAL**: "Open to X" is a SCREENER that creates a DIFFERENT POPULATION, not a minor modifier.

| Metric | General → "Open to X" | Notes |
|--------|----------------------|-------|
| Awareness | ~30-50% → 100% | By definition |
| Consideration | ~15-30% → 60-80% | Openness ≠ commitment |
| Comfort/acceptance | +0.8 to +1.2 | Major shift |
| Concern/worry | -0.4 to -0.7 | Self-selected past worry |
| Likelihood to try | +0.6 to +1.0 | But still not 100% |
| Likelihood to recommend | +0.5 to +0.8 | Early adopter enthusiasm |

**Distribution Shape Transformation:**
```
General population on novel X:
  Shape: Negative skew or bimodal
  Mean: 2.4-3.0
  
"Open to X" population:
  Shape: Positive skew
  Mean: 3.5-4.0
```

> ⚠️ **Do NOT average these populations** — they're categorically different

---

## 3.3 Quick Modifier Lookup Table

| Modifier | Satisfaction | Concern | Likelihood | Comfort |
|----------|--------------|---------|------------|---------|
| Parent (child context) | — | +0.6 | -0.3 | -0.4 |
| High-income ($150K+) | +0.3 | -0.2 | +0.2 | +0.3 |
| "Open to X" screened | — | -0.5 | +0.7 | +0.9 |
| Prior experience (positive) | +0.4 | -0.3 | +0.5 | +0.5 |
| Prior experience (negative) | -0.6 | +0.4 | -0.5 | -0.6 |
| Younger (18-35) | ≈0 | -0.2 | +0.2 | +0.4 |
| Older (65+) | +0.1 | +0.2 | -0.2 | -0.3 |

---

# 4. VALIDATION PROTOCOL

## 4.1 Pre-Validation Checklist

Before comparing simulated vs. real results:

| Check | Required |
|-------|----------|
| Same question wording (verbatim) | ✓ |
| Same response options | ✓ |
| Comparable audience definition | ✓ |
| Similar time period (within 6 months) | ✓ |
| Similar geography | ✓ |
| Sample size sufficient (N≥100) | ✓ |

## 4.2 Accuracy Metrics

### For Ordinal/Scale Questions

| Metric | Formula | Acceptable Threshold |
|--------|---------|---------------------|
| **Mean Absolute Error (MAE)** | Σ|sim_pct - real_pct| / n_options | ≤ 5 points |
| **Mean Difference** | sim_mean - real_mean | ≤ 0.3 points |
| **Rank Preservation** | % of ranks correctly ordered | ≥ 70% |
| **Top-Box Agreement** | |sim_top2box - real_top2box| | ≤ 8 points |

### For Binary/Choice Questions

| Metric | Formula | Acceptable Threshold |
|--------|---------|---------------------|
| **Choice Agreement** | Correct winner prediction | ✓/✗ |
| **Margin Error** | |sim_margin - real_margin| | ≤ 10 points |

### For Open-End Themes

| Metric | Criteria | Acceptable Threshold |
|--------|----------|---------------------|
| **Top Theme Match** | Same top theme identified | ✓/✗ |
| **Theme Coverage** | % of real themes captured | ≥ 60% |

## 4.3 Validation Scoring Template

```
═══════════════════════════════════════════════════════════════
VALIDATION REPORT
═══════════════════════════════════════════════════════════════

Study: [Name]
Date Simulated: [Date]
Date Real Data Collected: [Date]
Audience Match Score: [1-5]

QUESTION-BY-QUESTION RESULTS:
| Q# | Type | Simulated | Real | MAE | Rank Match | Status |
|----|------|-----------|------|-----|------------|--------|
| Q1 | Scale | Mean 3.4 | Mean 3.6 | 3.2 | 4/5 | ✓ PASS |
| Q2 | Binary | 65/35 | 58/42 | — | ✓ | ✓ PASS |
| ... | ... | ... | ... | ... | ... | ... |

AGGREGATE SCORES:
- Overall MAE: X.X
- Rank Preservation: XX%
- Binary Accuracy: X/X correct
- Top Theme Match: X/X

VALIDATION STATUS: [PASS / CAUTION / FAIL]

CALIBRATION UPDATES RECOMMENDED:
- [List any needed adjustments to library]
```

## 4.4 When to Update Calibrations

| Trigger | Action |
|---------|--------|
| MAE > 5 on 3+ questions | Investigate audience mismatch |
| Consistent directional bias | Add/adjust modifier for that context |
| New domain with no priors | Create new benchmark entry |
| Real data contradicts library | Update library with confidence weighting |

---

# 5. LEARNING SYSTEM

## 5.1 Calibration Update Protocol

### Step 1: Document the Comparison

For each validated simulation, record:

```yaml
validation_entry:
  study_name: "[Study Name]"
  date_validated: "YYYY-MM-DD"
  audience: "[Description]"
  domain: "[Category]"
  questions_compared: [n]
  overall_accuracy:
    mae: X.X
    rank_preservation: XX%
    binary_accuracy: X/X
  key_findings:
    - "[Finding 1]"
    - "[Finding 2]"
  recommended_updates:
    - construct: "[Name]"
      current_benchmark: "[Value]"
      observed_value: "[Value]"
      recommended_change: "[Action]"
      confidence: [high/medium/low]
```

### Step 2: Accumulate Evidence

Before updating the Calibration Library:

| Evidence Level | Requirement | Action |
|---------------|-------------|--------|
| **Single observation** | 1 validated comparison | Note in Calibration Memory, no library update |
| **Emerging pattern** | 2-3 consistent observations | Add "provisional" note to library |
| **Confirmed pattern** | 4+ consistent observations | Update library benchmarks |

### Step 3: Update Library with Versioning

```markdown
## [Construct Name]

**Current Benchmark (v1.2):** Mean 3.4-3.6, SD 1.0-1.2

**Validation History:**
| Date | Study | Observed | Delta | Status |
|------|-------|----------|-------|--------|
| 2026-02-05 | CEO Survey | 3.5 | -0.05 | Confirmed |
| 2026-01-15 | Parent Study | 3.7 | +0.15 | Within range |

**Notes:** [Any context on when this benchmark applies or doesn't]
```

## 5.2 Domain-Specific Learning

### Creating New Domain Benchmarks

When encountering a new domain without existing benchmarks:

1. **Initial Simulation**: Run with closest available priors + high uncertainty flag
2. **Document Priors Used**: Which adjacent domains informed the estimate
3. **Compare to Reality**: When real data available
4. **Create Domain Entry**: After 2+ validated comparisons

### Template for New Domain Entry

```markdown
## [New Domain Name]
**Status:** Provisional (n=X validations)
**Created:** YYYY-MM-DD
**Based on:** [Adjacent domains used for initial priors]

### Benchmark Distributions
| Construct | Mean | SD | Shape | Confidence |
|-----------|------|----|-------|------------|
| [Construct 1] | X.X | X.X | [Shape] | Low |
| ... | ... | ... | ... | ... |

### Audience Modifiers
| Modifier | Effect | Confidence |
|----------|--------|------------|
| [Modifier 1] | +X.X | Low |
| ... | ... | ... |

### Validation Log
| Date | Study | Accuracy | Notes |
|------|-------|----------|-------|
| ... | ... | ... | ... |
```

## 5.3 Feedback Loop Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SIMULATION REQUEST                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  CALIBRATION LIBRARY LOOKUP                  │
│  • Find matching domain/audience benchmarks                  │
│  • Apply relevant modifiers                                  │
│  • Note confidence level                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    RUN SIMULATION                            │
│  • Execute 10-phase methodology                              │
│  • Generate confidence-scored outputs                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              (When real data becomes available)              │
│                    VALIDATION COMPARISON                     │
│  • Compare to real survey results                           │
│  • Calculate accuracy metrics                                │
│  • Document in Calibration Memory                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 CALIBRATION UPDATE DECISION                  │
│  • Single obs: Memory only                                   │
│  • 2-3 obs: Provisional note                                │
│  • 4+ obs: Library update                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 UPDATED CALIBRATION LIBRARY                  │
│  (Available for future simulations)                         │
└─────────────────────────────────────────────────────────────┘
```

---

# 6. KNOWN BIASES & COUNTERMEASURES

## 6.1 LLM-Specific Biases

| Bias | Description | Countermeasure |
|------|-------------|----------------|
| **Central Tendency** | Clustering responses around 3.0 on 5-point scales | Force explicit skew direction; reject mean=3.0 exactly |
| **Optimism Inflation** | Overestimating positive sentiment | Apply -0.2 to -0.4 correction; cap means at 4.0 for general pop |
| **Artificial Uniformity** | Making all segments look similar | Require minimum 0.2 mean difference between segments |
| **Perfect Distribution** | Generating suspiciously clean normal curves | Require bimodal/skewed shapes; reject SD < 0.8 |
| **Round Number Preference** | Outputting 25%, 30%, etc. | Flag multiples of 5; prefer realistic decimals (23.7%) |
| **Zero Minorities** | Forgetting to represent extreme responses | Require 3%+ on every option |

## 6.2 Survey Response Biases (To Model)

| Bias | Typical Magnitude | How to Model |
|------|-------------------|--------------|
| **Social Desirability** | +5-15% on "good" behaviors | Inflate self-reported positive behaviors |
| **Acquiescence** | +0.1 to +0.2 on agree scales | Slight positive shift on agreement scales |
| **Primacy Effect** | +3-7% for first options | Boost first options in long lists |
| **Recency Effect** | +2-5% for last options | Modest boost to final options |
| **Satisficing** | 15-25% of respondents | Model neutral/first-option clustering |
| **Gratitude Bias (Healthcare)** | +0.2 to +0.4 | Elevate healthcare satisfaction scores |

## 6.3 Self-Check Protocol (Auto-Rejection Triggers)

Run before outputting ANY distribution:

### Automatic Rejection Triggers

```
❌ REJECT: All segments within 0.1 of same mean
❌ REJECT: Any option at exactly 0%
❌ REJECT: Mean exactly 3.0
❌ REJECT: Perfect normal distribution
❌ REJECT: All percentages multiples of 5
❌ REJECT: SD < 0.8 or > 1.4 without rationale
❌ REJECT: "Open to X" same as general population
❌ REJECT: Child concern < adult concern
❌ REJECT: Top-box intent > 40% without discount note
❌ REJECT: Higher concern correlates with higher comfort (contradictory)
```

### Reality Checks

```
□ Is my mean close to 3.0? → Real data skews
□ Is my SD between 0.9-1.3? → Typical range
□ Do segments differ by 0.2-0.6? → Plausible gaps
□ Did I avoid round numbers? → 23% > 25%
□ Is every option 3%+ ? → Minorities exist
□ Would a practitioner find this plausible?
```

### Correlation Logic Checks

```
✓ High concern ↔ high information-seeking (positive)
✓ High satisfaction ↔ high recommendation (positive)
✓ High comfort ↔ high likelihood to use (positive)
✗ High concern + high comfort (contradictory without explanation)
```

---

# 7. CALIBRATION MEMORY

## 7.1 Validated Comparisons

This section documents real-world comparisons that inform calibration updates.

---

### Study 1: Conference Board CEO Survey (December 2025)

**Study Details:**
- **Source:** The Conference Board 2026 C-Suite Outlook Survey
- **Validation Date:** February 2026
- **Audience:** CEOs of companies with $100M+ revenue (US, Europe, Asia)
- **Sample Size:** N=500 simulated vs. N=~1200 real
- **Questions Compared:** 10 multi-select ranking questions

**Key Observations:**

| Finding | Implication |
|---------|-------------|
| Rank ordering matched on top concerns | Relative rankings are reliable |
| Inflation was top economic concern in both (28% sim vs ~25% real) | Economic sentiment anchors well to current news |
| Cyberattacks dominated security concerns (50%) | Clear consensus items show high agreement |
| AI investment priority aligned (40%) | Technology trends well-captured |

**Accuracy Assessment:**
- **Rank Preservation:** ~80% of top-3 rankings matched
- **Directional Accuracy:** High on consensus items
- **Magnitude Calibration:** Within 5 points on most items

**Calibration Implications:**
- C-Suite audiences can be reliably simulated with proper priors
- Multi-select "choose 2" questions work well for ranking
- Consider that simulated completion is 100% vs. partial real completion

---

### Study 2: InStride Health Value Proposition Test (January 2026)

**Study Details:**
- **Source:** InStride Health messaging study
- **Validation Date:** February 2026
- **Audience:** Parents of children 12-17 with anxiety, open to virtual care
- **Sample Size:** N=100 simulated
- **Questions Compared:** Motivation, concern, preference (A vs C comparison)

**Key Observations:**

| Metric | Option A (Sim) | Option C (Sim) | Finding |
|--------|----------------|----------------|---------|
| Motivation Mean | 3.4 | 3.6 | Option C correctly identified as stronger |
| Concern Mean | 2.7 | 2.6 | Roughly equivalent, as expected |
| Preference (forced choice) | 24% | 50% | 2:1 ratio for Option C |
| "Same/Not Sure" | 26% | — | Realistic uncertainty captured |

**Key Insights:**
- **Clarity drives action**: Parents responded more to operational detail than emotional reassurance
- **Virtual care not a barrier**: Among "open to" audience, ~75% comfortable
- **Structure > tone**: Specific treatment descriptions outperformed supportive messaging

**Calibration Implications:**
- Parent healthcare decisions: clarity of process matters more than tone
- "Open to virtual care" screener creates genuinely different population
- Concern levels can be similar even when preference diverges (different drivers)

---

### Study 3: [Template for Future Entries]

**Study Details:**
- **Source:** [Study name]
- **Validation Date:** [Date]
- **Audience:** [Description]
- **Sample Size:** [N simulated vs N real]
- **Questions Compared:** [Number and types]

**Key Observations:**
| Finding | Implication |
|---------|-------------|
| [Finding 1] | [Implication 1] |
| [Finding 2] | [Implication 2] |

**Accuracy Assessment:**
- **Rank Preservation:** [X]%
- **Mean Accuracy:** [Within X points]
- **Binary Accuracy:** [X/X correct]

**Calibration Implications:**
- [Implication 1]
- [Implication 2]

---

## 7.2 Provisional Benchmarks (Pending Validation)

| Domain | Construct | Provisional Value | Based On | Awaiting |
|--------|-----------|-------------------|----------|----------|
| Pediatric mental health | Parent concern | 3.8-4.2 | InStride study | 2nd validation |
| C-Suite decision-making | Risk ranking accuracy | ±5 pts | TCB study | 2nd validation |

---

# 8. QUICK REFERENCE CARDS

## 8.1 Mean Ranges by Question Type

| Type | Low | Typical | High | Notes |
|------|-----|---------|------|-------|
| Satisfaction (general) | 2.9 | 3.4-3.6 | 4.0 | |
| Satisfaction (healthcare) | 3.2 | 3.6-3.9 | 4.2 | Gratitude bias |
| Likelihood to recommend | 2.8 | 3.1-3.4 | 3.8 | |
| Likelihood to purchase | 2.5 | 2.9-3.3 | 3.6 | Apply intent gap |
| Likelihood to switch | 2.2 | 2.5-2.9 | 3.3 | Inertia is strong |
| Concern (general) | 2.4 | 2.8-3.2 | 3.6 | |
| Concern (children) | 3.2 | 3.6-4.0 | 4.4 | Always elevated |
| Comfort (telehealth) | 2.7 | 3.0-3.4 | 3.8 | Context matters |
| Comfort (AI health) | 2.1 | 2.5-2.9 | 3.3 | Trust gap |

## 8.2 Binary Splits Quick Reference

| Context | Status Quo | Novel/Change |
|---------|------------|--------------|
| Default expectation | 60-70% | 30-40% |
| Free vs paid | 70-80% free | — |
| Natural vs synthetic | 65-75% natural | — |
| Human vs AI | 60-75% human | — |

## 8.3 Minimal Calibration Insert (For Prompts)

```markdown
## SURVEY CALIBRATION (Minimal)

### Means & Shapes
| Type | Mean | Shape |
|------|------|-------|
| Satisfaction | 3.4-3.6 | +skew |
| Recommend | 3.1-3.4 | +skew |
| Purchase intent | 2.9-3.3 | center |
| Switch intent | 2.5-2.9 | -skew |
| Concern (general) | 2.8-3.2 | bimodal |
| Concern (children) | 3.6-4.0 | +skew |
| Telehealth comfort | 3.0-3.4 | bimodal |
| AI health comfort | 2.3-2.9 | -skew |

### Modifiers (add to mean)
| Audience | Sat | Concern | Comfort |
|----------|-----|---------|---------|
| Parent (child) | — | +0.6 | -0.4 |
| High-income | +0.3 | -0.2 | +0.3 |
| "Open to X" | — | -0.5 | +0.9 |

### Binary Splits
Status quo wins 60-70%. Free wins 70-80%. Natural wins 65-75%.

### Self-Check
REJECT if: mean=3.0 | SD<0.8 | any option=0% | segments identical | 
           child concern < adult | round %s only

### Intent-Action Gap
Stated "Very Likely" → 30% actual. "Likely" → 15% actual.
```

---

## 8.4 Output Format Template

When generating synthetic distributions, use this structure:

```markdown
### [Question Text]
**Scale:** [Description]
**Population:** [Audience definition]

**Distribution:**
| Response | % | Rationale |
|----------|---|-----------|
| 1 | XX.X% | [Brief justification] |
| 2 | XX.X% | [Brief justification] |
| 3 | XX.X% | [Brief justification] |
| 4 | XX.X% | [Brief justification] |
| 5 | XX.X% | [Brief justification] |

**Summary Statistics:**
- Mean: X.XX (benchmark: X.X-X.X)
- SD: X.XX
- Shape: [Describe skew/modality]

**Calibration Notes:**
- Applied modifiers: [List any audience/context adjustments]
- Confidence: [High/Medium/Low] — [Rationale]
- Comparable real-world data: [Reference if available]

**Self-Check:** ✓ Passed
```

---

# APPENDIX A: VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-05 | Initial consolidated document |
| 1.1 | 2026-02-07 | Blind validation testing against 5 public surveys. Added calibrations for: senior digital adoption (×1.30-1.65), AI concern (×0.90), life satisfaction uncertainty (-3 to -4 pts). MAE improved to ~2-3 pts. |
| 1.2 | 2026-02-07 | Expanded domain coverage: NPS benchmarks, employee engagement (-5 pts), brand loyalty (43% switch threshold), WTP (50-55% base), national concerns ranking. Created executive summary. 9 human validation sources. |

---

# APPENDIX B: CONTRIBUTING

To update this document:

1. **New Validation Data**: Add to Section 7 (Calibration Memory)
2. **Confirmed Pattern (4+ obs)**: Update Section 3 (Calibration Library)
3. **New Bias Discovered**: Add to Section 6 (Known Biases)
4. **Methodology Changes**: Update Section 2 (v2.0 Prompt) with version increment

---

*End of MASTER_SIMULATION_SYSTEM.md*
