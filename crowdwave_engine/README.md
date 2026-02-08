# CrowdWave Simulation Engine

Production-ready survey simulation engine implementing the CrowdWave calibration methodology.

## Features

- **10-Phase Methodology**: Full implementation of the validated simulation pipeline
- **100+ Calibration Multipliers**: Human-validated corrections across 20+ domains
- **8 Bias Countermeasures**: Automatic detection and correction of LLM biases
- **Ensemble Simulation**: 3-run averaging for reduced variance
- **Accuracy Zones**: Automatic confidence scoring with actionable guidance

## Quick Start

```python
from crowdwave import CrowdWaveEngine

engine = CrowdWaveEngine()

survey = {
    "audience": "Parents of children 12-17 with anxiety",
    "geography": "USA",
    "sample_size": 500,
    "questions": [
        {
            "id": "Q1",
            "text": "How satisfied are you with your child's mental health care?",
            "type": "scale",
            "scale": [1, 2, 3, 4, 5],
            "labels": ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]
        }
    ]
}

results = engine.simulate(survey)
print(results)
```

## Architecture

```
crowdwave_engine/
├── crowdwave.py          # Main engine class
├── calibration.py        # Calibration library and multipliers
├── bias_corrections.py   # Bias detection and countermeasures
├── distributions.py      # Statistical distribution utilities
├── validators.py         # Output validation and QA
└── prompts.py           # LLM prompt templates
```

## Accuracy Expectations

| Zone | MAE | Question Types | Use Case |
|------|-----|----------------|----------|
| HIGH | ±2-3 pts | Trust, awareness, party ID | Decision-ready |
| MEDIUM | ±4-5 pts | Satisfaction, NPS, concern | Directional |
| LOW | ±8-15 pts | Intent, price, polarized | Validate first |

## Validated Against

- Survicate NPS Benchmark (5.4M responses)
- Gallup (13,000+ respondents)
- Conference Board C-Suite (1,732 executives)
- AARP Tech Trends (3,838 adults 50+)
- Pew Research (multiple studies)
- Edelman Trust Barometer (33,000 global)
