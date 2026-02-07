# Survey Simulation Calibration Library
## Version 1.0 | Synthetic Response Distribution Framework

---

## Purpose

This library provides empirically-grounded benchmark distributions and calibration protocols for generating realistic synthetic survey responses. Use these anchors to avoid common LLM biases (central tendency, optimism bias, artificial uniformity).

---

# PART 1: BENCHMARK DISTRIBUTIONS

## 1.1 Satisfaction Scales (1-5, where 5 = Very Satisfied)

### General Population Baseline
```
Distribution: Mild Positive Skew
1 (Very Dissatisfied):  5-10%
2 (Dissatisfied):       10-15%
3 (Neutral):            20-30%
4 (Satisfied):          30-35%
5 (Very Satisfied):     15-25%

Mean: 3.4-3.6 | Mode: 4 | SD: 1.0-1.2
```

### By Context Modifiers

| Context | Shape | Mean Shift | Notes |
|---------|-------|------------|-------|
| Healthcare services | Moderate positive skew | +0.2 to +0.4 | Gratitude bias in medical settings |
| Government services | Flatter, slight negative | -0.3 to -0.5 | Cynicism factor |
| Tech products (early adopters) | Strong positive skew | +0.3 to +0.5 | Self-selection bias |
| Mandatory services (utilities) | Bimodal tendency | ±0.2 | "Works or doesn't" polarization |
| Premium/luxury services | Compressed positive | +0.4 to +0.6 | Cognitive dissonance (justify spend) |

### Warning Signs (Unrealistic Patterns)
- ❌ Mean > 4.2 for general services (too optimistic)
- ❌ Mean < 2.8 for functional services (too pessimistic)
- ❌ SD < 0.8 (artificially narrow)
- ❌ Perfectly symmetric distribution (real data skews)

---

## 1.2 Likelihood Scales (1-5, where 5 = Very Likely)

### Behavioral Intent Baseline
```
Distribution: Question-Dependent (see below)
```

### By Intent Type

#### "Likely to recommend" (NPS-adjacent)
```
1 (Very Unlikely):   8-15%
2 (Unlikely):        12-18%
3 (Neutral):         25-35%
4 (Likely):          20-28%
5 (Very Likely):     12-20%

Mean: 3.1-3.4 | Typical NPS equivalent: +5 to +15
```

#### "Likely to purchase/use" (Stated Intent)
```
⚠️ CRITICAL: Apply Intent-Action Gap Discount

Stated "Very Likely" (5):     25-35% actual conversion
Stated "Likely" (4):          10-20% actual conversion
Stated "Neutral" (3):         3-8% actual conversion

Rule: Multiply top-2-box by 0.3-0.5 for realistic action prediction
```

#### "Likely to switch/change" (Inertia Context)
```
1 (Very Unlikely):   20-30%
2 (Unlikely):        20-25%
3 (Neutral):         25-30%
4 (Likely):          12-18%
5 (Very Likely):     5-12%

Mean: 2.5-2.9 | Note: Status quo bias is STRONG
```

### Warning Signs
- ❌ "Likely to recommend" mean > 3.8 (social desirability inflation)
- ❌ "Likely to switch" mean > 3.5 (underestimating inertia)
- ❌ No difference between "intent" and "action" projections

---

## 1.3 Concern/Worry Scales (1-5, where 5 = Very Concerned)

### General Population Baseline
```
Distribution: Topic-Dependent Bimodal Tendency

Low-salience topics:
  Mean: 2.6-3.0 | Many "not concerned" + neutral cluster

High-salience topics (health, safety, children):
  Mean: 3.4-3.9 | Positive skew toward concern
```

### By Topic Category

| Topic | Mean Range | Distribution Shape |
|-------|------------|-------------------|
| Personal health | 3.2-3.6 | Mild positive skew |
| Children's health/safety | 3.6-4.2 | Strong positive skew |
| Financial security | 3.3-3.7 | Moderate positive skew |
| Privacy/data | 3.0-3.5 | Bimodal (care a lot or not at all) |
| Environmental | 2.8-3.4 | Polarized by demographics |
| Abstract/distant risks | 2.4-2.9 | Compressed toward neutral |

### Concern Intensity Calibration
```
When concern is ACTIONABLE (can do something):
  → Higher variance, more extreme responses
  
When concern is ABSTRACT (systemic, distant):
  → Compressed toward middle, "concerned but not losing sleep"
```

