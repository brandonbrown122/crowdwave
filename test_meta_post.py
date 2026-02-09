#!/usr/bin/env python3
"""Test the Crowdwave simulation results post."""

import os
import sys

sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from crowdwave_engine.crowdwave import CrowdwaveEngine

engine = CrowdwaveEngine()

print('='*60)
print('CROWDWAVE TEST: Meta-Post (Simulation Results as Content)')
print('Target: Market Researchers, Product Managers, AI-curious')
print('='*60)

# Config for broader audience seeing this on LinkedIn
config = {
    "topic": "AI-powered market research simulation tool demonstration",
    "audience": "Market researchers, product managers, tech-curious professionals on LinkedIn",
    "n": 500
}

questions = [
    {
        "id": "q1_attention",
        "type": "binary",
        "text": "Does this post grab your attention in the first 2 lines?",
        "options": ["Yes", "No"]
    },
    {
        "id": "q2_credible",
        "type": "binary", 
        "text": "Does showing simulation results make the tool seem credible?",
        "options": ["Yes, credible", "No, skeptical"]
    },
    {
        "id": "q3_understand",
        "type": "binary",
        "text": "Do you understand what Crowdwave does from this post?",
        "options": ["Yes, clear", "No, confused"]
    },
    {
        "id": "q4_want_try",
        "type": "binary",
        "text": "Would you want to try this tool after seeing these results?",
        "options": ["Yes", "No"]
    },
    {
        "id": "q5_too_technical",
        "type": "binary",
        "text": "Is this post too technical for a general LinkedIn audience?",
        "options": ["Yes, too technical", "No, accessible"]
    },
    {
        "id": "q6_trust_numbers",
        "type": "binary",
        "text": "Do you trust the simulation percentages shown?",
        "options": ["Yes", "No"]
    },
    {
        "id": "q7_scroll_past",
        "type": "binary",
        "text": "Would you scroll past this post in your feed?",
        "options": ["Yes, would skip", "No, would read"]
    },
    {
        "id": "q8_share",
        "type": "binary",
        "text": "Would you share or comment on this post?",
        "options": ["Yes", "No"]
    },
]

# Run simulation
report = engine.simulate(config, questions)

# Print results
for i, qr in enumerate(report.results, 1):
    print(f"\n[Q{i}] {qr.question_text}")
    for opt, pct in qr.distribution.items():
        print(f"   {opt}: {pct:.1f}%")

print('\n' + '='*60)
print('SEGMENT ANALYSIS')
print('='*60)

# Test with different audience segments
segments = [
    ("Market Researchers (core target)", 
     {"topic": "AI simulation tool for research", "audience": "Professional market researchers who do surveys, focus groups, message testing", "n": 200}),
    ("Product Managers (secondary)", 
     {"topic": "AI simulation tool for research", "audience": "Product managers who need quick user insights, startup founders", "n": 200}),
    ("General LinkedIn (broad)", 
     {"topic": "AI tool demo on LinkedIn", "audience": "General professional LinkedIn users, casual scrollers", "n": 200}),
]

segment_questions = [
    {
        "id": "interest",
        "type": "binary",
        "text": "Are you interested in learning more about this AI research tool?",
        "options": ["Yes, interested", "No, not interested"]
    },
    {
        "id": "engage",
        "type": "binary",
        "text": "Would you engage with this post (like, comment, share)?",
        "options": ["Yes", "No"]
    }
]

for segment_name, segment_config in segments:
    result = engine.simulate(segment_config, segment_questions)
    print(f"\n[SEGMENT] {segment_name}")
    for qr in result.results:
        print(f"   {qr.question_text[:40]}...")
        for opt, pct in qr.distribution.items():
            print(f"      {opt}: {pct:.1f}%")

print('\n' + '='*60)
print('OVERALL ASSESSMENT')
print('='*60)
