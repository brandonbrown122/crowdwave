#!/usr/bin/env python3
"""Test LinkedIn message with Crowdwave simulator."""

import os
import sys

# Fix encoding for Windows
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from crowdwave_engine.crowdwave import CrowdwaveEngine

engine = CrowdwaveEngine()

print('='*60)
print('CROWDWAVE SIMULATED AUDIENCE FEEDBACK')
print('Target: Market Researchers & Insights Professionals')
print('='*60)

# Config for market researchers
config = {
    "topic": "AI-powered market research tool for early-stage hypothesis testing",
    "audience": "Market researchers, insights professionals, product managers",
    "n": 500
}

questions = [
    {
        "id": "q1_compelling",
        "type": "binary",
        "text": "After reading this LinkedIn post about an AI research tool, do you find it compelling?",
        "options": ["Yes, compelling", "No, not compelling"]
    },
    {
        "id": "q2_trust",
        "type": "binary", 
        "text": "Does this message make you trust the author as someone who understands research?",
        "options": ["Yes", "No"]
    },
    {
        "id": "q3_clarity",
        "type": "binary",
        "text": "Is it clear what problem this tool solves?",
        "options": ["Yes, very clear", "No, unclear"]
    },
    {
        "id": "q4_engagement",
        "type": "binary",
        "text": "Would you click to learn more after reading this post?",
        "options": ["Yes", "No"]
    },
    {
        "id": "q5_tone",
        "type": "binary",
        "text": "Is the tone of this message appropriate for a business audience?",
        "options": ["Yes, appropriate", "No, off-putting"]
    },
    {
        "id": "q6_differentiation",
        "type": "binary",
        "text": "Does this message explain why this tool is different from just using ChatGPT?",
        "options": ["Yes", "No"]
    },
    {
        "id": "q7_length",
        "type": "binary",
        "text": "Is this LinkedIn post too long?",
        "options": ["Yes, too long", "No, good length"]
    },
    {
        "id": "q8_cta",
        "type": "binary",
        "text": "Does this post have a clear call to action?",
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
    if qr.validation_warnings:
        for w in qr.validation_warnings:
            print(f"   WARNING: {w}")

print('\n' + '='*60)
print('SEGMENT ANALYSIS')
print('='*60)

# Test with different audience segments
segments = [
    ("Senior Researchers (10+ years, skeptical of AI)", 
     {"topic": "AI research tool evaluation", "audience": "Senior market researchers with 10+ years experience, skeptical of AI replacing human insight, traditional methodologies", "n": 200}),
    ("Junior Researchers (tech-forward)", 
     {"topic": "AI research tool evaluation", "audience": "Junior researchers early in career, comfortable with technology, open to new tools, digital natives", "n": 200}),
    ("Research Managers (budget-focused)", 
     {"topic": "AI research tool evaluation", "audience": "Research managers focused on budget efficiency, ROI, cost reduction, faster turnaround", "n": 200}),
]

segment_question = [{
    "id": "interest",
    "type": "binary",
    "text": "Would you be interested in trying an AI tool for early-stage research hypothesis testing?",
    "options": ["Yes, interested", "No, not interested"]
}]

for segment_name, segment_config in segments:
    result = engine.simulate(segment_config, segment_question)
    print(f"\n[SEGMENT] {segment_name}")
    for opt, pct in result.results[0].distribution.items():
        print(f"   {opt}: {pct:.1f}%")

print('\n' + '='*60)