### Warning Signs
- ❌ Concern about children's health mean < 3.5 (unrealistically low)
- ❌ Concern about abstract risks mean > 3.8 (unrealistically high)
- ❌ Uniform distribution across concern topics (real concern varies by topic)

---

## 1.4 Binary Preference Questions (A vs B)

### Baseline Expectation
```
Rarely 50/50 — Real preferences cluster around:
  - 55/45 to 65/35 (weak preference)
  - 70/30 to 80/20 (moderate preference)
  - 85/15+ (strong preference, often with dominant option)
```

### Modifier Table

| Context | Expected Split | Notes |
|---------|---------------|-------|
| Status quo vs change | 60-70% status quo | Loss aversion |
| Familiar vs novel | 55-65% familiar | Mere exposure effect |
| Free vs paid (even if paid is "better") | 70-80% free | Unless premium positioning works |
| Convenient vs optimal | 60-70% convenient | Time poverty reality |
| Natural vs synthetic | 65-75% natural | Especially in health/food contexts |
| Human vs AI (trust contexts) | 60-75% human | Varies by task type |

### When to Expect Near 50/50
- Genuinely novel trade-offs with no prior mental model
- Well-matched alternatives in familiar categories
- Highly segmented audiences (aggregate masks real clustering)

### Warning Signs
- ❌ Exactly 50/50 split (suspiciously convenient)
- ❌ 90/10+ without strong contextual reason
- ❌ Same split across different audience segments

---

## 1.5 Healthcare Comfort Scales (Telehealth, Virtual Care, AI-Assisted)

### "Comfort with Virtual/Telehealth" Baseline
```
Distribution: Bimodal with Growing Acceptance

Very Uncomfortable (1):  10-18%
Uncomfortable (2):       15-22%
Neutral (3):             20-28%
Comfortable (4):         22-30%
Very Comfortable (5):    12-20%

Mean: 3.0-3.4 | Post-COVID shift: +0.3 to +0.5 vs 2019
```

### By Care Type

| Care Type | Mean Comfort | Notes |
|-----------|--------------|-------|
| Follow-up/check-in | 3.5-3.9 | Highest acceptance |
| Mental health | 3.2-3.6 | Growing rapidly |
| Urgent care triage | 3.0-3.4 | Convenience vs trust tension |
| Chronic condition management | 3.3-3.7 | Depends on relationship |
| Pediatric care | 2.7-3.2 | Parents more cautious |
| Diagnostic/new symptoms | 2.5-3.0 | Want in-person for "serious" |
| AI-assisted diagnosis | 2.3-2.9 | Trust gap remains |

### Critical Modifiers
```
+ Has used telehealth before: +0.4 to +0.7
+ Younger (18-35): +0.3 to +0.5
+ Rural/access barriers: +0.2 to +0.4
+ Tech-savvy self-ID: +0.3 to +0.5

- Has children (for pediatric): -0.3 to -0.5
- Older (65+): -0.2 to -0.4
- Previous bad telehealth experience: -0.5 to -0.8
- Complex health conditions: -0.2 to -0.4
```

### Warning Signs
- ❌ Pediatric telehealth comfort > adult care comfort
- ❌ AI diagnosis comfort > human telehealth comfort
- ❌ No comfort difference between follow-up and new diagnosis
- ❌ Mean > 4.0 for any healthcare modality shift

---

# PART 2: AUDIENCE-SPECIFIC MODIFIERS

## 2.1 Parents Making Healthcare Decisions for Children

### Core Psychology
```
Heightened stakes → More conservative, more research, more worry
"My child" > "myself" in risk sensitivity
Information-seeking is HIGH but trust is SELECTIVE
```

### Modifier Effects

| Scale Type | Direction | Magnitude | Rationale |
|------------|-----------|-----------|-----------|
| Concern/worry | ↑ | +0.4 to +0.8 | Protective instinct |
| Comfort with novel approaches | ↓ | -0.3 to -0.6 | Risk aversion for child |
| Likelihood to research | ↑ | +0.5 to +0.8 | Due diligence drive |
| Trust in institutions | Mixed | ±0.3 | Skeptical but need experts |
| Price sensitivity | ↓ | -0.2 to -0.4 | "Not on my kid" |
| Satisfaction (when good outcome) | ↑ | +0.2 to +0.4 | Relief amplifies |

