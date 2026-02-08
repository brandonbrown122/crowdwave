"""
Crowdwave CLI - Command line interface for survey simulation.

Usage:
    python -m crowdwave_engine simulate --audience "US consumers" --question "Satisfied?" --type scale
    python -m crowdwave_engine server --port 8000
    python -m crowdwave_engine batch input.json output.csv
    python -m crowdwave_engine benchmark --industry saas --b2b
"""

import argparse
import json
import sys
from typing import Optional

# Handle Windows encoding
import io
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from .crowdwave import CrowdwaveEngine
from .calibration import get_nps_benchmark, requires_partisan_segmentation, NPS_BENCHMARKS


def cmd_simulate(args):
    """Run a quick simulation."""
    engine = CrowdwaveEngine()
    
    config = {
        "audience": args.audience,
        "geography": args.geography or "USA",
        "topic": args.topic or "",
    }
    
    # Build question
    q = {
        "id": "Q1",
        "text": args.question,
        "type": args.type,
    }
    
    if args.type == "scale":
        q["scale"] = [1, args.scale_max or 5]
    elif args.type == "binary":
        q["options"] = ["Yes", "No"]
    elif args.type == "multiple_choice" and args.options:
        q["options"] = args.options.split(",")
    
    report = engine.simulate(config, [q])
    
    if args.json:
        print(engine.to_json(report))
    else:
        result = report.results[0]
        print(f"\n📊 Simulation Results")
        print(f"{'='*50}")
        print(f"Question: {result.question_text}")
        print(f"Type: {args.type}")
        print(f"Audience: {args.audience}")
        print(f"\nDistribution:")
        for key, value in sorted(result.distribution.items(), key=lambda x: x[0]):
            bar = "█" * int(value / 2)
            print(f"  {key:>3}: {bar} {value:.1f}%")
        
        if result.mean is not None:
            print(f"\nMean: {result.mean:.2f}")
        if result.sd is not None:
            print(f"Std Dev: {result.sd:.2f}")
        print(f"Confidence: {result.confidence*100:.0f}%")
        print(f"Accuracy Zone: {result.accuracy_zone.value}")
        
        if result.biases_detected:
            print(f"\n⚠️  Biases: {', '.join(result.biases_detected)}")
        if result.corrections_applied:
            print(f"✅ Corrections: {', '.join(result.corrections_applied)}")


def cmd_server(args):
    """Run the API server."""
    try:
        from .api import run_server
        print(f"🚀 Starting Crowdwave API server on port {args.port}...")
        run_server(host=args.host or "0.0.0.0", port=args.port or 8000)
    except ImportError as e:
        print(f"Error: {e}")
        print("Install API dependencies: pip install crowdwave-engine[api]")
        sys.exit(1)


def cmd_batch(args):
    """Run batch processing."""
    from .batch import run_batch_from_file
    
    fmt = "json" if args.output.endswith(".json") else "csv"
    
    print(f"📦 Processing batch from {args.input}...")
    summary = run_batch_from_file(args.input, args.output, format=fmt)
    
    print(f"\n✅ Batch complete:")
    print(f"   Total jobs: {summary['total_jobs']}")
    print(f"   Successful: {summary['successful']}")
    print(f"   Failed: {summary['failed']}")
    print(f"   Avg duration: {summary['avg_duration_ms']:.0f}ms")
    print(f"   Output: {args.output}")


