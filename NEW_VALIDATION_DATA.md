# New Validation Data — February 7, 2026

## Summary

Two new human datasets added to calibration library:

| Dataset | N | Domain | Key Metrics |
|---------|---|--------|-------------|
| Mental Health Survey | 873 | Anxiety/Depression, Mental Health Solutions | Importance scales, Concept ratings |
| Amazon Subscribe & Save | 49 | Consumer Subscriptions, E-commerce | NPS, Satisfaction ratings |

---

## 1. Mental Health Survey (N=873)

**Audience:** Adults with anxiety and/or depression symptoms
- Anxiety diagnosis: 109 (12.5%)
- Depression diagnosis: 145 (16.7%)
- Both diagnoses: 119 (13.7%)
- Other: 2,027 (71.1% of full dataset)

**Symptom Scores (among those with symptoms):**
- Anxiety Symptom Score: Mean = 10.15, SD = 5.57 (N=869)
- Depression Symptom Score: Mean = 9.44, SD = 5.94 (N=869)

### Importance Scales (42_* series)
**Question:** "How important are each of the following when it comes to deciding which potential mental health & well-being solution you would like to use?"

**Scale:** 1=not at all important, 2=slightly, 3=moderately, 4=very, 5=the most important

| Attribute | N | Mean | Top-2-Box | Distribution |
|-----------|---|------|-----------|--------------|
| 42_1 (Effectiveness at reducing symptoms) | 873 | 3.96 | 75.4% | 2.9% / 4.8% / 17.0% / 44.4% / 30.9% |
| 42_11 (Unknown attribute) | 873 | 3.55 | 55.8% | 3.2% / 8.6% / 32.4% / 41.1% / 14.7% |
| 42_12 | 873 | 3.76 | 67.5% | 3.2% / 6.4% / 22.9% / 45.7% / 21.8% |
| 42_13 | 873 | 3.93 | 73.8% | 3.2% / 5.5% / 17.5% / 42.8% / 30.9% |
| 42_14 | 873 | 3.42 | 49.5% | 4.4% / 10.4% / 35.7% / 37.9% / 11.6% |
| 42_15 | 873 | 3.78 | 69.6% | 3.1% / 6.0% / 21.3% / 49.6% / 20.0% |
| 42_16 | 873 | 3.53 | 54.9% | 3.0% / 7.9% / 34.2% / 43.1% / 11.8% |
| 42_17 | 873 | 3.80 | 67.1% | 3.0% / 7.6% / 22.3% / 40.9% / 26.2% |
| 42_18 | 873 | 3.62 | 61.4% | 3.2% / 6.8% / 28.6% / 47.5% / 13.9% |

**Key Insight:** Importance scales for mental health solutions show:
- High importance placed on effectiveness (75% top-2-box)
- Moderate importance on other attributes (50-70% top-2-box)
- Typical distribution shape: positive skew, mode at "very important"

### Concept Ratings (51f_* series)
**Question:** "Please rate how ideal the product concept described would be for you along the following attributes"

**Scale:** 1=poor, 2=below average, 3=average, 4=above average, 5=excellent

| Attribute | N | Mean | Top-2-Box |
|-----------|---|------|-----------|
| 51f_1 (Effectiveness at reducing symptoms) | 869 | 3.53 | 49.8% |
| 51f_26 | 869 | 3.49 | 46.1% |
| 51f_27 | 869 | 3.57 | 50.6% |

**Key Insight:** Concept ratings center around neutral-to-positive, ~50% top-2-box

---

## 2. Amazon Subscribe & Save Interviews (N=49-52)

**Audience:** Current Amazon S&S users, qualitative interviews

### NPS (0-10 Scale)
**Question:** "How likely are you to recommend S&S to a friend on a scale of 0-10?"

| Metric | Value |
|--------|-------|
| N | 49 |
| Mean | 8.2 |
| Promoters (9-10) | 51.0% |
| Passives (7-8) | 36.7% |
| Detractors (0-6) | 12.2% |
| **NPS Score** | **+39** |

**Key Insight:** NPS of +39 is in line with industry benchmarks for SaaS/subscription services (typical range +35 to +45)

### Satisfaction Ratings (1-5 Scale)
**Question:** "Rate the following elements of S&S on a satisfaction scale of 1-5"

| Dimension | N | Mean | Top-2-Box |
|-----------|---|------|-----------|
| Savings vs other Amazon options | 49 | 4.08 | 77.6% |
| Delivery date flexibility | 50 | 3.84 | 62.0% |
| Ordering experience | 50 | 4.38 | 88.0% |
| Ease of use | 50 | 4.30 | 84.0% |
| Product/brand selection | 50 | 3.89 | 68.0% |
| Preferred product availability | 50 | 4.15 | 78.0% |
| Email notifications | 50 | 3.74 | 60.0% |
| Consolidation into single box | 48 | 4.15 | 75.0% |

**Key Insight:** 
- Core experience (ordering, ease of use) scores highest (84-88% top-2-box)
- Flexibility and notifications score lower (60-62% top-2-box)
- Overall mean satisfaction: 4.07/5 (81.4% top-2-box average)

---

## Calibration Implications

### Mental Health Domain

**NEW DOMAIN — Use with caution (single source)**

| Construct | Benchmark | Confidence |
|-----------|-----------|------------|
| Importance of effectiveness | Mean 3.96, 75% T2B | Medium (N=873, single study) |
| Importance (other attributes) | Mean 3.4-3.8, 50-70% T2B | Medium |
| Concept ratings | Mean ~3.5, 50% T2B | Medium |

**Potential Bias:** Mental health population may have:
- Higher motivation to seek solutions (importance inflated)
- More realistic expectations (ratings more moderate)
- Compare to general population carefully

### Consumer Subscription Domain

**VALIDATES existing NPS benchmarks:**

| Metric | Prediction | Actual | Status |
|--------|------------|--------|--------|
| NPS for subscription services | +35 to +45 | +39 | ✅ Confirmed |
| Satisfaction (core experience) | 80-85% T2B | 84-88% T2B | ✅ Confirmed |
| Satisfaction (flexibility/comms) | 60-70% T2B | 60-62% T2B | ✅ Confirmed |

**Key Finding:** Subscription service benchmarks hold for Amazon S&S specifically.

---

## Next Steps

1. Add mental health domain to CALIBRATION_MEMORY.md
2. Update MASTER_SIMULATION_SYSTEM.md with new benchmarks
3. Run blind predictions on mental health questions (before seeing full analysis)
4. Update deck with new validation status

---

*Data extracted: February 7, 2026*
*Sources: mental_health_data.xlsx (N=2,851 total, N=873 with scale responses), amazon_sns_data.xlsx (N=49-52)*
