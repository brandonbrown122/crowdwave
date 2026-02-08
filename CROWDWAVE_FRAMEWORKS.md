---
marp: true
theme: default
paginate: true
footer: "CrowdWave | Confidential"
style: |
  section {
    background: #ffffff;
    color: #222222;
    font-family: 'Arial', sans-serif;
    padding: 60px 70px 40px 70px;
    font-size: 18px;
    line-height: 1.5;
  }
  h1 {
    color: #003366;
    font-size: 22px;
    font-weight: 600;
    margin: 0 0 25px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #003366;
  }
  table {
    font-size: 13px;
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
  }
  th {
    background: #003366;
    color: white;
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
  }
  td {
    padding: 7px 10px;
    border-bottom: 1px solid #e0e0e0;
  }
  footer {
    font-size: 10px;
    color: #666666;
  }
  .source {
    font-size: 9px;
    color: #888888;
    margin-top: 15px;
    border-top: 1px solid #e0e0e0;
    padding-top: 6px;
  }
  .framework {
    display: grid;
    gap: 15px;
    margin: 15px 0;
  }
  .box {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 12px 15px;
  }
  .box-header {
    font-weight: 600;
    color: #003366;
    font-size: 14px;
    margin-bottom: 6px;
  }
  .box-content {
    font-size: 12px;
    color: #444;
  }
  .highlight-box {
    background: #003366;
    color: white;
    border-radius: 4px;
    padding: 12px 15px;
  }
  .metric-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    text-align: center;
    margin: 20px 0;
  }
  .metric-value {
    font-size: 36px;
    color: #003366;
    font-weight: 300;
  }
  .metric-label {
    font-size: 11px;
    color: #666;
    margin-top: 5px;
  }
  .zone-high { background: #d4edda; border-left: 4px solid #28a745; }
  .zone-med { background: #fff3cd; border-left: 4px solid #ffc107; }
  .zone-low { background: #f8d7da; border-left: 4px solid #dc3545; }
  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
  }
  .three-col {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 15px;
  }
  .quad {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: 12px;
  }
---

<!-- _class: lead -->
<!-- _backgroundColor: #003366 -->
<!-- _color: #ffffff -->
<!-- _footer: "" -->

<br><br>

# CrowdWave Accuracy Framework

**Calibrated AI predictions with documented, predictable accuracy**

<br>

February 2026

---

# Calibration reduces prediction error by 79%, enabling reliable AI-simulated research

<div class="metric-row">
<div>
<div class="metric-value">79%</div>
<div class="metric-label">Error reduction vs. naive LLM</div>
</div>
<div>
<div class="metric-value">1.9</div>
<div class="metric-label">Mean absolute error (points)</div>
</div>
<div>
<div class="metric-value">20+</div>
<div class="metric-label">Validated domains</div>
</div>
<div>
<div class="metric-value">5M+</div>
<div class="metric-label">Human survey responses</div>
</div>
</div>

<div class="highlight-box" style="margin-top: 30px;">
<strong>Core insight:</strong> Raw LLMs are 25% less accurate than expert forecasters. Calibration against human survey data closes this gap for established topics.
</div>

<div class="source">Source: CrowdWave validation (27 test cases); ForecastBench 2025 (Forecasting Research Institute)</div>

---

# The accuracy problem: Raw LLMs and synthetic surveys fail at rates unacceptable for business decisions

<div class="two-col">
<div>

**LLM Forecasting Accuracy**
(ForecastBench, Oct 2025)

| System | Brier Score | Gap |
|--------|-------------|-----|
| Superforecasters | 0.081 | — |
| GPT-4.5 | 0.101 | +25% |
| GPT-4 | 0.131 | +62% |
| Median public | 0.150+ | +85% |

</div>
<div>

**Synthetic Survey Correlation**
(Dig Insights, 2025)

| Task | Correlation |
|------|-------------|
| Known events | 0.85 ✓ |
| Future events | 0.50 ⚠ |
| **New concepts** | **0.30** ✗ |

<div class="box" style="margin-top: 15px;">
<div class="box-header">The paradox</div>
<div class="box-content">Synthetic data works for what you already know — and fails at what you actually need to predict.</div>
</div>

</div>
</div>

<div class="source">Source: Forecasting Research Institute (ForecastBench); Dig Insights validation study (N=500, 30 movies)</div>

---

# Accuracy Spectrum: Three zones determine appropriate use and required validation

<div class="three-col" style="margin-top: 20px;">

<div class="box zone-high">
<div class="box-header">HIGH ACCURACY</div>
<div class="box-content" style="font-size: 24px; text-align: center; margin: 10px 0;">±2-3 pts</div>
<div class="box-content">
<strong>Question types:</strong><br>
Trust scales<br>
Awareness (Y/N)<br>
Party ID<br>
Bipartisan rankings
</div>
<div class="box-content" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #28a745;">
<strong>Action:</strong> Use for decisions
</div>
</div>

<div class="box zone-med">
<div class="box-header">MEDIUM ACCURACY</div>
<div class="box-content" style="font-size: 24px; text-align: center; margin: 10px 0;">±4-5 pts</div>
<div class="box-content">
<strong>Question types:</strong><br>
Satisfaction (1-5)<br>
NPS / Recommend<br>
Concern levels<br>
Tech comfort
</div>
<div class="box-content" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #ffc107;">
<strong>Action:</strong> Use for direction
</div>
</div>

<div class="box zone-low">
<div class="box-header">LOW ACCURACY</div>
<div class="box-content" style="font-size: 24px; text-align: center; margin: 10px 0;">±8-15 pts</div>
<div class="box-content">
<strong>Question types:</strong><br>
Purchase intent<br>
Price sensitivity<br>
Polarized politics<br>
Novel behaviors
</div>
<div class="box-content" style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #dc3545;">
<strong>Action:</strong> Validate first
</div>
</div>

</div>

<div class="source">Source: CrowdWave accuracy testing (27 test cases, 6 domains)</div>

---

# High-accuracy zone: Stable attitudes with abundant benchmark data

<div class="two-col">

<div>

**Why these work**

<div class="quad">
<div class="box">
<div class="box-header">Stable</div>
<div class="box-content">Low volatility over time</div>
</div>
<div class="box">
<div class="box-header">Abundant data</div>
<div class="box-content">Multiple benchmark sources</div>
</div>
<div class="box">
<div class="box-header">Low emotion</div>
<div class="box-content">Factual, not affective</div>
</div>
<div class="box">
<div class="box-header">Training aligned</div>
<div class="box-content">LLM data matches reality</div>
</div>
</div>

</div>
<div>

**Validated performance**

| Question | Calibrated | Actual | Error |
|----------|------------|--------|-------|
| Trust in scientists | 77% | 77% | 0 |
| % Independent | 44% | 45% | 1 pt |
| Smartphone 50+ | 89% | 90% | 1 pt |
| Employee engaged | 32% | 31% | 1 pt |

</div>
</div>

<div class="source">Source: Gallup (N=13,000+); Pew Research (N=5,000+); AARP 2025 (N=3,838)</div>

---

# Medium-accuracy zone: Industry-specific calibration required for NPS and satisfaction

**NPS variance by industry (LLMs assume 35-40 for all — actual range is 30-65)**

<div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin: 20px 0; text-align: center;">

<div class="box" style="background: #d4edda;">
<div style="font-size: 28px; color: #003366; font-weight: 300;">65</div>
<div style="font-size: 10px;">Manufacturing</div>
</div>

<div class="box" style="background: #d4edda;">
<div style="font-size: 28px; color: #003366; font-weight: 300;">61</div>
<div style="font-size: 10px;">Healthcare</div>
</div>

<div class="box" style="background: #e8f4e8;">
<div style="font-size: 28px; color: #003366; font-weight: 300;">55</div>
<div style="font-size: 10px;">Retail</div>
</div>

<div class="box" style="background: #fff3cd;">
<div style="font-size: 28px; color: #003366; font-weight: 300;">46</div>
<div style="font-size: 10px;">Fintech</div>
</div>

<div class="box" style="background: #fff3cd;">
<div style="font-size: 28px; color: #003366; font-weight: 300;">42</div>
<div style="font-size: 10px;">Education</div>
</div>

<div class="box" style="background: #f8d7da;">
<div style="font-size: 28px; color: #003366; font-weight: 300;">30</div>
<div style="font-size: 10px;">Software</div>
</div>

</div>

**B2B vs. B2C splits reveal further variance**

| Industry | B2B | B2C | Gap |
|----------|-----|-----|-----|
| Healthcare | 38 | 70 | 32 pts |
| Education | 16 | 47 | 31 pts |
| Software | 29 | 47 | 18 pts |

<div class="source">Source: Survicate NPS Benchmark 2025 (599 companies, 5.4M responses)</div>

---

# Low-accuracy zone: Intent requires conversion factors; polarized topics require segmentation

<div class="two-col">

<div>

**Intent-to-Action Gap**

<div style="margin: 15px 0;">
<div style="display: flex; align-items: center; margin: 10px 0;">
<div style="width: 120px; font-size: 12px;">"Very likely"</div>
<div style="flex: 1; height: 20px; background: linear-gradient(to right, #003366 30%, #e0e0e0 30%);"></div>
<div style="width: 50px; text-align: right; font-size: 12px;">30%</div>
</div>
<div style="display: flex; align-items: center; margin: 10px 0;">
<div style="width: 120px; font-size: 12px;">"Likely"</div>
<div style="flex: 1; height: 20px; background: linear-gradient(to right, #003366 15%, #e0e0e0 15%);"></div>
<div style="width: 50px; text-align: right; font-size: 12px;">15%</div>
</div>
<div style="display: flex; align-items: center; margin: 10px 0;">
<div style="width: 120px; font-size: 12px;">"Might consider"</div>
<div style="flex: 1; height: 20px; background: linear-gradient(to right, #003366 5%, #e0e0e0 5%);"></div>
<div style="width: 50px; text-align: right; font-size: 12px;">5%</div>
</div>
</div>

<div class="box" style="margin-top: 15px;">
<div class="box-header">Rule</div>
<div class="box-content">Multiply top-2-box by ×0.30</div>
</div>

</div>
<div>

**Partisan Segmentation Required**

| Topic | R | D | Gap |
|-------|---|---|-----|
| Immigration | 75% | 25% | 50 |
| Climate | 25% | 70% | 45 |
| Gun violence | 35% | 70% | 35 |

<div class="box zone-low" style="margin-top: 15px;">
<div class="box-header">Warning</div>
<div class="box-content">Never predict a single number for polarized topics. The "average" represents no one.</div>
</div>

</div>
</div>

<div class="source">Source: Meta-analysis (intent gap); Pew Research Feb 2025 (N=5,086)</div>

---

# Eight documented bias patterns with systematic corrections

<div class="quad" style="margin-top: 15px;">

<div class="box">
<div class="box-header">Under-prediction biases</div>
<table style="font-size: 11px; margin: 10px 0;">
<tr><td>Senior tech adoption</td><td><strong>×1.30-1.65</strong></td></tr>
<tr><td>Status quo preference</td><td><strong>+15-20 pts</strong></td></tr>
<tr><td>Emotional intensity</td><td><strong>×1.20-1.30</strong></td></tr>
<tr><td>Cruise/travel satisfaction</td><td><strong>+15 pts</strong></td></tr>
</table>
</div>

<div class="box">
<div class="box-header">Over-prediction biases</div>
<table style="font-size: 11px; margin: 10px 0;">
<tr><td>AI concern (general)</td><td><strong>×0.90</strong></td></tr>
<tr><td>Intent-to-action</td><td><strong>×0.30-0.55</strong></td></tr>
<tr><td>Life satisfaction</td><td><strong>-3 to -5 pts</strong></td></tr>
</table>
</div>

<div class="box">
<div class="box-header">Structural biases</div>
<table style="font-size: 11px; margin: 10px 0;">
<tr><td>Partisan averaging</td><td><strong>Segment</strong></td></tr>
<tr><td>Open-end polish</td><td><strong>20% low-quality</strong></td></tr>
</table>
</div>

<div class="box">
<div class="box-header">Validation sources</div>
<div class="box-content" style="font-size: 11px;">
AARP 2025 (N=3,838)<br>
Pew/YouGov 2025<br>
Gallup 2025 (N=13K+)<br>
Behavioral meta-analysis
</div>
</div>

</div>

<div class="source">Source: Validated calibrations documented in CALIBRATION_MEMORY.md and BIAS_COUNTERMEASURES.md</div>

---

# Validation results: Calibration brings 100% of predictions within 5 points of actual

<div class="two-col">

<div>

**Before/After Comparison**

| Metric | Naive | Calibrated |
|--------|-------|------------|
| Mean error | 9.1 pts | **1.9 pts** |
| Within 2 pts | 7% | **81%** |
| Within 5 pts | 30% | **100%** |

<div class="highlight-box" style="margin-top: 20px;">
<strong>79% error reduction</strong><br>
<span style="font-size: 12px;">Statistically significant at p < 0.0001</span>
</div>

</div>
<div>

**Sample Predictions**

| Prediction | Naive | Cal. | Actual |
|------------|-------|------|--------|
| 50+ smartphone | 72% | 89% | 90% |
| Independent | 35% | 44% | 45% |
| AI concern | 58% | 50% | 48% |
| Mfg NPS | 40 | 64 | 65 |
| Cruise sat. | 78% | 91% | 90% |
| Engaged | 38% | 32% | 31% |

</div>
</div>

<div class="source">Source: CrowdWave validation testing (27 test cases, 6 domains); ACCURACY_TESTS.md</div>

---

# Executive audiences require role-specific calibration

**C-suite concern multipliers by role**

<div style="margin: 20px 0;">

| Concern | CEO | CFO | CHRO | CMO | Insight |
|---------|:---:|:---:|:----:|:---:|---------|
| Cyber | 1.30 | 1.40 | **1.60** | 0.90 | CHROs most concerned |
| AI | 0.90 | 1.05 | **1.40** | 1.10 | CEOs least concerned |
| Transformation | 1.50 | 1.15 | **1.70** | 1.40 | CHROs leading change |
| Uncertainty | 1.35 | **1.50** | 1.50 | 1.25 | CFOs feel it most |

</div>

<div class="two-col">
<div class="box">
<div class="box-header">Key finding</div>
<div class="box-content">CHROs are 75% more concerned about AI than CEOs. Generic "executive" predictions miss these role-based variations.</div>
</div>
<div class="box">
<div class="box-header">Application</div>
<div class="box-content">Always segment by role when surveying C-suite. Use multipliers above to adjust baseline predictions.</div>
</div>
</div>

<div class="source">Source: Conference Board Global C-Suite Survey 2026 (N=1,732 executives)</div>

---

# Domain coverage: 20+ validated categories with documented accuracy

<div class="three-col" style="font-size: 12px;">

<div>
<div class="box zone-high" style="margin-bottom: 10px;">
<div class="box-header">Fully Validated (±2-4 pts)</div>
</div>
<div class="box">Trust in institutions</div>
<div class="box">Political identity</div>
<div class="box">Technology adoption</div>
<div class="box">NPS by industry</div>
<div class="box">Consumer concerns</div>
<div class="box">Travel/hospitality</div>
</div>

<div>
<div class="box zone-med" style="margin-bottom: 10px;">
<div class="box-header">Partial Validation (±4-6 pts)</div>
</div>
<div class="box">Executive attitudes</div>
<div class="box">Healthcare decisions</div>
<div class="box">Workplace engagement</div>
<div class="box">Financial attitudes</div>
<div class="box">Media consumption</div>
</div>

<div>
<div class="box zone-low" style="margin-bottom: 10px;">
<div class="box-header">Gaps / Low Confidence</div>
</div>
<div class="box">Purchase intent</div>
<div class="box">Price sensitivity</div>
<div class="box">Novel behaviors</div>
<div class="box">Rural/urban splits</div>
<div class="box">Emerging tech</div>
</div>

</div>

<div class="source">Source: CALIBRATION_MEMORY.md, CALIBRATION_EXPANSION.md (combined ~50KB documentation)</div>

---

# Use case matrix: Match application to accuracy zone

<div class="two-col">

<div>

**By Confidence Level**

<div class="box zone-high" style="margin: 10px 0;">
<div class="box-header">HIGH CONFIDENCE</div>
<div class="box-content">
Concept testing<br>
Audience sizing<br>
Trend validation<br>
Priority ranking<br>
Benchmark comparison
</div>
</div>

<div class="box zone-med" style="margin: 10px 0;">
<div class="box-header">MEDIUM CONFIDENCE</div>
<div class="box-content">
Hypothesis generation<br>
Early-stage screening<br>
Directional guidance
</div>
</div>

<div class="box zone-low" style="margin: 10px 0;">
<div class="box-header">VALIDATE FIRST</div>
<div class="box-content">
New product concepts<br>
Pricing research<br>
High-stakes decisions
</div>
</div>

</div>
<div>

**Not Recommended Without Validation**

<div class="quad">
<div class="box">
<div class="box-header">Purchase conversion</div>
<div class="box-content" style="font-size: 11px;">Use A/B testing instead</div>
</div>
<div class="box">
<div class="box-header">Polarized topics</div>
<div class="box-content" style="font-size: 11px;">Must segment by party</div>
</div>
<div class="box">
<div class="box-header">Novel behaviors</div>
<div class="box-content" style="font-size: 11px;">No training data</div>
</div>
<div class="box">
<div class="box-header">Legal/regulatory</div>
<div class="box-content" style="font-size: 11px;">Requires human evidence</div>
</div>
</div>

</div>
</div>

<div class="source">Source: CrowdWave accuracy framework; industry best practices</div>

---

# Competitive differentiation: Documented accuracy vs. unvalidated claims

<div style="margin: 15px 0;">

| Capability | Raw LLM | Competitors | CrowdWave |
|------------|:-------:|:-----------:|:---------:|
| Documented accuracy | ✗ | "95%" ⚠ | 27 tests ✓ |
| Human validation | ✗ | Unclear | 5M+ ✓ |
| Bias corrections | ✗ | None | 8 patterns ✓ |
| Domain calibrations | ✗ | Generic | 20+ ✓ |
| Confidence scoring | ✗ | ✗ | Per-question ✓ |
| Known limitations | ✗ | ✗ | Documented ✓ |

</div>

<div class="two-col">
<div class="box">
<div class="box-header">Competitor claims</div>
<div class="box-content">"95% accuracy" — testimonials only, no methodology published, no test cases documented</div>
</div>
<div class="highlight-box">
<div class="box-header" style="color: white;">CrowdWave approach</div>
<div class="box-content" style="color: white;">27 test cases, 79% error reduction, full methodology transparency, known limitations documented</div>
</div>
</div>

<div class="source">Source: Competitive analysis; COMPETITIVE_BENCHMARKS.md</div>

---

# Methodology: 10-phase production workflow with ensemble estimation

<div style="display: flex; gap: 8px; margin: 20px 0; font-size: 11px;">
<div class="box" style="flex: 1; text-align: center; padding: 8px;">
<div style="font-weight: 600; color: #003366;">1</div>
Config
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px; background: #003366; color: white;">
<div style="font-weight: 600;">2</div>
Priors
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px;">
<div style="font-weight: 600; color: #003366;">3</div>
Behavior
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px;">
<div style="font-weight: 600; color: #003366;">4</div>
Survey
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px; background: #003366; color: white;">
<div style="font-weight: 600;">5</div>
Ensemble
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px;">
<div style="font-weight: 600; color: #003366;">6</div>
Verify
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px; background: #003366; color: white;">
<div style="font-weight: 600;">7</div>
Calibrate
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px;">
<div style="font-weight: 600; color: #003366;">8</div>
Open-end
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px;">
<div style="font-weight: 600; color: #003366;">9</div>
QA
</div>
<div class="box" style="flex: 1; text-align: center; padding: 8px;">
<div style="font-weight: 600; color: #003366;">10</div>
Output
</div>
</div>

<div class="two-col">
<div class="box">
<div class="box-header">Ensemble approach (Phase 5)</div>
<table style="font-size: 11px;">
<tr><td>Run 1: Conservative</td><td>40%</td></tr>
<tr><td>Run 2: Signal-forward</td><td>35%</td></tr>
<tr><td>Run 3: Heterogeneity</td><td>25%</td></tr>
</table>
<div class="box-content" style="margin-top: 8px; font-size: 11px;">Reduces single-shot variance by ~40%</div>
</div>
<div class="box">
<div class="box-header">Critical phases (highlighted)</div>
<div class="box-content" style="font-size: 11px;">
<strong>Phase 2:</strong> Anchor on benchmark data<br>
<strong>Phase 5:</strong> 3 independent runs<br>
<strong>Phase 7:</strong> Apply calibration multipliers
</div>
</div>
</div>

<div class="source">Source: MASTER_SIMULATION_SYSTEM.md (10-phase methodology, 38KB)</div>

---

# Summary: Calibrated predictions deliver 79% error reduction with known accuracy by question type

<div class="two-col" style="margin-top: 20px;">

<div>

**Performance metrics**

<div class="quad">
<div class="box" style="text-align: center;">
<div style="font-size: 28px; color: #003366;">79%</div>
<div style="font-size: 10px;">Error reduction</div>
</div>
<div class="box" style="text-align: center;">
<div style="font-size: 28px; color: #003366;">1.9</div>
<div style="font-size: 10px;">MAE (points)</div>
</div>
<div class="box" style="text-align: center;">
<div style="font-size: 28px; color: #003366;">20+</div>
<div style="font-size: 10px;">Domains</div>
</div>
<div class="box" style="text-align: center;">
<div style="font-size: 28px; color: #003366;">5M+</div>
<div style="font-size: 10px;">Human responses</div>
</div>
</div>

</div>
<div>

**Accuracy by zone**

<div class="box zone-high" style="margin: 8px 0; padding: 8px 12px;">
<strong>±2-3 pts</strong> — Trust, awareness → Decisions
</div>
<div class="box zone-med" style="margin: 8px 0; padding: 8px 12px;">
<strong>±4-5 pts</strong> — Satisfaction, NPS → Direction
</div>
<div class="box zone-low" style="margin: 8px 0; padding: 8px 12px;">
<strong>±8-15 pts</strong> — Intent, polarized → Validate
</div>

</div>
</div>

<div class="highlight-box" style="margin-top: 20px;">
<strong>Differentiation:</strong> Documented accuracy. Known limits. Transparent methodology.
</div>

<div class="source">Source: CrowdWave Accuracy Framework, February 2026</div>

---

<!-- _class: lead -->
<!-- _backgroundColor: #003366 -->
<!-- _color: #ffffff -->
<!-- _footer: "" -->

<br><br>

# Appendix

---

# Appendix A: Demographic calibration multipliers

| Segment | Emotional | Digital | Price |
|---------|:---------:|:-------:|:-----:|
| Women 60+ | ×1.30 | ×1.35 | ×0.85 |
| Women 18-59 | ×1.10 | ×1.00 | ×1.00 |
| Adults 50-69 | — | ×1.30 | — |
| Adults 70-79 | — | ×1.40 | — |
| Adults 80+ | — | ×1.50 | — |
| High-income ($150K+) | — | +0.3 | ×0.60 |
| Parents (child context) | +0.6 | — | ×0.80 |

<div class="source">Source: AARP Tech Trends 2025 (N=3,838); validated calibration studies</div>

---

# Appendix B: Source quality framework

<div class="three-col">

<div class="box zone-high">
<div class="box-header">Tier 1</div>
<div class="box-content">
Fed, Pew, Gallup, AARP<br><br>
Probability sample<br>
N > 1,000<br>
Published methodology
</div>
</div>

<div class="box zone-med">
<div class="box-header">Tier 2</div>
<div class="box-content">
McKinsey, Deloitte, JD Power<br><br>
Large N<br>
Established methodology<br>
Industry standard
</div>
</div>

<div class="box zone-low">
<div class="box-header">Tier 3</div>
<div class="box-content">
YouGov, Harris, Morning Consult<br><br>
Online panels<br>
Useful for trends<br>
Directional guidance
</div>
</div>

</div>

**Minimum sample requirements:** Topline: 400 | Subgroups: 800-1,000 | Rare: 2,500+

<div class="source">Source: AAPOR standards; VALIDATION_METHODOLOGY.md</div>

---

<!-- _class: lead -->
<!-- _backgroundColor: #003366 -->
<!-- _color: #ffffff -->
<!-- _footer: "" -->

<br><br>

# CrowdWave

**Documented accuracy. Known limits. Transparent methodology.**

February 2026
