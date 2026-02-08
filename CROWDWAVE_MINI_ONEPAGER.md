---
marp: true
theme: uncover
paginate: false
style: |
  section {
    background: linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%);
    color: #ffffff;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    padding: 40px;
    font-size: 14px;
  }
  h1 {
    color: #4ade80;
    font-size: 1.8em;
    font-weight: 700;
    margin: 0 0 5px 0;
    letter-spacing: -0.02em;
  }
  .tagline {
    font-size: 0.9em;
    color: #94a3b8;
    margin-bottom: 20px;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-top: 15px;
  }
  .metric {
    text-align: center;
    background: rgba(255,255,255,0.05);
    padding: 15px 10px;
    border-radius: 8px;
  }
  .metric-num {
    font-size: 2.2em;
    font-weight: 700;
    color: #4ade80;
    line-height: 1;
  }
  .metric-label {
    font-size: 0.7em;
    color: #94a3b8;
    margin-top: 5px;
  }
  .zones {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 20px;
  }
  .zone {
    padding: 12px;
    border-radius: 6px;
    text-align: center;
  }
  .zone-high { background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; }
  .zone-med { background: rgba(234, 179, 8, 0.2); border: 1px solid #eab308; }
  .zone-low { background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; }
  .zone-title {
    font-weight: 700;
    font-size: 0.85em;
    margin-bottom: 3px;
  }
  .zone-error {
    font-size: 1.2em;
    font-weight: 600;
  }
  .zone-examples {
    font-size: 0.65em;
    color: #94a3b8;
    margin-top: 5px;
  }
  .bottom {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    font-size: 0.75em;
    color: #64748b;
  }
  .features {
    display: flex;
    gap: 20px;
    margin-top: 15px;
    font-size: 0.8em;
  }
  .feature {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .check { color: #4ade80; }
---

# Crowdwave
<div class="tagline">Human-Calibrated AI Survey Simulation</div>

<div class="grid">
  <div class="metric">
    <div class="metric-num">79%</div>
    <div class="metric-label">Error Reduction<br/>vs naive LLM</div>
  </div>
  <div class="metric">
    <div class="metric-num">5M+</div>
    <div class="metric-label">Human Responses<br/>Calibrated</div>
  </div>
  <div class="metric">
    <div class="metric-num">20+</div>
    <div class="metric-label">Validated<br/>Domains</div>
  </div>
</div>

<div class="zones">
  <div class="zone zone-high">
    <div class="zone-title">HIGH ACCURACY</div>
    <div class="zone-error">±2-3 pts</div>
    <div class="zone-examples">Trust • Awareness • Rankings</div>
  </div>
  <div class="zone zone-med">
    <div class="zone-title">MEDIUM</div>
    <div class="zone-error">±4-5 pts</div>
    <div class="zone-examples">Satisfaction • NPS • Concern</div>
  </div>
  <div class="zone zone-low">
    <div class="zone-title">VALIDATE FIRST</div>
    <div class="zone-error">±8-15 pts</div>
    <div class="zone-examples">Intent • Price • Polarized</div>
  </div>
</div>

<div class="features">
  <div class="feature"><span class="check">✓</span> Documented accuracy limits</div>
  <div class="feature"><span class="check">✓</span> 8 bias correction patterns</div>
  <div class="feature"><span class="check">✓</span> Continuous calibration</div>
  <div class="feature"><span class="check">✓</span> No hype—just evidence</div>
</div>

<div class="bottom">
  <span>Calibrated against: Survicate • Gallup • Conference Board • Pew</span>
  <span>crowdwave.ai • February 2026</span>
</div>
