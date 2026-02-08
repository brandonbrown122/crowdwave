"""
Crowdwave Distribution Generation
Statistically rigorous distribution generation for survey simulation.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple
import math
import random


@dataclass
class DistributionParams:
    """Parameters for distribution generation."""
    mean: float
    sd: float
    skew: float = 0.0  # negative = left skew, positive = right skew
    kurtosis: float = 0.0  # excess kurtosis (0 = normal)
    min_val: float = 1.0
    max_val: float = 5.0
    

def generate_beta_distribution(
    mean: float,
    sd: float,
    min_val: float = 1.0,
    max_val: float = 5.0,
    n_points: int = 5
) -> Dict[str, float]:
    """
    Generate a bounded distribution using beta distribution properties.
    
    Beta distribution is ideal for bounded scales because:
    - It's bounded on [0, 1] (can scale to any range)
    - It can model various shapes (uniform, skewed, bimodal)
    - Parameters directly relate to mean and variance
    """
    # Normalize mean to [0, 1] range
    range_size = max_val - min_val
    normalized_mean = (mean - min_val) / range_size
    normalized_sd = sd / range_size
    
    # Clamp to valid range
    normalized_mean = max(0.01, min(0.99, normalized_mean))
    normalized_sd = max(0.01, min(0.4, normalized_sd))
    
    # Calculate beta parameters from mean and variance
    # For beta distribution: mean = a/(a+b), var = ab/((a+b)^2(a+b+1))
    variance = normalized_sd ** 2
    
    # Solve for alpha and beta
    # Using method of moments
    common = (normalized_mean * (1 - normalized_mean) / variance) - 1
    alpha = normalized_mean * common
    beta = (1 - normalized_mean) * common
    
    # Ensure valid parameters
    alpha = max(0.5, alpha)
    beta = max(0.5, beta)
    
    # Generate distribution points
    distribution = {}
    total = 0.0
    
    for i in range(n_points):
        # Map point to [0, 1]
        x = (i + 0.5) / n_points
        
        # Beta PDF (simplified)
        if alpha == 1 and beta == 1:
            pdf = 1.0
        else:
            pdf = (x ** (alpha - 1)) * ((1 - x) ** (beta - 1))
        
        distribution[str(int(min_val + i))] = pdf
        total += pdf
    
    # Normalize to percentages
    for key in distribution:
        distribution[key] = round(distribution[key] / total * 100, 1)
    
    return distribution


def generate_truncated_normal(
    mean: float,
    sd: float,
    min_val: float = 1.0,
    max_val: float = 5.0,
    n_points: int = 5
) -> Dict[str, float]:
    """
    Generate a truncated normal distribution.
    
    More appropriate when:
    - The scale has natural boundaries
    - You want symmetric-ish distributions
    """
    distribution = {}
    total = 0.0
    
    for i in range(n_points):
        point = min_val + i
        # Standard normal PDF, shifted and scaled
        z = (point - mean) / sd
        pdf = math.exp(-0.5 * z * z)
        
        distribution[str(int(point))] = pdf
        total += pdf
    
    # Normalize
    for key in distribution:
        distribution[key] = round(distribution[key] / total * 100, 1)
    
    return distribution


def generate_skewed_distribution(
    mean: float,
    sd: float,
    skew: float,
    min_val: float = 1.0,
    max_val: float = 5.0,
    n_points: int = 5
) -> Dict[str, float]:
    """
    Generate a distribution with specified skewness.
    
    Skew values:
    - skew < 0: Left/negative skew (tail on left, mass on right)
    - skew = 0: Symmetric
    - skew > 0: Right/positive skew (tail on right, mass on left)
    """
    distribution = {}
    total = 0.0
    
    for i in range(n_points):
        point = min_val + i
        
        # Base normal component
        z = (point - mean) / sd
        normal_pdf = math.exp(-0.5 * z * z)
        
        # Skewness adjustment using exponential tilt
        if skew != 0:
            tilt = math.exp(skew * z * 0.5)
            pdf = normal_pdf * tilt
        else:
            pdf = normal_pdf
        
        distribution[str(int(point))] = max(0.001, pdf)
        total += distribution[str(int(point))]
    
    # Normalize
    for key in distribution:
        distribution[key] = round(distribution[key] / total * 100, 1)
    
    return distribution


def generate_bimodal_distribution(
    mode1: float,
    mode2: float,
    weight1: float = 0.5,
    sd: float = 0.8,
    min_val: float = 1.0,
    max_val: float = 5.0,
    n_points: int = 5
) -> Dict[str, float]:
    """
    Generate a bimodal distribution with two peaks.
    
    Useful for polarized topics or segmented audiences.
    """
    distribution = {}
    weight2 = 1.0 - weight1
    
    for i in range(n_points):
        point = min_val + i
        
        # Two Gaussian peaks
        z1 = (point - mode1) / sd
        z2 = (point - mode2) / sd
        
        pdf1 = math.exp(-0.5 * z1 * z1)
        pdf2 = math.exp(-0.5 * z2 * z2)
        
        distribution[str(int(point))] = weight1 * pdf1 + weight2 * pdf2
    
    # Normalize
    total = sum(distribution.values())
    for key in distribution:
        distribution[key] = round(distribution[key] / total * 100, 1)
    
    return distribution


def generate_nps_distribution(
    mean: float,
    sd: float,
    promoter_boost: float = 0.0
) -> Dict[str, float]:
    """
    Generate NPS (0-10) distribution.
    
    NPS has specific properties:
    - Often bimodal (promoters vs detractors)
    - Scores cluster at 7-8 (passives) and 9-10 (promoters)
    - Detractors (0-6) are typically sparse unless major issues
    """
    distribution = {}
    
    # Generate base normal distribution
    for i in range(11):
        z = (i - mean) / sd
        pdf = math.exp(-0.5 * z * z)
        
        # Apply promoter boost to 9-10
        if i >= 9 and promoter_boost > 0:
            pdf *= (1 + promoter_boost)
        
        distribution[str(i)] = max(0.001, pdf)
    
    # Normalize
    total = sum(distribution.values())
    for key in distribution:
        distribution[key] = round(distribution[key] / total * 100, 1)
    
    return distribution


def generate_binary_distribution(
    yes_probability: float
) -> Dict[str, float]:
    """Generate a simple yes/no distribution."""
    return {
        "Yes": round(yes_probability * 100, 1),
        "No": round((1 - yes_probability) * 100, 1)
    }


def generate_likert_distribution(
    mean: float,
    sd: float,
    scale_points: int = 5,
    labels: Optional[List[str]] = None
) -> Dict[str, float]:
    """
    Generate a Likert scale distribution with proper labels.
    
    Default 5-point labels:
    1 = Strongly disagree / Very dissatisfied
    2 = Disagree / Dissatisfied
    3 = Neutral / Neither
    4 = Agree / Satisfied
    5 = Strongly agree / Very satisfied
    """
    # Generate numeric distribution
    dist = generate_truncated_normal(
        mean=mean,
        sd=sd,
        min_val=1,
        max_val=scale_points,
        n_points=scale_points
    )
    
    # Apply labels if provided
    if labels and len(labels) == scale_points:
        labeled_dist = {}
        for i, label in enumerate(labels):
            key = str(i + 1)
            if key in dist:
                labeled_dist[label] = dist[key]
        return labeled_dist
    
    return dist


def adjust_distribution_for_bias(
    distribution: Dict[str, float],
    bias_type: str,
    intensity: float = 1.0
) -> Dict[str, float]:
    """
    Apply bias correction to a distribution.
    
    Bias types:
    - "social_desirability": Reduce extreme negative responses
    - "acquiescence": Reduce agreement bias
    - "central_tendency": Reduce neutral clustering
    - "extreme_response": Reduce extreme response style
    """
    adjusted = distribution.copy()
    
    if bias_type == "social_desirability":
        # Shift mass from positive to more realistic distribution
        # LLMs tend to over-predict positive responses
        keys = sorted(adjusted.keys(), key=lambda x: float(x) if x.replace('.','').isdigit() else 0)
        if len(keys) >= 3:
            # Move some mass from highest to middle
            highest = keys[-1]
            middle = keys[len(keys) // 2]
            shift = adjusted[highest] * 0.1 * intensity
            adjusted[highest] -= shift
            adjusted[middle] += shift
    
    elif bias_type == "acquiescence":
        # Reduce automatic "yes" or agreement responses
        if "Yes" in adjusted:
            shift = adjusted["Yes"] * 0.05 * intensity
            adjusted["Yes"] -= shift
            adjusted["No"] = adjusted.get("No", 0) + shift
    
    elif bias_type == "central_tendency":
        # Spread mass from middle to extremes
        keys = sorted(adjusted.keys(), key=lambda x: float(x) if x.replace('.','').isdigit() else 0)
        if len(keys) >= 3:
            middle = keys[len(keys) // 2]
            shift = adjusted[middle] * 0.15 * intensity
            adjusted[middle] -= shift
            adjusted[keys[0]] += shift / 2
            adjusted[keys[-1]] += shift / 2
    
    elif bias_type == "extreme_response":
        # Reduce extreme responses
        keys = sorted(adjusted.keys(), key=lambda x: float(x) if x.replace('.','').isdigit() else 0)
        if len(keys) >= 3:
            lowest = keys[0]
            highest = keys[-1]
            middle = keys[len(keys) // 2]
            
            shift_low = adjusted[lowest] * 0.1 * intensity
            shift_high = adjusted[highest] * 0.1 * intensity
            
            adjusted[lowest] -= shift_low
            adjusted[highest] -= shift_high
            adjusted[middle] += shift_low + shift_high
    
    # Normalize to ensure percentages sum to 100
    total = sum(adjusted.values())
    for key in adjusted:
        adjusted[key] = round(adjusted[key] / total * 100, 1)
    
    return adjusted


def calculate_distribution_stats(
    distribution: Dict[str, float]
) -> Dict[str, float]:
    """
    Calculate statistics from a distribution.
    
    Returns: mean, sd, skewness, t2b (top-2-box), b2b (bottom-2-box)
    """
    # Try to extract numeric keys
    numeric_items = []
    for key, value in distribution.items():
        try:
            num_key = float(key)
            numeric_items.append((num_key, value / 100.0))
        except ValueError:
            continue
    
    if not numeric_items:
        return {"mean": 0, "sd": 0, "skewness": 0, "t2b": 0, "b2b": 0}
    
    # Sort by key
    numeric_items.sort(key=lambda x: x[0])
    
    # Calculate mean
    mean = sum(k * v for k, v in numeric_items)
    
    # Calculate variance and SD
    variance = sum(v * (k - mean) ** 2 for k, v in numeric_items)
    sd = math.sqrt(variance) if variance > 0 else 0
    
    # Calculate skewness
    if sd > 0:
        skewness = sum(v * ((k - mean) / sd) ** 3 for k, v in numeric_items)
    else:
        skewness = 0
    
    # Calculate T2B and B2B
    sorted_keys = [k for k, v in numeric_items]
    if len(sorted_keys) >= 2:
        t2b = sum(v for k, v in numeric_items if k >= sorted_keys[-2])
        b2b = sum(v for k, v in numeric_items if k <= sorted_keys[1])
    else:
        t2b = b2b = 0
    
    return {
        "mean": round(mean, 2),
        "sd": round(sd, 2),
        "skewness": round(skewness, 2),
        "t2b": round(t2b * 100, 1),
        "b2b": round(b2b * 100, 1)
    }
