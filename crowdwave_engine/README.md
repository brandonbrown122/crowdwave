# Crowdwave Simulation Engine

**Best-in-market survey simulation with 79% error reduction vs naive LLM predictions.**

## Quick Start

```python
from crowdwave_engine import CrowdwaveEngine

engine = CrowdwaveEngine()

config = {
    "audience": "US consumers age 25-54",
    "geography": "USA",
    "topic": "Product satisfaction",
}

questions = [
    {
        "id": "Q1",
        "text": "How satisfied are you with the product?",
        "type": "scale",
        "scale": [1, 5],
    },
    {
        "id": "Q2",
        "text": "How likely are you to recommend us?",
        "type": "nps",
    },
]

report = engine.simulate(config, questions)

# Output results
for result in report.results:
    print(f"{result.question_id}: Mean={result.mean:.2f}")
    print(f"  Distribution: {result.distribution}")
```

## Installation

```bash
# From PyPI (when published)
pip install crowdwave-engine

# From source
cd crowdwave_engine
pip install -e .
```

## Key Features

### 1. Calibrated Predictions

Unlike naive LLM approaches, Crowdwave applies validated calibrations:

- **Industry NPS benchmarks** from 5.4M+ survey responses
- **Demographic multipliers** (seniors, parents, executives)
- **Construct corrections** (intent-to-action gap, status quo preference)
- **Partisan segmentation** for polarized topics

### 2. Bias Detection & Correction

Automatically detects and corrects 8 documented LLM biases:

| Bias | LLM Tendency | Correction |
|------|--------------|------------|
| Social desirability | Over-predict positive | -10-15% |
| Acquiescence | Over-predict agreement | -5-10% |
| Status quo | Under-predict inertia | +15-20 pts |
| Senior tech | Under-predict adoption | ×1.30-1.65 |
| AI concern | Over-predict fear | ×0.90 |

### 3. Accuracy Zones

Each prediction includes an accuracy zone rating:

| Zone | Expected Error | Use Case |
|------|---------------|----------|
| HIGH | ±2-3 pts | Decisions |
| MEDIUM | ±4-5 pts | Direction |
| LOW | ±8-15 pts | Validate first |

### 4. Distribution Generation

Multiple statistically rigorous distribution types:

```python
from crowdwave_engine import (
    generate_beta_distribution,
    generate_truncated_normal,
    generate_skewed_distribution,
    generate_bimodal_distribution,
    generate_nps_distribution,
)

# Generate satisfaction distribution
dist = generate_truncated_normal(mean=3.8, sd=1.1)
```

### 5. Evaluation Framework

Track prediction accuracy over time:

```python
from crowdwave_engine import EvaluationTracker

tracker = EvaluationTracker()

# Record prediction
tracker.record_prediction(
    prediction_id="survey_001_q1",
    question_type="scale",
    predicted_mean=3.5,
    predicted_distribution={"1": 10, "2": 15, "3": 25, "4": 30, "5": 20}
)

# Later: validate against actual results
tracker.validate_prediction(
    prediction_id="survey_001_q1",
    actual_mean=3.8,
    actual_distribution={"1": 8, "2": 12, "3": 22, "4": 35, "5": 23}
)

# Get accuracy metrics
metrics = tracker.get_metrics()
print(f"MAE: {metrics.mean_mae:.2f}")
```

## API Server

Run as a REST API:

```bash
python -m crowdwave_engine.api --port 8000
```

Endpoints:
- `POST /simulate` - Run simulation
- `GET /health` - Health check
- `GET /benchmarks` - List available benchmarks

## CLI

```bash
# Run simulation from JSON file
python -m crowdwave_engine.cli simulate survey.json

# Output formats
python -m crowdwave_engine.cli simulate survey.json --format csv
python -m crowdwave_engine.cli simulate survey.json --format json
```

## Docker

```bash
# Build
docker build -t crowdwave-engine .

# Run
docker run -p 8000:8000 crowdwave-engine
```

Or with docker-compose:

```bash
docker-compose up
```

## LLM Integration (Optional)

For enhanced predictions with web-search priors:

```python
from crowdwave_engine import create_enhanced_engine

# Requires ANTHROPIC_API_KEY or OPENAI_API_KEY
engine = create_enhanced_engine(provider="anthropic")

# Searches for relevant priors before simulation
report = engine.simulate_with_priors(config, questions)
```

## Validation Results

Validated against real survey data:

| Dataset | N | MAE | Notes |
|---------|---|-----|-------|
| Amazon S&S | 49 | <0.6 pts | Subscription service |
| Mental Health | 500+ | <0.5 pts | Healthcare concern |
| NPS Benchmark | 5.4M | ±3 pts | Cross-industry |

## File Structure

```
crowdwave_engine/
├── __init__.py          # Package exports
├── crowdwave.py         # Core simulation engine
├── calibration.py       # Industry benchmarks
├── bias_corrections.py  # LLM bias handling
├── distributions.py     # Statistical distributions
├── evaluation.py        # Accuracy tracking
├── llm_integration.py   # Optional LLM priors
├── prompts.py           # Prompt templates
├── api.py               # FastAPI server
├── cli.py               # Command-line interface
└── tests/               # Test suite (65+ tests)
```

## Contributing

1. Run tests: `pytest tests/ -v`
2. Check coverage: `pytest --cov=crowdwave_engine tests/`
3. Format: `black crowdwave_engine/`

## License

Proprietary - Crowdwave, Inc.

## Support

- Documentation: See `/docs` directory
- Issues: Contact Crowdwave support
