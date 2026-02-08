"""
Crowdwave Python Client
Easy-to-use client for the Crowdwave API.
"""

import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


@dataclass
class SimulationResult:
    """Result for a single question."""
    question_id: str
    question_text: str
    distribution: Dict[str, float]
    mean: Optional[float]
    sd: Optional[float]
    confidence: float
    accuracy_zone: str
    biases_detected: List[str]
    corrections_applied: List[str]
    warnings: List[str]


@dataclass 
class SimulationReport:
    """Full simulation report."""
    status: str
    overall_confidence: float
    flags: List[str]
    results: List[SimulationResult]


class CrowdwaveClient:
    """
    Python client for Crowdwave Simulation API.
    
    Usage:
        client = CrowdwaveClient("http://localhost:8000")
        
        result = client.simulate(
            audience="US consumers 25-54",
            geography="USA",
            topic="Product satisfaction",
            questions=[
                {"id": "Q1", "text": "How satisfied are you?", "type": "scale", "scale": [1, 5]}
            ]
        )
        
        for r in result.results:
            print(f"{r.question_id}: Mean={r.mean:.2f}, Zone={r.accuracy_zone}")
    """
    
    def __init__(self, base_url: str = "http://localhost:8000", api_key: str = None):
        if not REQUESTS_AVAILABLE:
            raise ImportError("requests library required. pip install requests")
        
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.session = requests.Session()
        
        if api_key:
            self.session.headers["Authorization"] = f"Bearer {api_key}"
    
    def simulate(
        self,
        audience: str,
        questions: List[Dict],
        geography: str = "USA",
        topic: str = "",
        sample_size: int = 500,
        screeners: List[str] = None,
        stimuli: List[str] = None,
    ) -> SimulationReport:
        """
        Run a survey simulation.
        
        Args:
            audience: Target audience description
            questions: List of question dicts with id, text, type, and options/scale
            geography: Geographic region (default: USA)
            topic: Survey topic/context
            sample_size: Simulated sample size
            screeners: Pre-screening criteria
            stimuli: Stimuli descriptions
            
        Returns:
            SimulationReport with results for each question
        """
        payload = {
            "config": {
                "audience": audience,
                "geography": geography,
                "sample_size": sample_size,
                "topic": topic,
                "screeners": screeners or [],
                "stimuli": stimuli or [],
            },
            "questions": questions
        }
        
        response = self.session.post(
            f"{self.base_url}/simulate",
            json=payload
        )
        response.raise_for_status()
        data = response.json()
        
        results = [
            SimulationResult(
                question_id=r["question_id"],
                question_text=r["question_text"],
                distribution=r["distribution"],
                mean=r.get("mean"),
                sd=r.get("sd"),
                confidence=r.get("confidence", 0.5),
                accuracy_zone=r.get("accuracy_zone", "MEDIUM"),
                biases_detected=r.get("biases_detected", []),
                corrections_applied=r.get("corrections_applied", []),
                warnings=r.get("warnings", []),
            )
            for r in data.get("results", [])
        ]
        
        return SimulationReport(
            status=data.get("status", "success"),
            overall_confidence=data.get("overall_confidence", 0.5),
            flags=data.get("flags", []),
            results=results,
        )
    
    def batch_simulate(
        self,
        surveys: List[Dict],
    ) -> List[SimulationReport]:
        """
        Run multiple simulations in batch.
        
        Args:
            surveys: List of survey configs, each with 'config' and 'questions'
            
        Returns:
            List of SimulationReport objects
        """
        results = []
        for survey in surveys:
            config = survey.get("config", {})
            result = self.simulate(
                audience=config.get("audience", "General population"),
                geography=config.get("geography", "USA"),
                topic=config.get("topic", ""),
                sample_size=config.get("sample_size", 500),
                questions=survey.get("questions", []),
            )
            results.append(result)
        return results
    
    def get_benchmark(self, industry: str, b2b: bool = False) -> Dict:
        """
        Get NPS benchmark for an industry.
        
        Args:
            industry: Industry name
            b2b: Whether to use B2B benchmarks
            
        Returns:
            Dict with benchmark data
        """
        response = self.session.post(
            f"{self.base_url}/benchmark",
            json={"industry": industry, "b2b": b2b}
        )
        response.raise_for_status()
        return response.json()
    
    def check_partisan(self, topic: str) -> bool:
        """
        Check if topic requires partisan segmentation.
        
        Args:
            topic: Topic to check
            
        Returns:
            True if segmentation required
        """
        response = self.session.get(
            f"{self.base_url}/check-partisan/{topic}"
        )
        response.raise_for_status()
        return response.json().get("requires_partisan_segmentation", False)
    
    def get_calibrations(self, category: str = None) -> Dict:
        """
        Get available calibrations.
        
        Args:
            category: Optional category (demographics, executive, nps)
            
        Returns:
            Calibration data
        """
        if category:
            response = self.session.get(f"{self.base_url}/calibrations/{category}")
        else:
            response = self.session.get(f"{self.base_url}/calibrations")
        response.raise_for_status()
        return response.json()
    
    def health_check(self) -> bool:
        """Check if API is healthy."""
        try:
            response = self.session.get(f"{self.base_url}/api")
            return response.status_code == 200
        except:
            return False


# Convenience function for one-off simulations
def quick_simulate(
    audience: str,
    question: str,
    question_type: str = "scale",
    base_url: str = "http://localhost:8000",
) -> Dict:
    """
    Quick one-question simulation.
    
    Args:
        audience: Target audience
        question: Question text
        question_type: Type (scale, nps, binary)
        base_url: API URL
        
    Returns:
        Result dict with distribution and stats
    """
    client = CrowdwaveClient(base_url)
    
    q = {"id": "Q1", "text": question, "type": question_type}
    if question_type == "scale":
        q["scale"] = [1, 5]
    elif question_type == "binary":
        q["options"] = ["Yes", "No"]
    
    report = client.simulate(audience=audience, questions=[q])
    
    if report.results:
        r = report.results[0]
        return {
            "distribution": r.distribution,
            "mean": r.mean,
            "sd": r.sd,
            "confidence": r.confidence,
            "accuracy_zone": r.accuracy_zone,
        }
    return {}
