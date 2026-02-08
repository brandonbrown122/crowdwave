"""
Crowdwave LLM Integration
Web-search priors and enhanced simulation via Claude/GPT.
"""

import json
import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass


@dataclass
class Prior:
    """A research prior from web search."""
    construct: str
    source: str
    date: str
    finding: str
    sample_size: Optional[int]
    relevance: int  # 1-5
    weight: str  # "high", "medium", "low"


@dataclass 
class PriorSearchResult:
    """Result of searching for priors."""
    priors: List[Prior]
    search_queries: List[str]
    sources_checked: int


# ═══════════════════════════════════════════════════════════════
# PRIOR SEARCH PROMPTS
# ═══════════════════════════════════════════════════════════════

PRIOR_SEARCH_PROMPT = """You are a research analyst finding empirical priors for survey simulation.

TASK: Find real-world benchmark data for the following survey question.

QUESTION: {question_text}
AUDIENCE: {audience}
GEOGRAPHY: {geography}
TOPIC: {topic}

SEARCH STRATEGY:
1. Search for existing survey data on this exact topic
2. Look for polling data with similar demographics
3. Find industry research or academic studies
4. Check for government statistics if relevant

For each source found, extract:
- Source name and date
- Sample size
- Key finding (percentage, mean, distribution)
- How relevant it is to our specific audience (1-5)
- How much weight to give it (high/medium/low)

OUTPUT FORMAT (JSON):
{{
  "priors": [
    {{
      "construct": "name of what's being measured",
      "source": "source name",
      "date": "YYYY-MM or YYYY",
      "finding": "specific finding with numbers",
      "sample_size": 1000,
      "relevance": 4,
      "weight": "high"
    }}
  ],
  "search_queries": ["queries used"],
  "no_prior_found": false
}}

If no relevant priors exist, set no_prior_found: true and explain why.
"""


SIMULATION_WITH_PRIORS_PROMPT = """You are the Crowdwave survey simulation engine.

PRIORS ESTABLISHED:
{priors_json}

SURVEY CONFIG:
- Audience: {audience}
- Geography: {geography}
- Sample size: N={sample_size}
- Topic: {topic}

QUESTION TO SIMULATE:
{question_text}
Type: {question_type}
Options: {options}

CALIBRATION RULES:
{calibration_rules}

BIAS CORRECTIONS TO APPLY:
{bias_corrections}

INSTRUCTIONS:
1. Anchor on the priors above
2. Apply demographic modifiers for this audience
3. Generate 3 independent estimates (conservative, signal-forward, heterogeneity)
4. Reconcile: 40% conservative + 35% signal + 25% heterogeneity
5. Apply bias corrections
6. Validate output (no 0% options, no mean exactly 3.0, etc.)

OUTPUT FORMAT (JSON):
{{
  "distribution": {{"1": 5.2, "2": 12.1, "3": 23.4, "4": 35.8, "5": 23.5}},
  "mean": 3.58,
  "sd": 1.12,
  "confidence": 0.75,
  "rationale": "Brief explanation of key factors",
  "priors_used": ["list of prior sources used"],
  "corrections_applied": ["list of corrections"]
}}
"""


# ═══════════════════════════════════════════════════════════════
# LLM CLIENTS
# ═══════════════════════════════════════════════════════════════

class LLMClient:
    """Base class for LLM clients."""
    
    def complete(self, prompt: str, system: str = None) -> str:
        raise NotImplementedError


class AnthropicClient(LLMClient):
    """Claude client via Anthropic API."""
    
    def __init__(self, api_key: str = None, model: str = "claude-sonnet-4-20250514"):
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")
        self.model = model
        
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
    
    def complete(self, prompt: str, system: str = None) -> str:
        try:
            import anthropic
        except ImportError:
            raise ImportError("anthropic package not installed. Run: pip install anthropic")
        
        client = anthropic.Anthropic(api_key=self.api_key)
        
        messages = [{"role": "user", "content": prompt}]
        
        kwargs = {
            "model": self.model,
            "max_tokens": 4096,
            "messages": messages,
        }
        if system:
            kwargs["system"] = system
        
        response = client.messages.create(**kwargs)
        return response.content[0].text


