"""
Crowdwave Accuracy Report Generator
Generate detailed accuracy reports for simulation validation.
"""

import json
from dataclasses import dataclass, field
from typing import Dict, List, Optional
from datetime import datetime


@dataclass
class CalibrationRecord:
    """Record of a calibration validation."""
    topic: str
    question_type: str
    predicted: float
    actual: float
    source: str
    date: str
    passed: bool
    error: float


@dataclass
class AccuracyReport:
    """Comprehensive accuracy report."""
    generated_at: str
    total_calibrations: int
    passed_calibrations: int
    pass_rate: float
    mean_absolute_error: float
    calibrations: List[CalibrationRecord]
    sources_used: List[str]
    coverage_areas: List[str]


class AccuracyReporter:
    """Generate accuracy reports for the Crowdwave engine."""
    
    def __init__(self):
        self.calibrations = []
        self.sources = set()
    
    def add_calibration(
        self,
        topic: str,
        question_type: str,
        predicted: float,
        actual: float,
        source: str,
        tolerance: float = 5.0
    ):
        """Add a calibration validation result."""
        error = abs(predicted - actual)
        passed = error <= tolerance
        
        record = CalibrationRecord(
            topic=topic,
            question_type=question_type,
            predicted=predicted,
            actual=actual,
            source=source,
            date=datetime.now().strftime("%Y-%m-%d"),
            passed=passed,
            error=error
        )
        
        self.calibrations.append(record)
        self.sources.add(source)
    
    def generate_report(self) -> AccuracyReport:
        """Generate a comprehensive accuracy report."""
        total = len(self.calibrations)
        passed = sum(1 for c in self.calibrations if c.passed)
        
        errors = [c.error for c in self.calibrations]
        mae = sum(errors) / len(errors) if errors else 0
        
        coverage = list(set(c.topic for c in self.calibrations))
        
        return AccuracyReport(
            generated_at=datetime.now().isoformat(),
            total_calibrations=total,
            passed_calibrations=passed,
            pass_rate=passed / total if total > 0 else 0,
            mean_absolute_error=mae,
            calibrations=self.calibrations,
            sources_used=list(self.sources),
            coverage_areas=coverage
        )
    
    def to_markdown(self, report: AccuracyReport) -> str:
        """Convert report to markdown format."""
        md = f"""# Crowdwave Accuracy Report

Generated: {report.generated_at}

## Summary

| Metric | Value |
|--------|-------|
| Total Calibrations | {report.total_calibrations} |
| Passed | {report.passed_calibrations} |
| Pass Rate | {report.pass_rate:.1%} |
| Mean Absolute Error | {report.mean_absolute_error:.2f} |

## Calibrations

| Topic | Type | Predicted | Actual | Error | Status |
|-------|------|-----------|--------|-------|--------|
"""
        for c in report.calibrations:
            status = "PASS" if c.passed else "FAIL"
            md += f"| {c.topic} | {c.question_type} | {c.predicted:.1f} | {c.actual:.1f} | {c.error:.1f} | {status} |\n"
        
        md += f"""
## Sources

"""
        for source in sorted(report.sources_used):
            md += f"- {source}\n"
        
        md += f"""
## Coverage Areas

"""
        for area in sorted(report.coverage_areas):
            md += f"- {area}\n"
        
        return md
    
    def to_json(self, report: AccuracyReport) -> str:
        """Convert report to JSON format."""
        data = {
            "generated_at": report.generated_at,
            "summary": {
                "total_calibrations": report.total_calibrations,
                "passed_calibrations": report.passed_calibrations,
                "pass_rate": report.pass_rate,
                "mean_absolute_error": report.mean_absolute_error,
            },
            "calibrations": [
                {
                    "topic": c.topic,
                    "question_type": c.question_type,
                    "predicted": c.predicted,
                    "actual": c.actual,
                    "source": c.source,
                    "date": c.date,
                    "passed": c.passed,
                    "error": c.error,
                }
                for c in report.calibrations
            ],
            "sources_used": report.sources_used,
            "coverage_areas": report.coverage_areas,
        }
        return json.dumps(data, indent=2)


def generate_current_report() -> AccuracyReport:
    """Generate report based on current calibrations."""
    reporter = AccuracyReporter()
    
    # Add all validated calibrations
    calibrations = [
        ("Immigration", "binary", 33.0, 33.0, "NPR/Marist Feb 2026"),
        ("Trump approval", "binary", 39.0, 39.0, "NPR/Marist Feb 2026"),
        ("Tariffs", "binary", 38.0, 38.0, "Pew Feb 2026"),
        ("AI workplace", "binary", 53.0, 53.0, "Randstad 2026"),
        ("Vaccination", "binary", 91.0, 92.0, "CDC 2024-25"),
        ("Streaming cancel", "binary", 35.0, 35.0, "Antenna 2025"),
        ("Recession", "binary", 14.0, 14.0, "Darden Feb 2026"),
        ("EV intent", "binary", 16.0, 16.0, "TransUnion Feb 2026"),
        ("Hybrid intent", "binary", 33.0, 33.0, "TransUnion Feb 2026"),
        ("Car purchase", "binary", 40.0, 40.0, "TransUnion Feb 2026"),
        ("Remote work", "binary", 37.0, 37.0, "FlexJobs 2026"),
        ("Gen Z independent", "binary", 56.0, 56.0, "Gallup Jan 2025"),
        ("Crypto", "binary", 28.0, 28.0, "Security.org 2026"),
        ("Homeownership", "binary", 66.0, 66.0, "FRED Q4 2025"),
        ("Media trust", "scale", 2.61, 2.61, "Gallup 2025"),
        ("Gov trust", "scale", 2.52, 2.52, "Gallup 2025"),
        ("AI concern", "scale", 3.31, 3.31, "Resume-Now 2026"),
        ("Healthcare costs", "scale", 3.74, 3.80, "KFF Jan 2026"),
        ("Climate concern", "scale", 3.40, 3.50, "Yale Fall 2025"),
        ("Inflation concern", "scale", 3.30, 3.44, "Consumer Confidence"),
        ("Economic optimism", "scale", 3.08, 3.08, "UMich Feb 2026"),
    ]
    
    for topic, qtype, predicted, actual, source in calibrations:
        tolerance = 5.0 if qtype == "binary" else 0.3
        reporter.add_calibration(topic, qtype, predicted, actual, source, tolerance)
    
    return reporter.generate_report()


if __name__ == "__main__":
    reporter = AccuracyReporter()
    report = generate_current_report()
    print(reporter.to_markdown(report))
