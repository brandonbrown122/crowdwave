"""
Tests for Crowdwave evaluation framework.
"""

import unittest
import sys
from pathlib import Path
import tempfile
import json

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crowdwave_engine.evaluation import (
    EvaluationTracker,
    PredictionRecord,
    CalibrationMetrics,
    calculate_mae,
    calculate_mape,
    calculate_rmse,
    calculate_calibration_score,
)


class TestEvaluationTracker(unittest.TestCase):
    """Test the evaluation tracker."""
    
    def setUp(self):
        self.tracker = EvaluationTracker()
    
    def test_record_prediction(self):
        """Should record predictions correctly."""
        record = self.tracker.record_prediction(
            prediction_id="test_1",
            question_type="scale",
            predicted_mean=3.5,
            predicted_distribution={"1": 10, "2": 15, "3": 25, "4": 30, "5": 20},
            accuracy_zone="MEDIUM"
        )
        
        self.assertEqual(record.prediction_id, "test_1")
        self.assertEqual(record.predicted_mean, 3.5)
        self.assertFalse(record.validated)
    
    def test_validate_prediction(self):
        """Should validate predictions and calculate MAE."""
        self.tracker.record_prediction(
            prediction_id="test_1",
            question_type="scale",
            predicted_mean=3.5,
            predicted_distribution={"1": 10, "2": 15, "3": 25, "4": 30, "5": 20}
        )
        
        record = self.tracker.validate_prediction(
            prediction_id="test_1",
            actual_mean=3.8,
            actual_distribution={"1": 8, "2": 12, "3": 22, "4": 35, "5": 23}
        )
        
        self.assertTrue(record.validated)
        self.assertAlmostEqual(record.mae, 0.3, places=2)
        self.assertIsNotNone(record.brier_score)
    
    def test_get_metrics(self):
        """Should calculate aggregate metrics."""
        # Add some predictions
        for i in range(5):
            self.tracker.record_prediction(
                prediction_id=f"test_{i}",
                question_type="scale",
                predicted_mean=3.0 + i * 0.2,
                predicted_distribution={"1": 10, "2": 20, "3": 40, "4": 20, "5": 10},
                accuracy_zone="MEDIUM"
            )
            self.tracker.validate_prediction(
                prediction_id=f"test_{i}",
                actual_mean=3.0 + i * 0.25
            )
        
        metrics = self.tracker.get_metrics()
        
        self.assertEqual(metrics.total_predictions, 5)
        self.assertEqual(metrics.validated_predictions, 5)
        self.assertGreater(metrics.mean_mae, 0)
    
    def test_generate_report(self):
        """Should generate a readable report."""
        self.tracker.record_prediction(
            prediction_id="test_1",
            question_type="nps",
            predicted_mean=7.5,
            predicted_distribution={str(i): 10 for i in range(11)}
        )
        
        self.tracker.validate_prediction(
            prediction_id="test_1",
            actual_mean=7.8
        )
        
        report = self.tracker.generate_report()
        
        self.assertIn("CROWDWAVE ACCURACY REPORT", report)
        self.assertIn("Mean Absolute Error", report)
    
    def test_save_and_load(self):
        """Should save and load records."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            path = f.name
        
        try:
            # Record some predictions
            self.tracker.record_prediction(
                prediction_id="test_save",
                question_type="scale",
                predicted_mean=3.5,
                predicted_distribution={"1": 20, "2": 20, "3": 20, "4": 20, "5": 20}
            )
            
            self.tracker.save(path)
            
            # Load in new tracker
            new_tracker = EvaluationTracker()
            new_tracker.load(path)
            
            self.assertEqual(len(new_tracker.records), 1)
            self.assertEqual(new_tracker.records[0].prediction_id, "test_save")
        finally:
            import os
            os.unlink(path)


class TestCalculationFunctions(unittest.TestCase):
    """Test standalone calculation functions."""
    
    def test_calculate_mae(self):
        """MAE should be absolute difference."""
        self.assertEqual(calculate_mae(3.5, 4.0), 0.5)
        self.assertEqual(calculate_mae(4.0, 3.5), 0.5)
        self.assertEqual(calculate_mae(3.0, 3.0), 0.0)
    
    def test_calculate_mape(self):
        """MAPE should be percentage error."""
        mape = calculate_mape(90, 100)
        self.assertAlmostEqual(mape, 10.0, places=1)
        
        # Zero actual should handle gracefully
        mape_zero = calculate_mape(10, 0)
        self.assertEqual(mape_zero, float('inf'))
    
    def test_calculate_rmse(self):
        """RMSE should be root of mean squared error."""
        predictions = [3.0, 3.0, 3.0]
        actuals = [4.0, 4.0, 4.0]
        
        rmse = calculate_rmse(predictions, actuals)
        self.assertAlmostEqual(rmse, 1.0, places=2)
    
    def test_calculate_rmse_empty(self):
        """Empty lists should return 0."""
        self.assertEqual(calculate_rmse([], []), 0.0)
    
    def test_calculate_calibration_score(self):
        """Calibration score should detect miscalibration."""
        # Perfect calibration
        predicted = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
        # Mix of outcomes that roughly match probabilities
        actual = [False, False, False, False, True, True, True, True, True]
        
        score = calculate_calibration_score(predicted, actual)
        # Should be relatively low for roughly calibrated predictions
        self.assertLess(score, 0.5)


class TestBrierScore(unittest.TestCase):
    """Test Brier score calculations."""
    
    def test_perfect_prediction(self):
        """Perfect prediction should have Brier score of 0."""
        tracker = EvaluationTracker()
        
        dist = {"1": 10, "2": 20, "3": 40, "4": 20, "5": 10}
        
        tracker.record_prediction(
            prediction_id="perfect",
            question_type="scale",
            predicted_mean=3.0,
            predicted_distribution=dist
        )
        
        record = tracker.validate_prediction(
            prediction_id="perfect",
            actual_distribution=dist  # Same as predicted
        )
        
        self.assertAlmostEqual(record.brier_score, 0.0, places=4)
    
    def test_wrong_prediction(self):
        """Wrong prediction should have higher Brier score."""
        tracker = EvaluationTracker()
        
        tracker.record_prediction(
            prediction_id="wrong",
            question_type="scale",
            predicted_mean=2.0,
            predicted_distribution={"1": 40, "2": 30, "3": 20, "4": 8, "5": 2}
        )
        
        record = tracker.validate_prediction(
            prediction_id="wrong",
            actual_distribution={"1": 5, "2": 10, "3": 20, "4": 30, "5": 35}
        )
        
        # Brier score should be positive (worse)
        self.assertGreater(record.brier_score, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