class OpenAIClient(LLMClient):
    """GPT client via OpenAI API."""
    
    def __init__(self, api_key: str = None, model: str = "gpt-4o"):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        self.model = model
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not set")
    
    def complete(self, prompt: str, system: str = None) -> str:
        try:
            import openai
        except ImportError:
            raise ImportError("openai package not installed. Run: pip install openai")
        
        client = openai.OpenAI(api_key=self.api_key)
        
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=4096,
        )
        return response.choices[0].message.content


def get_llm_client(provider: str = "anthropic", **kwargs) -> LLMClient:
    """Get an LLM client by provider name."""
    if provider == "anthropic":
        return AnthropicClient(**kwargs)
    elif provider == "openai":
        return OpenAIClient(**kwargs)
    else:
        raise ValueError(f"Unknown provider: {provider}")


# ═══════════════════════════════════════════════════════════════
# PRIOR SEARCH
# ═══════════════════════════════════════════════════════════════

class PriorSearcher:
    """Search for empirical priors using LLM + web search."""
    
    def __init__(self, llm_client: LLMClient = None, web_search_fn = None):
        self.llm = llm_client
        self.web_search = web_search_fn  # Optional: function(query) -> results
    
    def search_priors(
        self,
        question_text: str,
        audience: str,
        geography: str = "USA",
        topic: str = ""
    ) -> PriorSearchResult:
        """Search for priors relevant to a survey question."""
        
        if not self.llm:
            # Return empty result if no LLM configured
            return PriorSearchResult(priors=[], search_queries=[], sources_checked=0)
        
        prompt = PRIOR_SEARCH_PROMPT.format(
            question_text=question_text,
            audience=audience,
            geography=geography,
            topic=topic,
        )
        
        system = """You are a research analyst with access to web search. 
Find real empirical data to anchor survey simulations. 
Be specific about sources, dates, and sample sizes.
Output valid JSON only."""
        
        response = self.llm.complete(prompt, system=system)
        
        # Parse JSON response
        try:
            # Handle markdown code blocks
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            
            data = json.loads(response.strip())
            
            priors = []
            for p in data.get("priors", []):
                priors.append(Prior(
                    construct=p.get("construct", ""),
                    source=p.get("source", ""),
                    date=p.get("date", ""),
                    finding=p.get("finding", ""),
                    sample_size=p.get("sample_size"),
                    relevance=p.get("relevance", 3),
                    weight=p.get("weight", "medium"),
                ))
            
            return PriorSearchResult(
                priors=priors,
                search_queries=data.get("search_queries", []),
                sources_checked=len(priors),
            )
            
        except json.JSONDecodeError:
            return PriorSearchResult(priors=[], search_queries=[], sources_checked=0)


# ═══════════════════════════════════════════════════════════════
# ENHANCED ENGINE
# ═══════════════════════════════════════════════════════════════

