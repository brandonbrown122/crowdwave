"""
CrowdWave Bias Detection and Countermeasures
Systematic corrections for known LLM simulation biases.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
from enum import Enum


class BiasType(Enum):
    EMOTIONAL_BONDING = "emotional_bonding"
    SENIOR_DIGITAL = "senior_digital"
    HEALTHCARE_CONCERN = "healthcare_concern"
    POLITICAL_REGULATORY = "political_regulatory"
    ECONOMIC_OVERWEIGHT = "economic_overweight"
    CENTRAL_TENDENCY = "central_tendency"
    OPTIMISM_INFLATION = "optimism_inflation"
    ROUND_NUMBER = "round_number"


@dataclass
class BiasDetection:
    """Result of bias detection for a question."""
    bias_type: BiasType
    confidence: float
    triggers: List[str]
    correction: Dict


# ═══════════════════════════════════════════════════════════════
# BIAS DETECTION KEYWORDS
# ═══════════════════════════════════════════════════════════════

EMOTIONAL_BONDING_TRIGGERS = [
    "pet", "dog", "cat", "family member", "bond", "love", "connection",
    "attachment", "relationship", "child", "children", "hobby", "passion",
    "identity", "sports team", "brand loyalty", "devoted"
]

SENIOR_DIGITAL_TRIGGERS = [
    "60+", "65+", "70+", "senior", "older adult", "elderly", "retired",
    "baby boomer", "social media", "online", "digital", "smartphone",
    "streaming", "video call", "facebook", "technology"
]

HEALTHCARE_CONCERN_TRIGGERS = [
    "health", "medical", "treatment", "medication", "side effect",
    "diagnosis", "worry", "concern", "anxiety", "fear", "risk",
    "doctor", "hospital", "insurance", "cancer", "disease"
]

POLITICAL_REGULATORY_TRIGGERS = [
    "regulatory", "regulation", "policy", "political", "government",
    "legislation", "compliance", "uncertainty", "election", "tariff",
    "executive", "ceo", "business outlook", "investment", "planning"
]

ECONOMIC_FACTOR_TRIGGERS = [
    "price", "cost", "savings", "roi", "budget", "money", "expense",
    "investment", "value", "afford", "decision factor", "purchase driver"
]

VALUES_FACTOR_TRIGGERS = [
    "esg", "sustainability", "ethical", "values", "mission", "governance",
    "corporate responsibility", "social impact", "environment", "trust"
]


# ═══════════════════════════════════════════════════════════════
# BIAS DETECTION
# ═══════════════════════════════════════════════════════════════

def detect_biases(question_text: str, audience: str, question_type: str) -> List[BiasDetection]:
    """Detect applicable biases for a question."""
    text = f"{question_text} {audience}".lower()
    detections = []
    
    # Check Emotional Bonding Underestimation
    triggers = [t for t in EMOTIONAL_BONDING_TRIGGERS if t in text]
    if len(triggers) >= 2:
        detections.append(BiasDetection(
            bias_type=BiasType.EMOTIONAL_BONDING,
            confidence=min(0.9, 0.4 + len(triggers) * 0.1),
            triggers=triggers,
            correction={"type": "multiply", "factor": 1.20, "target": "positive_emotions"}
        ))
    
    # Check Senior Digital Adoption Underestimation
    age_trigger = any(t in text for t in ["60+", "65+", "70+", "senior", "older", "retired"])
    digital_trigger = any(t in text for t in ["online", "digital", "social media", "smartphone", "streaming"])
    if age_trigger and digital_trigger:
        triggers = [t for t in SENIOR_DIGITAL_TRIGGERS if t in text]
        # Determine gender for multiplier
        multiplier = 1.35 if "women" in text or "female" in text else 1.30
        detections.append(BiasDetection(
            bias_type=BiasType.SENIOR_DIGITAL,
            confidence=0.85,
            triggers=triggers,
            correction={"type": "multiply", "factor": multiplier, "target": "adoption_rate"}
        ))
    
    # Check Healthcare Concern Dampening
    health_trigger = any(t in text for t in ["health", "medical", "treatment", "medication"])
    concern_trigger = any(t in text for t in ["concern", "worry", "anxiety", "fear", "risk"])
    if health_trigger and concern_trigger:
        triggers = [t for t in HEALTHCARE_CONCERN_TRIGGERS if t in text]
        # Higher correction for children's health
        uplift = 1.30 if any(t in text for t in ["child", "children", "pediatric"]) else 1.20
        detections.append(BiasDetection(
            bias_type=BiasType.HEALTHCARE_CONCERN,
            confidence=0.80,
            triggers=triggers,
            correction={"type": "multiply", "factor": uplift, "target": "concern_levels"}
        ))
    
    # Check Political/Regulatory Underweighting
    business_trigger = any(t in text for t in ["executive", "ceo", "business", "company", "investment"])
    regulatory_trigger = any(t in text for t in ["regulatory", "political", "policy", "uncertainty"])
    if business_trigger and regulatory_trigger:
        triggers = [t for t in POLITICAL_REGULATORY_TRIGGERS if t in text]
        detections.append(BiasDetection(
            bias_type=BiasType.POLITICAL_REGULATORY,
            confidence=0.75,
            triggers=triggers,
            correction={"type": "rank_adjust", "positions": 1.5, "direction": "up"}
        ))
    
    # Check Economic Factor Overweighting
    economic_trigger = any(t in text for t in ECONOMIC_FACTOR_TRIGGERS)
    values_trigger = any(t in text for t in VALUES_FACTOR_TRIGGERS)
    if economic_trigger and values_trigger:
        detections.append(BiasDetection(
            bias_type=BiasType.ECONOMIC_OVERWEIGHT,
            confidence=0.70,
            triggers=[t for t in ECONOMIC_FACTOR_TRIGGERS + VALUES_FACTOR_TRIGGERS if t in text],
            correction={
                "type": "rebalance",
                "economic_factor": 0.85,
                "values_factor": 1.20
            }
        ))
    
    return detections


# ═══════════════════════════════════════════════════════════════
# BIAS CORRECTIONS
# ═══════════════════════════════════════════════════════════════

def apply_emotional_bonding_correction(
    distribution: Dict[str, float],
    scale_type: str = "likert_5"
) -> Dict[str, float]:
    """
    Correct underestimation of emotional bonding intensity.
    Shifts distribution toward positive end.
    """
    if scale_type == "likert_5":
        # Boost top-2-box by ~20%
        adjusted = distribution.copy()
        boost_factor = 1.20
        
        # Move probability mass from middle to top
        if "5" in adjusted and "4" in adjusted and "3" in adjusted:
            transfer = adjusted["3"] * 0.15
            adjusted["3"] -= transfer
            adjusted["5"] += transfer * 0.6
            adjusted["4"] += transfer * 0.4
            
    elif scale_type == "percentage":
        # Simple multiplication capped at 95%
        adjusted = {k: min(95.0, v * 1.20) for k, v in distribution.items()}
    
    return adjusted


def apply_senior_digital_correction(
    value: float,
    demographic: str,
    metric: str
) -> float:
    """
    Correct underestimation of senior digital adoption.
    Returns adjusted value based on demographic and metric type.
    """
    # Base multiplier by age/gender
    multipliers = {
        "women_60_69": 1.35,
        "women_70_plus": 1.40,
        "men_60_69": 1.25,
        "men_70_plus": 1.30,
        "general_60_plus": 1.30,
    }
    
    # Find matching demographic
    demo_lower = demographic.lower()
    multiplier = 1.30  # default
    for key, mult in multipliers.items():
        if all(part in demo_lower for part in key.split("_")):
            multiplier = mult
            break
    
    # Metric-specific adjustments
    metric_boosts = {
        "ai_usage": 1.65 / 1.30,  # Extra boost for AI
        "social_media": 1.35 / 1.30,
        "streaming": 1.40 / 1.30,
    }
    
    metric_lower = metric.lower()
    for key, boost in metric_boosts.items():
        if key in metric_lower:
            multiplier *= boost
            break
    
    return min(95.0, value * multiplier)


def apply_healthcare_concern_correction(
    value: float,
    context: str
) -> float:
    """
    Correct dampening of healthcare concern levels.
    LLMs produce artificially calm responses on health topics.
    """
    context_lower = context.lower()
    
    # Determine uplift factor
    if any(t in context_lower for t in ["child", "children", "pediatric"]):
        uplift = 1.30
    elif any(t in context_lower for t in ["side effect", "treatment"]):
        uplift = 1.25
    elif any(t in context_lower for t in ["cost", "access", "insurance"]):
        uplift = 1.20
    else:
        uplift = 1.15
    
    return min(95.0, value * uplift)


def apply_political_regulatory_correction(
    ranking: Dict[str, int],
    factors_to_boost: List[str]
) -> Dict[str, int]:
    """
    Correct underweighting of political/regulatory concerns.
    Moves specified factors up in ranking.
    """
    adjusted = ranking.copy()
    
    for factor in factors_to_boost:
        if factor in adjusted:
            # Move up 1.5 positions (round to nearest)
            current_rank = adjusted[factor]
            new_rank = max(1, current_rank - 2)  # Can't go below 1
            
            # Adjust other ranks
            for other_factor, other_rank in adjusted.items():
                if other_factor != factor and other_rank >= new_rank and other_rank < current_rank:
                    adjusted[other_factor] += 1
            
            adjusted[factor] = new_rank
    
    return adjusted


def apply_economic_rebalance(
    factor_scores: Dict[str, float],
    economic_factors: List[str],
    values_factors: List[str]
) -> Dict[str, float]:
    """
    Rebalance economic vs. values factors in decision-making.
    LLMs overweight pure economics, underweight governance/values.
    """
    adjusted = factor_scores.copy()
    
    for factor, score in adjusted.items():
        factor_lower = factor.lower()
        if any(ef in factor_lower for ef in economic_factors):
            adjusted[factor] = score * 0.85
        elif any(vf in factor_lower for vf in values_factors):
            adjusted[factor] = score * 1.20
    
    return adjusted


# ═══════════════════════════════════════════════════════════════
# OUTPUT VALIDATION (Self-Check Protocol)
# ═══════════════════════════════════════════════════════════════

@dataclass
class ValidationResult:
    passed: bool
    violations: List[str]
    warnings: List[str]


def validate_distribution(
    distribution: Dict[str, float],
    question_type: str,
    audience: str
) -> ValidationResult:
    """
    Run self-check protocol on a distribution.
    Returns validation result with any violations.
    """
    violations = []
    warnings = []
    
    values = list(distribution.values())
    
    # Check 1: No option at exactly 0%
    if any(v == 0 for v in values):
        violations.append("Option at exactly 0% - minorities always exist")
    
    # Check 2: Mean not exactly 3.0 (for 5-point scales)
    if len(distribution) == 5:
        mean = sum(int(k) * v for k, v in distribution.items()) / 100
        if abs(mean - 3.0) < 0.01:
            violations.append("Mean exactly 3.0 - real data skews")
    
    # Check 3: All percentages multiples of 5
    if all(v % 5 == 0 for v in values):
        warnings.append("All percentages are round numbers - prefer realistic decimals")
    
    # Check 4: SD within typical range (0.8 - 1.4)
    if len(distribution) == 5:
        mean = sum(int(k) * v for k, v in distribution.items()) / 100
        variance = sum(((int(k) - mean) ** 2) * v for k, v in distribution.items()) / 100
        sd = variance ** 0.5
        if sd < 0.8:
            warnings.append(f"SD too low ({sd:.2f}) - responses may be artificially uniform")
        elif sd > 1.4:
            warnings.append(f"SD too high ({sd:.2f}) - may indicate extreme polarization")
    
    # Check 5: Sum to 100%
    total = sum(values)
    if abs(total - 100.0) > 0.1:
        violations.append(f"Distribution sums to {total:.1f}%, not 100%")
    
    # Check 6: Minimum 3% on every option
    if any(v < 3.0 and v > 0 for v in values):
        warnings.append("Some options below 3% - consider if realistic for audience")
    
    # Check 7: "Open to X" same as general population
    if "open to" in audience.lower():
        # This would need comparison to general pop, flagging as warning
        warnings.append("'Open to X' audience - verify distribution differs from general pop")
    
    return ValidationResult(
        passed=len(violations) == 0,
        violations=violations,
        warnings=warnings
    )


def validate_child_vs_adult_concern(
    child_concern: float,
    adult_concern: float
) -> ValidationResult:
    """
    Validate that child-related concern exceeds adult concern.
    LLMs sometimes get this wrong.
    """
    if child_concern < adult_concern:
        return ValidationResult(
            passed=False,
            violations=["Child concern lower than adult concern - parental instinct demands higher concern for children"],
            warnings=[]
        )
    return ValidationResult(passed=True, violations=[], warnings=[])


def validate_intent_action_gap(
    stated_intent: Dict[str, float]
) -> ValidationResult:
    """
    Check if intent predictions have been adjusted for intent-action gap.
    """
    warnings = []
    
    if "very_likely" in stated_intent or "5" in stated_intent:
        top_box = stated_intent.get("very_likely", stated_intent.get("5", 0))
        if top_box > 40:
            warnings.append(
                f"Top-box intent at {top_box:.1f}% - apply ×0.30 for actual conversion "
                f"(~{top_box * 0.30:.1f}% actual)"
            )
    
    return ValidationResult(passed=True, violations=[], warnings=warnings)
