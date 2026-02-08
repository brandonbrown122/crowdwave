#!/usr/bin/env python3
"""
Crowdwave Engine - Comprehensive Demo

Demonstrates all features of the simulation engine:
1. Basic simulation
2. Bias detection and correction
3. Industry benchmarks
4. Distribution generation
5. Evaluation tracking
6. Export formats
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crowdwave_engine import (
    CrowdwaveEngine,
    EvaluationTracker,
    generate_truncated_normal,
    generate_nps_distribution,
    generate_skewed_distribution,
    generate_bimodal_distribution,
    calculate_distribution_stats,
)
from crowdwave_engine.calibration import (
    NPS_BENCHMARKS,
    requires_partisan_segmentation,
)


def print_header(title: str):
    """Print a formatted header."""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def demo_basic_simulation():
    """Demo 1: Basic survey simulation."""
    print_header("DEMO 1: Basic Survey Simulation")
    
    engine = CrowdwaveEngine()
    
    config = {
        "audience": "US adults 25-54",
        "geography": "USA",
        "topic": "Online shopping satisfaction",
        "sample_size": 500,
    }
    
    questions = [
        {
            "id": "SAT1",
            "text": "How satisfied are you with online shopping overall?",
            "type": "scale",
            "scale": [1, 5],
        },
        {
            "id": "NPS1",
            "text": "How likely are you to recommend online shopping to a friend?",
            "type": "nps",
        },
        {
            "id": "BIN1",
            "text": "Have you made an online purchase in the last 30 days?",
            "type": "binary",
            "options": ["Yes", "No"],
        },
    ]
    
    report = engine.simulate(config, questions)
    
    print(f"\nAudience: {config['audience']}")
    print(f"Topic: {config['topic']}")
    print()
    
    for result in report.results:
        print(f"[*] {result.question_id}: {result.question_text[:50]}...")
        if result.mean:
            print(f"    Mean: {result.mean:.2f}")
        print(f"    Distribution: {result.distribution}")
        print(f"    Accuracy Zone: {result.accuracy_zone}")
        if result.validation_warnings:
            print(f"    [!] {result.validation_warnings[0]}")
        print()


def demo_bias_detection():
    """Demo 2: Bias detection and correction."""
    print_header("DEMO 2: Bias Detection & Correction")
    
    engine = CrowdwaveEngine()
    
    # Scenario 1: Parent concern about child safety
    print("\n[*] Scenario 1: Parents worried about child safety online")
    
    config1 = {
        "audience": "Parents of children 8-14",
        "geography": "USA",
        "topic": "Child online safety concerns",
    }
    
    questions1 = [{
        "id": "CONCERN1",
        "text": "How concerned are you about your child's online safety?",
        "type": "scale",
        "scale": [1, 5],
    }]
    
    report1 = engine.simulate(config1, questions1)
    r1 = report1.results[0]
    
    print(f"   Mean: {r1.mean:.2f}")
    print(f"   Biases detected: {r1.biases_detected or 'None'}")
    print(f"   Corrections applied: {r1.corrections_applied or 'None'}")
    
    # Scenario 2: Senior technology adoption
    print("\n[*] Scenario 2: Seniors and smartphone adoption")
    
    config2 = {
        "audience": "Adults 65+",
        "geography": "USA",
        "topic": "Smartphone usage",
    }
    
    questions2 = [{
        "id": "ADOPT1",
        "text": "How comfortable are you using a smartphone?",
        "type": "scale",
        "scale": [1, 5],
    }]
    
    report2 = engine.simulate(config2, questions2)
    r2 = report2.results[0]
    
    print(f"   Mean: {r2.mean:.2f}")
    print(f"   Biases detected: {r2.biases_detected or 'None'}")
    print(f"   Corrections applied: {r2.corrections_applied or 'None'}")


def demo_industry_benchmarks():
    """Demo 3: Industry NPS benchmarks."""
    print_header("DEMO 3: Industry NPS Benchmarks")
    
    print("\nAvailable NPS Benchmarks (from 5.4M responses):")
    print("-" * 50)
    
    for industry, nps in sorted(NPS_BENCHMARKS.items()):
        if isinstance(nps, (int, float)):
            print(f"   {industry:30} NPS: {nps:+.0f}")
    
    # Demonstrate partisan segmentation
    print("\n\n[*] Partisan Segmentation Detection:")
    
    topics = [
        "climate change policy",
        "immigration reform",
        "customer satisfaction with banking",
        "healthcare costs",
        "gun control",
    ]
    
    for topic in topics:
        needs_seg = requires_partisan_segmentation(topic)
        status = "[!]  REQUIRES SEGMENTATION" if needs_seg else "[OK] OK for aggregate"
        print(f"   {topic:40} {status}")


def demo_distribution_generation():
    """Demo 4: Distribution generation types."""
    print_header("DEMO 4: Distribution Generation")
    
    print("\n[+] Truncated Normal (mean=3.5, sd=1.0):")
    dist1 = generate_truncated_normal(mean=3.5, sd=1.0)
    for k, v in dist1.items():
        bar = "#" * int(v / 3)
        print(f"   {k}: {v:5.1f}% {bar}")
    
    print("\n[+] NPS Distribution (mean=7.5, sd=2.0):")
    dist2 = generate_nps_distribution(mean=7.5, sd=2.0)
    for k, v in dist2.items():
        bar = "#" * int(v / 2)
        print(f"   {k:>2}: {v:5.1f}% {bar}")
    
    print("\n[+] Positive Skew (satisfaction, mean=4.0):")
    dist3 = generate_skewed_distribution(mean=4.0, sd=0.9, skew=-1.0)
    for k, v in dist3.items():
        bar = "#" * int(v / 3)
        print(f"   {k}: {v:5.1f}% {bar}")
    
    print("\n[+] Bimodal (polarized topic):")
    dist4 = generate_bimodal_distribution(mode1=1.5, mode2=4.5, weight1=0.4)
    for k, v in dist4.items():
        bar = "#" * int(v / 3)
        print(f"   {k}: {v:5.1f}% {bar}")


def demo_evaluation_tracking():
    """Demo 5: Evaluation and accuracy tracking."""
    print_header("DEMO 5: Evaluation & Accuracy Tracking")
    
    tracker = EvaluationTracker()
    
    # Simulate some predictions and "actual" results
    predictions = [
        ("P1", "scale", 3.5, {"1": 10, "2": 15, "3": 25, "4": 30, "5": 20}, 3.7),
        ("P2", "scale", 4.0, {"1": 5, "2": 10, "3": 20, "4": 35, "5": 30}, 4.2),
        ("P3", "nps", 7.5, {str(i): 9 for i in range(11)}, 7.8),
        ("P4", "scale", 3.0, {"1": 15, "2": 25, "3": 30, "4": 20, "5": 10}, 3.2),
    ]
    
    print("\n[>] Recording predictions and validations:")
    
    for pid, qtype, pred_mean, pred_dist, actual_mean in predictions:
        # Record
        tracker.record_prediction(
            prediction_id=pid,
            question_type=qtype,
            predicted_mean=pred_mean,
            predicted_distribution=pred_dist,
            accuracy_zone="MEDIUM"
        )
        
        # Validate
        record = tracker.validate_prediction(
            prediction_id=pid,
            actual_mean=actual_mean
        )
        
        print(f"   {pid}: Predicted={pred_mean:.1f}, Actual={actual_mean:.1f}, "
              f"MAE={record.mae:.2f}")
    
    # Show aggregate metrics
    metrics = tracker.get_metrics()
    
    print(f"\n[^] Aggregate Metrics:")
    print(f"   Total predictions: {metrics.total_predictions}")
    print(f"   Validated: {metrics.validated_predictions}")
    print(f"   Mean MAE: {metrics.mean_mae:.3f} points")
    
    # Generate report
    print("\n[=] Full Report:")
    print(tracker.generate_report())


def demo_export_formats():
    """Demo 6: Export formats."""
    print_header("DEMO 6: Export Formats")
    
    engine = CrowdwaveEngine()
    
    config = {
        "audience": "US consumers",
        "geography": "USA",
        "topic": "Brand awareness",
    }
    
    questions = [
        {"id": "Q1", "text": "How aware are you of Brand X?", "type": "scale", "scale": [1, 5]},
        {"id": "Q2", "text": "Would you consider purchasing from Brand X?", "type": "binary", "options": ["Yes", "No"]},
    ]
    
    report = engine.simulate(config, questions)
    
    print("\n[#] JSON Export:")
    json_output = engine.to_json(report)
    print(json_output[:500] + "...\n")
    
    print("[#] CSV Export:")
    csv_output = engine.to_csv(report)
    for line in csv_output.split("\n")[:5]:
        print(f"   {line}")


def demo_distribution_stats():
    """Demo 7: Distribution statistics."""
    print_header("DEMO 7: Distribution Statistics")
    
    distributions = [
        ("Symmetric", {"1": 10, "2": 20, "3": 40, "4": 20, "5": 10}),
        ("Left skew", {"1": 5, "2": 8, "3": 17, "4": 35, "5": 35}),
        ("Right skew", {"1": 35, "2": 30, "3": 20, "4": 10, "5": 5}),
        ("Bimodal", {"1": 30, "2": 10, "3": 10, "4": 15, "5": 35}),
    ]
    
    print("\n   Distribution        Mean   SD   Skew   T2B    B2B")
    print("   " + "-" * 55)
    
    for name, dist in distributions:
        stats = calculate_distribution_stats(dist)
        print(f"   {name:18} {stats['mean']:5.2f} {stats['sd']:5.2f} "
              f"{stats['skewness']:+5.2f} {stats['t2b']:5.1f}% {stats['b2b']:5.1f}%")


def main():
    """Run all demos."""
    print("\n" + "=" * 70)
    print("   CROWDWAVE SIMULATION ENGINE - COMPREHENSIVE DEMO")
    print("=" * 70)
    
    demo_basic_simulation()
    demo_bias_detection()
    demo_industry_benchmarks()
    demo_distribution_generation()
    demo_evaluation_tracking()
    demo_export_formats()
    demo_distribution_stats()
    
    print_header("DEMO COMPLETE")
    print("\n[OK] All features demonstrated successfully!")
    print("\nFor more information, see:")
    print("  - README.md")
    print("  - /docs directory")
    print("  - Tests: pytest tests/ -v")
    print()


if __name__ == "__main__":
    main()
