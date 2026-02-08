# Mental Health Survey Validation Data

## Overview

This document provides ground truth response distributions from the mental health survey data for use in validating AI agent simulation accuracy. The data comes from a survey of individuals with anxiety and/or depression symptoms.

**Source:** `mental_health_data.xlsx`  
**Clean Sample Size:** n=873  
**Audience:** Adults experiencing anxiety and/or depression symptoms

---

## Audience Segmentation

### Anxiety Symptom Severity
| Category | n | % |
|----------|---|---|
| Mild to Moderate Anxiety | 540 | 61.9% |
| Severe Anxiety | 194 | 22.2% |
| None to Minimal Anxiety | 135 | 15.5% |

### Depression Symptom Severity
| Category | n | % |
|----------|---|---|
| Mild to Moderate Depression | 487 | 55.8% |
| None to Minimal Depression | 207 | 23.7% |
| Severe Depression | 175 | 20.0% |

### Formal Diagnosis Status
| Category | n | % |
|----------|---|---|
| No Diagnosis (NONE) | 440 | 50.4% |
| Depression Only (DEP) | 143 | 16.4% |
| Both Anxiety & Depression (BOTH) | 118 | 13.5% |
| Anxiety Only (ANX) | 109 | 12.5% |
| Other | 63 | 7.2% |

---

## Q42: Importance of Considerations for Mental Health Solutions

**Question Stem:** "How important are each of the following when it comes to deciding which potential mental health & well-being solution you would like to use?"

**Scale:** 5-point scale
- 1 = Not at all important
- 2 = Slightly important
- 3 = Moderately important
- 4 = Very important
- 5 = The most important

### 42_1: Effectiveness at reducing/eliminating symptoms
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.96 |
| Top-2-Box | 75.4% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 25 | 2.9% |
| Slightly important | 42 | 4.8% |
| Moderately important | 148 | 17.0% |
| Very important | 388 | 44.4% |
| The most important | 270 | 30.9% |

### 42_11: How quickly it starts to reduce symptoms
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.55 |
| Top-2-Box | 55.8% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 28 | 3.2% |
| Slightly important | 75 | 8.6% |
| Moderately important | 283 | 32.4% |
| Very important | 359 | 41.1% |
| The most important | 128 | 14.7% |

### 42_12: Level of safety
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.76 |
| Top-2-Box | 67.5% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 28 | 3.2% |
| Slightly important | 56 | 6.4% |
| Moderately important | 200 | 22.9% |
| Very important | 399 | 45.7% |
| The most important | 190 | 21.8% |

### 42_13: Affordability
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.93 |
| Top-2-Box | 73.8% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 28 | 3.2% |
| Slightly important | 48 | 5.5% |
| Moderately important | 153 | 17.5% |
| Very important | 374 | 42.8% |
| The most important | 270 | 30.9% |

### 42_14: How enjoyable it is
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.42 |
| Top-2-Box | 49.5% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 38 | 4.4% |
| Slightly important | 91 | 10.4% |
| Moderately important | 312 | 35.7% |
| Very important | 331 | 37.9% |
| The most important | 101 | 11.6% |

### 42_15: Convenience (works within your schedule)
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.78 |
| Top-2-Box | 69.6% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 27 | 3.1% |
| Slightly important | 52 | 6.0% |
| Moderately important | 186 | 21.3% |
| Very important | 433 | 49.6% |
| The most important | 175 | 20.0% |

### 42_16: Time investment
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.53 |
| Top-2-Box | 54.9% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 26 | 3.0% |
| Slightly important | 69 | 7.9% |
| Moderately important | 299 | 34.2% |
| Very important | 376 | 43.1% |
| The most important | 103 | 11.8% |

### 42_17: Level of privacy
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.80 |
| Top-2-Box | 67.1% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 26 | 3.0% |
| Slightly important | 66 | 7.6% |
| Moderately important | 195 | 22.3% |
| Very important | 357 | 40.9% |
| The most important | 229 | 26.2% |

### 42_18: Level of ease (assuming you have the time)
| Metric | Value |
|--------|-------|
| n | 873 |
| Mean | 3.62 |
| Top-2-Box | 61.4% |

| Response | Count | % |
|----------|-------|---|
| Not at all important | 28 | 3.2% |
| Slightly important | 59 | 6.8% |
| Moderately important | 250 | 28.6% |
| Very important | 415 | 47.5% |
| The most important | 121 | 13.9% |

---

## Q51f: Product Concept Rating

