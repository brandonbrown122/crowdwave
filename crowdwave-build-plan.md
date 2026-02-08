# Crowdwave: Synthetic Audience Platform Build Plan

*Compiled from research session — February 5, 2026*

---

## Table of Contents
1. [Competitive Landscape](#competitive-landscape)
2. [Build Plan](#build-plan)
3. [Calibration Strategy](#calibration-strategy)
4. [Quick Reference](#quick-reference)

---

# Competitive Landscape

## The Synthetic Audience Market Research Industry

### Key Players

| Company | Focus | Best For |
|---------|-------|----------|
| **Lakmoos AI** | Hybrid neuro-symbolic AI, validated synthetic respondents | Enterprise MR in regulated industries (auto, finance) |
| **Evidenza** | Brand messaging & go-to-market testing | Marketing teams, product launches |
| **Synthetic Users** | Qualitative interviews via LLM | UX research, rapid hypothesis generation |
| **Yabble** | "Virtual Audiences" for quick consumer insights | Fast brand research, hard-to-reach audiences |
| **Viewpoints.ai** | Synthetic consumer panels | Survey pre-testing, concept validation |
| **Aaru** | Enterprise integration, multi-agent AI | Large orgs with CRM/CDP integration needs |
| **Artificial Societies** | Large-scale social simulations | Network effects, community behavior modeling |
| **Brox.ai** | UX flow simulation | Product teams, usability testing |
| **Kantar (ConceptEvaluateAI)** | AI-augmented traditional MR | Established brands wanting hybrid approach |
| **NIQ (NielsenIQ)** | Synthetic respondents + CPG data | FMCG/CPG concept testing at scale |

---

### Competitive Dimensions

#### 1. Methodology / AI Approach

| Approach | Companies |
|----------|-----------|
| LLM-based (GPT wrappers) | Synthetic Users, Native, many startups |
| Hybrid neuro-symbolic | Lakmoos |
| Behavioral science models | bluepill, subconscious.ai |
| RAG-enhanced | Evidenza, Viewpoints.ai |
| Multi-agent simulation | Aaru, Artificial Societies |

#### 2. Validation & Rigor

| Level | Companies |
|-------|-----------|
| High (benchmarked vs. real data) | Lakmoos, Kantar, NIQ |
| Medium (some validation) | Evidenza, Viewpoints.ai, Aaru |
| Lower (fast but less auditable) | Synthetic Users, Yabble, Simulatrex |

#### 3. Speed vs. Depth

| Profile | Companies |
|---------|-----------|
| Speed-first (hours) | Yabble, Synthetic Users, Simulatrex |
| Balanced | Evidenza, Aaru, Viewpoints.ai |
| Depth-first (days, rigorous) | Lakmoos, Kantar, NIQ |

#### 4. Use Case Focus

| Use Case | Best Options |
|----------|--------------|
| Concept testing | Evidenza, Kantar, NIQ, Simulatrex |
| UX/product research | Synthetic Users, Brox.ai, Simile |
| Brand/messaging | Evidenza, Yabble, bluepill |
| Enterprise/regulated | Lakmoos, Kantar, NIQ |
| Hard-to-reach audiences | Yabble, Lakmoos |
| Social/network dynamics | Artificial Societies |

#### 5. Pricing Model

| Model | Companies |
|-------|-----------|
| Enterprise/custom | Lakmoos, Kantar, NIQ, Aaru |
| Self-serve SaaS | Synthetic Users, Yabble, Semilattice ($399/mo) |
| Hybrid | Evidenza, Viewpoints.ai |

---

### Positioning Summary

- **Speed + low rigor:** Yabble, Synthetic Users
- **Enterprise credibility + validation:** Lakmoos, Kantar, NIQ
- **Marketing/GTM testing:** Evidenza
- **UX/product feedback:** Brox.ai, Synthetic Users
- **Integrating with existing data:** Aaru

⚠️ **Watch out for:** Many tools are just prompted GPT wrappers — plausible-sounding but not methodologically grounded. Ask vendors how they validate against real-world data.

---

# Build Plan

## Vision

A synthetic research platform that delivers **fast, validated consumer insights** — positioned between the GPT-wrapper toys and the slow enterprise giants.

---

## Phase 1: MVP (Months 1-3)

### Core Product

| Component | Build |
|-----------|-------|
| **Persona engine** | Start with 5-10 well-defined consumer segments |
| **Survey interface** | Simple web form: upload questions → select audience → get responses |
| **LLM backbone** | Claude or GPT-4 with heavy prompt engineering + guardrails |
| **Response generation** | Persona-conditioned prompts that constrain outputs to segment behavior |

### Example Segments to Start

- Budget-conscious millennial parents
- Tech-forward Gen Z
- Affluent suburban boomers
- Urban professional millennials
- Value-seeking Gen X

### Key Constraints

- **Don't try to be everything** — pick ONE use case (concept testing, ad copy testing, or survey pre-testing)
- **Don't fake rigor yet** — be transparent: "AI-generated insights for directional guidance"

### Tech Stack

```
Frontend: React/Next.js
Backend: Node or Python (FastAPI)
LLM: Claude API or OpenAI
DB: Postgres + vector store (Pinecone/Weaviate) for persona memory
Auth: Clerk or Auth0
Hosting: Vercel + Railway or AWS
```

---

## Phase 2: Validation Layer (Months 4-6)

### Building Credibility

| Action | How |
|--------|-----|
| **Partner with a brand** | Find 1-2 companies willing to run parallel tests (synthetic vs. real panel) |
| **Benchmark studies** | Run 10+ side-by-side comparisons, measure correlation |
| **Publish results** | Transparency = trust. Blog it, present at conferences |
| **Iterate on weak spots** | Which segments underperform? Fix the personas |

### Data Enrichment

- License or partner for real consumer data (surveys, purchase behavior)
- Use RAG to ground personas in actual responses, not just LLM imagination
- Build segment-specific knowledge bases

---

## Phase 3: Product Expansion (Months 6-12)

| Feature | Purpose |
|---------|---------|
| **Interview mode** | Qualitative depth — chat with synthetic personas |
| **Custom personas** | Upload your own customer data → generate matched synthetic audience |
| **Audit trail** | Show *why* a persona responded a certain way (explainability) |
| **API access** | Let teams integrate into existing workflows |
| **Collaboration** | Teams, projects, shared insights |

---

## Phase 4: Moat Building (Year 2+)

| Moat | How |
|------|-----|
| **Proprietary data** | Accumulate real validation data over time |
| **Vertical specialization** | Own one industry (CPG, fintech, healthcare) deeply |
| **Behavioral models** | Move beyond LLMs — add decision-science models for realism |
| **Network effects** | More usage → more validation → better accuracy |

---

## Team (Lean Start)

| Role | Focus |
|------|-------|
| **Founder/PM** | Vision, sales, customer discovery |
| **ML/AI engineer** | Persona engine, prompt engineering, RAG |
| **Full-stack dev** | Product build |
| **MR advisor** | Industry credibility, methodology guidance |

---

## Go-to-Market

1. **Early adopters**: Startups, agencies, innovation teams who need speed over pedigree
2. **Wedge use case**: Survey pre-testing ("test your survey on synthetic panel before spending $50K on real one")
3. **Pricing**: Freemium or low-cost entry ($99-299/mo) to get adoption, then upsell enterprise
4. **Content play**: Publish benchmark studies, build thought leadership

---

## Positioning Options

| Position | Pitch |
|----------|-------|
| **Speed king** | "Insights in 10 minutes, not 10 weeks" |
| **Validation-first** | "The only synthetic panel that publishes accuracy benchmarks" |
| **Niche master** | "Synthetic audiences for [fintech / healthcare / gaming]" |
| **Hybrid play** | "AI-first, human-validated" (synthetic for speed, real panel for confirmation) |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Accuracy skepticism | Publish benchmarks relentlessly |
| Data moat is hard | Partner early, build validation flywheel |
| Incumbents move fast | Kantar/NIQ are slow but well-resourced — move faster, stay niche |
| LLM limitations | Hybrid architecture, don't over-promise |

---

# Calibration Strategy

## The Core Challenge

It's not enough for synthetic respondents to give *plausible* answers — the **distribution** needs to match reality:
- If 60% of real millennials prefer Option A, your synthetic panel should land near 60%, not 85%
- You need the spread, not just the average

---

## Fast Calibration Strategies

### 1. Anchor on Public Data (Day 1)

Use existing research as ground truth:

| Source | What You Get |
|--------|--------------|
| **Pew Research** | Attitudes, demographics, political/social views |
| **Statista** | Consumer behavior, purchase preferences |
| **Census / BLS** | Demographics, income, household composition |
| **Academic studies** | Validated scales (NPS benchmarks, satisfaction norms) |
| **Industry reports** | Category-specific benchmarks |

**How to use it:** Bake these distributions into your persona definitions. Instead of prompting "respond as a millennial," prompt "respond as a millennial, knowing that 65% of millennials in surveys say X."

---

### 2. Distribution-Aware Prompting

Don't just generate one response — generate the **distribution**:

```
Prompt approach:
"You are simulating a panel of 100 [segment]. 
For this question, estimate:
- % who would choose Option A
- % who would choose Option B
- % who would choose Option C
Then generate individual responses weighted to that distribution."
```

Or sample multiple synthetic respondents and aggregate — don't rely on single-shot answers.

---

### 3. Temperature + Sampling Tricks

| Technique | Effect |
|-----------|--------|
| **Higher temperature** | More variance in responses (mimics real human spread) |
| **Multiple samples** | Run same persona 10x, aggregate for distribution |
| **Stratified personas** | Create sub-segments within a segment |

---

### 4. Rapid Micro-Validation

Run **small, fast checks** to calibrate:

| Method | Speed | Cost |
|--------|-------|------|
| **Prolific/MTurk micro-surveys** | 24-48 hrs | $50-200 |
| **Social polls** | Hours | Free |
| **Customer intercepts** | Days | Low |
| **Historical data** | Instant | Free (if available) |

**Calibration Loop:** 
1. Run synthetic panel
2. Run micro-survey (n=50-100) on same question
3. Compare distributions
4. Adjust persona prompts/weights
5. Repeat

---

### 5. Bayesian Calibration Layer

Build a lightweight calibration model:

```
Prior: LLM's raw output distribution
Evidence: Real-world benchmark data
Posterior: Adjusted synthetic distribution
```

**In practice:**
- LLM says 80% prefer A
- Benchmark data says 55% prefer A
- Apply correction factor to shift outputs

Automate with a calibration layer between LLM output and final results.

---

### 6. Segment-Specific Fine-Tuning

For critical segments, create **custom prompt templates** tuned to known behaviors:

| Segment | Calibration Data | Prompt Adjustment |
|---------|------------------|-------------------|
| Gen Z | Pew social media data | Weight toward platform-specific behaviors |
| High-income | Spending surveys | Adjust price sensitivity downward |
| Parents | Family purchase studies | Weight toward convenience, safety |

---

### 7. Ensemble Approach

Combine multiple methods:

```
Final distribution = 
  (0.4 × LLM raw output) + 
  (0.3 × benchmark-anchored estimate) + 
  (0.3 × micro-validation adjusted)
```

Weight based on confidence in each source.

---

## Quick-Start Calibration Playbook

| Week | Action |
|------|--------|
| **Week 1** | Collect public benchmarks for 3-5 key segments |
| **Week 2** | Build distribution-aware prompts, test variance |
| **Week 3** | Run 2-3 micro-validation studies (Prolific, n=50 each) |
| **Week 4** | Build calibration layer, adjust weights |
| **Ongoing** | Every new study = new calibration data point |

---

## Target Accuracy Metrics

| Metric | Target |
|--------|--------|
| **Correlation with real data** | r > 0.7 for top-line metrics |
| **Distribution error** | < 10 percentage points on key questions |
| **Directional accuracy** | 85%+ (synthetic picks same winner as real) |

---

# Quick Reference

## What Makes a Synthetic Tool "World-Class"

1. **Grounded in real data** — not just LLM hallucinations
2. **Validated against actual research** — benchmarked accuracy
3. **Behavioral realism** — personas act like real segments
4. **Auditable/explainable** — trace *why* a synthetic respondent said X
5. **Fast + rigorous** — the hard tradeoff everyone's chasing

## TL;DR Build Strategy

1. Start narrow (one use case, one audience)
2. Validate obsessively
3. Publish transparently
4. Expand from trust

---

*Document generated by Crowdwave Research Assistant*
