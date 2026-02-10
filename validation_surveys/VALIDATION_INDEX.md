# Validation Surveys Index

## Purpose
These surveys are blind predictions awaiting real-world validation.
When Syno runs parallel real surveys, compare results and update calibrations.

## Survey Status

| Survey | Audience | N | Status | Expected Error |
|--------|----------|---|--------|----------------|
| b2b_software_purchase | IT Decision Makers | 500 | Awaiting validation | 3-5pt |
| genz_social_media | Gen Z 18-26 | 500 | Awaiting validation | 3-5pt |
| healthcare_patient | Recent patients | 500 | Awaiting validation | 2-3pt |
| small_business_outlook | SMB owners | 500 | Awaiting validation | 3-5pt |
| subscription_fatigue | Multi-subscribers | 500 | Awaiting validation | 3-5pt |
| hispanic_consumer | Hispanic/Latino adults | 500 | Awaiting validation | 3-5pt |
| remote_workers | Full-time remote | 500 | Awaiting validation | 3-4pt |
| parents_young_children | Parents (kids <10) | 500 | Awaiting validation | 3-5pt |
| luxury_consumers | HH income $200K+ | 500 | Awaiting validation | 3-5pt |
| first_time_homebuyers | First-time buyers | 500 | Awaiting validation | 3-5pt |

## Validation Process

1. **Run real survey** on same questions with same audience
2. **Compare distributions** - calculate MAE for each question
3. **Update calibrations** if error > 5pt:
   - Add to `calibration.py` SATISFACTION_BENCHMARKS or similar
   - Add topic detection to `crowdwave.py` _get_base_distribution
4. **Mark as validated** in this index

## Calibration Priority

High priority for validation (largest potential accuracy gain):
1. B2B Software - no B2B calibrations currently
2. Gen Z - thin generational calibrations
3. Luxury consumers - behavioral patterns may differ
4. Hispanic/Latino - no ethnic segmentation

Already partially calibrated:
- Healthcare patient (uses health benchmarks)
- Remote workers (added Feb 2026)
- Subscription fatigue (validates streaming benchmarks)

## Files

Each survey has:
- `{name}_{timestamp}.csv` - Respondent-level data (500 records)
- `{name}_{timestamp}_summary.txt` - Aggregate results

---
*Generated: 2026-02-09*
