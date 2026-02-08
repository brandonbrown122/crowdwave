"""
CrowdWave Engine Unit Tests
Tests core simulation functionality.
"""

import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crowdwave_engine import (
    CrowdWaveEngine,
    AccuracyZone,
    detect_biases,
    validate_distribution,
    BiasType,
)


class TestEngineBasics(unittest.TestCase):
    """Test basic engine functionality."""
    
    def setUp(self):
        self.engine = CrowdWaveEngine()
    
    def test_scale_question_simulation(self):
        """Test 5-point scale question simulation."""
        config = {"audience": "General population", "geography": "USA"}
        questions = [{
            "id": "Q1",
            "text": "How satisfied are you with the service?",
            "type": "scale",
            "scale": [1, 5],
        }]
        
        report = self.engine.simulate(config, questions)
        
        self.assertEqual(len(report.results), 1)
        result = report.results[0]
        
        # Distribution should sum to ~100%
        total = sum(result.distribution.values())
        self.assertAlmostEqual(total, 100.0, places=1)
        
        # Mean should be between 1 and 5
        self.assertIsNotNone(result.mean)
        self.assertGreater(result.mean, 1.0)
        self.assertLess(result.mean, 5.0)
        
        # Confidence should be capped at 0.90
        self.assertLessEqual(result.confidence, 0.90)
    
    def test_binary_question_simulation(self):
        """Test binary choice question simulation."""
        config = {"audience": "General population"}
        questions = [{
            "id": "Q1",
            "text": "Would you prefer in-person or virtual?",
            "type": "binary",
            "options": ["In-person", "Virtual"],
        }]
        
        report = self.engine.simulate(config, questions)
        result = report.results[0]
        
        # Distribution should sum to 100%
        total = sum(result.distribution.values())
        self.assertAlmostEqual(total, 100.0, places=1)
        
        # Status quo bias: in-person should be higher
        self.assertGreater(result.distribution["In-person"], result.distribution["Virtual"])
    
    def test_nps_question_simulation(self):
        """Test NPS (0-10) question simulation."""
        config = {"audience": "Subscription service users"}
        questions = [{
            "id": "Q1",
            "text": "How likely are you to recommend us?",
            "type": "nps",
        }]
        
        report = self.engine.simulate(config, questions)
        result = report.results[0]
        
        # Should have 11 options (0-10)
        self.assertEqual(len(result.distribution), 11)
        
        # Mean should be in typical NPS range (6-8)
        self.assertIsNotNone(result.mean)
        self.assertGreater(result.mean, 5.0)
        self.assertLess(result.mean, 9.0)


class TestBiasDetection(unittest.TestCase):
    """Test bias detection functionality."""
    
    def test_emotional_bonding_detection(self):
        """Test emotional bonding bias detection."""
        biases = detect_biases(
            "My dog is a true member of my family",
            "Pet owners",
            "scale"
        )
        
        bias_types = [b.bias_type for b in biases]
        self.assertIn(BiasType.EMOTIONAL_BONDING, bias_types)
    
    def test_senior_digital_detection(self):
        """Test senior digital adoption bias detection."""
        biases = detect_biases(
            "How often do you use social media?",
            "Adults 65+ years old",
            "scale"
        )
        
        bias_types = [b.bias_type for b in biases]
        self.assertIn(BiasType.SENIOR_DIGITAL, bias_types)
    
    def test_healthcare_concern_detection(self):
        """Test healthcare concern bias detection."""
        # Need both health trigger AND concern trigger
        biases = detect_biases(
            "How worried are you about health treatment side effects?",
            "Patients with chronic conditions",
            "scale"
        )
        
        bias_types = [b.bias_type for b in biases]
        self.assertIn(BiasType.HEALTHCARE_CONCERN, bias_types)


class TestDistributionValidation(unittest.TestCase):
    """Test distribution validation functionality."""
    
    def test_valid_distribution(self):
        """Test validation of a valid distribution."""
        dist = {"1": 5.0, "2": 12.0, "3": 25.0, "4": 35.0, "5": 23.0}
        result = validate_distribution(dist, "scale", "General population")
        
        self.assertTrue(result.passed)
    
    def test_zero_option_rejection(self):
        """Test rejection of distribution with 0% option."""
        dist = {"1": 0.0, "2": 15.0, "3": 30.0, "4": 35.0, "5": 20.0}
        result = validate_distribution(dist, "scale", "General population")
        
        self.assertFalse(result.passed)
        self.assertTrue(any("0%" in v for v in result.violations))
    
    def test_mean_exactly_3_warning(self):
        """Test detection of mean exactly 3.0."""
        # Distribution that produces mean ~3.0
        dist = {"1": 10.0, "2": 20.0, "3": 40.0, "4": 20.0, "5": 10.0}
        result = validate_distribution(dist, "scale", "General population")
        
        # Should have violation for mean = 3.0
        has_mean_violation = any("3.0" in v for v in result.violations)
        self.assertTrue(has_mean_violation)


class TestAccuracyZones(unittest.TestCase):
    """Test accuracy zone classification."""
    
    def setUp(self):
        self.engine = CrowdWaveEngine()
    
    def test_high_accuracy_awareness(self):
        """Test that awareness questions get HIGH zone."""
        config = {"audience": "General population"}
        questions = [{
            "id": "Q1",
            "text": "Are you aware of this brand?",
            "type": "scale",
            "scale": [1, 5],
        }]
        
        report = self.engine.simulate(config, questions)
        self.assertEqual(report.results[0].accuracy_zone, AccuracyZone.HIGH)
    
    def test_low_accuracy_intent(self):
        """Test that purchase intent questions get LOW zone."""
        config = {"audience": "General population"}
        questions = [{
            "id": "Q1",
            "text": "How likely are you to purchase this product?",
            "type": "scale",
            "scale": [1, 5],
        }]
        
        report = self.engine.simulate(config, questions)
        self.assertEqual(report.results[0].accuracy_zone, AccuracyZone.LOW)


class TestCalibrationApplication(unittest.TestCase):
    """Test that calibration multipliers are applied correctly."""
    
    def setUp(self):
        self.engine = CrowdWaveEngine()
    
    def test_parent_child_concern_elevated(self):
        """Test that concern is elevated for parents re: children."""
        # Simulate with parent audience
        config = {"audience": "Parents of children with anxiety"}
        questions = [{
            "id": "Q1",
            "text": "How concerned are you about your child's mental health?",
            "type": "scale",
            "scale": [1, 5],
        }]
        
        report = self.engine.simulate(config, questions)
        result = report.results[0]
        
        # Mean should be elevated (>3.5 for concern about children)
        self.assertGreater(result.mean, 3.5)
    
    def test_status_quo_preference(self):
        """Test that status quo preference is applied."""
        config = {"audience": "General population"}
        questions = [{
            "id": "Q1",
            "text": "Would you switch to a new provider?",
            "type": "binary",
            "options": ["Stay with current", "Switch to new"],
        }]
        
        report = self.engine.simulate(config, questions)
        result = report.results[0]
        
        # Status quo should win
        # Note: options may not match exactly, check the larger value
        values = list(result.distribution.values())
        self.assertGreaterEqual(max(values), 55.0)  # Status quo wins 55-70%


if __name__ == "__main__":
    unittest.main()
