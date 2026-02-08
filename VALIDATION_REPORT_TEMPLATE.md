# Prediction Validation Report

**Client:** [Client Name]  
**Project:** [Project Name]  
**Date:** [YYYY-MM-DD]  
**Analyst:** [Analyst Name]  
**Report Version:** 1.0

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Predictions Evaluated** | [N] |
| **Overall Brier Score** | [0.XX] |
| **Mean Absolute Error** | ±[X.X] pts |
| **Predictions Within ±5 pts** | [XX]% |
| **Validation Status** | ✅ Validated / ⚠️ Partial / ❌ Failed |

**Summary:** [2–3 sentence summary of prediction accuracy for this project]

---

## 1. Study Overview

### Research Objectives
[Brief description of the research objectives and key questions]

### Methodology Comparison

| Dimension | Synthetic Prediction | Validation Survey |
|-----------|---------------------|-------------------|
| **Date** | [Date] | [Date] |
| **Sample Size** | N/A (calibrated estimate) | N=[XXX] |
| **Population** | [Target population] | [Survey population] |
| **Mode** | AI-calibrated synthesis | [Online/Phone/etc.] |
| **Margin of Error** | ±[X] pts (estimated) | ±[X] pts (95% CI) |

---

## 2. Pre/Post Comparison

### Core Metrics

| Metric | Predicted | Actual | Difference | Within CI? |
|--------|:---------:|:------:|:----------:|:----------:|
| [Metric 1] | XX% | XX% | ±X pts | ✅/❌ |
| [Metric 2] | XX% | XX% | ±X pts | ✅/❌ |
| [Metric 3] | XX% | XX% | ±X pts | ✅/❌ |
| [Metric 4] | XX% | XX% | ±X pts | ✅/❌ |
| [Metric 5] | XX% | XX% | ±X pts | ✅/❌ |

### Accuracy Summary

| Accuracy Tier | Count | Percentage |
|---------------|:-----:|:----------:|
| Excellent (±3 pts) | [N] | [X]% |
| Good (±5 pts) | [N] | [X]% |
| Acceptable (±8 pts) | [N] | [X]% |
| Outside tolerance | [N] | [X]% |

---

## 3. Segment-Level Analysis

### By Demographic Segment

| Segment | N (Survey) | Predicted | Actual | Error |
|---------|:----------:|:---------:|:------:|:-----:|
| [Segment 1] | [N] | XX% | XX% | ±X pts |
| [Segment 2] | [N] | XX% | XX% | ±X pts |
| [Segment 3] | [N] | XX% | XX% | ±X pts |

### Calibration Multipliers Applied

| Segment | Multiplier Used | Multiplier Effective? |
|---------|:---------------:|:---------------------:|
| [Segment 1] | ×X.XX | ✅ Yes / ❌ Needs adjustment |
| [Segment 2] | ×X.XX | ✅ Yes / ❌ Needs adjustment |

---

## 4. Error Analysis

### Systematic Biases Identified

| Pattern | Direction | Magnitude | Possible Cause |
|---------|-----------|-----------|----------------|
| [Pattern 1] | Over/Under | ±X pts | [Explanation] |
| [Pattern 2] | Over/Under | ±X pts | [Explanation] |

### Predictions That Missed

| Metric | Predicted | Actual | Error | Root Cause |
|--------|:---------:|:------:|:-----:|------------|
| [Metric] | XX% | XX% | +X pts | [Explanation] |
| [Metric] | XX% | XX% | −X pts | [Explanation] |

### Root Cause Categories

| Category | Count | Action |
|----------|:-----:|--------|
| Calibration gap (new domain) | [N] | Add to calibration library |
| Demographic multiplier off | [N] | Adjust multiplier |
| Temporal shift | [N] | N/A (external factor) |
| Measurement difference | [N] | Note for future |
| Unknown | [N] | Investigate |

---

## 5. Calibration Updates

### Recommended Multiplier Adjustments

Based on this validation, we recommend the following calibration updates:

