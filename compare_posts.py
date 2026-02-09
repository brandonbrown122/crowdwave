#!/usr/bin/env python3
"""Compare two LinkedIn posts."""

import os
import sys

sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from crowdwave_engine.crowdwave import CrowdwaveEngine

engine = CrowdwaveEngine()

print('='*60)
print('CROWDWAVE: HEAD-TO-HEAD POST COMPARISON')
print('='*60)

# Same config for fair comparison
config = {
    "topic": "AI-powered market research tool LinkedIn post",
    "audience": "Market researchers, insights professionals, product managers on LinkedIn",
    "n": 500
}

# Core comparison questions
questions = [
    {
        "id": "q1_hook",
        "type": "binary",
        "text": "Does the opening line make you want to read more?",
        "options": ["Yes, hooked", "No, would scroll"]
    },
    {
        "id": "q2_understand",
        "type": "binary", 
        "text": "Do you understand what the product does?",
        "options": ["Yes, clear", "No, confused"]
    },
    {
        "id": "q3_trust",
        "type": "binary",
        "text": "Does the author seem credible and trustworthy?",
        "options": ["Yes", "No"]
    },
    {
        "id": "q4_differentiated",
        "type": "binary",
        "text": "Is this clearly different from just using ChatGPT?",
        "options": ["Yes, differentiated", "No, same thing"]
    },
    {
        "id": "q5_action",
        "type": "binary",
        "text": "Do you know what action to take next?",
        "options": ["Yes, clear CTA", "No, unclear"]
    },
    {
        "id": "q6_share",
        "type": "binary",
        "text": "Would you share this with a colleague?",
        "options": ["Yes", "No"]
    },
]

print('\n' + '='*60)
print('POST A: Origin Story (Founder narrative)')
print('='*60)
print('"I\'ve spent much of my career doing market research..."')
print('- Personal journey, Harvard podcast, tension with AI')
print('- ~280 words, narrative style')

result_a = engine.simulate(config, questions)
scores_a = {}
for qr in result_a.results:
    print(f"\n{qr.question_text[:50]}...")
    for opt, pct in qr.distribution.items():
        print(f"   {opt}: {pct:.1f}%")
        if "Yes" in opt or "hooked" in opt or "clear" in opt or "differentiated" in opt:
            scores_a[qr.question_id] = pct

print('\n' + '='*60)
print('POST B: Simulation Results (Demo/data)')
print('='*60)
print('"Crowdwave Simulated Feedback: LinkedIn Message..."')
print('- Tables, percentages, ChatGPT prompt')
print('- ~200 words, technical format')

result_b = engine.simulate(config, questions)
scores_b = {}
for qr in result_b.results:
    print(f"\n{qr.question_text[:50]}...")
    for opt, pct in qr.distribution.items():
        print(f"   {opt}: {pct:.1f}%")
        if "Yes" in opt or "hooked" in opt or "clear" in opt or "differentiated" in opt:
            scores_b[qr.question_id] = pct

print('\n' + '='*60)
print('COMPARISON SUMMARY')
print('='*60)
