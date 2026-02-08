"""
CrowdWave LLM Prompt Templates
10-Phase methodology prompts for Claude/GPT integration.
"""

from typing import Dict, List, Optional
from .calibration import CONSTRUCT_CORRECTIONS, DEMOGRAPHIC_MULTIPLIERS


# ═══════════════════════════════════════════════════════════════
# MAIN SIMULATION PROMPT
# ═══════════════════════════════════════════════════════════════

SIMULATION_PROMPT_TEMPLATE = """
═══════════════════════════════════════════════════════════════
CROWDWAVE SURVEY SIMULATION ENGINE v2.0
═══════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════
PHASE 1: PROJECT CONFIG
═══════════════════════════════════════════════════════════════
as_of_date: {as_of_date}
geography: {geography}
sample_size: N={sample_size}

AUDIENCE DEFINITION:
{audience}

SCREENERS (respondents MUST match ALL):
{screeners}

TOPIC/DOMAIN:
{topic}

STIMULI (treat as exposures):
{stimuli}

═══════════════════════════════════════════════════════════════
PHASE 2: ANCHORING PRIORS
═══════════════════════════════════════════════════════════════
Use these validated benchmarks as priors:

{priors}

═══════════════════════════════════════════════════════════════
PHASE 3: BEHAVIORAL REALISM MODEL
═══════════════════════════════════════════════════════════════
Model these response behaviors:
- Satisficing: ~15-25% select midpoints or first options
- Acquiescence bias: slight skew toward agreement
- Social desirability: inflate "good" behaviors by 5-15%
- Scale bunching: cluster in 2-3 adjacent points
- Primacy/recency: slight bias to first/last options

═══════════════════════════════════════════════════════════════
PHASE 4: QUESTIONS TO SIMULATE
═══════════════════════════════════════════════════════════════
{questions}

═══════════════════════════════════════════════════════════════
PHASE 5: ENSEMBLE SIMULATION
═══════════════════════════════════════════════════════════════
Generate 3 INDEPENDENT estimates:

RUN 1 (Conservative): Anchor on priors, compress toward center
RUN 2 (Signal-forward): Allow larger stimulus effects
RUN 3 (Heterogeneity): Higher variance, segment differences

Then reconcile: 40% Run1 + 35% Run2 + 25% Run3

═══════════════════════════════════════════════════════════════
PHASE 6: APPLY CALIBRATION CORRECTIONS
═══════════════════════════════════════════════════════════════
Apply these validated multipliers:

{corrections}

═══════════════════════════════════════════════════════════════
PHASE 7: SELF-CHECK (REJECT IF ANY FAIL)
═══════════════════════════════════════════════════════════════
❌ REJECT: Mean exactly 3.0
❌ REJECT: Any option at 0%
❌ REJECT: All percentages multiples of 5
❌ REJECT: SD < 0.8 or > 1.4 without rationale
❌ REJECT: "Open to X" same as general population
❌ REJECT: Child concern < adult concern
❌ REJECT: Top-box intent > 40% without discount note

═══════════════════════════════════════════════════════════════
PHASE 8: OUTPUT FORMAT
═══════════════════════════════════════════════════════════════
For each question, output:

```json
{{
  "question_id": "Q1",
  "distribution": {{"1": 6.2, "2": 11.8, "3": 23.4, "4": 35.1, "5": 23.5}},
  "mean": 3.58,
  "sd": 1.12,
  "confidence": 0.75,
  "accuracy_zone": "medium",
  "corrections_applied": ["emotional_bonding_+20%"],
  "rationale": "Brief explanation of key factors"
}}
```

═══════════════════════════════════════════════════════════════
EXECUTE NOW
═══════════════════════════════════════════════════════════════
"""


# ═══════════════════════════════════════════════════════════════
# MINIMAL CALIBRATION INSERT
# ═══════════════════════════════════════════════════════════════

