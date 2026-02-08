"""
CrowdWave Simulation Engine
Production-ready survey simulation with 79% error reduction vs naive LLM.
"""

from .crowdwave import (
    CrowdWaveEngine,
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

__version__ = "1.0.0"
__author__ = "CrowdWave"

__all__ = [
    # Main engine
    "CrowdWaveEngine",
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
]