def cmd_benchmark(args):
    """Get NPS benchmarks."""
    if args.list:
        print("\n[Chart] Available NPS Benchmarks (Survicate 2025)")
        print("="*60)
        print(f"{'Industry':<30} {'Median':>8} {'B2B':>8} {'B2C':>8}")
        print("-"*60)
        for industry, data in sorted(NPS_BENCHMARKS["by_industry"].items(), 
                                     key=lambda x: x[1].get("median", x[1].get("b2c", 0)), reverse=True):
            name = industry.replace("_", " ").title()
            median = data.get("median", "-")
            b2b = data.get("b2b", "-")
            b2c = data.get("b2c", "-")
            print(f"{name:<30} {str(median):>8} {str(b2b):>8} {str(b2c):>8}")
        print("-"*60)
        print(f"{'Overall Median':<30} {NPS_BENCHMARKS['overall_median']:>8}")
        return
    
    if not args.industry:
        print("Error: --industry required (or use --list)")
        sys.exit(1)
    
    nps = get_nps_benchmark(args.industry, args.b2b)
    print(f"\n📊 NPS Benchmark")
    print(f"   Industry: {args.industry}")
    print(f"   B2B: {'Yes' if args.b2b else 'No'}")
    print(f"   Benchmark NPS: {nps}")


def cmd_partisan(args):
    """Check if topic requires partisan segmentation."""
    requires = requires_partisan_segmentation(args.topic)
    
    print(f"\n🔍 Partisan Segmentation Check")
    print(f"   Topic: {args.topic}")
    print(f"   Requires segmentation: {'YES ⚠️' if requires else 'No'}")
    
    if requires:
        print("\n   ⚠️  This topic requires R/D/I audience splits.")
        print("   Results may differ by 20-40 points across parties.")


def main():
    parser = argparse.ArgumentParser(
        description="Crowdwave Survey Simulation Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Quick simulation
  python -m crowdwave_engine simulate --audience "US consumers" --question "How satisfied are you?" --type scale

  # NPS simulation
  python -m crowdwave_engine simulate -a "Tech workers" -q "Would you recommend?" -t nps --json

  # Start API server
  python -m crowdwave_engine server --port 8000

  # Batch processing
  python -m crowdwave_engine batch surveys.json results.csv

  # Get benchmarks
  python -m crowdwave_engine benchmark --industry saas --b2b
  python -m crowdwave_engine benchmark --list

  # Check partisan requirement
  python -m crowdwave_engine partisan "climate change policy"
"""
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Simulate command
    sim_parser = subparsers.add_parser("simulate", help="Run a simulation")
    sim_parser.add_argument("-a", "--audience", required=True, help="Target audience")
    sim_parser.add_argument("-q", "--question", required=True, help="Question text")
    sim_parser.add_argument("-t", "--type", default="scale", 
                           choices=["scale", "nps", "binary", "multiple_choice"],
                           help="Question type")
    sim_parser.add_argument("-g", "--geography", default="USA", help="Geography")
    sim_parser.add_argument("--topic", help="Survey topic")
    sim_parser.add_argument("--scale-max", type=int, default=5, help="Max scale value")
    sim_parser.add_argument("--options", help="Comma-separated options for multiple_choice")
    sim_parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    # Server command
    srv_parser = subparsers.add_parser("server", help="Start API server")
    srv_parser.add_argument("-p", "--port", type=int, default=8000, help="Port")
    srv_parser.add_argument("--host", default="0.0.0.0", help="Host")
    
    # Batch command
    batch_parser = subparsers.add_parser("batch", help="Run batch processing")
    batch_parser.add_argument("input", help="Input JSON file")
    batch_parser.add_argument("output", help="Output file (csv or json)")
    
    # Benchmark command
    bench_parser = subparsers.add_parser("benchmark", help="Get NPS benchmarks")
    bench_parser.add_argument("-i", "--industry", help="Industry name")
    bench_parser.add_argument("--b2b", action="store_true", help="B2B benchmark")
    bench_parser.add_argument("--list", action="store_true", help="List all benchmarks")
    
    # Partisan command
    part_parser = subparsers.add_parser("partisan", help="Check partisan segmentation")
    part_parser.add_argument("topic", help="Topic to check")
    
    args = parser.parse_args()
    
    if args.command == "simulate":
        cmd_simulate(args)
    elif args.command == "server":
        cmd_server(args)
    elif args.command == "batch":
        cmd_batch(args)
    elif args.command == "benchmark":
        cmd_benchmark(args)
    elif args.command == "partisan":
        cmd_partisan(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