### Segment Variations
```
First-time parents: Amplify all effects by 1.2-1.5x
Parents of children with chronic conditions: 
  - Higher baseline concern (+0.3)
  - BUT higher comfort with established treatments (+0.4)
  - More nuanced, less binary responses
  
Parents of teens vs young children:
  - Teens: More openness to autonomy-supporting options
  - Young children: Maximum protective instinct
```

### Distribution Shape Changes
```
Standard question → Parent context:
- More responses at extremes (bimodal tendency)
- Fewer "neutral" responses (stakes too high for indifference)
- Higher variance overall
```

---

## 2.2 High-Income vs General Population

### Definition Anchors
```
"High-income" operational definition:
  - HHI $150K+ (top ~15% US)
  - HHI $200K+ (top ~8% US)
  - Adjust for geography (NYC $200K ≈ Midwest $120K)
```

### Modifier Effects

| Scale Type | High-Income Shift | Rationale |
|------------|------------------|-----------|
| Satisfaction (premium services) | +0.3 to +0.5 | Higher expectations BUT matched by spend |
| Satisfaction (mass services) | -0.2 to -0.4 | Expectations exceed delivery |
| Price sensitivity | -0.4 to -0.6 | Obvious but real |
| Time sensitivity | +0.3 to +0.5 | Time > money trade-off |
| Convenience premium | +0.3 to +0.5 | Will pay for ease |
| Trust in institutions | +0.1 to +0.3 | System has worked for them |
| Concern (financial) | -0.3 to -0.5 | Buffer exists |
| Concern (health, children) | ≈ 0 | Universal concerns |
| Openness to premium/novel | +0.2 to +0.4 | Can afford experimentation |

### Response Style Differences
```
High-income respondents tend to:
- Give more differentiated responses (use full scale)
- Have stronger opinions (fewer neutrals)
- Be more critical (higher standards)
- Show less social desirability bias (less to prove)

Distribution effect:
- Slightly higher variance (SD +0.1 to +0.2)
- More bimodal on quality judgments
- Fewer "3" responses
```

### Warning Signs
- ❌ High-income more price-sensitive than general pop
- ❌ No difference in convenience/time valuations
- ❌ Higher satisfaction with budget services

---

## 2.3 "Open to X" vs General Audience

### Critical Framing
```
"Open to X" is a SCREENER that fundamentally changes the population:
- Already past awareness barrier
- Already past initial rejection
- Self-selected for at least curiosity

This is NOT a small adjustment — it's a different population.
```

### Magnitude of Shift

| Metric | General → "Open to X" | Notes |
|--------|----------------------|-------|
| Awareness | ~30-50% → 100% | By definition |
| Consideration | ~15-30% → 60-80% | Openness ≠ commitment |
| Comfort/acceptance | +0.8 to +1.2 | Major shift |
| Concern/worry | -0.4 to -0.7 | Self-selected past worry |
| Likelihood to try | +0.6 to +1.0 | But still not 100% |
| Likelihood to recommend | +0.5 to +0.8 | Early adopter enthusiasm |

### Distribution Shape Transformation
```
General population on novel X:
  Shape: Negative skew or bimodal
  Mean: 2.4-3.0
  Heavy clustering at low end
  
"Open to X" population:
  Shape: Positive skew
  Mean: 3.5-4.0
  Heavy clustering at high end
  
WARNING: Do not average these populations — they're categorically different
```

### Conversion Reality Check
```
Even "Open to X" audiences:
- "Very Likely" stated intent → 40-60% actual trial
- "Likely" stated intent → 20-35% actual trial

Still apply intent-action gap, just less severe than general pop
```

### Warning Signs
- ❌ "Open to" audience has same distribution as general
- ❌ "Open to" audience shows high concern (contradicts screener)
- ❌ Treating "open to" results as representative of total market

---

# PART 3: SELF-CHECK PROTOCOL

## Pre-Output Validation Checklist

Before outputting any synthetic distribution, run through these checks:

### Check 1: Central Tendency Audit
```
□ Is my mean too close to 3.0? 
  → Real data typically skews; perfect center is suspicious
  
□ Am I defaulting to normal distribution?
  → Most survey data is NOT normally distributed
  
□ Is my SD realistic (typically 0.9-1.3 for 5-point scales)?
  → SD < 0.8 suggests artificial compression
  → SD > 1.4 suggests unrealistic polarization
```