class EnhancedCrowdwaveEngine:
    """Crowdwave engine with LLM-powered prior search."""
    
    def __init__(
        self,
        llm_provider: str = "anthropic",
        llm_api_key: str = None,
        use_web_search: bool = True,
    ):
        from .crowdwave import CrowdwaveEngine
        from .calibration import (
            DEMOGRAPHIC_MULTIPLIERS,
            CONSTRUCT_CORRECTIONS,
        )
        
        self.base_engine = CrowdwaveEngine()
        self.calibrations = {
            "demographics": DEMOGRAPHIC_MULTIPLIERS,
            "constructs": CONSTRUCT_CORRECTIONS,
        }
        
        # Initialize LLM client
        try:
            self.llm = get_llm_client(llm_provider, api_key=llm_api_key)
            self.prior_searcher = PriorSearcher(llm_client=self.llm)
        except (ValueError, ImportError) as e:
            print(f"LLM not configured: {e}. Falling back to base engine.")
            self.llm = None
            self.prior_searcher = None
    
    def simulate_with_priors(
        self,
        config: Dict[str, Any],
        questions: List[Dict[str, Any]],
        search_priors: bool = True,
    ) -> Dict[str, Any]:
        """
        Run simulation with LLM-powered prior search.
        
        If LLM is not configured, falls back to base engine.
        """
        
        # If no LLM, use base engine
        if not self.llm or not search_priors:
            return self.base_engine.simulate(config, questions)
        
        results = []
        all_priors = []
        
        for question in questions:
            # Search for priors
            prior_result = self.prior_searcher.search_priors(
                question_text=question.get("text", ""),
                audience=config.get("audience", "General population"),
                geography=config.get("geography", "USA"),
                topic=config.get("topic", ""),
            )
            
            all_priors.extend(prior_result.priors)
            
            # Use LLM to simulate with priors
            if prior_result.priors:
                result = self._simulate_question_with_llm(
                    config, question, prior_result.priors
                )
            else:
                # Fall back to base engine for this question
                report = self.base_engine.simulate(config, [question])
                result = report.results[0] if report.results else None
            
            if result:
                results.append(result)
        
        # Build report
        from .crowdwave import SimulationReport, SurveyConfig
        
        return SimulationReport(
            config=SurveyConfig(
                audience=config.get("audience", ""),
                geography=config.get("geography", "USA"),
                sample_size=config.get("sample_size", 500),
            ),
            results=results,
            priors_used=[{"source": p.source, "finding": p.finding} for p in all_priors],
            overall_confidence=sum(r.confidence for r in results) / len(results) if results else 0,
            flags=[],
        )
    
    def _simulate_question_with_llm(
        self,
        config: Dict,
        question: Dict,
        priors: List[Prior],
    ):
        """Use LLM to simulate a question with priors."""
        from .crowdwave import SimulationResult
        from .calibration import AccuracyZone
        from .bias_corrections import detect_biases
        
        # Build priors JSON
        priors_json = json.dumps([
            {
                "source": p.source,
                "finding": p.finding,
                "relevance": p.relevance,
                "weight": p.weight,
            }
            for p in priors
        ], indent=2)
        
        # Get bias corrections
        biases = detect_biases(
            question.get("text", ""),
            config.get("audience", ""),
            question.get("type", "scale"),
        )
        bias_corrections = ", ".join([b.bias_type.value for b in biases]) or "None"
        
        # Build calibration rules
        calibration_rules = """
- Satisfaction scales: mean 3.4-3.6, positive skew
- Concern scales: mean 2.8-3.2, bimodal for polarized topics
- Intent scales: apply 0.30 multiplier for "Very Likely" actual conversion
- Senior digital adoption: multiply by 1.30-1.65
- AI concern (general): multiply by 0.90
- Parent child concern: add 0.6 to mean
- Status quo preference: add 10-15 pts to status quo option
"""
        
        prompt = SIMULATION_WITH_PRIORS_PROMPT.format(
            priors_json=priors_json,
            audience=config.get("audience", "General population"),
            geography=config.get("geography", "USA"),
            sample_size=config.get("sample_size", 500),
            topic=config.get("topic", ""),
            question_text=question.get("text", ""),
            question_type=question.get("type", "scale"),
            options=json.dumps(question.get("options", [])),
            calibration_rules=calibration_rules,
            bias_corrections=bias_corrections,
        )
        
        response = self.llm.complete(prompt)
        
        # Parse response
        try:
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                response = response.split("```")[1].split("```")[0]
            
            data = json.loads(response.strip())
            
            return SimulationResult(
                question_id=question.get("id", "Q"),
                question_text=question.get("text", ""),
                distribution=data.get("distribution", {}),
                mean=data.get("mean"),
                sd=data.get("sd"),
                confidence=min(0.90, data.get("confidence", 0.7)),
                accuracy_zone=AccuracyZone.MEDIUM,
                biases_detected=[b.bias_type.value for b in biases],
                corrections_applied=data.get("corrections_applied", []),
                validation_warnings=[],
                methodology_trace={
                    "priors_used": data.get("priors_used", []),
                    "rationale": data.get("rationale", ""),
                    "llm_enhanced": True,
                },
            )
            
        except (json.JSONDecodeError, KeyError) as e:
            # Fall back to base engine
            report = self.base_engine.simulate(config, [question])
            return report.results[0] if report.results else None


# ═══════════════════════════════════════════════════════════════
# CONVENIENCE FUNCTIONS
# ═══════════════════════════════════════════════════════════════

def create_enhanced_engine(
    provider: str = "anthropic",
    api_key: str = None,
) -> EnhancedCrowdwaveEngine:
    """Create an enhanced engine with LLM support."""
    return EnhancedCrowdwaveEngine(
        llm_provider=provider,
        llm_api_key=api_key,
    )
