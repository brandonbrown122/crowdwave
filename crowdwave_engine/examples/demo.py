#!/usr/bin/env python3
"""
Crowdwave Demo
Demonstrates the simulation engine with a sample survey.
"""

import json
import sys
import io
from pathlib import Path

# Handle Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add parent to path for local testing
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crowdwave_engine import CrowdwaveEngine, AccuracyZone


def main():
    print("=" * 60)
    print("Crowdwave SIMULATION ENGINE DEMO")
    print("=" * 60)
    
    # Load demo survey
    demo_path = Path(__file__).parent / "demo_survey.json"
    with open(demo_path) as f:
        survey = json.load(f)
    
    print(f"\n📋 Survey: {survey['topic']}")
    print(f"👥 Audience: {survey['audience']}")
    print(f"🔢 Sample size: N={survey['sample_size']}")
    print(f"📍 Geography: {survey['geography']}")
    
    # Initialize engine
    engine = CrowdwaveEngine(verbose=True)
    
    # Extract config and questions
    config = {
        "audience": survey["audience"],
        "geography": survey["geography"],
        "sample_size": survey["sample_size"],
        "topic": survey["topic"],
        "screeners": survey.get("screeners", []),
        "stimuli": survey.get("stimuli", []),
    }
    questions = survey["questions"]
    
    print(f"\n🎯 Running simulation for {len(questions)} questions...")
    print("-" * 60)
    
    # Run simulation
    report = engine.simulate(config, questions)
    
    # Display results
    print("\n📊 RESULTS")
    print("=" * 60)
    
    for result in report.results:
        print(f"\n{result.question_id}: {result.question_text[:50]}...")
        print(f"   Accuracy Zone: {result.accuracy_zone.value.upper()}")
        print(f"   Confidence: {result.confidence:.0%}")
        
        # Distribution
        if result.mean:
            print(f"   Mean: {result.mean} | SD: {result.sd}")
        
        print("   Distribution:")
        for option, pct in result.distribution.items():
            bar = "█" * int(pct / 3)
            print(f"      {option}: {pct:5.1f}% {bar}")
        
        # Bias corrections
        if result.biases_detected:
            print(f"   ⚡ Biases detected: {', '.join(result.biases_detected)}")
        if result.corrections_applied:
            print(f"   ✅ Corrections: {', '.join(result.corrections_applied)}")
        if result.validation_warnings:
            print(f"   ⚠️  Warnings: {result.validation_warnings[0]}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📈 SIMULATION SUMMARY")
    print("=" * 60)
    print(f"   Overall confidence: {report.overall_confidence:.0%}")
    print(f"   Questions simulated: {len(report.results)}")
    print(f"   Priors used: {len(report.priors_used)}")
    
    if report.flags:
        print(f"\n   ⚠️  Flags ({len(report.flags)}):")
        for flag in report.flags[:3]:
            print(f"      - {flag}")
    
    # Accuracy guidance
    print("\n📋 ACCURACY GUIDANCE")
    high = [r for r in report.results if r.accuracy_zone == AccuracyZone.HIGH]
    medium = [r for r in report.results if r.accuracy_zone == AccuracyZone.MEDIUM]
    low = [r for r in report.results if r.accuracy_zone == AccuracyZone.LOW]
    
    if high:
        print(f"   🟢 HIGH accuracy (±2-3 pts): {len(high)} questions - use for decisions")
    if medium:
        print(f"   🟡 MEDIUM accuracy (±4-5 pts): {len(medium)} questions - use for direction")
    if low:
        print(f"   🔴 LOW accuracy (±8-15 pts): {len(low)} questions - validate first")
    
    # Export
    print("\n💾 Export options:")
    print("   engine.to_csv(report)  → CSV format")
    print("   engine.to_json(report) → JSON format")
    
    print("\n✅ Demo complete!")
    return report


if __name__ == "__main__":
    report = main()
