"""
Crowdwave Evaluation Framework
Tracks accuracy metrics and calibration performance.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
import json
import math


@dataclass
class PredictionRecord:
    """Record of a single prediction for tracking."""
    prediction_id: str
    timestamp: str
    question_type: str
    predicted_mean: Optional[float]
    predicted_distribution: Dict[str, float]
    actual_mean: Optional[float] = None
    actual_distribution: Optional[Dict[str, float]] = None
    mae: Optional[float] = None
    brier_score: Optional[float] = None
    accuracy_zone: str = "unknown"
    validated: bool = False


@dataclass
class CalibrationMetrics:
    """Aggregate calibration metrics."""
    total_predictions: int = 0
    validated_predictions: int = 0
    mean_mae: float = 0.0
    mean_brier: float = 0.0
    accuracy_by_zone: Dict[str, float] = field(default_factory=dict)
    accuracy_by_type: Dict[str, float] = field(default_factory=dict)


class EvaluationTracker:
    """
    Track prediction accuracy over time.
    
    Implements:
    - Brier score for probability calibration
    - MAE for point estimates
    - Zone-specific accuracy tracking
    """
    
    def __init__(self, storage_path: Optional[str] = None):
        self.records: List[PredictionRecord] = []
        self.storage_path = storage_path
        
    def record_prediction(
        self,
        prediction_id: str,
        question_type: str,
        predicted_mean: Optional[float],
        predicted_distribution: Dict[str, float],
        accuracy_zone: str = "unknown"
    ) -> PredictionRecord:
        """Record a new prediction."""
        record = PredictionRecord(
            prediction_id=prediction_id,
            timestamp=datetime.now().isoformat(),
            question_type=question_type,
            predicted_mean=predicted_mean,
            predicted_distribution=predicted_distribution,
            accuracy_zone=accuracy_zone
        )
        self.records.append(record)
        return record
    
    def validate_prediction(
        self,
        prediction_id: str,
        actual_mean: Optional[float] = None,
        actual_distribution: Optional[Dict[str, float]] = None
    ) -> Optional[PredictionRecord]:
        """
        Validate a prediction against actual results.
        
        Calculates:
        - MAE for means
        - Brier score for distributions
        """
        record = self._find_record(prediction_id)
        if not record:
            return None
            
        record.actual_mean = actual_mean
        record.actual_distribution = actual_distribution
        
        # Calculate MAE
        if record.predicted_mean is not None and actual_mean is not None:
            record.mae = abs(record.predicted_mean - actual_mean)
        
        # Calculate Brier score for distribution
        if actual_distribution:
            record.brier_score = self._calculate_brier(
                record.predicted_distribution,
                actual_distribution
            )
        
        record.validated = True
        return record
    
    def _calculate_brier(
        self,
        predicted: Dict[str, float],
        actual: Dict[str, float]
    ) -> float:
        """
        Calculate Brier score.
        Lower is better (0 = perfect calibration).
        """
        all_keys = set(predicted.keys()) | set(actual.keys())
        
        brier_sum = 0.0
        for key in all_keys:
            p = predicted.get(key, 0.0) / 100.0  # Convert from percentage
            a = actual.get(key, 0.0) / 100.0
            brier_sum += (p - a) ** 2
        
        return brier_sum / len(all_keys) if all_keys else 0.0
    
    def _find_record(self, prediction_id: str) -> Optional[PredictionRecord]:
        """Find a record by ID."""
        for record in self.records:
            if record.prediction_id == prediction_id:
                return record
        return None
    
    def get_metrics(self) -> CalibrationMetrics:
        """Calculate aggregate metrics."""
        metrics = CalibrationMetrics()
        metrics.total_predictions = len(self.records)
        
        validated = [r for r in self.records if r.validated]
        metrics.validated_predictions = len(validated)
        
        if not validated:
            return metrics
        
        # Calculate means
        maes = [r.mae for r in validated if r.mae is not None]
        briers = [r.brier_score for r in validated if r.brier_score is not None]
        
        if maes:
            metrics.mean_mae = sum(maes) / len(maes)
        if briers:
            metrics.mean_brier = sum(briers) / len(briers)
        
        # Accuracy by zone
        zone_records: Dict[str, List[float]] = {}
        for r in validated:
            if r.mae is not None:
                if r.accuracy_zone not in zone_records:
                    zone_records[r.accuracy_zone] = []
                zone_records[r.accuracy_zone].append(r.mae)
        
        for zone, maes in zone_records.items():
            metrics.accuracy_by_zone[zone] = sum(maes) / len(maes)
        
        # Accuracy by type
        type_records: Dict[str, List[float]] = {}
        for r in validated:
            if r.mae is not None:
                if r.question_type not in type_records:
                    type_records[r.question_type] = []
                type_records[r.question_type].append(r.mae)
        
        for qtype, maes in type_records.items():
            metrics.accuracy_by_type[qtype] = sum(maes) / len(maes)
        
        return metrics
    
    def generate_report(self) -> str:
        """Generate a human-readable accuracy report."""
        metrics = self.get_metrics()
        
        lines = [
            "=" * 60,
            "CROWDWAVE ACCURACY REPORT",
            "=" * 60,
            "",
            f"Total predictions: {metrics.total_predictions}",
            f"Validated predictions: {metrics.validated_predictions}",
            "",
        ]
        
        if metrics.validated_predictions > 0:
            lines.extend([
                "AGGREGATE METRICS",
                "-" * 40,
                f"Mean Absolute Error: {metrics.mean_mae:.2f} points",
                f"Mean Brier Score: {metrics.mean_brier:.4f}",
                "",
            ])
            
            if metrics.accuracy_by_zone:
                lines.append("ACCURACY BY ZONE")
                lines.append("-" * 40)
                for zone, mae in sorted(metrics.accuracy_by_zone.items()):
                    lines.append(f"  {zone}: MAE {mae:.2f}")
                lines.append("")
            
            if metrics.accuracy_by_type:
                lines.append("ACCURACY BY QUESTION TYPE")
                lines.append("-" * 40)
                for qtype, mae in sorted(metrics.accuracy_by_type.items()):
                    lines.append(f"  {qtype}: MAE {mae:.2f}")
                lines.append("")
        
        lines.append("=" * 60)
        return "\n".join(lines)
    
    def save(self, path: Optional[str] = None):
        """Save records to JSON."""
        path = path or self.storage_path
        if not path:
            return
        
        data = {
            "records": [
                {
                    "prediction_id": r.prediction_id,
                    "timestamp": r.timestamp,
                    "question_type": r.question_type,
                    "predicted_mean": r.predicted_mean,
                    "predicted_distribution": r.predicted_distribution,
                    "actual_mean": r.actual_mean,
                    "actual_distribution": r.actual_distribution,
                    "mae": r.mae,
                    "brier_score": r.brier_score,
                    "accuracy_zone": r.accuracy_zone,
                    "validated": r.validated,
                }
                for r in self.records
            ],
            "metrics": {
                "total": len(self.records),
                "validated": len([r for r in self.records if r.validated]),
            }
        }
        
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
    
    def load(self, path: Optional[str] = None):
        """Load records from JSON."""
        path = path or self.storage_path
        if not path:
            return
        
        try:
            with open(path, "r") as f:
                data = json.load(f)
            
            self.records = [
                PredictionRecord(**r) for r in data.get("records", [])
            ]
        except FileNotFoundError:
            pass


# Convenience functions
def calculate_mae(predicted: float, actual: float) -> float:
    """Calculate Mean Absolute Error between two values."""
    return abs(predicted - actual)


def calculate_mape(predicted: float, actual: float) -> float:
    """Calculate Mean Absolute Percentage Error."""
    if actual == 0:
        return float('inf') if predicted != 0 else 0.0
    return abs((actual - predicted) / actual) * 100


def calculate_rmse(predictions: List[float], actuals: List[float]) -> float:
    """Calculate Root Mean Square Error."""
    if len(predictions) != len(actuals):
        raise ValueError("Predictions and actuals must have same length")
    
    if not predictions:
        return 0.0
    
    squared_errors = [(p - a) ** 2 for p, a in zip(predictions, actuals)]
    return math.sqrt(sum(squared_errors) / len(squared_errors))


def calculate_calibration_score(
    predicted_probs: List[float],
    actual_outcomes: List[bool]
) -> float:
    """
    Calculate calibration score (expected calibration error).
    
    Groups predictions into bins and compares predicted vs actual.
    """
    if len(predicted_probs) != len(actual_outcomes):
        raise ValueError("Predictions and outcomes must have same length")
    
    if not predicted_probs:
        return 0.0
    
    # Create bins
    n_bins = 10
    bins = [[] for _ in range(n_bins)]
    
    for prob, outcome in zip(predicted_probs, actual_outcomes):
        bin_idx = min(int(prob * n_bins), n_bins - 1)
        bins[bin_idx].append((prob, 1.0 if outcome else 0.0))
    
    # Calculate ECE
    ece = 0.0
    total = len(predicted_probs)
    
    for bin_data in bins:
        if not bin_data:
            continue
        
        avg_pred = sum(p for p, _ in bin_data) / len(bin_data)
        avg_actual = sum(a for _, a in bin_data) / len(bin_data)
        
        ece += (len(bin_data) / total) * abs(avg_pred - avg_actual)
    
    return ece
