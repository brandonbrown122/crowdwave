"""
Crowdwave Calibration Library
Human-validated multipliers and benchmarks for survey simulation.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum


class AccuracyZone(Enum):
    HIGH = "high"      # ±2-3 pts MAE
    MEDIUM = "medium"  # ±4-5 pts MAE
    LOW = "low"        # ±8-15 pts MAE


@dataclass
class Benchmark:
    """A validated benchmark for a specific construct."""
    construct: str
    mean_range: tuple  # (low, high)
    sd_range: tuple    # (low, high)
    shape: str         # "positive_skew", "negative_skew", "bimodal", "symmetric"
    source: str
    sample_size: int
    validated_date: str
    accuracy_zone: AccuracyZone


# ═══════════════════════════════════════════════════════════════
# SATISFACTION BENCHMARKS (5-Point Scales)
# ═══════════════════════════════════════════════════════════════

SATISFACTION_BENCHMARKS = {
    "general_population": Benchmark(
        construct="satisfaction",
        mean_range=(3.4, 3.6),
        sd_range=(1.0, 1.2),
        shape="positive_skew",
        source="Multiple sources",
        sample_size=10000,
        validated_date="2026-02-07",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "healthcare_services": Benchmark(
        construct="satisfaction",
        mean_range=(3.6, 3.9),
        sd_range=(0.9, 1.1),
        shape="positive_skew",
        source="Gratitude bias validated",
        sample_size=5000,
        validated_date="2026-02-07",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "government_services": Benchmark(
        construct="satisfaction",
        mean_range=(3.0, 3.3),
        sd_range=(1.1, 1.3),
        shape="slight_negative_skew",
        source="Cynicism factor",
        sample_size=5000,
        validated_date="2026-02-07",
        accuracy_zone=AccuracyZone.MEDIUM
    ),
    "tech_products_early_adopters": Benchmark(
        construct="satisfaction",
        mean_range=(3.7, 4.0),
        sd_range=(0.9, 1.1),
        shape="positive_skew",
        source="Self-selection bias",
        sample_size=3000,
        validated_date="2026-02-07",
        accuracy_zone=AccuracyZone.MEDIUM
    ),
    "subscription_services": Benchmark(
        construct="satisfaction",
        mean_range=(4.0, 4.1),
        sd_range=(0.8, 1.0),
        shape="positive_skew",
        source="Amazon S&S validation (N=49)",
        sample_size=49,
        validated_date="2026-02-07",
        accuracy_zone=AccuracyZone.MEDIUM
    ),
    "cruise_travel": Benchmark(
        construct="satisfaction",
        mean_range=(4.3, 4.6),
        sd_range=(0.7, 0.9),
        shape="strong_positive_skew",
        source="CLIA/Gitnux 2025",
        sample_size=10000,
        validated_date="2026-02-07",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "subscription_core_experience": Benchmark(
        construct="satisfaction",
        mean_range=(4.2, 4.5),
        sd_range=(0.8, 1.0),
        shape="strong_positive_skew",
        source="Amazon S&S validation (N=49)",
        sample_size=49,
        validated_date="2026-02-08",
        accuracy_zone=AccuracyZone.MEDIUM
    ),
    "subscription_peripheral": Benchmark(
        construct="satisfaction",
        mean_range=(3.7, 4.0),
        sd_range=(0.9, 1.1),
        shape="positive_skew",
        source="Amazon S&S validation (N=49)",
        sample_size=49,
        validated_date="2026-02-08",
        accuracy_zone=AccuracyZone.MEDIUM
    ),
    # Remote Work Benchmarks (Gallup/Pew 2025)
    "remote_work_satisfaction": Benchmark(
        construct="satisfaction",
        mean_range=(4.0, 4.3),
        sd_range=(0.8, 1.0),
        shape="positive_skew",
        source="Gallup Remote Work 2025",
        sample_size=5000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "remote_work_productivity": Benchmark(
        construct="satisfaction",
        mean_range=(3.9, 4.2),
        sd_range=(0.9, 1.1),
        shape="positive_skew",
        source="Gallup Remote Work 2025",
        sample_size=5000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "return_to_office_preference": Benchmark(
        construct="preference",
        mean_range=(0.20, 0.28),  # Only 20-28% want full RTO
        sd_range=(0.05, 0.08),
        shape="negative_skew",
        source="Gallup/Pew Remote Work 2025",
        sample_size=8000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "hybrid_preference": Benchmark(
        construct="preference",
        mean_range=(0.55, 0.62),  # 55-62% prefer hybrid
        sd_range=(0.05, 0.08),
        shape="normal",
        source="Gallup Remote Work 2025",
        sample_size=5000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    
    # C-Suite Executive Benchmarks (Conference Board 2025)
    "csuite_cyber_concern": Benchmark(
        construct="concern",
        mean_range=(0.46, 0.50),  # 46-50% cite as top concern
        sd_range=(0.05, 0.08),
        shape="normal",
        source="Conference Board C-Suite Survey 2025 (N=1,732)",
        sample_size=1732,
        validated_date="2026-02-08",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "csuite_recession_concern": Benchmark(
        construct="concern",
        mean_range=(0.34, 0.38),  # 34-38% cite recession
        sd_range=(0.05, 0.08),
        shape="normal",
        source="Conference Board C-Suite Survey 2025",
        sample_size=1732,
        validated_date="2026-02-08",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "csuite_ai_impact": Benchmark(
        construct="concern",
        mean_range=(0.33, 0.37),  # 33-37% cite AI
        sd_range=(0.05, 0.08),
        shape="normal",
        source="Conference Board C-Suite Survey 2025",
        sample_size=1732,
        validated_date="2026-02-08",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "csuite_regulation_concern": Benchmark(
        construct="concern",
        mean_range=(0.33, 0.37),  # 33-37% cite regulation
        sd_range=(0.05, 0.08),
        shape="normal",
        source="Conference Board C-Suite Survey 2025",
        sample_size=1732,
        validated_date="2026-02-08",
        accuracy_zone=AccuracyZone.HIGH
    ),
    # Healthcare Worker Benchmarks (various 2024-2025 surveys)
    "healthcare_worker_satisfaction": Benchmark(
        construct="satisfaction",
        mean_range=(3.4, 3.7),
        sd_range=(1.0, 1.2),
        shape="normal",
        source="AMA/AHA Healthcare Worker Survey 2025",
        sample_size=5000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "healthcare_worker_burnout": Benchmark(
        construct="concern",
        mean_range=(3.8, 4.1),  # High burnout levels
        sd_range=(0.9, 1.1),
        shape="positive_skew",
        source="JAMA Burnout Study 2025",
        sample_size=3000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "healthcare_retention": Benchmark(
        construct="intent",
        mean_range=(0.68, 0.75),  # 68-75% plan to stay
        sd_range=(0.05, 0.08),
        shape="normal",
        source="McKinsey Healthcare Survey 2025",
        sample_size=2000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    
    # Retiree Benchmarks (AARP/Gallup)
    "retiree_satisfaction": Benchmark(
        construct="satisfaction",
        mean_range=(4.0, 4.3),
        sd_range=(0.8, 1.0),
        shape="positive_skew",
        source="AARP Retirement Satisfaction 2025",
        sample_size=4000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "retiree_financial_security": Benchmark(
        construct="confidence",
        mean_range=(3.5, 3.8),
        sd_range=(1.0, 1.2),
        shape="normal",
        source="AARP/Gallup 2025",
        sample_size=4000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
    "retiree_social_connection": Benchmark(
        construct="satisfaction",
        mean_range=(0.72, 0.78),  # 72-78% feel connected
        sd_range=(0.05, 0.08),
        shape="normal",
        source="AARP Social Connectedness 2025",
        sample_size=4000,
        validated_date="2026-02-09",
        accuracy_zone=AccuracyZone.HIGH
    ),
}


# ═══════════════════════════════════════════════════════════════
# NPS BENCHMARKS BY INDUSTRY
# ═══════════════════════════════════════════════════════════════

NPS_BENCHMARKS = {
    "overall_median": 42,
    "b2c_median": 49,
    "b2b_median": 38,
    
    "by_industry": {
        "manufacturing": {"median": 65, "b2b": 66, "b2c": 62},
        "healthcare": {"median": 61, "b2b": 38, "b2c": 70},
        "agency_consulting": {"median": 59, "b2b": 59, "b2c": 58},
        "retail_ecommerce": {"median": 55, "b2b": 55, "b2c": 54},
        "professional_services": {"median": 50},
        "fintech": {"median": 46},
        "education": {"median": 42, "b2b": 16, "b2c": 47},
        "media": {"median": 40, "b2b": 44, "b2c": 40},
        "wholesale": {"median": 36},
        "digital_marketplaces": {"median": 35, "b2b": 39, "b2c": 27},
        "software": {"median": 30, "b2b": 29, "b2c": 47},
        "cruise_travel": {"median": 40},
    },
    
    "source": "Survicate NPS Benchmark 2025 (N=5.4M responses, 599 companies)"
}


# ═══════════════════════════════════════════════════════════════
# DEMOGRAPHIC MULTIPLIERS (Human-Validated)
# ═══════════════════════════════════════════════════════════════

DEMOGRAPHIC_MULTIPLIERS = {
    # Women 60+ (Pet Owner Study, N=125)
    "women_60_plus": {
        "emotional_intensity": 1.30,
        "digital_adoption": 1.35,
        "price_sensitivity": 0.85,
        "activity_intent": 0.75,
        "source": "Pet owner survey, N=125, validated 2026-02-05"
    },
    
    # Women 18-59 (Pet Owner Study, N=48)
    "women_18_59": {
        "emotional_intensity": 1.10,
        "digital_adoption": 1.00,
        "price_sensitivity": 1.00,
        "source": "Pet owner survey, N=48, validated 2026-02-05"
    },
    
    # Adults 50+ (AARP Tech Trends, N=3,838)
    "adults_50_plus": {
        "smartphone_ownership": 1.25,  # 90% actual vs 72% predicted
        "ai_usage": 1.65,              # 30% actual vs 18% predicted
        "social_media_usage": 1.35,    # 90% actual vs 67% predicted
        "streaming_video": 1.40,       # 80% actual vs 57% predicted
        "tech_positive_sentiment": 1.25,
        "source": "AARP Tech Trends 2025, N=3,838"
    },
    
    # Parents (Child Healthcare Context)
    "parents_child_context": {
        "concern_worry": 0.6,      # Add to mean
        "comfort_novel": -0.4,     # Subtract from mean
        "likelihood_research": 0.7,
        "price_sensitivity": -0.3,  # Less price sensitive for child
        "satisfaction_good_outcome": 0.3,
        "source": "InStride Health study"
    },
    
    # High Income ($150K+)
    "high_income": {
        "satisfaction_premium": 0.3,
        "satisfaction_mass": -0.3,
        "price_sensitivity": -0.5,
        "time_sensitivity": 0.4,
        "convenience_premium": 0.4,
        "trust_institutions": 0.2,
        "openness_novel": 0.3,
        "source": "Multiple studies"
    },
    
    # "Open to X" Screened Audiences
    "open_to_x_screened": {
        "comfort_acceptance": 0.9,     # Add to mean
        "concern_worry": -0.5,         # Subtract from mean
        "likelihood_try": 0.7,
        "likelihood_recommend": 0.6,
        "note": "Creates a DIFFERENT POPULATION, not a minor modifier"
    },
}


# ═══════════════════════════════════════════════════════════════
# MENTAL HEALTH IMPORTANCE BENCHMARKS (Validated N=873)
# ═══════════════════════════════════════════════════════════════

MENTAL_HEALTH_BENCHMARKS = {
    "source": "Mental Health Survey 2026, N=873 adults with anxiety/depression",
    "validated_date": "2026-02-07",
    "accuracy_zone": AccuracyZone.HIGH,
    
    # Importance ratings (5-point scale: 1=Not at all, 5=Most important)
    "importance_distributions": {
        "effectiveness": {
            "distribution": {"1": 2.9, "2": 4.8, "3": 17.0, "4": 44.4, "5": 30.9},
            "mean": 3.96,
            "t2b": 75.4,
        },
        "safety": {
            "distribution": {"1": 3.2, "2": 6.4, "3": 22.9, "4": 45.7, "5": 21.8},
            "mean": 3.76,
            "t2b": 67.5,
        },
        "affordability": {
            "distribution": {"1": 3.2, "2": 5.5, "3": 17.5, "4": 42.8, "5": 30.9},
            "mean": 3.93,
            "t2b": 73.8,
        },
        "speed": {
            "distribution": {"1": 3.2, "2": 8.6, "3": 32.4, "4": 41.1, "5": 14.7},
            "mean": 3.55,
            "t2b": 55.8,
        },
        "privacy": {
            "distribution": {"1": 3.0, "2": 7.6, "3": 22.3, "4": 40.9, "5": 26.2},
            "mean": 3.80,
            "t2b": 67.1,
        },
        "convenience": {
            "distribution": {"1": 3.1, "2": 6.0, "3": 21.3, "4": 49.6, "5": 20.0},
            "mean": 3.78,
            "t2b": 69.6,
        },
        "enjoyability": {
            "distribution": {"1": 4.4, "2": 10.4, "3": 35.7, "4": 37.9, "5": 11.6},
            "mean": 3.42,
            "t2b": 49.5,
        },
        "ease": {
            "distribution": {"1": 3.2, "2": 6.8, "3": 28.6, "4": 47.5, "5": 13.9},
            "mean": 3.62,
            "t2b": 61.4,
        },
        "time_investment": {
            "distribution": {"1": 3.0, "2": 7.9, "3": 34.2, "4": 43.1, "5": 11.8},
            "mean": 3.53,
            "t2b": 54.9,
        },
    },
    
    # Product concept ratings (5-point scale: 1=Poor, 5=Excellent)
    "concept_distributions": {
        "effectiveness": {
            "distribution": {"1": 4.0, "2": 9.2, "3": 36.9, "4": 29.5, "5": 20.4},
            "mean": 3.53,
            "t2b": 49.8,
        },
        "speed": {
            "distribution": {"1": 3.8, "2": 9.3, "3": 40.7, "4": 26.5, "5": 19.7},
            "mean": 3.49,
            "t2b": 46.1,
        },
        "safety": {
            "distribution": {"1": 3.8, "2": 5.3, "3": 40.3, "4": 31.1, "5": 19.6},
            "mean": 3.57,
            "t2b": 50.6,
        },
        "convenience": {
            "distribution": {"1": 3.6, "2": 3.9, "3": 31.3, "4": 36.7, "5": 24.5},
            "mean": 3.75,
            "t2b": 61.2,
        },
        "privacy": {
            "distribution": {"1": 4.4, "2": 8.1, "3": 36.7, "4": 27.3, "5": 23.6},
            "mean": 3.58,
            "t2b": 50.9,
        },
        "ease": {
            "distribution": {"1": 3.7, "2": 4.9, "3": 33.9, "4": 36.6, "5": 20.8},
            "mean": 3.66,
            "t2b": 57.4,
        },
        "enjoyability": {
            "distribution": {"1": 3.6, "2": 6.9, "3": 44.3, "4": 30.3, "5": 15.0},
            "mean": 3.46,
            "t2b": 45.2,
        },
    },
    
    # Severity adjustments (multiply T2B by these factors)
    "severity_multipliers": {
        "severe_anxiety": 1.06,      # 79.9% vs 75.4% baseline for effectiveness
        "severe_depression": 1.09,   # 82.3% vs 75.4% baseline
        "both_diagnoses": 1.19,      # 89.8% vs 75.4% baseline
        "no_diagnosis": 0.94,        # 70.7% vs 75.4% baseline
    },
    
    # Generic importance distribution (for unmapped attributes)
    "generic_importance": {
        "distribution": {"1": 3.2, "2": 6.5, "3": 24.0, "4": 43.0, "5": 23.3},
        "mean": 3.77,
        "t2b": 66.3,
    },
}


# ═══════════════════════════════════════════════════════════════
# HEALTH IMPORTANCE GENERIC BENCHMARKS
# ═══════════════════════════════════════════════════════════════

HEALTH_IMPORTANCE_BENCHMARKS = {
    "source": "Derived from mental health + general health research",
    
    # Core attributes typically rank in this order for health products
    "ranking": [
        "effectiveness",    # Usually #1
        "safety",           # Usually #2
        "affordability",    # Usually #3
        "privacy",          # Variable
        "convenience",      # Variable
        "speed",            # Usually mid-tier
        "ease",             # Usually mid-tier
        "enjoyability",     # Usually lowest
    ],
    
    # T2B ranges by attribute type (health context)
    "t2b_ranges": {
        "effectiveness": (70, 80),
        "safety": (65, 75),
        "affordability": (68, 78),
        "privacy": (60, 72),
        "convenience": (62, 72),
        "speed": (50, 60),
        "ease": (55, 65),
        "enjoyability": (42, 55),
    },
}


def get_mental_health_distribution(attribute: str, question_type: str = "importance") -> dict:
    """Get calibrated distribution for mental health survey questions."""
    benchmarks = MENTAL_HEALTH_BENCHMARKS
    
    # Determine which distribution set to use
    if question_type in ["concept", "rating", "rate"]:
        dist_set = benchmarks["concept_distributions"]
    else:
        dist_set = benchmarks["importance_distributions"]
    
    # Map common attribute names
    attribute_map = {
        "effective": "effectiveness",
        "safe": "safety",
        "affordable": "affordability",
        "quick": "speed",
        "fast": "speed",
        "private": "privacy",
        "convenient": "convenience",
        "easy": "ease",
        "enjoyable": "enjoyability",
        "fun": "enjoyability",
        "time": "time_investment",
    }
    
    attr_lower = attribute.lower()
    for key, mapped in attribute_map.items():
        if key in attr_lower:
            attr_lower = mapped
            break
    
    # Return matched distribution or generic
    if attr_lower in dist_set:
        return dist_set[attr_lower]["distribution"].copy()
    
    return benchmarks["generic_importance"]["distribution"].copy()


# ═══════════════════════════════════════════════════════════════
# EXECUTIVE/C-SUITE MULTIPLIERS (Conference Board, N=1,732)
# ═══════════════════════════════════════════════════════════════

EXECUTIVE_MULTIPLIERS = {
    "by_role": {
        "ceo": {
            "cyber_concern": 1.30,
            "ai_concern": 0.90,
            "business_transformation": 1.50,
            "uncertainty": 1.35,
            "talent_finding": 1.10,
        },
        "cfo": {
            "cyber_concern": 1.40,
            "ai_concern": 1.05,
            "business_transformation": 1.15,
            "uncertainty": 1.50,
        },
        "chro": {
            "cyber_concern": 1.60,
            "ai_concern": 1.40,
            "business_transformation": 1.70,
            "uncertainty": 1.50,
        },
        "cmo": {
            "cyber_concern": 0.90,
            "ai_concern": 1.10,
            "business_transformation": 1.40,
            "uncertainty": 1.25,
        },
        "tech_executive": {
            "cyber_concern": 1.55,
            "ai_concern": 1.20,
            "business_transformation": 1.40,
            "uncertainty": 0.85,
        },
    },
    
    "by_region": {
        "north_america": {
            "cyber": 1.25,  # 60.2% vs 48.5% global
            "uncertainty": 1.15,
            "ai": 1.15,
        },
        "europe": {
            "cyber": 1.10,
            "uncertainty": 0.95,
            "ai": 1.00,
        },
        "asia": {
            "cyber": 0.70,  # 34.5% vs 48.5% global
            "uncertainty": 0.85,
            "ai": 0.85,
        },
        "southern_cone": {
            "cyber": 0.80,
            "uncertainty": 1.20,
            "ai": 0.95,
        },
    },
    
    "source": "Conference Board Global C-Suite Survey 2026, N=1,732"
}


# ═══════════════════════════════════════════════════════════════
# CONSTRUCT-LEVEL CORRECTIONS
# ═══════════════════════════════════════════════════════════════

CONSTRUCT_CORRECTIONS = {
    # LLM under-predicts these
    "senior_tech_adoption": {"multiplier": (1.30, 1.65), "direction": "increase"},
    "emotional_bonding": {"multiplier": (1.20, 1.30), "direction": "increase"},
    "status_quo_preference": {"add_points": (10, 15), "direction": "increase"},
    "cyber_concern_executives": {"multiplier": 1.35, "direction": "increase"},
    "business_transformation": {"multiplier": 1.65, "direction": "increase"},
    "cruise_loyalty": {"add_points": (15, 20), "direction": "increase"},
    "sustainability_willingness": {"add_points": (15, 20), "direction": "increase"},
    
    # LLM over-predicts these
    "ai_concern_general": {"multiplier": 0.90, "direction": "decrease"},
    "life_satisfaction_uncertainty": {"add_points": (-3, -4), "direction": "decrease"},
    "employee_engagement": {"add_points": -5, "direction": "decrease"},
    "recession_fear_executives": {"multiplier": 0.85, "direction": "decrease"},
    "institutional_trust": {"add_points": (-5, -10), "direction": "decrease"},
    
    # Intent-action gap (CRITICAL)
    "intent_very_likely": {"multiplier": 0.30, "note": "Very Likely → 30% actual"},
    "intent_likely": {"multiplier": 0.15, "note": "Likely → 15% actual"},
    "intent_neutral": {"multiplier": 0.05, "note": "Neutral → 5% actual"},
}


# ═══════════════════════════════════════════════════════════════
# PARTISAN SEGMENTATION REQUIREMENTS
# ═══════════════════════════════════════════════════════════════

PARTISAN_TOPICS = {
    "illegal immigration": {"gap": 50, "required": True},
    "immigration": {"gap": 50, "required": True},
    "climate change": {"gap": 40, "required": True},
    "climate": {"gap": 40, "required": True},
    "racism": {"gap": 40, "required": True},
    "gun violence": {"gap": 35, "required": True},
    "guns": {"gap": 35, "required": True},
    "poverty": {"gap": 25, "required": True},
    "inflation": {"gap": 20, "required": True},
    
    "note": "NEVER predict a single 'average' for these topics without party breakdown"
}

POLITICAL_IDENTITY_2025 = {
    "independent": 45,  # Record high
    "democrat": 27,
    "republican": 27,
    "by_generation": {
        "gen_z": {"independent": 56},
        "millennials": {"independent": 50},
        "gen_x": {"independent": 40},
        "boomers": {"independent": 33},
        "silent": {"independent": 30},
    },
    "source": "Gallup 2025, N=13,000+"
}


# ═══════════════════════════════════════════════════════════════
# BINARY SPLIT DEFAULTS
# ═══════════════════════════════════════════════════════════════

BINARY_SPLITS = {
    "status_quo_vs_change": (65, 35),
    "familiar_vs_novel": (60, 40),
    "free_vs_paid": (75, 25),
    "convenient_vs_optimal": (65, 35),
    "natural_vs_synthetic": (70, 30),
    "human_vs_ai": (68, 32),
    "incumbent_vendor_b2b": (70, 30),  # B2B buying behavior
}


# ═══════════════════════════════════════════════════════════════
# QUESTION TYPE ACCURACY EXPECTATIONS
# ═══════════════════════════════════════════════════════════════

ACCURACY_BY_QUESTION_TYPE = {
    "awareness_familiarity": AccuracyZone.HIGH,
    "trust_confidence": AccuracyZone.HIGH,
    "party_identification": AccuracyZone.HIGH,
    "satisfaction_nps": AccuracyZone.MEDIUM,
    "concern_worry": AccuracyZone.MEDIUM,
    "preference_choice": AccuracyZone.MEDIUM,
    "purchase_intent": AccuracyZone.LOW,
    "willingness_to_pay": AccuracyZone.LOW,
    "polarized_political": AccuracyZone.LOW,
    "open_ended": AccuracyZone.LOW,
}


def get_benchmark(context: str, question_type: str) -> Optional[Benchmark]:
    """Look up the appropriate benchmark for a question context."""
    key = f"{context}_{question_type}".lower().replace(" ", "_")
    
    # Try satisfaction benchmarks
    if question_type in ["satisfaction", "satisfied"]:
        for bm_key, bm in SATISFACTION_BENCHMARKS.items():
            if bm_key in key or context.lower() in bm_key:
                return bm
        return SATISFACTION_BENCHMARKS.get("general_population")
    
    return None


def get_demographic_modifier(demographic: str, construct: str) -> float:
    """Get the multiplier for a demographic-construct combination."""
    demo_key = demographic.lower().replace(" ", "_").replace("-", "_")
    
    for key, modifiers in DEMOGRAPHIC_MULTIPLIERS.items():
        if key in demo_key or demo_key in key:
            return modifiers.get(construct, 1.0)
    
    return 1.0


def requires_partisan_segmentation(topic: str) -> bool:
    """Check if a topic requires mandatory partisan breakdown."""
    topic_lower = topic.lower()
    for partisan_topic in PARTISAN_TOPICS:
        if partisan_topic in topic_lower:
            return PARTISAN_TOPICS[partisan_topic].get("required", False)
    return False


def get_nps_benchmark(industry: str, b2b: bool = False) -> int:
    """Get the NPS benchmark for an industry."""
    industry_key = industry.lower().replace(" ", "_").replace("-", "_")
    
    for key, data in NPS_BENCHMARKS["by_industry"].items():
        if key in industry_key or industry_key in key:
            if b2b and "b2b" in data:
                return data["b2b"]
            elif not b2b and "b2c" in data:
                return data["b2c"]
            return data["median"]
    
    return NPS_BENCHMARKS["b2b_median" if b2b else "b2c_median"]
