"""
Crowdwave Simulation Engine
Production-ready survey simulation with calibrated accuracy.
"""

import json
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from enum import Enum

from .calibration import (
    AccuracyZone, 
    SATISFACTION_BENCHMARKS,
    NPS_BENCHMARKS,
    DEMOGRAPHIC_MULTIPLIERS,
    EXECUTIVE_MULTIPLIERS,
    CONSTRUCT_CORRECTIONS,
    PARTISAN_TOPICS,
    BINARY_SPLITS,
    ACCURACY_BY_QUESTION_TYPE,
    get_benchmark,
    get_demographic_modifier,
    requires_partisan_segmentation,
    get_nps_benchmark,
)
from .bias_corrections import (
    BiasType,
    detect_biases,
    apply_emotional_bonding_correction,
    apply_senior_digital_correction,
    apply_healthcare_concern_correction,
    apply_political_regulatory_correction,
    apply_economic_rebalance,
    validate_distribution,
)
from .calibration_current import (
    IMMIGRATION_ENFORCEMENT_FEB2026,
    AI_JOB_CONCERNS_2026,
    VACCINATION_RATES_US,
    STREAMING_BENCHMARKS,
    CONSUMER_CONFIDENCE_FEB2026,
    VEHICLE_PURCHASE_FEB2026,
    PARTY_IDENTIFICATION_2025,
    GENERATIONAL_ATTITUDES,
    get_current_calibration,
)


# ═══════════════════════════════════════════════════════════════
# DATA STRUCTURES
# ═══════════════════════════════════════════════════════════════

@dataclass
class SurveyConfig:
    """Configuration for a survey simulation."""
    audience: str
    geography: str = "USA"
    sample_size: int = 500
    as_of_date: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d"))
    time_window: str = "current"
    screeners: List[str] = field(default_factory=list)
    topic: str = ""
    stimuli: List[str] = field(default_factory=list)


@dataclass
class Question:
    """A survey question to simulate."""
    id: str
    text: str
    type: str  # "scale", "binary", "multiple_choice", "ranking", "open_end", "nps"
    options: List[str] = field(default_factory=list)
    scale: Optional[Tuple[int, int]] = None  # (min, max) for scale questions
    labels: Optional[List[str]] = None


@dataclass
class SimulationResult:
    """Result of simulating a single question."""
    question_id: str
    question_text: str
    distribution: Dict[str, float]
    mean: Optional[float] = None
    sd: Optional[float] = None
    confidence: float = 0.7
    accuracy_zone: AccuracyZone = AccuracyZone.MEDIUM
    biases_detected: List[str] = field(default_factory=list)
    corrections_applied: List[str] = field(default_factory=list)
    validation_warnings: List[str] = field(default_factory=list)
    methodology_trace: Dict[str, Any] = field(default_factory=dict)


@dataclass
class EnsembleRun:
    """A single run in the 3-run ensemble."""
    run_type: str  # "conservative", "signal_forward", "heterogeneity"
    distribution: Dict[str, float]
    rationale: str


@dataclass
class SimulationReport:
    """Complete simulation report."""
    config: SurveyConfig
    results: List[SimulationResult]
    priors_used: List[Dict]
    overall_confidence: float
    flags: List[str]
    generated_at: str = field(default_factory=lambda: datetime.now().isoformat())


# ═══════════════════════════════════════════════════════════════
# MAIN ENGINE
# ═══════════════════════════════════════════════════════════════

