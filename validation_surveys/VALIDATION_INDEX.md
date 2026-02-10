# Validation Surveys Index

## Purpose
These surveys are blind predictions awaiting real-world validation.
When Syno runs parallel real surveys, compare results and update calibrations.

## Survey Inventory (15 Surveys)

| # | Survey | Audience | N | Calibration | Expected Error |
|---|--------|----------|---|-------------|----------------|
| 1 | b2b_software_purchase | IT Decision Makers | 500 | uncalibrated | 3-5pt |
| 2 | genz_social_media | Gen Z 18-26 | 500 | uncalibrated | 3-5pt |
| 3 | healthcare_patient | Recent patients | 500 | calibrated | 2-3pt |
| 4 | small_business_outlook | SMB owners | 500 | uncalibrated | 3-5pt |
| 5 | subscription_fatigue | Multi-subscribers | 500 | calibrated | 3-4pt |
| 6 | hispanic_consumer | Hispanic/Latino adults | 500 | uncalibrated | 3-5pt |
| 7 | remote_workers | Full-time remote | 500 | calibrated | 3-4pt |
| 8 | parents_young_children | Parents (kids <10) | 500 | uncalibrated | 3-5pt |
| 9 | luxury_consumers | HH income $200K+ | 500 | uncalibrated | 3-5pt |
| 10 | first_time_homebuyers | First-time buyers | 500 | uncalibrated | 3-5pt |
| 11 | rural_america | Rural US adults | 500 | uncalibrated | 3-5pt |
| 12 | small_business_tech | SMB tech adoption | 500 | uncalibrated | 3-5pt |
| 13 | college_students | College students 18-24 | 500 | uncalibrated | 3-5pt |
| 14 | retirees | Retired adults 65+ | 500 | calibrated | 3-4pt |
| 15 | healthcare_workers | Nurses, doctors, staff | 500 | calibrated | 3-4pt |

**Total Simulated Respondents: 7,500**

## By Calibration Status

### ✅ Calibrated (5 surveys)
- healthcare_patient
- subscription_fatigue  
- remote_workers
- retirees
- healthcare_workers

### ⚠️ Uncalibrated (10 surveys)
- b2b_software_purchase
- genz_social_media
- small_business_outlook
- hispanic_consumer
- parents_young_children
- luxury_consumers
- first_time_homebuyers
- rural_america
- small_business_tech
- college_students

## Validation Process

1. **Run real survey** on same questions with same audience
2. **Compare distributions** - calculate MAE for each question
3. **Update calibrations** if error > 5pt:
   - Add to `calibration.py` SATISFACTION_BENCHMARKS or similar
   - Add topic detection to `crowdwave.py` _get_base_distribution
4. **Mark as validated** in this index

## Priority for Validation

**High Impact (no calibrations exist):**
1. B2B Software - no B2B calibrations
2. Gen Z - thin generational calibrations
3. Hispanic/Latino - no ethnic segmentation
4. Luxury consumers - behavioral patterns may differ
5. Rural America - geographic segmentation needed

**Medium Impact (partial calibrations):**
6. Parents - some family calibrations exist
7. College students - overlaps with Gen Z
8. Small business - partial SMB calibrations
9. First-time homebuyers - no housing calibrations

## Files

Each survey has:
- `{name}_{timestamp}.csv` - Respondent-level data (500 records)
- `{name}_{timestamp}_summary.txt` - Aggregate results

---
*Last Updated: 2026-02-09*
*Total Surveys: 15*
*Total Respondents: 7,500*