| Construct/Segment | Current Multiplier | Recommended | Evidence |
|-------------------|:------------------:|:-----------:|----------|
| [Construct] | ×X.XX | ×X.XX | [Brief rationale] |
| [Segment] | ×X.XX | ×X.XX | [Brief rationale] |

### New Calibration Data to Log

```
Domain: [Domain]
Source: [Client project name]
N: [Sample size]
Date: [YYYY-MM-DD]
Status: ✅ Valid for calibration

| Metric | Predicted | Actual | Multiplier |
|--------|-----------|--------|------------|
| [Metric] | XX% | XX% | ×X.XX |
```

---

## 6. Brier Score Calculation

### Individual Predictions

| Prediction | P (Predicted) | Outcome (0/1) | (P - O)² |
|------------|:-------------:|:-------------:|:--------:|
| [Pred 1] | 0.XX | [0/1] | 0.XXXX |
| [Pred 2] | 0.XX | [0/1] | 0.XXXX |
| [Pred 3] | 0.XX | [0/1] | 0.XXXX |

### Aggregate Brier Score

```
Brier Score = (1/N) × Σ(P - O)² = [0.XXXX]
```

| Benchmark | Score |
|-----------|:-----:|
| This project | [0.XX] |
| CrowdWave target | 0.12–0.15 |
| Superforecasters | 0.081 |
| Random baseline | 0.25 |

**Assessment:** [Above/At/Below target performance]

---

## 7. Confidence Interval Performance

### Interval Calibration

| Confidence Level | Expected Coverage | Actual Coverage | Status |
|------------------|:-----------------:|:---------------:|:------:|
| 50% CI | 50% | [XX]% | ✅/⚠️/❌ |
| 80% CI | 80% | [XX]% | ✅/⚠️/❌ |
| 95% CI | 95% | [XX]% | ✅/⚠️/❌ |

### Observations

- [ ] CIs appropriately calibrated
- [ ] CIs too narrow (overconfident)
- [ ] CIs too wide (underconfident)

**Recommended CI adjustment:** [None / Widen by X% / Narrow by X%]

---

## 8. Lessons Learned

### What Worked Well

1. [Specific prediction or methodology that performed accurately]
2. [Calibration multiplier that proved effective]
3. [Domain where accuracy exceeded expectations]

### What Needs Improvement

1. [Specific gap or miss with explanation]
2. [Calibration area needing additional data]
3. [Methodology refinement for future projects]

### Process Improvements

| Finding | Recommendation | Priority |
|---------|----------------|:--------:|
| [Finding 1] | [Action] | High/Med/Low |
| [Finding 2] | [Action] | High/Med/Low |

---

## 9. Recommendations

### For This Client/Project

1. **[Recommendation 1]:** [Specific guidance based on findings]
2. **[Recommendation 2]:** [Specific guidance based on findings]

### For CrowdWave Calibration Library

1. **Add to calibration:** [New data points to log]
2. **Adjust multipliers:** [Specific multiplier changes]
3. **Flag domain:** [Any domains needing more validation]

### For Future Similar Projects

1. [Methodological recommendation]
2. [Sample or scope recommendation]
3. [Reporting recommendation]

---

## 10. Appendix

### A. Full Prediction Log

| ID | Question | Predicted | CI (95%) | Actual | Error | Status |
|----|----------|:---------:|:--------:|:------:|:-----:|:------:|
| 1 | [Question text] | XX% | [XX–XX]% | XX% | ±X | ✅/❌ |
| 2 | [Question text] | XX% | [XX–XX]% | XX% | ±X | ✅/❌ |

### B. Source Quality Assessment

| Source | Type | Quality Tier | Weight |
|--------|------|:------------:|:------:|
| [Source 1] | [Poll/Market/Expert] | [1–4] | [X.X] |
| [Source 2] | [Poll/Market/Expert] | [1–4] | [X.X] |

### C. Methodology Notes

[Any specific methodology notes, deviations, or caveats for this project]

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Analyst | [Name] | [Date] | _________ |
| Reviewer | [Name] | [Date] | _________ |
| Client Lead | [Name] | [Date] | _________ |

---

**Document Classification:** [Internal / Client Confidential]  
**Next Review Date:** [Date]

*CrowdWave Research Division*
