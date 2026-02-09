import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from crowdwave_engine.crowdwave import CrowdwaveEngine

engine = CrowdwaveEngine()

# Target audience: Market researchers, insights professionals, product/marketing leaders
# Testing Jeremy's LinkedIn message

print('='*60)
print('CROWDWAVE SIMULATED AUDIENCE FEEDBACK')
print('Target: Market Researchers & Insights Professionals')
print('='*60)

# Question 1: Overall reaction
q1 = 'After reading this LinkedIn post about Crowdwave, do you find it compelling?'
result1 = engine.predict(q1, ['Yes, compelling', 'No, not compelling'], 
                        topic='market research AI tool LinkedIn post')
print(f'\n📊 Q1: {q1}')
for k, v in result1.items():
    print(f'   {k}: {v:.1f}%')

# Question 2: Trust/Credibility
q2 = 'Does this message make you trust the author as someone who understands research?'
result2 = engine.predict(q2, ['Yes', 'No'], 
                        topic='market research credibility founder story')
print(f'\n📊 Q2: {q2}')
for k, v in result2.items():
    print(f'   {k}: {v:.1f}%')

# Question 3: Clear value proposition
q3 = 'Is it clear what problem Crowdwave solves?'
result3 = engine.predict(q3, ['Yes, very clear', 'No, unclear'], 
                        topic='product messaging value proposition clarity')
print(f'\n📊 Q3: {q3}')
for k, v in result3.items():
    print(f'   {k}: {v:.1f}%')

# Question 4: Would engage
q4 = 'Would you click to learn more about Crowdwave after reading this?'
result4 = engine.predict(q4, ['Yes', 'No'], 
                        topic='LinkedIn engagement B2B SaaS interest')
print(f'\n📊 Q4: {q4}')
for k, v in result4.items():
    print(f'   {k}: {v:.1f}%')

# Question 5: Tone
q5 = 'Is the tone of this message appropriate for a business/research audience?'
result5 = engine.predict(q5, ['Yes, appropriate', 'No, off-putting'], 
                        topic='professional communication tone LinkedIn')
print(f'\n📊 Q5: {q5}')
for k, v in result5.items():
    print(f'   {k}: {v:.1f}%')

# Question 6: Differentiates from ChatGPT
q6 = 'Does this message explain why Crowdwave is different from just using ChatGPT?'
result6 = engine.predict(q6, ['Yes', 'No'], 
                        topic='AI product differentiation competitive positioning')
print(f'\n📊 Q6: {q6}')
for k, v in result6.items():
    print(f'   {k}: {v:.1f}%')

# Question 7: Too long?
q7 = 'Is this LinkedIn post too long?'
result7 = engine.predict(q7, ['Yes, too long', 'No, good length'], 
                        topic='LinkedIn post length attention span')
print(f'\n📊 Q7: {q7}')
for k, v in result7.items():
    print(f'   {k}: {v:.1f}%')

# Question 8: Call to action
q8 = 'Does this post have a clear call to action?'
result8 = engine.predict(q8, ['Yes', 'No'], 
                        topic='marketing CTA conversion')
print(f'\n📊 Q8: {q8}')
for k, v in result8.items():
    print(f'   {k}: {v:.1f}%')

print('\n' + '='*60)
print('SEGMENT BREAKDOWNS')
print('='*60)

# Segment: Senior researchers (skeptical of AI)
print('\n👤 SEGMENT: Senior Researchers (10+ years experience, skeptical of AI)')
q_senior = 'As an experienced researcher, would you trust AI-simulated insights?'
result_senior = engine.predict(q_senior, ['Yes', 'No'], 
                              topic='AI skepticism senior professional experience')
for k, v in result_senior.items():
    print(f'   {k}: {v:.1f}%')

# Segment: Junior researchers (open to new tools)
print('\n👤 SEGMENT: Junior Researchers (early career, tech-forward)')
q_junior = 'As someone early in your career, are you open to AI research tools?'
result_junior = engine.predict(q_junior, ['Yes', 'No'], 
                              topic='AI adoption young professional technology')
for k, v in result_junior.items():
    print(f'   {k}: {v:.1f}%')

# Segment: Budget-conscious managers
print('\n👤 SEGMENT: Research Managers (budget-focused)')
q_budget = 'Would a tool that reduces early-stage research costs interest you?'
result_budget = engine.predict(q_budget, ['Yes', 'No'], 
                              topic='cost reduction budget research tools')
for k, v in result_budget.items():
    print(f'   {k}: {v:.1f}%')

print('\n' + '='*60)
