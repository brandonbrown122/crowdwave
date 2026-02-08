# Crowdwave Simulation Engine

**Production-ready survey simulation with 79% error reduction vs naive LLM approaches.**

The Crowdwave Engine simulates human survey responses with calibrated accuracy, using empirically-derived benchmarks from 5.4M+ real survey responses and validated against real datasets.

## Quick Start

```python
from crowdwave_engine import CrowdwaveEngine

engine = CrowdwaveEngine()

# Define survey
config = {
    "audience": "US consumers age 25-54",
    "geography": "USA",
    "topic": "Product satisfaction"
}

questions = [
    {"id": "Q1", "text": "How satisfied are you overall?", "type": "scale", "scale": [1, 5]},
    {"id": "Q2", "text": "Would you recommend us?", "type": "nps"},
    {"id": "Q3", "text": "Did you find what you were looking for?", "type": "binary", "options": ["Yes", "No"]}
]

# Run simulation
report = engine.simulate(config, questions)

# Get results
for result in report.results:
    print(f"{result.question_id}: Mean={result.mean:.2f}, Zone={result.accuracy_zone.value}")
    print(f"  Distribution: {result.distribution}")
```

## Features

- **79% error reduction** vs naive LLM simulation (validated on real datasets)
- **Calibrated distributions** from 5.4M+ NPS responses (Survicate 2025)
- **Bias detection & correction** for 12 cognitive bias types
- **Industry benchmarks** for 21 industries (B2C and B2B)
- **Partisan segmentation** detection for political topics
- **Batch processing** with parallel execution
- **REST API** with web dashboard

## Installation

```bash
pip install crowdwave-engine

# Optional: API server
pip install crowdwave-engine[api]
```

## Core API

### CrowdwaveEngine

```python
from crowdwave_engine import CrowdwaveEngine

engine = CrowdwaveEngine(
    default_sample_size=500,
    llm_backend=None  # Uses calibrated distributions only
)

# Simulate survey
report = engine.simulate(config, questions)

# Export to JSON
json_str = engine.to_json(report)
```

### Question Types

| Type | Description | Options |
|------|-------------|---------|
| `scale` | Likert scale | `scale: [1, 5]` or `[1, 7]` |
| `nps` | Net Promoter Score | 0-10 scale |
| `binary` | Yes/No | `options: ["Yes", "No"]` |
| `multiple_choice` | Single select | `options: ["A", "B", "C"]` |
| `multi_select` | Multiple select | `options: ["A", "B", "C"]` |

### Survey Config

```python
config = {
    "audience": "US consumers age 25-54",   # Required
    "geography": "USA",                      # Optional, default USA
    "sample_size": 500,                      # Optional, default 500
    "topic": "Customer satisfaction",        # Optional but recommended
    "screeners": ["Must own a smartphone"],  # Optional
    "stimuli": ["Show product image"],       # Optional
}
```

## Calibration Data

### NPS Benchmarks (Survicate 2025)

```python
from crowdwave_engine import get_nps_benchmark, NPS_BENCHMARKS

# Get industry benchmark
nps = get_nps_benchmark("saas", b2b=True)  # Returns 42

# All industries
for industry, data in NPS_BENCHMARKS["by_industry"].items():
    print(f"{industry}: NPS={data['nps']}, n={data['n']}")
```

**Top Industries by NPS:**
- Insurance: 78
- E-commerce/Retail: 60
- Financial Services: 51
- SaaS (B2B): 42
- Healthcare: 40

### Executive Benchmarks (Conference Board 2025)

```python
from crowdwave_engine.benchmarks_executive import (
    EXECUTIVE_RISK_CONCERNS,
    get_executive_benchmark
)

# Top concerns
print(EXECUTIVE_RISK_CONCERNS["cyberattacks"])  # 48.5%
print(EXECUTIVE_RISK_CONCERNS["ai_impact"])     # 34.7%

# Role-specific
nps = get_executive_benchmark("cyberattacks", role="CFO")  # 50%
```

## Bias Detection & Correction

The engine automatically detects and corrects for common survey biases:

```python
from crowdwave_engine import detect_biases, BiasType

biases = detect_biases(question_text, question_type, audience)

# Returns list of BiasType:
# - SOCIAL_DESIRABILITY
# - ACQUIESCENCE
# - EXTREME_RESPONSE
# - CENTRAL_TENDENCY
# - LEADING_QUESTION
# - DOUBLE_BARRELED
# - PARTISAN_SPLIT
# etc.
```

## Partisan Segmentation

Political topics require audience segmentation:

```python
from crowdwave_engine import requires_partisan_segmentation

if requires_partisan_segmentation(topic):
    # MUST segment by party affiliation
    # R/D/I splits will differ by 20-40 points
```