### Check 2: Skew Direction Verification
```
□ Does my skew match the question valence?
  → Satisfaction: Usually mild positive skew
  → Concern: Usually positive skew (toward concerned)
  → Likelihood to switch: Usually negative skew (toward unlikely)
  
□ Have I accounted for social desirability?
  → Health behaviors: Inflate positives by 10-15%
  → Sensitive topics: Answers skew "acceptable"
```

### Check 3: Segment Differentiation
```
□ Do my segments show MEANINGFUL differences?
  → Different audiences should have different distributions
  → Identical patterns across segments is a red flag
  
□ Are my segment differences PLAUSIBLE?
  → Differences should be 0.2-0.6 on means, not 1.5+
  → Direction should match known psychology
```

### Check 4: Internal Consistency
```
□ Do related questions show logical patterns?
  → High concern should correlate with information-seeking
  → High satisfaction should correlate with recommendation
  → Comfort with X should correlate with likelihood to use X
  
□ Are there appropriate correlations?
  → Not everything should move together
  → Some tensions are realistic (want it but worried about it)
```

### Check 5: Reality Anchoring
```
□ Would these results surprise a practitioner?
  → If too clean, add realistic noise
  → If too dramatic, moderate the extremes
  
□ Could I defend these numbers with real-world analogs?
  → "This is similar to [actual study] because..."
  
□ Have I avoided round numbers?
  → 23% is more realistic than 25%
  → 3.37 is more realistic than 3.4
```

### Check 6: Edge Case Review
```
□ Have I represented the "wrong answer" minority?
  → There's always someone satisfied with bad service
  → There's always someone concerned about nothing
  → 0% on any option is almost never realistic
  
□ Is my floor/ceiling realistic?
  → Minimum response on any option: Usually 3-8%
  → Maximum on any single option: Rarely >45% on 5-point
```

---

## Red Flag Patterns (Auto-Reject)

If your output matches any of these, regenerate:

```
❌ REJECT: All segments within 0.1 of same mean
❌ REJECT: Any option at exactly 0%
❌ REJECT: Perfect normal distribution
❌ REJECT: Mean exactly 3.0
❌ REJECT: All percentages are multiples of 5
❌ REJECT: Higher concern correlates with higher comfort
❌ REJECT: "Open to X" segment same as general population
❌ REJECT: Children's health concern < adult health concern
❌ REJECT: Intent-to-purchase > 40% at top-box without qualification
❌ REJECT: SD < 0.7 or > 1.5 without explicit rationale
```

---

## Output Format Template

When generating synthetic distributions, use this structure:

```
### [Question Text]
Scale: [Description]
Population: [Audience definition]

**Distribution:**
| Response | % | Rationale |
|----------|---|-----------|
| 1 | XX% | [Brief justification] |
| 2 | XX% | [Brief justification] |
| 3 | XX% | [Brief justification] |
| 4 | XX% | [Brief justification] |
| 5 | XX% | [Brief justification] |

**Summary Statistics:**
- Mean: X.XX (benchmark: X.X-X.X)
- SD: X.XX
- Shape: [Describe skew/modality]

**Calibration Notes:**
- Applied modifiers: [List any audience/context adjustments]
- Confidence: [High/Medium/Low] — [Rationale]
- Comparable real-world data: [Reference if available]

**Self-Check Passed:** ✓ [Or note any concerns]
```

---

# PART 4: QUICK REFERENCE CARD

## Mean Ranges by Question Type

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

## Quick Modifier Lookup

| Modifier | Satisfaction | Concern | Likelihood | Comfort |
|----------|--------------|---------|------------|---------|
| Parent (child context) | — | +0.5 | -0.3 | -0.4 |
| High-income | +0.2 | -0.2 | +0.2 | +0.3 |
| "Open to X" | — | -0.5 | +0.7 | +0.9 |
| Prior experience (positive) | +0.4 | -0.3 | +0.5 | +0.5 |
| Prior experience (negative) | -0.6 | +0.4 | -0.5 | -0.6 |
| Younger (18-35) | ≈0 | -0.2 | +0.2 | +0.4 |
| Older (65+) | +0.1 | +0.2 | -0.2 | -0.3 |

---

*End of Calibration Library*
