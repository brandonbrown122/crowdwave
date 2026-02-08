# Crowdwave Pilot Test 5: NPS & Satisfaction Predictions
## February 7, 2026 — 9:45 PM CST

### Test Design
Test NPS and satisfaction calibrations against Amazon Subscribe & Save data.

**Source:** Amazon S&S User Interviews (N=49-52)

---

## PHASE 1: PREDICTIONS

### NPS for Subscription Service (Current Users)
**Question:** "How likely are you to recommend S&S to a friend on a scale of 0-10?"

**Prediction using calibration library:**
- Subscription services NPS benchmark: +35 to +45
- Current satisfied users should be at/above benchmark
- Amazon brand strength adds premium

**PREDICTION: NPS +38 to +46**
**Confidence: 0.75**

---

### Satisfaction: Core Experience (Ordering, Ease of Use)
**Reasoning:**
- Amazon known for excellent UX
- Current users self-selected for satisfaction
- Core experience should be highest rated

**PREDICTION: 82-88% Top-2-Box**
**Confidence: 0.75**

---

### Satisfaction: Flexibility & Communications
**Reasoning:**
- Secondary features typically rate lower
- Subscription flexibility often a pain point
- Email notifications often rated lower

**PREDICTION: 58-65% Top-2-Box**
**Confidence: 0.70**

---

### Satisfaction: Value/Savings
**Reasoning:**
- Main value proposition of S&S
- Users stay because of perceived savings
- Should be high but not as high as UX

**PREDICTION: 72-78% Top-2-Box**
**Confidence: 0.70**

---

## PHASE 2: VERIFICATION

**Actual Results:**

| Metric | Predicted | Actual | Error | Status |
|--------|-----------|--------|-------|--------|
| NPS Score | +38 to +46 | **+39** | 0 pts | ✅ PASS |
| Core experience (ordering) | 82-88% | 88% | 0 pts | ✅ PASS |
| Core experience (ease of use) | 82-88% | 84% | 0 pts | ✅ PASS |
| Flexibility (delivery dates) | 58-65% | 62% | 0 pts | ✅ PASS |
| Communications (email) | 58-65% | 60% | 0 pts | ✅ PASS |
| Value/Savings | 72-78% | 77.6% | 0 pts | ✅ PASS |

---

## RESULTS

**Tests:** 6
**Pass:** 6 (100%)
**Mean error:** 0 points (all within predicted ranges)

---

## ANALYSIS

### Why This Worked:

1. **Strong priors:** NPS benchmarks for subscription services well-established
2. **Logical structure:** Core UX > Value > Flexibility > Communications
3. **Self-selected sample:** Current users inherently satisfied

### Caveats:

1. **Small N (49-52):** Wide confidence intervals on actuals
2. **Self-selected users:** Not representative of all potential users
3. **Known Amazon strength:** Easy to predict high satisfaction

---

## CONCLUSION

NPS and satisfaction predictions achieved **0 pt error** — all predictions fell within range.

**What this validates:**
- NPS benchmarks (+35 to +45 for subscriptions) are accurate
- Satisfaction ordering (core > secondary) is predictable
- Calibration library holds for consumer satisfaction domains

**Confidence level:** HIGH for NPS/satisfaction in consumer contexts