**Product Concept:** "An app-based program that helps improve mental health & well-being by teaching you practical techniques that you can immediately apply in your life."

**Question:** "Please rate how ideal the product concept described would be for you along the following attributes:"

**Scale:** 5-point scale
- 1 = Poor
- 2 = Below average
- 3 = Average
- 4 = Above average
- 5 = Excellent

### 51f_1: Effectiveness at reducing/eliminating symptoms
| Metric | Value |
|--------|-------|
| n | 869 |
| Mean | 3.53 |
| Top-2-Box | 49.8% |

| Response | Count | % |
|----------|-------|---|
| Poor | 35 | 4.0% |
| Below average | 80 | 9.2% |
| Average | 321 | 36.9% |
| Above average | 256 | 29.5% |
| Excellent | 177 | 20.4% |

### 51f_26: How quickly it starts to reduce symptoms
| Metric | Value |
|--------|-------|
| n | 869 |
| Mean | 3.49 |
| Top-2-Box | 46.1% |

| Response | Count | % |
|----------|-------|---|
| Poor | 33 | 3.8% |
| Below average | 81 | 9.3% |
| Average | 354 | 40.7% |
| Above average | 230 | 26.5% |
| Excellent | 171 | 19.7% |

### 51f_27: Level of safety
| Metric | Value |
|--------|-------|
| n | 869 |
| Mean | 3.57 |
| Top-2-Box | 50.6% |

| Response | Count | % |
|----------|-------|---|
| Poor | 33 | 3.8% |
| Below average | 46 | 5.3% |
| Average | 350 | 40.3% |
| Above average | 270 | 31.1% |
| Excellent | 170 | 19.6% |

### 51f_29: How enjoyable it is
| Metric | Value |
|--------|-------|
| n | 869 |
| Mean | 3.46 |
| Top-2-Box | 45.2% |

| Response | Count | % |
|----------|-------|---|
| Poor | 31 | 3.6% |
| Below average | 60 | 6.9% |
| Average | 385 | 44.3% |
| Above average | 263 | 30.3% |
| Excellent | 130 | 15.0% |

### 51f_30: Convenience (works within your schedule)
| Metric | Value |
|--------|-------|
| n | 869 |
| Mean | 3.75 |
| Top-2-Box | 61.2% |

| Response | Count | % |
|----------|-------|---|
| Poor | 31 | 3.6% |
| Below average | 34 | 3.9% |
| Average | 272 | 31.3% |
| Above average | 319 | 36.7% |
| Excellent | 213 | 24.5% |

### 51f_31: Time investment
| Metric | Value |
|--------|-------|
| n | 869 |
| Mean | 3.47 |
| Top-2-Box | 47.3% |

| Response | Count | % |
|----------|-------|---|
| Poor | 36 | 4.1% |
| Below average | 65 | 7.5% |
| Average | 357 | 41.1% |
| Above average | 274 | 31.5% |
| Excellent | 137 | 15.8% |

### 51f_32: Level of privacy
| Metric | Value |
|--------|-------|
| n | 869 |
| Mean | 3.58 |
| Top-2-Box | 50.9% |

| Response | Count | % |
|----------|-------|---|
| Poor | 38 | 4.4% |
| Below average | 70 | 8.1% |
| Average | 319 | 36.7% |
| Above average | 237 | 27.3% |
| Excellent | 205 | 23.6% |

### 51f_33: Level of ease
| Metric | Value |
|--------|-------|
| n | 869 |
| Mean | 3.66 |
| Top-2-Box | 57.4% |

| Response | Count | % |
|----------|-------|---|
| Poor | 32 | 3.7% |
| Below average | 43 | 4.9% |
| Average | 295 | 33.9% |
| Above average | 318 | 36.6% |
| Excellent | 181 | 20.8% |

---

## Segmentation Analysis: Q42 Key Metrics

### By Anxiety Symptom Severity

| Segment | n | 42_1 Mean | 42_1 T2B | 42_13 Mean | 42_13 T2B | 42_15 Mean | 42_15 T2B |
|---------|---|-----------|----------|------------|-----------|------------|-----------|
| None to Minimal | 135 | 3.74 | 68.9% | 3.76 | 70.4% | 3.57 | 63.0% |
| Mild to Moderate | 540 | 3.97 | 75.6% | 3.91 | 72.0% | 3.76 | 68.0% |
| Severe | 194 | 4.09 | 79.9% | 4.10 | 80.4% | 3.98 | 79.4% |

