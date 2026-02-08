"""
Crowdwave Engine - Full Demonstration

This script demonstrates all major features of the Crowdwave Simulation Engine.
"""

import json
import sys
import io
from pathlib import Path

# Handle Windows encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add parent to path for development
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from crowdwave_engine import (
    CrowdwaveEngine,
    BatchProcessor,
    get_nps_benchmark,
    requires_partisan_segmentation,
    detect_biases,
    NPS_BENCHMARKS,
)


def print_header(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


def demo_basic_simulation():
    """Demonstrate basic survey simulation."""
    print_header("Basic Survey Simulation")
    
    engine = CrowdwaveEngine()
    
    config = {
        "audience": "US consumers age 25-54",
        "geography": "USA",
        "topic": "Customer satisfaction with e-commerce"
    }
    
    questions = [
        {
            "id": "Q1",
            "text": "Overall, how satisfied are you with your recent purchase?",
            "type": "scale",
            "scale": [1, 5],
            "labels": ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"]
        },
        {
            "id": "Q2",
            "text": "How likely are you to recommend us to a friend or colleague?",
            "type": "nps"
        },
        {
            "id": "Q3",
            "text": "Did you find what you were looking for?",
            "type": "binary",
            "options": ["Yes", "No"]
        }
    ]
    
    print(f"\nAudience: {config['audience']}")
    print(f"Topic: {config['topic']}")
    print(f"Questions: {len(questions)}")
    
    report = engine.simulate(config, questions)
    
    print(f"\nOverall Confidence: {report.overall_confidence*100:.0f}%")
    if report.flags:
        print(f"Flags: {', '.join(report.flags)}")
    
    for result in report.results:
        print(f"\n--- {result.question_id}: {result.question_text[:50]}...")
        print(f"    Distribution:")
        for key, value in sorted(result.distribution.items(), key=lambda x: x[0]):
            bar = "█" * int(value / 3)
            print(f"      {key:>3}: {bar} {value:.1f}%")
        if result.mean:
            print(f"    Mean: {result.mean:.2f} (SD: {result.sd:.2f})")
        print(f"    Confidence: {result.confidence*100:.0f}%")
        print(f"    Accuracy Zone: {result.accuracy_zone.value}")


def demo_nps_benchmarks():
    """Demonstrate NPS benchmark lookups."""
    print_header("NPS Industry Benchmarks")
    
    industries = ["software", "retail", "healthcare", "financial_services", "manufacturing"]
    
    print(f"\n{'Industry':<25} {'B2C NPS':>10} {'B2B NPS':>10}")
    print("-" * 50)
    
    for industry in industries:
        b2c = get_nps_benchmark(industry, b2b=False)
        b2b = get_nps_benchmark(industry, b2b=True)
        print(f"{industry.replace('_', ' ').title():<25} {b2c:>10} {b2b:>10}")
    
    print(f"\nOverall median NPS: {NPS_BENCHMARKS['overall_median']}")
    print("Source: Survicate 2025 (N=5.4M responses)")


def demo_partisan_detection():
    """Demonstrate partisan topic detection."""
    print_header("Partisan Segmentation Detection")
    
    topics = [
        "Customer satisfaction with shipping",
        "Climate change policy opinions",
        "Product quality feedback",
        "Immigration policy views",
        "Restaurant service quality",
        "Gun control legislation",
        "Software usability testing",
    ]
    
    print(f"\n{'Topic':<45} {'Requires Segmentation':>20}")
    print("-" * 65)
    
    for topic in topics:
        requires = requires_partisan_segmentation(topic)
        status = "YES - R/D/I splits needed" if requires else "No"
        print(f"{topic[:44]:<45} {status:>20}")


def demo_bias_detection():
    """Demonstrate bias detection."""
    print_header("Bias Detection")
    
    test_questions = [
        ("Don't you agree this product is excellent?", "scale", "General population"),
        ("How satisfied are you with your health insurance?", "scale", "US adults"),
        ("Would you recommend us?", "nps", "Recent customers"),
        ("Do you think climate change is real and important?", "binary", "US voters"),
    ]
    
    for text, q_type, audience in test_questions:
        biases = detect_biases(text, q_type, audience)
        print(f"\nQuestion: \"{text[:50]}...\"")
        print(f"  Type: {q_type}, Audience: {audience}")
        if biases:
            print(f"  Biases detected: {[b.value for b in biases]}")
        else:
            print(f"  No biases detected")


def demo_batch_processing():
    """Demonstrate batch processing."""
    print_header("Batch Processing")
    
    processor = BatchProcessor(max_workers=2)
    
    # Add multiple jobs
    audiences = [
        ("US millennials", "USA"),
        ("UK Gen Z", "UK"),
        ("German adults", "Germany"),
    ]
    
    for audience, geo in audiences:
        processor.add_job(
            job_id=f"survey_{geo.lower()}",
            config={"audience": audience, "geography": geo, "topic": "Brand awareness"},
            questions=[
                {"id": "Q1", "text": "Have you heard of Brand X?", "type": "binary", "options": ["Yes", "No"]},
                {"id": "Q2", "text": "How would you rate Brand X?", "type": "scale", "scale": [1, 5]}
            ],
            metadata={"region": geo}
        )
    
    print(f"\nProcessing {len(processor.jobs)} jobs in parallel...")
    
    def progress(completed, total):
        print(f"  Progress: {completed}/{total}")
    
    results = processor.run(parallel=True, progress_callback=progress)
    
    summary = processor.summary(results)
    print(f"\nBatch Summary:")
    print(f"  Total jobs: {summary['total_jobs']}")
    print(f"  Successful: {summary['successful']}")
    print(f"  Avg duration: {summary['avg_duration_ms']:.0f}ms")
    print(f"  Accuracy zones: {summary['accuracy_zones']}")


def demo_json_export():
    """Demonstrate JSON export."""
    print_header("JSON Export")
    
    engine = CrowdwaveEngine()
    
    config = {"audience": "Tech workers", "geography": "USA"}
    questions = [{"id": "Q1", "text": "Are you satisfied with your tools?", "type": "nps"}]
    
    report = engine.simulate(config, questions)
    json_output = engine.to_json(report)
    
    # Parse and pretty print first 500 chars
    data = json.loads(json_output)
    pretty = json.dumps(data, indent=2)
    print(f"\n{pretty[:800]}...")


def main():
    """Run all demonstrations."""
    print("\n" + "="*60)
    print("  CROWDWAVE SIMULATION ENGINE - FULL DEMO")
    print("="*60)
    
    demo_basic_simulation()
    demo_nps_benchmarks()
    demo_partisan_detection()
    demo_bias_detection()
    demo_batch_processing()
    demo_json_export()
    
    print_header("Demo Complete")
    print("\nFor more information, see the README.md or API documentation.")


if __name__ == "__main__":
    main()