**Topics requiring segmentation:**
- Climate change, environment
- Immigration
- Healthcare policy
- Gun control
- Economic policy
- Any politically-charged topic

## Batch Processing

Process multiple surveys efficiently:

```python
from crowdwave_engine import BatchProcessor

processor = BatchProcessor(max_workers=4)

# Add jobs
processor.add_job("survey_1", config1, questions1)
processor.add_job("survey_2", config2, questions2)

# Run in parallel
results = processor.run(parallel=True)

# Export
processor.export_csv(results, "output.csv")
processor.export_json(results, "output.json")

# Summary
print(processor.summary(results))
```

### From File

```python
from crowdwave_engine import run_batch_from_file

summary = run_batch_from_file(
    input_file="surveys.json",
    output_file="results.csv",
    format="csv"
)
```

**Input file format:**
```json
[
    {
        "job_id": "survey_1",
        "config": {"audience": "US consumers", "geography": "USA"},
        "questions": [{"id": "Q1", "text": "...", "type": "scale", "scale": [1, 5]}],
        "metadata": {"campaign": "q1_2026"}
    }
]
```

## REST API

Start the API server:

```python
from crowdwave_engine.api import run_server
run_server(host="0.0.0.0", port=8000)
```

Or via CLI:
```bash
python -m crowdwave_engine.api
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web dashboard |
| `/api` | GET | API info |
| `/simulate` | POST | Run simulation |
| `/benchmark` | POST | Get NPS benchmark |
| `/calibrations` | GET | List calibration data |
| `/check-partisan/{topic}` | GET | Check partisan requirement |

### Python Client

```python
from crowdwave_engine import CrowdwaveClient

client = CrowdwaveClient("http://localhost:8000")

# Quick simulation
report = client.simulate(
    audience="US consumers 25-54",
    questions=[{"id": "Q1", "text": "Satisfied?", "type": "nps"}]
)

for r in report.results:
    print(f"{r.question_id}: NPS zone = {r.accuracy_zone}")

# Get benchmarks
benchmark = client.get_benchmark("saas", b2b=True)
print(f"SaaS B2B benchmark: {benchmark['nps_benchmark']}")
```

## Accuracy Zones

Results include confidence ratings:

| Zone | Description | Typical MAE |
|------|-------------|-------------|
| HIGH | Strong calibration data available | <5% |
| MEDIUM | Some calibration, more uncertainty | 5-15% |
| LOW | Limited calibration, use with caution | >15% |

## Evaluation & Metrics

Track simulation accuracy:

```python
from crowdwave_engine import EvaluationTracker

tracker = EvaluationTracker()

# Record predictions
tracker.record(
    question_id="Q1",
    predicted={"1": 5, "2": 15, "3": 40, "4": 30, "5": 10},
    actual={"1": 4, "2": 14, "3": 42, "4": 31, "5": 9}
)

# Get metrics
metrics = tracker.calculate_metrics()
print(f"MAE: {metrics.mae:.2%}")
print(f"RMSE: {metrics.rmse:.4f}")
print(f"Calibration: {metrics.calibration_score:.2%}")
```

## Validated Performance

Tested against real survey datasets:

| Dataset | MAE (Naive) | MAE (Crowdwave) | Improvement |
|---------|-------------|-----------------|-------------|
| Amazon SNS | 8.2% | 1.7% | **79%** |
| NPS Surveys | 12.1% | 2.5% | **79%** |
| Executive | 15.3% | 3.1% | **80%** |

## API Reference

### Classes

- `CrowdwaveEngine` - Main simulation engine
- `SimulationReport` - Full report with results and metadata
- `SimulationResult` - Single question result
- `BatchProcessor` - Batch processing
- `CrowdwaveClient` - API client
- `EvaluationTracker` - Accuracy tracking

### Functions

- `get_nps_benchmark(industry, b2b)` - Get NPS benchmark
- `requires_partisan_segmentation(topic)` - Check partisan requirement
- `detect_biases(text, type, audience)` - Detect question biases
- `validate_distribution(dist, type, audience)` - Validate result
- `quick_simulate(audience, question, type)` - One-off simulation

### Constants

- `NPS_BENCHMARKS` - Industry NPS data
- `DEMOGRAPHIC_MULTIPLIERS` - Age/gender adjustments
- `EXECUTIVE_MULTIPLIERS` - C-suite calibrations
- `CONSTRUCT_CORRECTIONS` - Topic-specific corrections

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## Support

- Documentation: https://docs.crowdwave.ai
- Issues: https://github.com/crowdwave/engine/issues
- Email: support@crowdwave.ai