**Key Insight:** Higher anxiety severity → Higher importance ratings across all dimensions

### By Depression Symptom Severity

| Segment | n | 42_1 Mean | 42_1 T2B | 42_13 Mean | 42_13 T2B | 42_15 Mean | 42_15 T2B |
|---------|---|-----------|----------|------------|-----------|------------|-----------|
| None to Minimal | 207 | 3.83 | 68.1% | 3.81 | 69.1% | 3.69 | 64.7% |
| Mild to Moderate | 487 | 3.94 | 76.2% | 3.91 | 73.9% | 3.74 | 69.0% |
| Severe | 175 | 4.19 | 82.3% | 4.11 | 78.3% | 4.00 | 77.7% |

**Key Insight:** Higher depression severity → Higher importance ratings, especially for effectiveness

### By Formal Diagnosis

| Segment | n | 42_1 Mean | 42_1 T2B | 42_13 Mean | 42_13 T2B | 42_15 Mean | 42_15 T2B |
|---------|---|-----------|----------|------------|-----------|------------|-----------|
| Anxiety Only | 109 | 4.15 | 78.9% | 3.89 | 74.3% | 3.83 | 72.5% |
| Depression Only | 143 | 4.20 | 85.3% | 4.03 | 81.1% | 3.87 | 74.1% |
| Both Anx & Dep | 118 | 4.28 | 89.8% | 3.97 | 80.5% | 3.90 | 80.5% |
| No Diagnosis | 440 | 3.82 | 70.7% | 3.94 | 72.5% | 3.74 | 67.5% |

**Key Insight:** Diagnosed individuals (especially "Both") show highest importance ratings for effectiveness (89.8% T2B)

---

## Summary Statistics for Simulation Validation

### Q42 Importance Rankings (by Mean Score)
1. **Effectiveness** (42_1): Mean=3.96, T2B=75.4%
2. **Affordability** (42_13): Mean=3.93, T2B=73.8%
3. **Privacy** (42_17): Mean=3.80, T2B=67.1%
4. **Convenience** (42_15): Mean=3.78, T2B=69.6%
5. **Safety** (42_12): Mean=3.76, T2B=67.5%
6. **Ease of Use** (42_18): Mean=3.62, T2B=61.4%
7. **Speed of Results** (42_11): Mean=3.55, T2B=55.8%
8. **Time Investment** (42_16): Mean=3.53, T2B=54.9%
9. **Enjoyability** (42_14): Mean=3.42, T2B=49.5%

### Q51f Product Concept Ratings (by Mean Score)
1. **Convenience** (51f_30): Mean=3.75, T2B=61.2%
2. **Ease of Use** (51f_33): Mean=3.66, T2B=57.4%
3. **Privacy** (51f_32): Mean=3.58, T2B=50.9%
4. **Safety** (51f_27): Mean=3.57, T2B=50.6%
5. **Effectiveness** (51f_1): Mean=3.53, T2B=49.8%
6. **Speed of Results** (51f_26): Mean=3.49, T2B=46.1%
7. **Time Investment** (51f_31): Mean=3.47, T2B=47.3%
8. **Enjoyability** (51f_29): Mean=3.46, T2B=45.2%

---

## Validation Use Cases

### 1. Overall Distribution Matching
Compare simulated agent responses against these ground truth distributions using:
- Chi-square goodness of fit tests
- Kolmogorov-Smirnov tests
- Mean absolute error (MAE) between % distributions

### 2. Segment-Level Accuracy
Test whether simulated agents correctly reproduce the pattern:
- Higher severity → Higher importance ratings
- Diagnosed → Higher importance than undiagnosed
- "Both" diagnosis → Highest effectiveness importance

### 3. Ranking Accuracy
Verify simulated agents preserve relative importance ordering:
- Effectiveness > Affordability > Privacy > Convenience > Safety (etc.)

### 4. Top-2-Box Accuracy
Compare aggregate positive sentiment rates (T2B):
- Target: Within ±5 percentage points of ground truth

---

## Technical Notes

- **Data Cleaning:** Excluded rows with non-response values (header rows, metadata)
- **Valid Response Filter:** Only responses matching scale labels included
- **Missing Data:** Some respondents skipped questions (Q51f n=869 vs Q42 n=873)
- **Symptom Scores:** Based on validated symptom severity scales in survey
- **Diagnosis:** Self-reported formal diagnosis status

---

*Generated from mental_health_data.xlsx for Crowdwave simulation validation*
