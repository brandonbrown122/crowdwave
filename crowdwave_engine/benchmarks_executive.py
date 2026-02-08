"""
Crowdwave Executive Benchmarks
C-Suite survey calibrations from Conference Board 2025 (N=1,732)
"""

# External Risk Factors - % of executives citing as top concern
EXECUTIVE_RISK_CONCERNS = {
    # Economic factors
    "economic_recession": 0.356,
    "inflation": 0.178,
    "interest_rates": 0.110,
    "tariffs": 0.251,
    "exchange_rates": 0.096,
    
    # Security factors
    "cyberattacks": 0.485,
    "uncertainty": 0.474,
    "armed_conflict_middle_east": 0.150,
    "armed_conflict_europe": 0.142,
    "social_unrest": 0.286,
    "terrorism": 0.114,
    
    # Technology factors
    "ai_impact": 0.347,
    "ai_regulation": 0.274,
    "technology_adoption": 0.240,
    "automation_impact": 0.230,
    
    # Regulatory factors
    "regulation": 0.353,
    "protectionism": 0.325,
    "regulatory_divergence": 0.270,
    "esg_regulations": 0.163,
    "esg_litigation": 0.103,
    
    # Supply chain
    "supply_chain_disruptions": 0.450,
    "energy_shortages": 0.179,
    "semiconductor_shortages": 0.101,
    "tariff_price_increases": 0.352,
    
    # Workforce
    "finding_qualified_workers": 0.355,
    "worker_shortages": 0.192,
    "lack_of_skills": 0.226,
    "higher_compensation_expectations": 0.197,
    "low_employee_engagement": 0.156,
    
    # Political
    "political_uncertainty": 0.353,
    "political_polarization": 0.258,
    "public_policy_shifts": 0.284,
    "erosion_rule_of_law": 0.197,
}

# Profitability improvement strategies - % planning to use
EXECUTIVE_PROFITABILITY_STRATEGIES = {
    "business_model_changes": 0.488,
    "price_increases": 0.284,
    "reduce_headcount": 0.231,
    "reduce_labor_costs": 0.201,
    "reduce_marketing_spend": 0.209,
    "ma_activity": 0.192,
    "divestitures": 0.086,
}

# Trust levels - % expressing trust
EXECUTIVE_TRUST_LEVELS = {
    "trust_international_institutions": 0.098,
    "trust_media": 0.092,
    "trust_government": 0.194,
    "trust_domestic_institutions": 0.130,
}

# Role-specific variations (multipliers vs overall)
ROLE_MULTIPLIERS = {
    "CEO": {
        "cyberattacks": 0.96,  # 46.5% vs 48.5% overall
        "ai_impact": 0.87,     # 30.3% vs 34.7%
        "recession": 1.00,
    },
    "CFO": {
        "cyberattacks": 1.03,  # 50% 
        "recession": 0.75,     # 26.7%
        "inflation": 1.40,     # 25% vs 17.8%
    },
    "CHRO": {
        "finding_workers": 1.05,
        "worker_shortages": 1.05,
        "compensation": 1.51,  # 29.8% vs 19.7%
    },
    "CMO": {
        "consumer_behavior": 1.32,  # 34.5% vs 26.1%
        "ai_impact": 1.17,
    },
}

# Regional variations (vs overall)
REGIONAL_MULTIPLIERS = {
    "north_america": {
        "cyberattacks": 0.96,
        "regulation": 0.95,
        "protectionism": 0.98,
    },
    "europe": {
        "energy_shortages": 1.27,  # Higher concern
        "regulation": 1.06,
        "protectionism": 1.06,
    },
    "asia_pacific": {
        "supply_chain": 1.08,
        "armed_conflict_asia": 1.20,
    },
}

def get_executive_benchmark(topic: str, role: str = None, region: str = None) -> float:
    """
    Get calibrated executive concern level.
    
    Args:
        topic: Risk topic (e.g., "cyberattacks", "ai_impact")
        role: Executive role (CEO, CFO, etc.) for role-specific adjustment
        region: Region for regional adjustment
        
    Returns:
        Calibrated percentage (0-1)
    """
    base = EXECUTIVE_RISK_CONCERNS.get(topic, 0.20)  # Default 20%
    
    if role and role in ROLE_MULTIPLIERS:
        role_mult = ROLE_MULTIPLIERS[role].get(topic, 1.0)
        base *= role_mult
    
    if region and region in REGIONAL_MULTIPLIERS:
        region_mult = REGIONAL_MULTIPLIERS[region].get(topic, 1.0)
        base *= region_mult
    
    return min(base, 0.95)  # Cap at 95%


def detect_executive_context(audience: str, topic: str) -> dict:
    """
    Detect if simulation involves executive/C-suite audience.
    
    Returns dict with:
    - is_executive: bool
    - role: detected role if any
    - topics: matched risk topics
    """
    audience_lower = audience.lower()
    topic_lower = topic.lower()
    
    result = {
        "is_executive": False,
        "role": None,
        "matched_topics": [],
    }
    
    # Detect executive audience
    exec_keywords = ["executive", "c-suite", "c-level", "ceo", "cfo", "cmo", 
                     "chro", "coo", "cto", "board", "director", "vp", 
                     "vice president", "senior leader"]
    
    for kw in exec_keywords:
        if kw in audience_lower:
            result["is_executive"] = True
            break
    
    # Detect specific role
    role_map = {
        "ceo": "CEO",
        "chief executive": "CEO",
        "cfo": "CFO", 
        "chief financial": "CFO",
        "cmo": "CMO",
        "chief marketing": "CMO",
        "chro": "CHRO",
        "chief human": "CHRO",
        "hr leader": "CHRO",
    }
    
    for pattern, role in role_map.items():
        if pattern in audience_lower:
            result["role"] = role
            break
    
    # Match topics
    topic_keywords = {
        "cyber": "cyberattacks",
        "hack": "cyberattacks",
        "security": "cyberattacks",
        "recession": "economic_recession",
        "economy": "economic_recession",
        "ai": "ai_impact",
        "artificial intelligence": "ai_impact",
        "automation": "automation_impact",
        "supply chain": "supply_chain_disruptions",
        "talent": "finding_qualified_workers",
        "hiring": "finding_qualified_workers",
        "workforce": "worker_shortages",
        "inflation": "inflation",
        "tariff": "tariffs",
        "regulation": "regulation",
        "climate": "esg_regulations",
        "esg": "esg_regulations",
    }
    
    for keyword, topic_key in topic_keywords.items():
        if keyword in topic_lower:
            result["matched_topics"].append(topic_key)
    
    return result