class CrowdwaveEngine:
    """
    Production survey simulation engine implementing 10-phase methodology.
    
    Usage:
        engine = CrowdwaveEngine()
        results = engine.simulate(survey_config, questions)
    """
    
    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.priors_cache = {}
    
    def simulate(
        self,
        config: Dict[str, Any],
        questions: List[Dict[str, Any]]
    ) -> SimulationReport:
        """
        Run full simulation pipeline.
        
        Args:
            config: Survey configuration dict
            questions: List of question dicts
            
        Returns:
            SimulationReport with results for all questions
        """
        # Parse config
        survey_config = SurveyConfig(
            audience=config.get("audience", "General population"),
            geography=config.get("geography", "USA"),
            sample_size=config.get("sample_size", 500),
            topic=config.get("topic", ""),
            screeners=config.get("screeners", []),
            stimuli=config.get("stimuli", []),
        )
        
        # Parse questions
        parsed_questions = [
            Question(
                id=q.get("id", f"Q{i+1}"),
                text=q.get("text", ""),
                type=q.get("type", "scale"),
                options=q.get("options", []),
                scale=tuple(q.get("scale", [1, 5])) if q.get("scale") else (1, 5),
                labels=q.get("labels"),
            )
            for i, q in enumerate(questions)
        ]
        
        # Phase 1: Establish priors
        priors = self._establish_priors(survey_config, parsed_questions)
        
        # Phase 2-9: Simulate each question
        results = []
        for question in parsed_questions:
            result = self._simulate_question(survey_config, question, priors)
            results.append(result)
        
        # Calculate overall confidence
        overall_confidence = sum(r.confidence for r in results) / len(results)
        
        # Collect flags
        flags = []
        for r in results:
            if r.accuracy_zone == AccuracyZone.LOW:
                flags.append(f"{r.question_id}: Low accuracy zone - validate results")
            if r.validation_warnings:
                flags.extend([f"{r.question_id}: {w}" for w in r.validation_warnings])
        
        return SimulationReport(
            config=survey_config,
            results=results,
            priors_used=priors,
            overall_confidence=overall_confidence,
            flags=flags,
        )
    
    def _detect_generation(self, audience: str) -> Optional[str]:
        """Detect generation from audience description."""
        audience_lower = audience.lower()
        
        if any(t in audience_lower for t in ["gen z", "genz", "18-24", "18-25", "zoomers"]):
            return "gen_z"
        elif any(t in audience_lower for t in ["millennial", "25-40", "25-44", "gen y"]):
            return "millennial"
        elif any(t in audience_lower for t in ["gen x", "genx", "40-55", "45-60"]):
            return "gen_x"
        elif any(t in audience_lower for t in ["boomer", "55+", "60+", "65+", "senior", "older"]):
            return "boomer"
        return None
    
    def _establish_priors(
        self,
        config: SurveyConfig,
        questions: List[Question]
    ) -> List[Dict]:
        """
        Phase 2: Establish priors from calibration library.
        """
        priors = []
        
        # Audience priors
        audience_lower = config.audience.lower()
        
        # Detect generation
        generation = self._detect_generation(config.audience)
        if generation:
            priors.append({
                "type": "generation",
                "generation": generation,
                "party_id": PARTY_IDENTIFICATION_2025["by_generation"].get(generation, {}),
                "relevance": 4,
            })
        
        # Check for demographic matches
        for demo_key, modifiers in DEMOGRAPHIC_MULTIPLIERS.items():
            demo_parts = demo_key.replace("_", " ")
            if any(part in audience_lower for part in demo_parts.split()):
                priors.append({
                    "type": "demographic",
                    "key": demo_key,
                    "modifiers": modifiers,
                    "relevance": 4,
                })
        
        # Check for executive audience
        if any(t in audience_lower for t in ["ceo", "executive", "c-suite", "cfo", "chro"]):
            priors.append({
                "type": "executive",
                "data": EXECUTIVE_MULTIPLIERS,
                "relevance": 5,
            })
        
        # Topic-specific priors
        for q in questions:
            q_text = q.text.lower()
            
            # NPS questions
            if q.type == "nps" or "recommend" in q_text:
                priors.append({
                    "type": "nps_benchmark",
                    "data": NPS_BENCHMARKS,
                    "relevance": 4,
                })
            
            # Satisfaction questions
            if "satisf" in q_text:
                benchmark = get_benchmark(config.topic, "satisfaction")
                if benchmark:
                    priors.append({
                        "type": "satisfaction_benchmark",
                        "data": benchmark,
                        "relevance": 4,
                    })
        
        return priors
    
    def _simulate_question(
        self,
        config: SurveyConfig,
        question: Question,
        priors: List[Dict]
    ) -> SimulationResult:
        """
        Simulate a single question through phases 3-9.
        """
        # Phase 3: Detect biases
        biases = detect_biases(question.text, config.audience, question.type)
        biases_detected = [b.bias_type.value for b in biases]
        
        # Phase 4: Determine accuracy zone
        accuracy_zone = self._determine_accuracy_zone(question)
        
        # Phase 5: Run ensemble (3 independent estimates)
        runs = self._run_ensemble(config, question, priors)
        
        # Phase 6: Reconcile ensemble
        distribution = self._reconcile_ensemble(runs)
        
        # Phase 7: Apply bias corrections (only for appropriate question types)
        corrections_applied = []
        for bias in biases:
            if bias.bias_type == BiasType.EMOTIONAL_BONDING and question.type == "scale":
                distribution = apply_emotional_bonding_correction(distribution)
                corrections_applied.append("emotional_bonding_+20%")
            elif bias.bias_type == BiasType.SENIOR_DIGITAL and question.type in ["scale", "nps"]:
                # Only apply to adoption-related metrics, not all questions
                q_lower = question.text.lower()
                if any(t in q_lower for t in ["use", "adopt", "try", "online", "digital"]):
                    for key in distribution:
                        distribution[key] = apply_senior_digital_correction(
                            distribution[key], config.audience, question.text
                        )
                    distribution = self._normalize(distribution)
                    corrections_applied.append(f"senior_digital_×{bias.correction['factor']}")
            elif bias.bias_type == BiasType.HEALTHCARE_CONCERN and question.type == "scale":
                # Only for concern questions, not all healthcare
                q_lower = question.text.lower()
                if any(t in q_lower for t in ["concern", "worry", "fear", "anxious"]):
                    for key in distribution:
                        distribution[key] = apply_healthcare_concern_correction(
                            distribution[key], question.text
                        )
                    distribution = self._normalize(distribution)
                    corrections_applied.append("healthcare_concern_+15-30%")
        
        # Phase 8: Calculate statistics
        mean, sd = self._calculate_stats(distribution, question)
        
        # Phase 9: Validate output
        validation = validate_distribution(distribution, question.type, config.audience)
        
        # Phase 10: Calculate confidence
        confidence = self._calculate_confidence(priors, runs, validation)
        
        return SimulationResult(
            question_id=question.id,
            question_text=question.text,
            distribution=distribution,
            mean=mean,
            sd=sd,
            confidence=confidence,
            accuracy_zone=accuracy_zone,
            biases_detected=biases_detected,
            corrections_applied=corrections_applied,
            validation_warnings=validation.warnings,
            methodology_trace={
                "ensemble_runs": [{"type": r.run_type, "rationale": r.rationale} for r in runs],
                "priors_count": len(priors),
                "validation_passed": validation.passed,
            }
        )
    
    def _determine_accuracy_zone(self, question: Question) -> AccuracyZone:
        """Determine expected accuracy zone for a question type."""
        q_text = question.text.lower()
        
        # High accuracy
        if any(t in q_text for t in ["aware", "familiar", "trust", "confidence", "party"]):
            return AccuracyZone.HIGH
        
        # Low accuracy
        if any(t in q_text for t in ["intent", "purchase", "pay", "price", "switch"]):
            return AccuracyZone.LOW
        
        # Check for polarized topics
        if requires_partisan_segmentation(question.text):
            return AccuracyZone.LOW
        
        # Default to medium
        return AccuracyZone.MEDIUM
    
    def _run_ensemble(
        self,
        config: SurveyConfig,
        question: Question,
        priors: List[Dict]
    ) -> List[EnsembleRun]:
        """
        Phase 5: Generate 3 independent distribution estimates.
        """
        runs = []
        
        # Get base distribution from benchmarks
        base = self._get_base_distribution(question, priors, config.topic, config.audience)
        
        # Run 1: Conservative (anchor on priors, compress toward center)
        conservative = self._apply_conservative_shift(base)
        runs.append(EnsembleRun(
            run_type="conservative",
            distribution=conservative,
            rationale="Heavy anchor on priors, modest stimulus effects, compressed to center"
        ))
        
        # Run 2: Signal-forward (allow larger shifts from baseline)
        signal_forward = self._apply_signal_shift(base, config)
        runs.append(EnsembleRun(
            run_type="signal_forward",
            distribution=signal_forward,
            rationale="Meaningful stimulus impact, weight recent sources heavily"
        ))
        
        # Run 3: Heterogeneity (higher variance, segment differences)
        heterogeneity = self._apply_heterogeneity_shift(base)
        runs.append(EnsembleRun(
            run_type="heterogeneity",
            distribution=heterogeneity,
            rationale="Higher variance, audience segments respond differently"
        ))
        
        return runs
    
    def _get_base_distribution(
        self,
        question: Question,
        priors: List[Dict],
        topic: str = "",
        audience: str = ""
    ) -> Dict[str, float]:
        """Get base distribution from benchmarks or defaults."""
        q_lower = question.text.lower()
        topic_lower = topic.lower() if topic else ""
        combined_context = q_lower + " " + topic_lower
        
        if question.type == "scale" and question.scale:
            min_val, max_val = question.scale
            n_points = max_val - min_val + 1
            
            if n_points == 5:
                # Check for current calibrations first
                
                # Inflation concern specifically
                if any(t in q_lower for t in ["inflation"]) and any(t in q_lower for t in ["concern", "worried"]):
                    # 68% concerned but more moderate distribution
                    return {"1": 10.0, "2": 16.0, "3": 26.0, "4": 30.0, "5": 18.0}
                
                # Economic sentiment - calibrated Feb 2026
                if any(t in combined_context for t in ["economy", "economic", "recession", "financial"]):
                    if any(t in q_lower for t in ["recession", "downturn"]):
                        # Only 14% expect recession
                        return {"1": 35.0, "2": 28.0, "3": 23.0, "4": 10.0, "5": 4.0}
                    elif any(t in q_lower for t in ["optimistic", "confident", "positive"]):
                        # Mixed sentiment (57.3 index)
                        return {"1": 12.0, "2": 18.0, "3": 32.0, "4": 26.0, "5": 12.0}
                    elif any(t in q_lower for t in ["concern", "worried"]):
                        # General economic concerns
                        return {"1": 8.0, "2": 14.0, "3": 24.0, "4": 34.0, "5": 20.0}
                
                # AI/job concerns - calibrated Feb 2026
                if any(t in combined_context for t in ["ai ", "artificial intelligence", "automation"]):
                    if any(t in q_lower for t in ["concern", "worried", "fear", "impact"]):
                        # 51% worried (T2B ~60-65%)
                        return {"1": 12.0, "2": 15.0, "3": 22.0, "4": 32.0, "5": 19.0}
                
                # Media trust - calibrated (only 32% trust)
                if any(t in q_lower for t in ["media", "news", "press"]) and "trust" in q_lower:
                    # Only 32% trust media (Gallup)
                    return {"1": 29.0, "2": 25.0, "3": 14.0, "4": 22.0, "5": 10.0}
                
                # Federal government trust - calibrated (only 22% trust always/mostly)
                if any(t in combined_context for t in ["government", "federal"]) and "trust" in q_lower:
                    # Only 22% trust always/mostly
                    return {"1": 24.0, "2": 30.0, "3": 24.0, "4": 16.0, "5": 6.0}
                
                # Healthcare costs concern - calibrated (Jan 2026)
                if any(t in combined_context for t in ["healthcare", "health care", "medical", "insurance"]):
                    if any(t in q_lower for t in ["cost", "afford", "pay", "expense"]):
                        # 66% worried, 33% very worried
                        return {"1": 5.0, "2": 10.0, "3": 19.0, "4": 36.0, "5": 30.0}
                
                # Climate change concern - calibrated (strongly partisan)
                if any(t in combined_context for t in ["climate", "environment", "global warming"]):
                    if any(t in q_lower for t in ["concern", "worried", "serious"]):
                        # Overall ~60% concerned but huge partisan gap
                        return {"1": 12.0, "2": 15.0, "3": 18.0, "4": 30.0, "5": 25.0}
                    elif any(t in q_lower for t in ["believe", "real", "happening"]):
                        # ~70% believe happening
                        return {"1": 8.0, "2": 10.0, "3": 12.0, "4": 35.0, "5": 35.0}
                
                # Vaccine/health trust - calibrated
                if any(t in combined_context for t in ["cdc", "vaccine", "health authority"]):
                    if any(t in q_lower for t in ["trust"]):
                        # ~58% trust overall, varies by party
                        return {"1": 10.0, "2": 14.0, "3": 18.0, "4": 34.0, "5": 24.0}
                    elif any(t in q_lower for t in ["concern", "worried"]):
                        # Measles outbreak - higher concern
                        return {"1": 5.0, "2": 10.0, "3": 18.0, "4": 38.0, "5": 29.0}
                
                # Streaming satisfaction - calibrated (be specific to streaming services)
                if any(t in combined_context for t in ["streaming service", "netflix", "disney+", "hbo", "hulu"]):
                    # Mean ~3.4/5
                    return {"1": 6.0, "2": 14.0, "3": 26.0, "4": 34.0, "5": 20.0}
                
                # Generic patterns
                if any(t in q_lower for t in ["satisfied", "satisfaction"]):
                    return {"1": 5.0, "2": 11.0, "3": 22.0, "4": 38.0, "5": 24.0}
                elif any(t in q_lower for t in ["concern", "worried", "fear"]):
                    return {"1": 3.0, "2": 8.0, "3": 18.0, "4": 42.0, "5": 29.0}
                elif any(t in q_lower for t in ["comfortable", "comfort"]):
                    return {"1": 4.0, "2": 9.0, "3": 20.0, "4": 40.0, "5": 27.0}
                elif any(t in q_lower for t in ["likely", "likelihood", "intent"]):
                    return {"1": 8.0, "2": 14.0, "3": 28.0, "4": 32.0, "5": 18.0}
                else:
                    return {"1": 6.0, "2": 12.0, "3": 24.0, "4": 35.0, "5": 23.0}
            else:
                pct = 100.0 / n_points
                return {str(i): pct for i in range(min_val, max_val + 1)}
        
        elif question.type == "binary" and len(question.options) == 2:
            opt0, opt1 = question.options[0], question.options[1]
            opt0_lower, opt1_lower = opt0.lower(), opt1.lower()
            
            # Tariffs (Feb 2026)
            if any(t in combined_context for t in ["tariff", "trade war", "import tax"]):
                if "approve" in opt0_lower or "support" in opt0_lower:
                    # 38% approve tariffs
                    return {opt0: 38.0, opt1: 62.0}
                elif "disapprove" in opt0_lower or "oppose" in opt0_lower:
                    # 60% disapprove
                    return {opt0: 60.0, opt1: 40.0}
            
            # Presidential approval (Feb 2026)
            if any(t in combined_context for t in ["trump", "president", "administration"]) and any(t in q_lower for t in ["approve", "approval"]):
                if "approve" in opt0_lower:
                    # 39% approve, 56% disapprove (Feb 2026)
                    return {opt0: 39.0, opt1: 61.0}
                elif "disapprove" in opt0_lower:
                    return {opt0: 56.0, opt1: 44.0}
            
            # Current calibrations - Immigration (Feb 2026)
            if any(t in combined_context for t in ["immigration", "ice", "deportation", "enforcement"]):
                if "approve" in opt0_lower:
                    # 33% approve ICE, 60% disapprove (Feb 2026)
                    return {opt0: 33.0, opt1: 67.0}
                elif "disapprove" in opt0_lower:
                    return {opt0: 60.0, opt1: 40.0}
            
            # AI workplace adoption (Feb 2026)
            if any(t in combined_context for t in ["ai ", "artificial intelligence"]):
                if any(t in q_lower for t in ["employer", "workplace", "company", "using"]):
                    # 53% say workplace uses AI
                    if "yes" in opt0_lower:
                        return {opt0: 53.0, opt1: 47.0}
                    else:
                        return {opt0: 47.0, opt1: 53.0}
                elif "good" in opt0_lower or "positive" in opt0_lower:
                    # Mixed on AI being good for workers
                    return {opt0: 48.0, opt1: 52.0}
            
            # Vaccination (calibrated from CDC data)
            if any(t in combined_context for t in ["vaccine", "vaccinated", "mmr", "measles"]):
                if "yes" in opt0_lower:
                    # 92.5% kindergarteners vaccinated nationally
                    return {opt0: 91.0, opt1: 9.0}
                else:
                    return {opt0: 9.0, opt1: 91.0}
            
            # Streaming cancellation (calibrated)
            if any(t in combined_context for t in ["streaming"]) and "cancel" in q_lower:
                if "yes" in opt0_lower:
                    # ~35% considering canceling
                    return {opt0: 35.0, opt1: 65.0}
                else:
                    return {opt0: 65.0, opt1: 35.0}
            
            # Vehicle purchase intent (Feb 2026)
            if any(t in combined_context for t in ["car", "vehicle", "auto"]):
                if any(t in q_lower for t in ["electric", "ev "]):
                    if "yes" in opt0_lower or "would" in opt0_lower:
                        # Only 16% intend to buy EV
                        return {opt0: 16.0, opt1: 84.0}
                    else:
                        return {opt0: 84.0, opt1: 16.0}
                elif any(t in q_lower for t in ["hybrid"]):
                    if "yes" in opt0_lower:
                        return {opt0: 33.0, opt1: 67.0}
                elif any(t in q_lower for t in ["planning", "intend", "buy"]):
                    if "yes" in opt0_lower:
                        # 40% planning to buy
                        return {opt0: 40.0, opt1: 60.0}
            
            # Recession expectations (Feb 2026)
            if any(t in combined_context for t in ["recession"]):
                if "yes" in opt0_lower or "expect" in opt0_lower or "likely" in opt0_lower:
                    # Only 14% expect recession
                    return {opt0: 14.0, opt1: 86.0}
                elif "no" in opt0_lower:
                    return {opt0: 86.0, opt1: 14.0}
            
            # Cryptocurrency (2026)
            if any(t in combined_context for t in ["crypto", "bitcoin", "cryptocurrency"]):
                if any(t in q_lower for t in ["own", "have", "hold"]):
                    if "yes" in opt0_lower:
                        # 28% own crypto
                        return {opt0: 28.0, opt1: 72.0}
                    else:
                        return {opt0: 72.0, opt1: 28.0}
                elif any(t in q_lower for t in ["plan to buy", "intend", "considering"]):
                    if "yes" in opt0_lower:
                        # Only 6% of non-owners plan to buy
                        return {opt0: 6.0, opt1: 94.0}
            
            # Sports viewership (Feb 2026)
            if any(t in combined_context for t in ["super bowl", "football", "nfl"]):
                if any(t in q_lower for t in ["watch", "plan", "viewing"]):
                    if "yes" in opt0_lower:
                        # 69% plan to watch Super Bowl
                        return {opt0: 69.0, opt1: 31.0}
            
            if any(t in combined_context for t in ["olympics", "winter games"]):
                if any(t in q_lower for t in ["watch", "plan"]):
                    if "yes" in opt0_lower:
                        return {opt0: 58.0, opt1: 42.0}
            
            # Social Security (2026)
            if any(t in combined_context for t in ["social security", "retirement benefits"]):
                if any(t in q_lower for t in ["cut", "reduce", "worried", "concern"]):
                    if "yes" in opt0_lower:
                        # 70-80% worried about cuts
                        return {opt0: 75.0, opt1: 25.0}
                elif any(t in q_lower for t in ["priority", "important"]):
                    if "yes" in opt0_lower:
                        return {opt0: 83.0, opt1: 17.0}
            
            # College value (2025)
            if any(t in combined_context for t in ["college", "university", "degree", "higher education"]):
                if any(t in q_lower for t in ["worth", "value", "cost"]):
                    if "yes" in opt0_lower or "worth" in opt0_lower:
                        # Only 33% say worth the cost
                        return {opt0: 33.0, opt1: 67.0}
            
            # Gun ownership (2025)
            if any(t in combined_context for t in ["gun", "firearm", "weapon"]):
                if any(t in q_lower for t in ["own", "have", "household"]):
                    if "yes" in opt0_lower:
                        # 36% household, 23% personal
                        return {opt0: 32.0, opt1: 68.0}
            
            # Marijuana (2025)
            if any(t in combined_context for t in ["marijuana", "cannabis", "weed", "pot"]):
                if any(t in q_lower for t in ["legalize", "legal", "support"]):
                    if "yes" in opt0_lower or "support" in opt0_lower:
                        # 69% support recreational
                        return {opt0: 69.0, opt1: 31.0}
                if any(t in q_lower for t in ["medical"]):
                    if "yes" in opt0_lower:
                        return {opt0: 86.0, opt1: 14.0}
            
            # Abortion (2025) - highly partisan
            if any(t in combined_context for t in ["abortion"]):
                if any(t in q_lower for t in ["legal", "allow", "support"]):
                    if "yes" in opt0_lower:
                        # 63% legal in all/most cases
                        return {opt0: 63.0, opt1: 37.0}
                if any(t in q_lower for t in ["restrict", "limit", "ban"]):
                    if "yes" in opt0_lower:
                        return {opt0: 72.0, opt1: 28.0}
            
            # Pet ownership (2025)
            if any(t in combined_context for t in ["pet", "dog", "cat", "animal"]):
                if any(t in q_lower for t in ["own", "have"]):
                    if "yes" in opt0_lower:
                        # 68% own a pet
                        return {opt0: 68.0, opt1: 32.0}
                if "dog" in q_lower:
                    if "yes" in opt0_lower:
                        return {opt0: 38.0, opt1: 62.0}
                if "cat" in q_lower:
                    if "yes" in opt0_lower:
                        return {opt0: 26.0, opt1: 74.0}
            
            # Gym/Fitness (2025)
            if any(t in combined_context for t in ["gym", "fitness", "exercise", "workout"]):
                if any(t in q_lower for t in ["member", "belong", "join"]):
                    if "yes" in opt0_lower:
                        # 21% have gym membership
                        return {opt0: 21.0, opt1: 79.0}
                if any(t in q_lower for t in ["achieved", "goal", "success"]):
                    if "yes" in opt0_lower:
                        return {opt0: 55.0, opt1: 45.0}
            
            # Mental health
            if any(t in combined_context for t in ["mental health", "depression", "anxiety"]):
                if any(t in q_lower for t in ["diagnosed", "experienced", "suffered"]):
                    if "yes" in opt0_lower:
                        # 19% overall, higher for women
                        return {opt0: 19.0, opt1: 81.0}
                elif any(t in q_lower for t in ["concern", "worry", "important"]):
                    if "yes" in opt0_lower:
                        # High concern for mental health issues
                        return {opt0: 72.0, opt1: 28.0}
            
            # Homeownership
            if any(t in combined_context for t in ["home", "house", "mortgage"]):
                if any(t in q_lower for t in ["own", "homeowner"]):
                    if "yes" in opt0_lower:
                        # 65.7% homeownership rate
                        return {opt0: 66.0, opt1: 34.0}
                elif any(t in q_lower for t in ["first-time", "first time"]):
                    if "yes" in opt0_lower:
                        # 54% of buyers are first-time
                        return {opt0: 54.0, opt1: 46.0}
            
            # Party identification (Gallup 2025)
            if any(t in combined_context for t in ["party", "political", "democrat", "republican", "independent"]):
                if any(t in q_lower for t in ["identify", "affiliation", "party"]):
                    # Detect generation from audience for calibration
                    generation = self._detect_generation(audience) if hasattr(self, '_detect_generation') else None
                    if generation and generation in PARTY_IDENTIFICATION_2025["by_generation"]:
                        gen_data = PARTY_IDENTIFICATION_2025["by_generation"][generation]
                        if "democrat" in opt0_lower:
                            return {opt0: gen_data["democrat"] * 100, opt1: (1 - gen_data["democrat"]) * 100}
                        elif "republican" in opt0_lower:
                            return {opt0: gen_data["republican"] * 100, opt1: (1 - gen_data["republican"]) * 100}
                        elif "independent" in opt0_lower:
                            return {opt0: gen_data["independent"] * 100, opt1: (1 - gen_data["independent"]) * 100}
                    else:
                        # Use overall
                        overall = PARTY_IDENTIFICATION_2025["overall"]
                        if "independent" in opt0_lower:
                            return {opt0: 45.0, opt1: 55.0}  # Record high
                        elif "democrat" in opt0_lower:
                            return {opt0: 27.0, opt1: 73.0}
                        elif "republican" in opt0_lower:
                            return {opt0: 28.0, opt1: 72.0}
            
            # Remote work preferences (calibrated)
            if any(t in combined_context for t in ["remote", "work from home", "wfh", "hybrid", "office"]):
                if "remote" in opt0_lower or "home" in opt0_lower:
                    if "prefer" in q_lower or "want" in q_lower:
                        # 37% prefer fully remote
                        return {opt0: 37.0, opt1: 63.0}
                    else:
                        # Currently 14% fully remote
                        return {opt0: 14.0, opt1: 86.0}
                elif "hybrid" in opt0_lower:
                    if "prefer" in q_lower:
                        return {opt0: 60.0, opt1: 40.0}
                    else:
                        return {opt0: 30.0, opt1: 70.0}
                elif any(t in opt0_lower for t in ["office", "in-person", "onsite"]):
                    if "prefer" in q_lower:
                        # Only 3% prefer fully onsite
                        return {opt0: 3.0, opt1: 97.0}
                    else:
                        # Currently 56% onsite
                        return {opt0: 56.0, opt1: 44.0}
            
            # Online shopping (2025)
            if any(t in combined_context for t in ["shopping", "ecommerce", "online", "retail"]):
                if any(t in q_lower for t in ["prefer online", "shop online"]):
                    if "yes" in opt0_lower or "online" in opt0_lower:
                        return {opt0: 28.0, opt1: 72.0}
                if any(t in q_lower for t in ["mobile", "phone", "app"]):
                    if "yes" in opt0_lower:
                        return {opt0: 48.0, opt1: 52.0}
            
            # Work-life balance
            if any(t in combined_context for t in ["work-life", "work life", "balance"]):
                if any(t in q_lower for t in ["satisfied", "happy", "good"]):
                    if "yes" in opt0_lower:
                        return {opt0: 60.0, opt1: 40.0}
            
            # Dating apps (2026)
            if any(t in combined_context for t in ["dating", "tinder", "bumble", "hinge"]):
                if any(t in q_lower for t in ["use", "used", "tried"]):
                    if "yes" in opt0_lower:
                        return {opt0: 37.0, opt1: 63.0}
                if any(t in q_lower for t in ["currently", "now", "active"]):
                    if "yes" in opt0_lower:
                        return {opt0: 6.0, opt1: 94.0}
            
            # Religion (2025)
            if any(t in combined_context for t in ["church", "religion", "religious", "faith"]):
                if any(t in q_lower for t in ["member", "belong"]):
                    if "yes" in opt0_lower:
                        return {opt0: 47.0, opt1: 53.0}
                if any(t in q_lower for t in ["attend", "go to", "weekly"]):
                    if "yes" in opt0_lower:
                        return {opt0: 24.0, opt1: 76.0}
                if any(t in q_lower for t in ["christian", "identify"]):
                    if "yes" in opt0_lower:
                        return {opt0: 65.0, opt1: 35.0}
            
            # Diet (2025)
            if any(t in combined_context for t in ["vegetarian", "vegan", "plant-based", "diet"]):
                if any(t in q_lower for t in ["vegetarian"]):
                    if "yes" in opt0_lower:
                        return {opt0: 5.0, opt1: 95.0}
                if any(t in q_lower for t in ["vegan"]):
                    if "yes" in opt0_lower:
                        return {opt0: 3.0, opt1: 97.0}
            
            # Credit card debt (2025)
            if any(t in combined_context for t in ["credit card", "debt", "credit"]):
                if any(t in q_lower for t in ["carry", "balance", "have debt"]):
                    if "yes" in opt0_lower:
                        return {opt0: 36.0, opt1: 64.0}
                if any(t in q_lower for t in ["increase", "grow", "more"]):
                    if "yes" in opt0_lower:
                        return {opt0: 47.0, opt1: 53.0}
            
            # News consumption/trust
            if any(t in combined_context for t in ["news", "media", "journalism"]):
                if any(t in q_lower for t in ["trust", "reliable", "believe"]):
                    if "yes" in opt0_lower:
                        # 56% trust national, higher for local
                        if "local" in q_lower:
                            return {opt0: 68.0, opt1: 32.0}
                        else:
                            return {opt0: 56.0, opt1: 44.0}
            
            # Sleep (2025)
            if any(t in combined_context for t in ["sleep", "rest", "tired"]):
                if any(t in q_lower for t in ["enough", "recommended", "7 hours"]):
                    if "yes" in opt0_lower:
                        return {opt0: 69.0, opt1: 31.0}
                    else:
                        return {opt0: 31.0, opt1: 69.0}
            
            # Travel (2026)
            if any(t in combined_context for t in ["travel", "vacation", "trip"]):
                if any(t in q_lower for t in ["plan", "planning", "intend"]):
                    if "yes" in opt0_lower:
                        # 56% plan same or more travel
                        return {opt0: 56.0, opt1: 44.0}
                if any(t in q_lower for t in ["more", "increase"]):
                    if "yes" in opt0_lower:
                        return {opt0: 42.0, opt1: 58.0}
            
            # Student loans
            if any(t in combined_context for t in ["student loan", "college debt", "student debt"]):
                if any(t in q_lower for t in ["have", "carry", "owe"]):
                    if "yes" in opt0_lower:
                        return {opt0: 13.0, opt1: 87.0}
            
            # Health insurance satisfaction
            if any(t in combined_context for t in ["health insurance", "coverage", "insurance plan"]):
                if any(t in q_lower for t in ["satisfied", "happy", "good"]):
                    if "yes" in opt0_lower:
                        # 82% satisfied
                        return {opt0: 82.0, opt1: 18.0}
            
            # Minimum wage
            if any(t in combined_context for t in ["minimum wage", "$15", "wage increase"]):
                if any(t in q_lower for t in ["support", "favor", "increase"]):
                    if "yes" in opt0_lower:
                        return {opt0: 59.0, opt1: 41.0}
            
            # Universal Basic Income
            if any(t in combined_context for t in ["ubi", "universal basic income", "basic income"]):
                if any(t in q_lower for t in ["support", "favor"]):
                    if "yes" in opt0_lower:
                        return {opt0: 45.0, opt1: 55.0}
            
            # Death penalty
            if any(t in combined_context for t in ["death penalty", "capital punishment", "execution"]):
                if any(t in q_lower for t in ["support", "favor"]):
                    if "yes" in opt0_lower:
                        return {opt0: 52.0, opt1: 48.0}
            
            # Term limits
            if any(t in combined_context for t in ["term limit", "congress"]):
                if any(t in q_lower for t in ["support", "favor"]):
                    if "yes" in opt0_lower:
                        return {opt0: 90.0, opt1: 10.0}
            
            # Smart home
            if any(t in combined_context for t in ["smart home", "alexa", "google home", "smart speaker"]):
                if any(t in q_lower for t in ["have", "own", "use"]):
                    if "yes" in opt0_lower:
                        return {opt0: 48.0, opt1: 52.0}
            
            # Social media
            if any(t in combined_context for t in ["social media", "facebook", "instagram", "tiktok"]):
                if any(t in q_lower for t in ["news", "get news"]):
                    if "yes" in opt0_lower:
                        return {opt0: 35.0, opt1: 65.0}
                if any(t in q_lower for t in ["influence", "purchase", "buy"]):
                    if "yes" in opt0_lower:
                        return {opt0: 55.0, opt1: 45.0}  # Avg across generations
            
            # Climate change
            if any(t in combined_context for t in ["climate", "global warming", "environment"]):
                if any(t in q_lower for t in ["worried", "concerned", "problem"]):
                    if "yes" in opt0_lower:
                        return {opt0: 75.0, opt1: 25.0}  # Avg across concerns
            
            # Housing affordability
            if any(t in combined_context for t in ["housing", "rent", "mortgage", "home price"]):
                if any(t in q_lower for t in ["problem", "afford", "expensive"]):
                    if "yes" in opt0_lower:
                        return {opt0: 92.0, opt1: 8.0}
            
            # Childcare
            if any(t in combined_context for t in ["childcare", "child care", "daycare"]):
                if any(t in q_lower for t in ["problem", "crisis", "afford"]):
                    if "yes" in opt0_lower:
                        return {opt0: 80.0, opt1: 20.0}
            
            # Retirement
            if any(t in combined_context for t in ["retirement", "401k", "pension", "retire"]):
                if any(t in q_lower for t in ["confident", "ready", "enough"]):
                    if "yes" in opt0_lower:
                        return {opt0: 58.0, opt1: 42.0}  # General population
                if any(t in q_lower for t in ["worried", "concerned"]):
                    if "yes" in opt0_lower:
                        return {opt0: 47.0, opt1: 53.0}
            
            # Tipping
            if any(t in combined_context for t in ["tipping", "tip", "gratuity"]):
                if any(t in q_lower for t in ["annoyed", "fatigue", "negative", "problem"]):
                    if "yes" in opt0_lower:
                        return {opt0: 63.0, opt1: 37.0}
            
            # EV charging
            if any(t in combined_context for t in ["ev charging", "charging station", "charger"]):
                if any(t in q_lower for t in ["concern", "barrier", "problem"]):
                    if "yes" in opt0_lower:
                        return {opt0: 65.0, opt1: 35.0}  # High concern
            
            # Side hustles
            if any(t in combined_context for t in ["side hustle", "gig work", "freelance", "extra income"]):
                if any(t in q_lower for t in ["have", "do", "work"]):
                    if "yes" in opt0_lower:
                        return {opt0: 27.0, opt1: 73.0}
                if any(t in q_lower for t in ["need", "rely"]):
                    if "yes" in opt0_lower:
                        return {opt0: 72.0, opt1: 28.0}
            
            # Data privacy
            if any(t in combined_context for t in ["privacy", "data", "personal information"]):
                if any(t in q_lower for t in ["concern", "worried", "important"]):
                    if "yes" in opt0_lower:
                        return {opt0: 80.0, opt1: 20.0}
            
            # Social Security confidence
            if any(t in combined_context for t in ["social security"]):
                if any(t in q_lower for t in ["cut", "reduce", "change"]):
                    if "yes" in opt0_lower:
                        return {opt0: 70.0, opt1: 30.0}
                if any(t in q_lower for t in ["available", "there", "trust"]):
                    if "yes" in opt0_lower:
                        return {opt0: 70.0, opt1: 30.0}  # 70% believe it'll be there
            
            # Shopping preferences
            if any(t in combined_context for t in ["shopping", "retail", "store"]):
                if any(t in q_lower for t in ["online", "internet"]):
                    if "yes" in opt0_lower:
                        return {opt0: 28.0, opt1: 72.0}  # 28% prefer online
                if any(t in q_lower for t in ["in-store", "brick", "physical"]):
                    if "yes" in opt0_lower:
                        return {opt0: 45.0, opt1: 55.0}
            
            # Inflation concern
            if any(t in combined_context for t in ["inflation", "price", "cost of living"]):
                if any(t in q_lower for t in ["concern", "worried", "problem"]):
                    if "yes" in opt0_lower:
                        return {opt0: 66.0, opt1: 34.0}
            
            # Dreamers/DACA
            if any(t in combined_context for t in ["dreamer", "daca", "undocumented youth"]):
                if any(t in q_lower for t in ["pathway", "citizenship", "stay"]):
                    if "yes" in opt0_lower:
                        return {opt0: 81.0, opt1: 19.0}
            
            # Healthcare costs
            if any(t in combined_context for t in ["healthcare cost", "medical bill", "health insurance cost"]):
                if any(t in q_lower for t in ["worried", "afford", "concern"]):
                    if "yes" in opt0_lower:
                        return {opt0: 66.0, opt1: 34.0}
            
            # Mental health treatment
            if any(t in combined_context for t in ["therapy", "counseling", "mental health treatment"]):
                if any(t in q_lower for t in ["received", "sought", "gotten"]):
                    if "yes" in opt0_lower:
                        return {opt0: 14.0, opt1: 86.0}
                if any(t in q_lower for t in ["struggle", "challenge", "issue"]):
                    if "yes" in opt0_lower:
                        return {opt0: 20.0, opt1: 80.0}
            
            # College value
            if any(t in combined_context for t in ["college", "university", "degree"]):
                if any(t in q_lower for t in ["worth", "value"]):
                    if "yes" in opt0_lower:
                        return {opt0: 33.0, opt1: 67.0}
                    else:
                        return {opt0: 63.0, opt1: 37.0}  # Not worth it
            
            # Work arrangements
            if any(t in combined_context for t in ["work from home", "remote work", "hybrid", "office"]):
                if any(t in q_lower for t in ["prefer", "want"]):
                    if "hybrid" in opt0_lower:
                        return {opt0: 72.0, opt1: 28.0}
                    if "remote" in opt0_lower:
                        return {opt0: 16.0, opt1: 84.0}
                    if "office" in opt0_lower:
                        return {opt0: 12.0, opt1: 88.0}
            
            # Gun control
            if any(t in combined_context for t in ["gun", "firearm", "assault weapon"]):
                if any(t in q_lower for t in ["ban", "control", "restrict"]):
                    if "yes" in opt0_lower:
                        return {opt0: 57.0, opt1: 43.0}
            
            # Police trust
            if any(t in combined_context for t in ["police", "law enforcement", "cop"]):
                if any(t in q_lower for t in ["trust", "confidence", "approve"]):
                    if "yes" in opt0_lower:
                        return {opt0: 55.0, opt1: 45.0}
            
            # Food delivery
            if any(t in combined_context for t in ["food delivery", "doordash", "uber eats", "grubhub"]):
                if any(t in q_lower for t in ["use", "order"]):
                    if "yes" in opt0_lower:
                        return {opt0: 52.0, opt1: 48.0}
            
            # Subscription fatigue
            if any(t in combined_context for t in ["subscription", "streaming", "cancel"]):
                if any(t in q_lower for t in ["cancel", "cut", "reduce"]):
                    if "yes" in opt0_lower:
                        return {opt0: 65.0, opt1: 35.0}
                if any(t in q_lower for t in ["too many", "fatigue", "overwhelmed"]):
                    if "yes" in opt0_lower:
                        return {opt0: 65.0, opt1: 35.0}
            
            # Loneliness
            if any(t in combined_context for t in ["lonely", "loneliness", "isolated", "alone"]):
                if any(t in q_lower for t in ["feel", "experience"]):
                    if "yes" in opt0_lower:
                        return {opt0: 40.0, opt1: 60.0}
            
            # Job satisfaction
            if any(t in combined_context for t in ["job satisfaction", "work satisfaction", "happy at work"]):
                if any(t in q_lower for t in ["satisfied", "happy", "like"]):
                    if "yes" in opt0_lower:
                        return {opt0: 51.0, opt1: 49.0}
                if any(t in q_lower for t in ["pay", "salary", "compensation"]):
                    if "yes" in opt0_lower:
                        return {opt0: 34.0, opt1: 66.0}
            
            # Buy Now Pay Later
            if any(t in combined_context for t in ["bnpl", "buy now pay later", "klarna", "affirm", "afterpay"]):
                if any(t in q_lower for t in ["use", "used", "try"]):
                    if "yes" in opt0_lower:
                        return {opt0: 20.0, opt1: 80.0}
            
            # Financial literacy
            if any(t in combined_context for t in ["financial literacy", "budgeting", "money management"]):
                if any(t in q_lower for t in ["understand", "know", "confident"]):
                    if "yes" in opt0_lower:
                        return {opt0: 50.0, opt1: 50.0}
                if any(t in q_lower for t in ["regret", "mistake"]):
                    if "yes" in opt0_lower:
                        return {opt0: 54.0, opt1: 46.0}
            
            # Parental stress
            if any(t in combined_context for t in ["parenting", "parent", "child rearing"]):
                if any(t in q_lower for t in ["stress", "burnout", "overwhelm", "mental health"]):
                    if "yes" in opt0_lower:
                        return {opt0: 30.0, opt1: 70.0}
            
            # Life satisfaction
            if any(t in combined_context for t in ["life satisfaction", "happiness", "well-being"]):
                if any(t in q_lower for t in ["optimistic", "better", "improve"]):
                    if "yes" in opt0_lower:
                        return {opt0: 72.0, opt1: 28.0}
            
            # Fitness/Exercise
            if any(t in combined_context for t in ["fitness", "exercise", "gym", "workout"]):
                if any(t in q_lower for t in ["important", "priority"]):
                    if "yes" in opt0_lower:
                        return {opt0: 86.0, opt1: 14.0}
                if any(t in q_lower for t in ["achieve", "meet", "goal"]):
                    if "yes" in opt0_lower:
                        return {opt0: 55.0, opt1: 45.0}
            
            # Organic food
            if any(t in combined_context for t in ["organic", "natural food", "local produce"]):
                if any(t in q_lower for t in ["buy", "prefer", "purchase"]):
                    if "yes" in opt0_lower:
                        return {opt0: 42.0, opt1: 58.0}  # Gen Z monthly
            
            # Podcasts
            if any(t in combined_context for t in ["podcast", "audio show"]):
                if any(t in q_lower for t in ["listen", "subscribe"]):
                    if "yes" in opt0_lower:
                        return {opt0: 55.0, opt1: 45.0}  # Monthly
                if any(t in q_lower for t in ["tried", "ever"]):
                    if "yes" in opt0_lower:
                        return {opt0: 73.0, opt1: 27.0}
            
            # Video games
            if any(t in combined_context for t in ["video game", "gaming", "gamer"]):
                if any(t in q_lower for t in ["play", "game"]):
                    if "yes" in opt0_lower:
                        return {opt0: 65.0, opt1: 35.0}  # Approximate adult gamers
            
            # Homeownership
            if any(t in combined_context for t in ["homeowner", "own home", "buy home"]):
                if any(t in q_lower for t in ["own", "have"]):
                    if "yes" in opt0_lower:
                        return {opt0: 66.0, opt1: 34.0}  # 65.7% rate
                if any(t in q_lower for t in ["rent", "renter"]):
                    if "yes" in opt0_lower:
                        return {opt0: 34.0, opt1: 66.0}
            
            # Volunteering/Charity
            if any(t in combined_context for t in ["volunteer", "charity", "donate", "giving"]):
                if any(t in q_lower for t in ["donate", "give", "contributed"]):
                    if "yes" in opt0_lower:
                        return {opt0: 76.0, opt1: 24.0}
                if any(t in q_lower for t in ["volunteer", "help"]):
                    if "yes" in opt0_lower:
                        return {opt0: 55.0, opt1: 45.0}
            
            # Car ownership
            if any(t in combined_context for t in ["car", "vehicle", "automobile"]):
                if any(t in q_lower for t in ["own", "have"]):
                    if "yes" in opt0_lower:
                        return {opt0: 92.0, opt1: 8.0}
            
            # Book reading
            if any(t in combined_context for t in ["book", "reading", "read"]):
                if any(t in q_lower for t in ["read", "finish"]):
                    if "yes" in opt0_lower:
                        return {opt0: 60.0, opt1: 40.0}
            
            # Outdoor/Camping
            if any(t in combined_context for t in ["camping", "outdoor", "hiking", "nature"]):
                if any(t in q_lower for t in ["camp", "hike", "outdoor"]):
                    if "yes" in opt0_lower:
                        return {opt0: 25.0, opt1: 75.0}
            
            # Coffee
            if any(t in combined_context for t in ["coffee", "caffeine"]):
                if any(t in q_lower for t in ["drink", "consume", "daily"]):
                    if "yes" in opt0_lower:
                        return {opt0: 66.0, opt1: 34.0}
            
            # Alcohol
            if any(t in combined_context for t in ["alcohol", "drinking", "beer", "wine", "liquor"]):
                if any(t in q_lower for t in ["drink", "consume"]):
                    if "yes" in opt0_lower:
                        return {opt0: 54.0, opt1: 46.0}
                if any(t in q_lower for t in ["sober", "quit", "reduce"]):
                    if "yes" in opt0_lower:
                        return {opt0: 34.0, opt1: 66.0}
            
            # Sports betting
            if any(t in combined_context for t in ["sports betting", "gambling", "bet on sports"]):
                if any(t in q_lower for t in ["bet", "gamble", "wager"]):
                    if "yes" in opt0_lower:
                        return {opt0: 22.0, opt1: 78.0}
            
            # Plastic surgery
            if any(t in combined_context for t in ["plastic surgery", "cosmetic surgery", "botox"]):
                if any(t in q_lower for t in ["consider", "had", "get"]):
                    if "yes" in opt0_lower:
                        return {opt0: 15.0, opt1: 85.0}  # Approximate
            
            # Dating apps (updated)
            if any(t in combined_context for t in ["dating app", "tinder", "bumble", "hinge", "online dating"]):
                if any(t in q_lower for t in ["use", "try", "met"]):
                    if "yes" in opt0_lower:
                        return {opt0: 37.0, opt1: 63.0}  # General usage
                if any(t in q_lower for t in ["met partner", "relationship"]):
                    if "yes" in opt0_lower:
                        return {opt0: 50.0, opt1: 50.0}  # Of engaged couples
            
            # EV range anxiety
            if any(t in combined_context for t in ["ev range", "electric vehicle range", "range anxiety"]):
                if any(t in q_lower for t in ["concern", "worry", "barrier"]):
                    if "yes" in opt0_lower:
                        return {opt0: 70.0, opt1: 30.0}  # Top concern
            
            # Telehealth
            if any(t in combined_context for t in ["telehealth", "telemedicine", "virtual doctor", "video visit"]):
                if any(t in q_lower for t in ["use", "tried", "had"]):
                    if "yes" in opt0_lower:
                        return {opt0: 54.0, opt1: 46.0}
            
            # GLP-1/Weight loss drugs
            if any(t in combined_context for t in ["ozempic", "wegovy", "glp-1", "weight loss drug"]):
                if any(t in q_lower for t in ["tried", "use", "take"]):
                    if "yes" in opt0_lower:
                        return {opt0: 12.0, opt1: 88.0}
                if any(t in q_lower for t in ["hear", "aware"]):
                    if "yes" in opt0_lower:
                        return {opt0: 53.0, opt1: 47.0}
            
            # Fast food
            if any(t in combined_context for t in ["fast food", "mcdonald", "burger king", "wendy"]):
                if any(t in q_lower for t in ["eat", "weekly", "often"]):
                    if "yes" in opt0_lower:
                        return {opt0: 83.0, opt1: 17.0}  # Weekly
                if any(t in q_lower for t in ["daily"]):
                    if "yes" in opt0_lower:
                        return {opt0: 37.0, opt1: 63.0}
            
            # Password security
            if any(t in combined_context for t in ["password", "security", "login"]):
                if any(t in q_lower for t in ["reuse", "weak", "same"]):
                    if "yes" in opt0_lower:
                        return {opt0: 94.0, opt1: 6.0}
            
            # Solar/Renewable energy
            if any(t in combined_context for t in ["solar", "renewable", "wind energy"]):
                if any(t in q_lower for t in ["support", "favor"]):
                    if "yes" in opt0_lower:
                        return {opt0: 79.0, opt1: 21.0}
            
            # Print media trust
            if any(t in combined_context for t in ["print", "newspaper", "magazine"]):
                if any(t in q_lower for t in ["trust", "believe"]):
                    if "yes" in opt0_lower:
                        return {opt0: 82.0, opt1: 18.0}
            
            # Payment methods
            if any(t in combined_context for t in ["cash", "payment", "digital wallet", "apple pay"]):
                if any(t in q_lower for t in ["cash", "physical"]):
                    if "yes" in opt0_lower:
                        return {opt0: 12.0, opt1: 88.0}
                if any(t in q_lower for t in ["digital", "wallet", "contactless"]):
                    if "yes" in opt0_lower:
                        return {opt0: 39.0, opt1: 61.0}  # Online
            
            # DIY home improvement
            if any(t in combined_context for t in ["diy", "home improvement", "renovation"]):
                if any(t in q_lower for t in ["project", "completed", "done"]):
                    if "yes" in opt0_lower:
                        return {opt0: 72.0, opt1: 28.0}
            
            # Secondhand/Thrift
            if any(t in combined_context for t in ["secondhand", "thrift", "resale", "used clothing"]):
                if any(t in q_lower for t in ["buy", "shop", "purchase"]):
                    if "yes" in opt0_lower:
                        return {opt0: 60.0, opt1: 40.0}
            
            # Meal kit delivery
            if any(t in combined_context for t in ["meal kit", "hello fresh", "blue apron"]):
                if any(t in q_lower for t in ["use", "subscribe", "order"]):
                    if "yes" in opt0_lower:
                        return {opt0: 7.0, opt1: 93.0}
            
            # Wearables/Smartwatch
            if any(t in combined_context for t in ["smartwatch", "fitness tracker", "wearable", "apple watch"]):
                if any(t in q_lower for t in ["own", "have", "use"]):
                    if "yes" in opt0_lower:
                        return {opt0: 28.0, opt1: 72.0}
            
            # Meditation apps
            if any(t in combined_context for t in ["meditation", "mindfulness", "calm", "headspace"]):
                if any(t in q_lower for t in ["use", "practice", "app"]):
                    if "yes" in opt0_lower:
                        return {opt0: 15.0, opt1: 85.0}  # Approximate
            
            # Cord cutting
            if any(t in combined_context for t in ["cable", "cord cutting", "tv subscription"]):
                if any(t in q_lower for t in ["cut", "cancel", "drop"]):
                    if "yes" in opt0_lower:
                        return {opt0: 50.0, opt1: 50.0}  # ~Half have cut
                if any(t in q_lower for t in ["have", "subscribe"]):
                    if "yes" in opt0_lower:
                        return {opt0: 45.0, opt1: 55.0}  # Less than half have cable
            
            # Home security
            if any(t in combined_context for t in ["security system", "ring doorbell", "home security"]):
                if any(t in q_lower for t in ["have", "installed", "own"]):
                    if "yes" in opt0_lower:
                        return {opt0: 53.0, opt1: 47.0}
            
            # Remote/hybrid work preferences
            if any(t in combined_context for t in ["remote work", "work from home", "wfh", "hybrid"]):
                if any(t in q_lower for t in ["prefer", "want"]):
                    if "hybrid" in opt0_lower:
                        return {opt0: 60.0, opt1: 40.0}
                    if "remote" in opt0_lower:
                        return {opt0: 37.0, opt1: 63.0}
            
            # Student loan
            if any(t in combined_context for t in ["student loan", "college debt", "student debt"]):
                if any(t in q_lower for t in ["forgiveness", "cancel"]):
                    if "support" in opt0_lower or "yes" in opt0_lower:
                        return {opt0: 57.0, opt1: 43.0}
            
            # Gig economy / side hustle
            if any(t in combined_context for t in ["gig economy", "side hustle", "uber", "lyft", "freelance"]):
                if any(t in q_lower for t in ["have", "do", "work"]):
                    if "yes" in opt0_lower:
                        return {opt0: 45.0, opt1: 55.0}
            
            # Cryptocurrency
            if any(t in combined_context for t in ["cryptocurrency", "bitcoin", "crypto", "ethereum"]):
                if any(t in q_lower for t in ["own", "invest", "hold"]):
                    if "yes" in opt0_lower:
                        return {opt0: 15.0, opt1: 85.0}  # ~15% ownership
            
            # Veganism/Vegetarianism
            if any(t in combined_context for t in ["vegan", "vegetarian", "plant-based"]):
                if any(t in q_lower for t in ["are", "follow", "diet"]):
                    if "vegan" in q_lower:
                        if "yes" in opt0_lower:
                            return {opt0: 3.0, opt1: 97.0}
                    if "vegetarian" in q_lower:
                        if "yes" in opt0_lower:
                            return {opt0: 5.0, opt1: 95.0}
                    if "yes" in opt0_lower:
                        return {opt0: 8.0, opt1: 92.0}  # Combined
            
            # Smart speakers
            if any(t in combined_context for t in ["alexa", "google home", "smart speaker", "voice assistant"]):
                if any(t in q_lower for t in ["own", "have", "use"]):
                    if "yes" in opt0_lower:
                        return {opt0: 75.0, opt1: 25.0}
            
            # Online grocery
            if any(t in combined_context for t in ["grocery delivery", "instacart", "online grocery"]):
                if any(t in q_lower for t in ["use", "order", "prefer"]):
                    if "yes" in opt0_lower:
                        return {opt0: 21.0, opt1: 79.0}
            
            # Tattoos
            if any(t in combined_context for t in ["tattoo", "body art", "ink"]):
                if any(t in q_lower for t in ["have", "got"]):
                    if "yes" in opt0_lower:
                        return {opt0: 30.0, opt1: 70.0}
                if any(t in q_lower for t in ["regret"]):
                    if "yes" in opt0_lower:
                        return {opt0: 24.0, opt1: 76.0}
            
            # Marriage/Divorce
            if any(t in combined_context for t in ["marriage", "divorce", "married"]):
                if any(t in q_lower for t in ["divorce", "end"]):
                    if "yes" in opt0_lower:
                        return {opt0: 41.0, opt1: 59.0}
            
            # Sleep/Insomnia
            if any(t in combined_context for t in ["sleep", "insomnia", "sleeping"]):
                if any(t in q_lower for t in ["trouble", "problem", "insomnia"]):
                    if "yes" in opt0_lower:
                        return {opt0: 12.5, opt1: 87.5}
            
            # Flu vaccination
            if any(t in combined_context for t in ["flu shot", "flu vaccine", "influenza"]):
                if any(t in q_lower for t in ["get", "got", "received"]):
                    if "yes" in opt0_lower:
                        return {opt0: 46.0, opt1: 54.0}
            
            # Credit card debt
            if any(t in combined_context for t in ["credit card", "credit card debt"]):
                if any(t in q_lower for t in ["balance", "carry", "debt"]):
                    if "yes" in opt0_lower:
                        return {opt0: 36.0, opt1: 64.0}
            
            # Emergency savings
            if any(t in combined_context for t in ["emergency fund", "emergency savings", "rainy day"]):
                if any(t in q_lower for t in ["have", "cover"]):
                    if "no" in opt0_lower or "can't" in opt0_lower:
                        return {opt0: 43.0, opt1: 57.0}
                    if "yes" in opt0_lower:
                        return {opt0: 57.0, opt1: 43.0}
            
            # 401k retirement
            if any(t in combined_context for t in ["401k", "retirement", "ira"]):
                if any(t in q_lower for t in ["max", "maximum", "limit"]):
                    if "yes" in opt0_lower:
                        return {opt0: 14.0, opt1: 86.0}
            
            # News trust
            if any(t in combined_context for t in ["news", "media", "journalism"]):
                if any(t in q_lower for t in ["trust", "believe"]):
                    if "yes" in opt0_lower:
                        return {opt0: 56.0, opt1: 44.0}
            
            # Organ donation
            if any(t in combined_context for t in ["organ donor", "organ donation"]):
                if any(t in q_lower for t in ["support", "favor"]):
                    if "yes" in opt0_lower:
                        return {opt0: 95.0, opt1: 5.0}
                if any(t in q_lower for t in ["registered", "signed"]):
                    if "yes" in opt0_lower:
                        return {opt0: 58.0, opt1: 42.0}
            
            # Internet access
            if any(t in combined_context for t in ["internet", "online", "broadband"]):
                if any(t in q_lower for t in ["use", "access"]):
                    if "yes" in opt0_lower:
                        return {opt0: 90.0, opt1: 10.0}
            
            # Gun ownership
            if any(t in combined_context for t in ["gun", "firearm", "handgun"]):
                if any(t in q_lower for t in ["own", "have"]):
                    if "yes" in opt0_lower:
                        return {opt0: 42.0, opt1: 58.0}
            
            # Pet ownership
            if any(t in combined_context for t in ["pet", "dog", "cat"]):
                if any(t in q_lower for t in ["own", "have"]):
                    if "yes" in opt0_lower:
                        return {opt0: 71.0, opt1: 29.0}
            
            # Life insurance
            if any(t in combined_context for t in ["life insurance", "insurance policy"]):
                if any(t in q_lower for t in ["have", "own"]):
                    if "yes" in opt0_lower:
                        return {opt0: 60.0, opt1: 40.0}
            
            # Food allergies
            if any(t in combined_context for t in ["food allergy", "allergic", "peanut allergy"]):
                if any(t in q_lower for t in ["have", "suffer"]):
                    if "yes" in opt0_lower:
                        return {opt0: 8.0, opt1: 92.0}  # ~8% have food allergies
            
            # Charitable giving
            if any(t in combined_context for t in ["charity", "donate", "giving"]):
                if any(t in q_lower for t in ["donate", "give"]):
                    if "yes" in opt0_lower:
                        return {opt0: 41.0, opt1: 59.0}
            
            # Budgeting
            if any(t in combined_context for t in ["budget", "budgeting", "expenses"]):
                if any(t in q_lower for t in ["have", "track"]):
                    if "yes" in opt0_lower:
                        return {opt0: 86.0, opt1: 14.0}
                if any(t in q_lower for t in ["stick", "follow"]):
                    if "no" in opt0_lower or "over" in opt0_lower:
                        return {opt0: 84.0, opt1: 16.0}
            
            # Solar panels
            if any(t in combined_context for t in ["solar panel", "rooftop solar"]):
                if any(t in q_lower for t in ["have", "installed"]):
                    if "yes" in opt0_lower:
                        return {opt0: 9.0, opt1: 91.0}
                if any(t in q_lower for t in ["interest", "consider"]):
                    if "yes" in opt0_lower:
                        return {opt0: 55.0, opt1: 45.0}
            
            # Freelancing
            if any(t in combined_context for t in ["freelance", "self-employed", "independent contractor"]):
                if any(t in q_lower for t in ["are", "work"]):
                    if "yes" in opt0_lower:
                        return {opt0: 25.0, opt1: 75.0}
            
            # Default patterns - status quo bias
            if any(t in opt0_lower for t in ["in-person", "traditional", "stay", "current", "keep"]):
                return {opt0: 60.0, opt1: 40.0}
            elif any(t in opt1_lower for t in ["in-person", "traditional", "stay", "current", "keep"]):
                return {opt0: 40.0, opt1: 60.0}
            elif any(t in opt0_lower for t in ["virtual", "online", "new", "switch", "change"]):
                return {opt0: 40.0, opt1: 60.0}
            elif any(t in opt1_lower for t in ["virtual", "online", "new", "switch", "change"]):
                return {opt0: 60.0, opt1: 40.0}
            else:
                return {opt0: 52.0, opt1: 48.0}
        
        elif question.type == "nps":
            # NPS distribution (0-10), positive for screened audiences
            return {
                "0": 1.0, "1": 1.0, "2": 2.0, "3": 3.0, "4": 4.0,
                "5": 7.0, "6": 9.0, "7": 18.0, "8": 24.0, "9": 19.0, "10": 12.0
            }
        
        elif question.options:
            # Multiple choice - equal distribution with slight primacy
            n = len(question.options)
            base_pct = 100.0 / n
            dist = {}
            for i, opt in enumerate(question.options):
                if i == 0:
                    dist[opt] = base_pct + 3.0
                elif i == n - 1:
                    dist[opt] = base_pct + 1.0
                else:
                    dist[opt] = base_pct - 4.0 / max(1, n - 2)
            return dist
        
        return {}
    
    def _apply_conservative_shift(self, base: Dict[str, float]) -> Dict[str, float]:
        """Compress distribution toward center."""
        result = base.copy()
        
        # Find middle point
        keys = list(result.keys())
        if len(keys) >= 3:
            mid_idx = len(keys) // 2
            mid_key = keys[mid_idx]
            
            # Move 5% from extremes to middle
            for i, key in enumerate(keys):
                if i == 0 or i == len(keys) - 1:
                    transfer = result[key] * 0.10
                    result[key] -= transfer
                    result[mid_key] += transfer
        
        return self._normalize(result)
    
    def _apply_signal_shift(
        self,
        base: Dict[str, float],
        config: SurveyConfig
    ) -> Dict[str, float]:
        """Allow larger shifts based on stimuli and context."""
        result = base.copy()
        
        # If stimuli present, shift distribution
        if config.stimuli:
            keys = list(result.keys())
            if len(keys) >= 2:
                # Boost positive end
                result[keys[-1]] += 5.0
                result[keys[-2]] += 3.0
                result[keys[0]] -= 4.0
                result[keys[1]] -= 4.0
        
        return self._normalize(result)
    
    def _apply_heterogeneity_shift(self, base: Dict[str, float]) -> Dict[str, float]:
        """Increase variance in distribution."""
        result = base.copy()
        
        # Make extremes more extreme
        keys = list(result.keys())
        if len(keys) >= 3:
            mid_idx = len(keys) // 2
            
            # Move from middle to extremes
            transfer = result[keys[mid_idx]] * 0.15
            result[keys[mid_idx]] -= transfer
            result[keys[0]] += transfer * 0.4
            result[keys[-1]] += transfer * 0.6
        
        return self._normalize(result)
    
    def _reconcile_ensemble(self, runs: List[EnsembleRun]) -> Dict[str, float]:
        """
        Weighted average of ensemble runs.
        Weights: 40% conservative, 35% signal-forward, 25% heterogeneity
        """
        weights = {"conservative": 0.40, "signal_forward": 0.35, "heterogeneity": 0.25}
        
        result = {}
        keys = list(runs[0].distribution.keys())
        
        for key in keys:
            weighted_sum = sum(
                run.distribution.get(key, 0) * weights.get(run.run_type, 0.33)
                for run in runs
            )
            result[key] = round(weighted_sum, 1)
        
        return self._normalize(result)
    
    def _calculate_stats(
        self,
        distribution: Dict[str, float],
        question: Question
    ) -> Tuple[Optional[float], Optional[float]]:
        """Calculate mean and SD for scale questions."""
        if question.type not in ["scale", "nps"]:
            return None, None
        
        try:
            # Calculate mean
            total = 0
            for key, pct in distribution.items():
                val = float(key)
                total += val * pct
            mean = total / 100.0
            
            # Calculate variance
            variance = 0
            for key, pct in distribution.items():
                val = float(key)
                variance += ((val - mean) ** 2) * pct
            variance /= 100.0
            sd = variance ** 0.5
            
            return round(mean, 2), round(sd, 2)
        except (ValueError, ZeroDivisionError):
            return None, None
    
    def _calculate_confidence(
        self,
        priors: List[Dict],
        runs: List[EnsembleRun],
        validation
    ) -> float:
        """
        Calculate confidence score.
        
        confidence = base_score × prior_weight × agreement_factor
        """
        # Base score from prior availability
        if len(priors) >= 3:
            base_score = 0.85
        elif len(priors) >= 1:
            base_score = 0.70
        else:
            base_score = 0.50
        
        # Prior relevance weight
        if priors:
            avg_relevance = sum(p.get("relevance", 3) for p in priors) / len(priors)
            prior_weight = avg_relevance / 5.0
        else:
            prior_weight = 0.5
        
        # Agreement factor (how much runs agree)
        if len(runs) >= 2:
            keys = list(runs[0].distribution.keys())
            max_diff = 0
            for key in keys:
                values = [r.distribution.get(key, 0) for r in runs]
                max_diff = max(max_diff, max(values) - min(values))
            
            if max_diff <= 10:
                agreement_factor = 1.0
            elif max_diff <= 15:
                agreement_factor = 0.8
            else:
                agreement_factor = 0.6
        else:
            agreement_factor = 0.7
        
        # Validation penalty
        if not validation.passed:
            agreement_factor *= 0.8
        
        confidence = base_score * prior_weight * agreement_factor
        
        # Cap at 0.90
        return min(0.90, round(confidence, 2))
    
    def _normalize(self, distribution: Dict[str, float]) -> Dict[str, float]:
        """Normalize distribution to sum to 100%."""
        # First, ensure no negative values (floor at 0.5%)
        cleaned = {k: max(0.5, v) for k, v in distribution.items()}
        
        total = sum(cleaned.values())
        if total == 0:
            return distribution
        
        normalized = {k: round(v / total * 100, 1) for k, v in cleaned.items()}
        
        # Adjust largest to force exact 100
        diff = 100.0 - sum(normalized.values())
        if diff != 0:
            largest_key = max(normalized, key=normalized.get)
            normalized[largest_key] = round(normalized[largest_key] + diff, 1)
        
        return normalized
    
    def to_csv(self, report: SimulationReport) -> str:
        """Export results to CSV format."""
        lines = ["question_id,question_text,option,percentage,mean,sd,confidence,accuracy_zone"]
        
        for result in report.results:
            for option, pct in result.distribution.items():
                lines.append(
                    f"{result.question_id},"
                    f"\"{result.question_text}\","
                    f"{option},"
                    f"{pct},"
                    f"{result.mean or ''},"
                    f"{result.sd or ''},"
                    f"{result.confidence},"
                    f"{result.accuracy_zone.value}"
                )
        
        return "\n".join(lines)
    
    def to_json(self, report: SimulationReport) -> str:
        """Export results to JSON format."""
        def serialize(obj, depth=0):
            if depth > 10:  # Prevent infinite recursion
                return str(obj)
            if obj is None:
                return None
            if isinstance(obj, (str, int, float, bool)):
                return obj
            if isinstance(obj, Enum):
                return obj.value
            if isinstance(obj, list):
                return [serialize(i, depth + 1) for i in obj]
            if isinstance(obj, dict):
                return {str(k): serialize(v, depth + 1) for k, v in obj.items()}
            if hasattr(obj, "__dataclass_fields__"):
                # Handle dataclasses specifically
                return {k: serialize(getattr(obj, k), depth + 1) 
                        for k in obj.__dataclass_fields__.keys()}
            if hasattr(obj, "__dict__"):
                return {k: serialize(v, depth + 1) 
                        for k, v in obj.__dict__.items() 
                        if not k.startswith('_')}
            return str(obj)
        
        return json.dumps(serialize(report), indent=2)