MINIMAL_CALIBRATION = """
## SURVEY CALIBRATION (Minimal)

### Means & Shapes (5-point scales)
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

### Intent-Action Gap (CRITICAL)
Stated "Very Likely" → 30% actual. "Likely" → 15% actual.

### Self-Check
REJECT if: mean=3.0 | SD<0.8 | any option=0% | segments identical
"""


# ═══════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════

def build_simulation_prompt(
    config: Dict,
    questions: List[Dict],
    priors: List[Dict]
) -> str:
    """Build the full simulation prompt from config."""
    
    # Format priors section
    priors_text = ""
    for prior in priors:
        if prior.get("type") == "demographic":
            priors_text += f"- Demographic: {prior['key']}\n"
            for k, v in prior.get("modifiers", {}).items():
                if k != "source":
                    priors_text += f"  - {k}: {v}\n"
        elif prior.get("type") == "nps_benchmark":
            priors_text += f"- NPS Benchmark: Median {prior['data'].get('overall_median', 42)}\n"
    
    if not priors_text:
        priors_text = "No specific priors available - use conservative defaults"
    
    # Format questions section
    questions_text = ""
    for q in questions:
        questions_text += f"\n{q.get('id', 'Q')}: {q.get('text', '')}\n"
        questions_text += f"  Type: {q.get('type', 'scale')}\n"
        if q.get('options'):
            questions_text += f"  Options: {', '.join(q['options'])}\n"
    
    # Format corrections section
    corrections_text = ""
    for construct, correction in list(CONSTRUCT_CORRECTIONS.items())[:10]:
        if isinstance(correction.get("multiplier"), tuple):
            mult = f"×{correction['multiplier'][0]}-{correction['multiplier'][1]}"
        elif correction.get("multiplier"):
            mult = f"×{correction['multiplier']}"
        elif correction.get("add_points"):
            if isinstance(correction["add_points"], tuple):
                mult = f"+{correction['add_points'][0]} to {correction['add_points'][1]} pts"
            else:
                mult = f"{correction['add_points']:+d} pts"
        else:
            continue
        corrections_text += f"- {construct}: {mult}\n"
    
    # Format screeners
    screeners = config.get("screeners", [])
    screeners_text = "\n".join(f"- {s}" for s in screeners) if screeners else "None"
    
    # Format stimuli
    stimuli = config.get("stimuli", [])
    stimuli_text = "\n".join(f"- {s}" for s in stimuli) if stimuli else "None"
    
    return SIMULATION_PROMPT_TEMPLATE.format(
        as_of_date=config.get("as_of_date", "2026-02-07"),
        geography=config.get("geography", "USA"),
        sample_size=config.get("sample_size", 500),
        audience=config.get("audience", "General population"),
        screeners=screeners_text,
        topic=config.get("topic", "Not specified"),
        stimuli=stimuli_text,
        priors=priors_text,
        questions=questions_text,
        corrections=corrections_text,
    )


def get_quick_calibration_insert() -> str:
    """Get the minimal calibration insert for quick simulations."""
    return MINIMAL_CALIBRATION


# ═══════════════════════════════════════════════════════════════
# VALIDATION PROMPT
# ═══════════════════════════════════════════════════════════════

VALIDATION_PROMPT = """
═══════════════════════════════════════════════════════════════
CROWDWAVE VALIDATION CHECK
═══════════════════════════════════════════════════════════════

Review this simulated distribution and check for:

1. ❌ Mean exactly 3.0 on 5-point scale
2. ❌ Any option at exactly 0%
3. ❌ All percentages are multiples of 5
4. ❌ SD below 0.8 or above 1.4
5. ❌ "Open to X" audience same as general pop
6. ❌ Child concern lower than adult concern
7. ❌ Top-box intent above 40% without action gap note

DISTRIBUTION TO CHECK:
{distribution}

CONTEXT:
- Question: {question}
- Audience: {audience}
- Type: {question_type}

OUTPUT FORMAT:
```json
{{
  "passed": true/false,
  "violations": ["list of rule violations"],
  "warnings": ["list of potential issues"],
  "suggested_corrections": {{}}
}}
```
"""
