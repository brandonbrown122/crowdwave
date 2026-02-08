"""
Crowdwave API Wrapper
FastAPI-based REST API for survey simulation.
"""

import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

# Check if FastAPI is available
try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    from pydantic import BaseModel
    import os
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    BaseModel = object  # Fallback

from .crowdwave import CrowdwaveEngine
from .calibration import (
    get_nps_benchmark,
    requires_partisan_segmentation,
    DEMOGRAPHIC_MULTIPLIERS,
    EXECUTIVE_MULTIPLIERS,
    NPS_BENCHMARKS,
)


# ═══════════════════════════════════════════════════════════════
# API MODELS (Pydantic)
# ═══════════════════════════════════════════════════════════════

if FASTAPI_AVAILABLE:
    class QuestionInput(BaseModel):
        id: str
        text: str
        type: str  # "scale", "binary", "nps", "multiple_choice"
        options: Optional[List[str]] = None
        scale: Optional[List[int]] = None
        labels: Optional[List[str]] = None

    class SurveyConfig(BaseModel):
        audience: str
        geography: str = "USA"
        sample_size: int = 500
        topic: str = ""
        screeners: List[str] = []
        stimuli: List[str] = []

    class SimulationRequest(BaseModel):
        config: SurveyConfig
        questions: List[QuestionInput]

    class BenchmarkRequest(BaseModel):
        industry: str
        b2b: bool = False

    class ValidationRequest(BaseModel):
        question_id: str
        question_text: str
        question_type: str
        audience: str
        distribution: Dict[str, float]


# ═══════════════════════════════════════════════════════════════
# API SETUP
# ═══════════════════════════════════════════════════════════════

def create_app() -> 'FastAPI':
    """Create and configure the FastAPI application."""
    if not FASTAPI_AVAILABLE:
        raise ImportError("FastAPI not installed. Run: pip install fastapi uvicorn")
    
    app = FastAPI(
        title="Crowdwave Simulation API",
        description="Production survey simulation with calibrated accuracy",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialize engine
    engine = CrowdwaveEngine()
    
    # Static files directory
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    if os.path.exists(static_dir):
        app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    # ═══════════════════════════════════════════════════════════════
    # ENDPOINTS
    # ═══════════════════════════════════════════════════════════════
    
    @app.get("/")
    async def root():
        """Serve the dashboard or return API info."""
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {
            "service": "Crowdwave Simulation API",
            "version": "1.0.1",
            "status": "healthy",
            "dashboard": "/static/index.html",
            "endpoints": {
                "simulate": "/simulate",
                "benchmark": "/benchmark",
                "validate": "/validate",
                "calibrations": "/calibrations",
            }
        }
    
    @app.get("/api")
    async def api_info():
        """API health check."""
        return {
            "service": "Crowdwave Simulation API",
            "version": "1.0.1",
            "status": "healthy",
            "endpoints": {
                "simulate": "/simulate",
                "benchmark": "/benchmark",
                "validate": "/validate",
                "calibrations": "/calibrations",
            }
        }
    
    @app.post("/simulate")
    async def simulate(request: SimulationRequest):
        """
        Run a survey simulation.
        
        Returns calibrated distribution predictions with confidence scores.
        """
        try:
            config = {
                "audience": request.config.audience,
                "geography": request.config.geography,
                "sample_size": request.config.sample_size,
                "topic": request.config.topic,
                "screeners": request.config.screeners,
                "stimuli": request.config.stimuli,
            }
            
            questions = [
                {
                    "id": q.id,
                    "text": q.text,
                    "type": q.type,
                    "options": q.options or [],
                    "scale": q.scale,
                    "labels": q.labels,
                }
                for q in request.questions
            ]
            
            report = engine.simulate(config, questions)
            
            # Convert to JSON-serializable format
            results = []
            for r in report.results:
                results.append({
                    "question_id": r.question_id,
                    "question_text": r.question_text,
                    "distribution": r.distribution,
                    "mean": r.mean,
                    "sd": r.sd,
                    "confidence": r.confidence,
                    "accuracy_zone": r.accuracy_zone.value,
                    "biases_detected": r.biases_detected,
                    "corrections_applied": r.corrections_applied,
                    "warnings": r.validation_warnings,
                })
            
            return {
                "status": "success",
                "overall_confidence": report.overall_confidence,
                "flags": report.flags,
                "results": results,
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/benchmark")
    async def benchmark(request: BenchmarkRequest):
        """
        Get NPS benchmark for an industry.
        
        Based on Survicate 2025 data (N=5.4M responses).
        """
        try:
            nps = get_nps_benchmark(request.industry, request.b2b)
            
            # Get full industry data if available
            industry_key = request.industry.lower().replace(" ", "_")
            industry_data = None
            for key, data in NPS_BENCHMARKS["by_industry"].items():
                if industry_key in key:
                    industry_data = data
                    break
            
            return {
                "industry": request.industry,
                "b2b": request.b2b,
                "nps_benchmark": nps,
                "industry_data": industry_data,
                "overall_median": NPS_BENCHMARKS["overall_median"],
                "source": "Survicate NPS Benchmark 2025 (N=5.4M)"
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/validate")
    async def validate(request: ValidationRequest):
        """
        Validate a simulation result against self-check rules.
        """
        from .bias_corrections import validate_distribution
        
        try:
            result = validate_distribution(
                request.distribution,
                request.question_type,
                request.audience
            )
            
            return {
                "passed": result.passed,
                "violations": result.violations,
                "warnings": result.warnings,
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/calibrations")
    async def get_calibrations():
        """
        Get available calibration multipliers.
        """
        return {
            "demographics": list(DEMOGRAPHIC_MULTIPLIERS.keys()),
            "executive_roles": list(EXECUTIVE_MULTIPLIERS.get("by_role", {}).keys()),
            "executive_regions": list(EXECUTIVE_MULTIPLIERS.get("by_region", {}).keys()),
            "industries_nps": list(NPS_BENCHMARKS["by_industry"].keys()),
        }
    
    @app.get("/calibrations/{category}")
    async def get_calibration_details(category: str):
        """
        Get detailed calibration data for a category.
        """
        if category == "demographics":
            return DEMOGRAPHIC_MULTIPLIERS
        elif category == "executive":
            return EXECUTIVE_MULTIPLIERS
        elif category == "nps":
            return NPS_BENCHMARKS
        else:
            raise HTTPException(status_code=404, detail=f"Category not found: {category}")
    
    @app.get("/check-partisan/{topic}")
    async def check_partisan(topic: str):
        """
        Check if a topic requires partisan segmentation.
        """
        requires = requires_partisan_segmentation(topic)
        return {
            "topic": topic,
            "requires_partisan_segmentation": requires,
            "note": "If True, you MUST segment results by party affiliation" if requires else None
        }
    
    return app


# ═══════════════════════════════════════════════════════════════
# STANDALONE SERVER
# ═══════════════════════════════════════════════════════════════

def run_server(host: str = "0.0.0.0", port: int = 8000):
    """Run the API server."""
    try:
        import uvicorn
    except ImportError:
        print("uvicorn not installed. Run: pip install uvicorn")
        return
    
    app = create_app()
    uvicorn.run(app, host=host, port=port)


if __name__ == "__main__":
    run_server()
