"""
Comprehensive Calibration Validation - Feb 2026
"""
import sys, io
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from crowdwave_engine import CrowdwaveEngine
engine = CrowdwaveEngine()

print('='*70)
print('COMPREHENSIVE CALIBRATION VALIDATION - FEB 2026')
print('='*70)

tests = [
    # (Topic, Audience, Question, Type, Options/Scale, Expected, Source)
    ('Immigration', 'US adults', 'Do you approve of ICE enforcement?', 'binary', ['Approve', 'Disapprove'], 33, 'NPR/Marist'),
    ('Trump', 'US voters', 'Do you approve of Trump administration?', 'binary', ['Approve', 'Disapprove'], 39, 'NPR/Marist'),
    ('Tariffs', 'US adults', 'Do you approve of tariff increases?', 'binary', ['Approve', 'Disapprove'], 38, 'Pew'),
    ('AI jobs', 'US workers', 'Has your employer started using AI?', 'binary', ['Yes', 'No'], 53, 'Randstad'),
    ('Vaccines', 'US parents', 'Are your children vaccinated (MMR)?', 'binary', ['Yes', 'No'], 91, 'CDC'),
    ('Streaming', 'Subscribers', 'Considering canceling streaming?', 'binary', ['Yes', 'No'], 35, 'Antenna'),
    ('Recession', 'US adults', 'Expect recession in 12 months?', 'binary', ['Yes', 'No'], 14, 'Darden'),
    ('EV', 'Car buyers', 'Would you buy an electric vehicle?', 'binary', ['Yes', 'No'], 16, 'TransUnion'),
    ('Hybrid car', 'Car buyers', 'Would you buy a hybrid?', 'binary', ['Yes', 'No'], 33, 'TransUnion'),
    ('Car purchase', 'US adults', 'Planning to buy a car this year?', 'binary', ['Yes', 'No'], 40, 'TransUnion'),
    ('Remote work', 'Workers', 'Do you prefer remote work?', 'binary', ['Remote', 'In-office'], 37, 'FlexJobs'),
    ('Party ID', 'Gen Z adults', 'Do you identify as independent?', 'binary', ['Independent', 'Party'], 56, 'Gallup'),
    ('Crypto', 'US adults', 'Do you own cryptocurrency?', 'binary', ['Yes', 'No'], 28, 'Security.org'),
    ('Homeowner', 'US adults', 'Do you own your home?', 'binary', ['Yes', 'No'], 66, 'FRED'),
]

print()
print(f"{'Topic':<14} {'Question':<35} {'Result':<12} {'Expected':<12} {'Source':<12} Status")
print('-'*95)

passed = 0
total = 0

for topic, audience, question, qtype, options, expected, source in tests:
    config = {'audience': audience, 'topic': topic}
    q = {'id': 'Q1', 'text': question, 'type': qtype, 'options': options}
    
    report = engine.simulate(config, [q])
    r = report.results[0]
    
    first_opt = options[0]
    actual = r.distribution[first_opt]
    result = f'{actual:.0f}%'
    expected_str = f'{expected}%'
    
    diff = abs(actual - expected)
    status = 'OK' if diff < 5 else 'DIFF'
    if diff < 5:
        passed += 1
    total += 1
    
    print(f'{topic:<14} {question[:33]:<35} {result:<12} {expected_str:<12} {source:<12} {status}')

# Scale questions
print()
print('-'*95)
print('SCALE QUESTIONS')
print('-'*95)

scale_tests = [
    ('Media trust', 'US adults', 'How much do you trust the media?', 2.61, 'Gallup'),
    ('Gov trust', 'US adults', 'How much do you trust federal government?', 2.52, 'Gallup'),
    ('AI concern', 'US workers', 'How concerned about AI affecting your job?', 3.31, 'Resume-Now'),
    ('Healthcare', 'US adults', 'How concerned about healthcare costs?', 3.80, 'KFF'),
    ('Climate', 'US adults', 'How concerned about climate change?', 3.50, 'Yale'),
]

for topic, audience, question, expected_mean, source in scale_tests:
    config = {'audience': audience, 'topic': topic}
    q = {'id': 'Q1', 'text': question, 'type': 'scale', 'scale': [1, 5]}
    
    report = engine.simulate(config, [q])
    r = report.results[0]
    
    diff = abs(r.mean - expected_mean)
    status = 'OK' if diff < 0.3 else 'DIFF'
    if diff < 0.3:
        passed += 1
    total += 1
    
    print(f'{topic:<14} Mean: {r.mean:.2f}/5 (expected ~{expected_mean:.2f}) [{source}] {status}')

print()
print('='*70)
print(f'VALIDATION COMPLETE: {passed}/{total} calibrations within tolerance')
print('='*70)
