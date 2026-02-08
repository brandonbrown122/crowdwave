"""
CrowdWave CLI
Command-line interface for running simulations.
"""

import argparse
import json
import sys
from pathlib import Path
from .crowdwave import CrowdWaveEngine


def main():
    parser = argparse.ArgumentParser(
        description="CrowdWave Survey Simulation Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  crowdwave simulate --config survey.json --output results.csv
  crowdwave validate --input results.json
  crowdwave benchmark --industry healthcare --b2b
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Commands")
    
    # Simulate command
    sim_parser = subparsers.add_parser("simulate", help="Run a simulation")
    sim_parser.add_argument("--config", "-c", required=True, help="Survey config JSON file")
    sim_parser.add_argument("--output", "-o", help="Output file (CSV or JSON)")
    sim_parser.add_argument("--format", "-f", choices=["csv", "json"], default="json")
    sim_parser.add_argument("--verbose", "-v", action="store_true")
    
    # Benchmark command
    bench_parser = subparsers.add_parser("benchmark", help="Get NPS/satisfaction benchmarks")
    bench_parser.add_argument("--industry", "-i", help="Industry name")
    bench_parser.add_argument("--b2b", action="store_true", help="B2B context")
    bench_parser.add_argument("--demographic", "-d", help="Demographic segment")
    
    # Validate command
    val_parser = subparsers.add_parser("validate", help="Validate simulation results")
    val_parser.add_argument("--input", "-i", required=True, help="Results JSON file")
    
    args = parser.parse_args()
    
    if args.command == "simulate":
        run_simulation(args)
    elif args.command == "benchmark":
        show_benchmarks(args)
    elif args.command == "validate":
        validate_results(args)
    else:
        parser.print_help()


def run_simulation(args):
    """Run a simulation from config file."""
    config_path = Path(args.config)
    if not config_path.exists():
        print(f"Error: Config file not found: {config_path}")
        sys.exit(1)
    
    with open(config_path) as f:
        config = json.load(f)
    
    engine = CrowdWaveEngine(verbose=args.verbose)
    
    survey_config = {
        "audience": config.get("audience", "General population"),
        "geography": config.get("geography", "USA"),
        "sample_size": config.get("sample_size", 500),
        "topic": config.get("topic", ""),
        "screeners": config.get("screeners", []),
        "stimuli": config.get("stimuli", []),
    }
    
    questions = config.get("questions", [])
    
    print(f"🎯 Running simulation: {len(questions)} questions, audience: {survey_config['audience']}")
    
    report = engine.simulate(survey_config, questions)
    
    # Output results
    if args.format == "csv":
        output = engine.to_csv(report)
    else:
        output = engine.to_json(report)
    
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"✅ Results saved to: {args.output}")
    else:
        print(output)
    
    # Print summary
    print(f"\n📊 Summary:")
    print(f"   Questions simulated: {len(report.results)}")
    print(f"   Overall confidence: {report.overall_confidence:.0%}")
    print(f"   Flags: {len(report.flags)}")
    
    if report.flags:
        print("\n⚠️  Flags:")
        for flag in report.flags[:5]:
            print(f"   - {flag}")


def show_benchmarks(args):
    """Show relevant benchmarks."""
    from .calibration import NPS_BENCHMARKS, DEMOGRAPHIC_MULTIPLIERS, get_nps_benchmark
    
    if args.industry:
        nps = get_nps_benchmark(args.industry, args.b2b)
        print(f"📈 NPS Benchmark for {args.industry}{'(B2B)' if args.b2b else ''}: {nps}")
        
        # Show industry details
        industry_key = args.industry.lower().replace(" ", "_")
        for key, data in NPS_BENCHMARKS["by_industry"].items():
            if industry_key in key:
                print(f"   Full data: {data}")
                break
    
    if args.demographic:
        demo_key = args.demographic.lower().replace(" ", "_").replace("-", "_")
        for key, modifiers in DEMOGRAPHIC_MULTIPLIERS.items():
            if demo_key in key or key in demo_key:
                print(f"\n👥 Demographic modifiers for {key}:")
                for mod_key, value in modifiers.items():
                    if mod_key != "source":
                        print(f"   {mod_key}: {value}")
                print(f"   Source: {modifiers.get('source', 'N/A')}")
                break
    
    if not args.industry and not args.demographic:
        print("📊 Available benchmarks:")
        print("\n   Industries:")
        for ind in list(NPS_BENCHMARKS["by_industry"].keys())[:10]:
            print(f"     - {ind}")
        print("\n   Demographics:")
        for demo in list(DEMOGRAPHIC_MULTIPLIERS.keys())[:10]:
            print(f"     - {demo}")


def validate_results(args):
    """Validate simulation results."""
    from .bias_corrections import validate_distribution
    
    with open(args.input) as f:
        results = json.load(f)
    
    print("🔍 Validating results...\n")
    
    passed = 0
    failed = 0
    
    for result in results.get("results", [results]):
        dist = result.get("distribution", {})
        q_type = result.get("type", "scale")
        audience = results.get("config", {}).get("audience", "General")
        
        validation = validate_distribution(dist, q_type, audience)
        
        q_id = result.get("question_id", "Q?")
        if validation.passed:
            print(f"   ✅ {q_id}: Passed")
            passed += 1
        else:
            print(f"   ❌ {q_id}: Failed")
            for v in validation.violations:
                print(f"      - {v}")
            failed += 1
        
        if validation.warnings:
            for w in validation.warnings:
                print(f"      ⚠️ {w}")
    
    print(f"\n📋 Results: {passed} passed, {failed} failed")


if __name__ == "__main__":
    main()
