"""
Crowdwave Simulation Engine
Production-ready survey simulation with 79% error reduction vs naive LLM.

Quick Start:
    from crowdwave_engine import CrowdwaveEngine
    
    engine = CrowdwaveEngine()
    results = engine.simulate(config, questions)
    print(engine.to_json(results))

API Server:
    from crowdwave_engine.api import run_server
    run_server(port=8000)
"""

from .crowdwave import (
    CrowdwaveEngine,
    SurveyConfig,
    Question,
    SimulationResult,
    SimulationReport,
)

from .calibration import (
    AccuracyZone,
    NPS_BENCHMARKS,
    DEMOGRAPHIC_MULTIPLIERS,
    EXECUTIVE_MULTIPLIERS,
    CONSTRUCT_CORRECTIONS,
    get_benchmark,
    get_nps_benchmark,
    requires_partisan_segmentation,
)

from .bias_corrections import (
    BiasType,
    detect_biases,
    validate_distribution,
)

from .prompts import (
    build_simulation_prompt,
    get_quick_calibration_insert,
)

# LLM integration (optional - requires anthropic/openai packages)
try:
    from .llm_integration import (
        EnhancedCrowdwaveEngine,
        PriorSearcher,
        create_enhanced_engine,
    )
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    EnhancedCrowdwaveEngine = None
    PriorSearcher = None
    create_enhanced_engine = None

# Evaluation framework
from .evaluation import (
    EvaluationTracker,
    CalibrationMetrics,
    PredictionRecord,
    calculate_mae,
    calculate_mape,
    calculate_rmse,
    calculate_calibration_score,
)

# Distribution generators
from .distributions import (
    generate_beta_distribution,
    generate_truncated_normal,
    generate_skewed_distribution,
    generate_bimodal_distribution,
    generate_nps_distribution,
    generate_likert_distribution,
    calculate_distribution_stats,
    adjust_distribution_for_bias,
)

# Batch processing
from .batch import (
    BatchProcessor,
    BatchJob,
    BatchResult,
    run_batch_from_file,
)

# Client (optional - requires requests)
try:
    from .client import (
        CrowdwaveClient,
        quick_simulate,
    )
    CLIENT_AVAILABLE = True
except ImportError:
    CLIENT_AVAILABLE = False
    CrowdwaveClient = None
    quick_simulate = None

__version__ = "1.0.2"
__author__ = "Crowdwave"

__all__ = [
    # Main engine
    "CrowdwaveEngine",
    "SurveyConfig",
    "Question",
    "SimulationResult",
    "SimulationReport",
    
    # Calibration
    "AccuracyZone",
    "NPS_BENCHMARKS",
    "DEMOGRAPHIC_MULTIPLIERS",
    "EXECUTIVE_MULTIPLIERS",
    "CONSTRUCT_CORRECTIONS",
    "get_benchmark",
    "get_nps_benchmark",
    "requires_partisan_segmentation",
    
    # Bias corrections
    "BiasType",
    "detect_biases",
    "validate_distribution",
    
    # Prompts
    "build_simulation_prompt",
    "get_quick_calibration_insert",
    
    # Evaluation
    "EvaluationTracker",
    "CalibrationMetrics",
    "PredictionRecord",
    "calculate_mae",
    "calculate_mape",
    "calculate_rmse",
    "calculate_calibration_score",
    
    # Distributions
    "generate_beta_distribution",
    "generate_truncated_normal",
    "generate_skewed_distribution",
    "generate_bimodal_distribution",
    "generate_nps_distribution",
    "generate_likert_distribution",
    "calculate_distribution_stats",
    "adjust_distribution_for_bias",
    
    # Batch processing
    "BatchProcessor",
    "BatchJob",
    "BatchResult",
    "run_batch_from_file",
    
    # Client
    "CrowdwaveClient",
    "quick_simulate",
]
