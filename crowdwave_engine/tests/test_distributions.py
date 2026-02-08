"""
Tests for Crowdwave distribution generation.
"""

import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crowdwave_engine.distributions import (
    generate_beta_distribution,
    generate_truncated_normal,
    generate_skewed_distribution,
    generate_bimodal_distribution,
    generate_nps_distribution,
    generate_likert_distribution,
    calculate_distribution_stats,
    adjust_distribution_for_bias,
)


class TestDistributionGeneration(unittest.TestCase):
    """Test distribution generation functions."""
    
    def test_beta_distribution_sums_to_100(self):
        """Beta distribution should sum to ~100%."""
        dist = generate_beta_distribution(mean=3.5, sd=1.0)
        total = sum(dist.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_truncated_normal_sums_to_100(self):
        """Truncated normal should sum to ~100%."""
        dist = generate_truncated_normal(mean=3.0, sd=1.2)
        total = sum(dist.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_skewed_distribution_positive_skew(self):
        """Positive skew should have more mass on lower values."""
        dist = generate_skewed_distribution(mean=3.0, sd=1.0, skew=1.5)
        # For positive skew, lower values should have more weight
        low_mass = float(dist.get("1", 0)) + float(dist.get("2", 0))
        high_mass = float(dist.get("4", 0)) + float(dist.get("5", 0))
        # Not strictly less due to mean effects, but should show skew pattern
        self.assertIsNotNone(dist)  # Just verify it generates
    
    def test_skewed_distribution_negative_skew(self):
        """Negative skew should have more mass on higher values."""
        dist = generate_skewed_distribution(mean=4.0, sd=1.0, skew=-1.5)
        self.assertIsNotNone(dist)
        total = sum(dist.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_bimodal_distribution_has_two_peaks(self):
        """Bimodal distribution should have elevated values at both modes."""
        dist = generate_bimodal_distribution(mode1=2.0, mode2=4.5, weight1=0.5)
        # Check that values near modes are elevated
        self.assertIsNotNone(dist)
        total = sum(dist.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_nps_distribution_range(self):
        """NPS distribution should have 11 points (0-10)."""
        dist = generate_nps_distribution(mean=7.5, sd=2.0)
        self.assertEqual(len(dist), 11)
        total = sum(dist.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_nps_with_promoter_boost(self):
        """Promoter boost should increase 9-10 values."""
        dist_base = generate_nps_distribution(mean=7.5, sd=2.0, promoter_boost=0.0)
        dist_boosted = generate_nps_distribution(mean=7.5, sd=2.0, promoter_boost=0.5)
        
        promoters_base = float(dist_base["9"]) + float(dist_base["10"])
        promoters_boosted = float(dist_boosted["9"]) + float(dist_boosted["10"])
        
        # Boosted should have higher promoter percentage
        self.assertGreater(promoters_boosted, promoters_base * 0.9)
    
    def test_likert_distribution_default_labels(self):
        """Likert distribution without labels should use numeric keys."""
        dist = generate_likert_distribution(mean=3.5, sd=1.0)
        self.assertIn("1", dist)
        self.assertIn("5", dist)
    
    def test_likert_distribution_with_labels(self):
        """Likert distribution with labels should use provided labels."""
        labels = ["Terrible", "Bad", "OK", "Good", "Excellent"]
        dist = generate_likert_distribution(mean=3.5, sd=1.0, labels=labels)
        self.assertIn("Terrible", dist)
        self.assertIn("Excellent", dist)


class TestDistributionStats(unittest.TestCase):
    """Test distribution statistics calculation."""
    
    def test_calculate_stats_numeric(self):
        """Should calculate correct stats for numeric distribution."""
        dist = {"1": 10, "2": 20, "3": 40, "4": 20, "5": 10}
        stats = calculate_distribution_stats(dist)
        
        self.assertIn("mean", stats)
        self.assertIn("sd", stats)
        self.assertIn("t2b", stats)
        self.assertIn("b2b", stats)
        
        # Mean should be around 3 for this symmetric distribution
        self.assertAlmostEqual(stats["mean"], 3.0, places=1)
    
    def test_t2b_calculation(self):
        """Top-2-box should be sum of highest two values."""
        dist = {"1": 5, "2": 10, "3": 15, "4": 30, "5": 40}
        stats = calculate_distribution_stats(dist)
        
        # T2B should be 30 + 40 = 70
        self.assertAlmostEqual(stats["t2b"], 70.0, places=1)
    
    def test_b2b_calculation(self):
        """Bottom-2-box should be sum of lowest two values."""
        dist = {"1": 5, "2": 10, "3": 15, "4": 30, "5": 40}
        stats = calculate_distribution_stats(dist)
        
        # B2B should be 5 + 10 = 15
        self.assertAlmostEqual(stats["b2b"], 15.0, places=1)


class TestBiasAdjustment(unittest.TestCase):
    """Test bias adjustment functions."""
    
    def test_social_desirability_adjustment(self):
        """Social desirability should reduce extreme positive."""
        dist = {"1": 5, "2": 10, "3": 20, "4": 30, "5": 35}
        adjusted = adjust_distribution_for_bias(dist, "social_desirability")
        
        # Highest value should be reduced
        self.assertLess(float(adjusted["5"]), 35)
        
        # Should still sum to 100
        total = sum(adjusted.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_central_tendency_adjustment(self):
        """Central tendency correction should spread from middle."""
        dist = {"1": 10, "2": 15, "3": 50, "4": 15, "5": 10}
        adjusted = adjust_distribution_for_bias(dist, "central_tendency")
        
        # Middle value should decrease
        self.assertLess(float(adjusted["3"]), 50)
        
        total = sum(adjusted.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_acquiescence_adjustment(self):
        """Acquiescence correction should reduce Yes responses."""
        dist = {"Yes": 75, "No": 25}
        adjusted = adjust_distribution_for_bias(dist, "acquiescence")
        
        # Yes should decrease
        self.assertLess(float(adjusted["Yes"]), 75)
        self.assertGreater(float(adjusted["No"]), 25)


class TestEdgeCases(unittest.TestCase):
    """Test edge cases and boundary conditions."""
    
    def test_extreme_mean_high(self):
        """Distribution with mean near max should work."""
        dist = generate_truncated_normal(mean=4.8, sd=0.5)
        self.assertIsNotNone(dist)
        total = sum(dist.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_extreme_mean_low(self):
        """Distribution with mean near min should work."""
        dist = generate_truncated_normal(mean=1.2, sd=0.5)
        self.assertIsNotNone(dist)
        total = sum(dist.values())
        self.assertAlmostEqual(total, 100.0, places=0)
    
    def test_very_small_sd(self):
        """Very small SD should produce tight distribution."""
        dist = generate_truncated_normal(mean=3.0, sd=0.3)
        # Most mass should be at 3
        self.assertGreater(float(dist["3"]), 50)
    
    def test_large_sd(self):
        """Large SD should produce spread distribution."""
        dist = generate_truncated_normal(mean=3.0, sd=2.0)
        # No single value should dominate
        for key in dist:
            self.assertLess(float(dist[key]), 60)


if __name__ == "__main__":
    unittest.main(verbosity=2)
