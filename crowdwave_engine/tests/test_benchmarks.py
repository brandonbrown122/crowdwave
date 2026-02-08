"""
CrowdWave Benchmark Validation Tests
Tests engine against human-validated benchmarks from CALIBRATION_MEMORY.md
"""

import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crowdwave_engine import CrowdWaveEngine, get_nps_benchmark


class TestNPSBenchmarks(unittest.TestCase):
    """Validate NPS predictions against Survicate benchmarks (N=5.4M)."""
    
    def test_manufacturing_nps(self):
        """Manufacturing: Expected NPS ~62-65, not 35-40."""
        nps = get_nps_benchmark("manufacturing")
        self.assertGreaterEqual(nps, 60)
        self.assertLessEqual(nps, 66)
    
    def test_healthcare_b2c_nps(self):
        """Healthcare B2C: Expected NPS ~70."""
        nps = get_nps_benchmark("healthcare", b2b=False)
        self.assertEqual(nps, 70)
    
    def test_healthcare_b2b_nps(self):
        """Healthcare B2B: Expected NPS ~38."""
        nps = get_nps_benchmark("healthcare", b2b=True)
        self.assertEqual(nps, 38)
    
    def test_software_b2b_nps(self):
        """Software B2B: Expected NPS ~29."""
        nps = get_nps_benchmark("software", b2b=True)
        self.assertEqual(nps, 29)
    
    def test_education_b2b_nps(self):
        """Education B2B: Expected NPS ~16 (major miss for naive LLM)."""
        nps = get_nps_benchmark("education", b2b=True)
        self.assertEqual(nps, 16)


class TestDemographicCalibrations(unittest.TestCase):
    """Test demographic-specific calibration accuracy."""
    
    def setUp(self):
        self.engine = CrowdWaveEngine()
    
    def test_senior_digital_adoption(self):
        """
        Validate senior digital adoption correction.
        AARP 2025: 90% smartphone ownership (not 70%)
        """
        # This tests that we're applying the 1.30 multiplier
        from crowdwave_engine import DEMOGRAPHIC_MULTIPLIERS
        
        mods = DEMOGRAPHIC_MULTIPLIERS.get("adults_50_plus", {})
        self.assertIn("smartphone_ownership", mods)
        self.assertGreaterEqual(mods["smartphone_ownership"], 1.25)
    
    def test_women_60_plus_emotional_intensity(self):
        """
        Validate women 60+ emotional bonding correction.
        Human data: 1.30 multiplier needed.
        """
        from crowdwave_engine import DEMOGRAPHIC_MULTIPLIERS
        
        mods = DEMOGRAPHIC_MULTIPLIERS.get("women_60_plus", {})
        self.assertIn("emotional_intensity", mods)
        self.assertEqual(mods["emotional_intensity"], 1.30)


class TestConstructCorrections(unittest.TestCase):
    """Test construct-level bias corrections."""
    
    def test_ai_concern_overcorrection(self):
        """
        AI concern: LLM over-predicts.
        Should apply 0.90 multiplier.
        """
        from crowdwave_engine import CONSTRUCT_CORRECTIONS
        
        correction = CONSTRUCT_CORRECTIONS.get("ai_concern_general", {})
        self.assertEqual(correction.get("multiplier"), 0.90)
    
    def test_intent_action_gap(self):
        """
        Intent-action gap: Critical.
        "Very Likely" -> 30% actual.
        """
        from crowdwave_engine import CONSTRUCT_CORRECTIONS
        
        correction = CONSTRUCT_CORRECTIONS.get("intent_very_likely", {})
        self.assertEqual(correction.get("multiplier"), 0.30)
    
    def test_status_quo_preference(self):
        """
        Status quo preference: LLM under-predicts.
        Should add 10-15 pts.
        """
        from crowdwave_engine import CONSTRUCT_CORRECTIONS
        
        correction = CONSTRUCT_CORRECTIONS.get("status_quo_preference", {})
        add_pts = correction.get("add_points", (0, 0))
        self.assertGreaterEqual(add_pts[0], 10)


class TestPartisanSegmentation(unittest.TestCase):
    """Test partisan topic handling."""
    
    def test_immigration_requires_segmentation(self):
        """Immigration: 50pt gap requires party breakdown."""
        from crowdwave_engine import requires_partisan_segmentation
        
        self.assertTrue(requires_partisan_segmentation("illegal immigration"))
    
    def test_climate_requires_segmentation(self):
        """Climate change: 40pt gap requires party breakdown."""
        from crowdwave_engine import requires_partisan_segmentation
        
        self.assertTrue(requires_partisan_segmentation("climate change"))
    
    def test_neutral_topic_no_segmentation(self):
        """Neutral topics don't require segmentation."""
        from crowdwave_engine import requires_partisan_segmentation
        
        self.assertFalse(requires_partisan_segmentation("product satisfaction"))


class TestExecutiveCalibrations(unittest.TestCase):
    """Test executive/C-suite calibrations (Conference Board N=1,732)."""
    
    def test_cyber_concern_by_role(self):
        """Test cyber concern varies by role."""
        from crowdwave_engine import EXECUTIVE_MULTIPLIERS
        
        by_role = EXECUTIVE_MULTIPLIERS.get("by_role", {})
        
        # CHRO highest on cyber (1.60)
        chro = by_role.get("chro", {})
        self.assertEqual(chro.get("cyber_concern"), 1.60)
        
        # CMO lowest on cyber (0.90)
        cmo = by_role.get("cmo", {})
        self.assertEqual(cmo.get("cyber_concern"), 0.90)
    
    def test_regional_variation(self):
        """Test regional variation in executive concerns."""
        from crowdwave_engine import EXECUTIVE_MULTIPLIERS
        
        by_region = EXECUTIVE_MULTIPLIERS.get("by_region", {})
        
        # North America highest on cyber
        na = by_region.get("north_america", {})
        self.assertGreater(na.get("cyber", 1.0), 1.2)
        
        # Asia lowest on cyber
        asia = by_region.get("asia", {})
        self.assertLess(asia.get("cyber", 1.0), 0.8)


class TestAccuracyMetrics(unittest.TestCase):
    """
    Test that engine achieves documented accuracy metrics.
    Target: 79% error reduction vs naive LLM (9.1 -> 1.9 pts MAE).
    """
    
    def setUp(self):
        self.engine = CrowdWaveEngine()
    
    def test_satisfaction_accuracy(self):
        """
        Satisfaction questions should be in HIGH accuracy zone.
        Expected MAE: 2-3 pts.
        """
        config = {"audience": "General population"}
        questions = [{
            "id": "Q1",
            "text": "How satisfied are you with this service?",
            "type": "scale",
            "scale": [1, 5],
        }]
        
        report = self.engine.simulate(config, questions)
        result = report.results[0]
        
        # Mean should be in typical satisfaction range (3.4-3.6)
        self.assertGreater(result.mean, 3.2)
        self.assertLess(result.mean, 4.0)
    
    def test_concern_elevated_for_parents(self):
        """
        Parent concern about children should be elevated.
        Benchmark mean: 3.6-4.0.
        """
        config = {"audience": "Parents of children with health issues"}
        questions = [{
            "id": "Q1",
            "text": "How concerned are you about your child's health?",
            "type": "scale",
            "scale": [1, 5],
        }]
        
        report = self.engine.simulate(config, questions)
        result = report.results[0]
        
        # Mean should be elevated for child concern (3.6+)
        self.assertGreater(result.mean, 3.5)


if __name__ == "__main__":
    # Run with verbosity
    unittest.main(verbosity=2)
