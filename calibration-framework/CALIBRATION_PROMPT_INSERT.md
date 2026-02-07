# SURVEY CALIBRATION ANCHORS
## Embed in Simulation Prompts

---

## BENCHMARK DISTRIBUTIONS (5-point scales)

### Satisfaction (1=Very Dissatisfied, 5=Very Satisfied)
```
General: Mean 3.4-3.6 | SD 1.0-1.2 | Mild positive skew
Healthcare: Mean 3.6-3.9 | Gratitude bias +0.2
Government: Mean 3.0-3.3 | Cynicism factor -0.3
```

### Likelihood (1=Very Unlikely, 5=Very Likely)
```
To recommend: Mean 3.1-3.4 | SD 1.1 | Slight positive skew
To purchase: Mean 2.9-3.3 | ⚠️ Top-box converts at 25-35%
To switch: Mean 2.5-2.9 | Strong status quo bias
```

### Concern (1=Not Concerned, 5=Very Concerned)
```
General topics: Mean 2.8-3.2 | Bimodal tendency
Children/health: Mean 3.6-4.0 | Strong positive skew
Abstract risks: Mean 2.4-2.9 | Compressed toward neutral
```

### Healthcare Comfort (virtual/AI)
```
Telehealth general: Mean 3.0-3.4 | Bimodal
Pediatric virtual: Mean 2.7-3.2 | Parents more cautious
AI-assisted care: Mean 2.3-2.9 | Trust gap remains
```

### Binary A/B Splits
```
Status quo vs change: 60-70% status quo
Familiar vs novel: 55-65% familiar
Free vs paid: 70-80% free
Natural vs synthetic: 65-75% natural
Convenient vs optimal: 60-70% convenient
```

---

## AUDIENCE MODIFIERS

### Parents (child healthcare context)
```
Concern: +0.5 to +0.8
Comfort with novel: -0.3 to -0.6
Research likelihood: +0.5 to +0.8
Price sensitivity: -0.3 (will pay for child)
Distribution: More bimodal, fewer neutrals
```

### High-Income (HHI $150K+)
```
Satisfaction (premium): +0.3 to +0.5
Satisfaction (mass market): -0.2 to -0.4
Time/convenience value: +0.4 to +0.6
Price sensitivity: -0.5
Response style: Higher variance, fewer neutrals
```

### "Open to X" (Pre-Screened)
```
⚠️ This is a DIFFERENT POPULATION, not a modifier

Comfort/acceptance: +0.8 to +1.2 vs general
Concern: -0.4 to -0.7 (self-selected past worry)
Likelihood to try: +0.6 to +1.0
Shape: Flips from negative to positive skew

Do NOT average with general population
```

---

## SELF-CHECK PROTOCOL

Run before outputting any distribution:

### Automatic Rejection Triggers
```
❌ All segments within 0.1 of same mean
❌ Any response option at exactly 0%
❌ Mean exactly 3.0 (artificial center)
❌ Perfect normal distribution
❌ All percentages multiples of 5
❌ SD < 0.8 or > 1.4 without rationale
❌ "Open to X" same as general population
❌ Child concern < adult concern
❌ Top-box intent > 40% without discount note
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

### Correlation Logic
```
✓ High concern ↔ high information-seeking
✓ High satisfaction ↔ high recommendation
✓ High comfort ↔ high likelihood to use
✗ High concern + high comfort (contradictory)
```

---

## OUTPUT FORMAT

```
Distribution: [1]: XX% | [2]: XX% | [3]: XX% | [4]: XX% | [5]: XX%
Mean: X.XX (benchmark: X.X-X.X) | SD: X.XX
Shape: [e.g., mild positive skew, bimodal]
Modifiers applied: [list]
Confidence: [High/Med/Low]
```

---

## COMMON ERRORS TO AVOID

1. **Optimism bias**: Means > 4.0 are rare outside premium contexts
2. **Central clustering**: Real distributions are messy, not normal
3. **Segment uniformity**: Different audiences = different patterns
4. **Intent inflation**: Stated intent ≠ behavior (apply 0.3-0.5 discount)
5. **False precision**: Use realistic decimals (3.37, not 3.4)
6. **Zero minorities**: Someone always picks the "wrong" answer
7. **Parent blind spot**: Child context amplifies everything

---

*Use these anchors to ground synthetic outputs in empirical reality.*
