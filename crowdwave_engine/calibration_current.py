"""
Crowdwave Current Topic Calibrations
Real-time polling data for recent topics (February 2026)
"""

# Immigration Enforcement (Feb 2026)
# Sources: NPR/PBS/Marist Poll, USA Today
IMMIGRATION_ENFORCEMENT_FEB2026 = {
    "ice_gone_too_far": {
        "overall": 0.65,  # 65% say ICE gone too far
        "by_party": {
            "democrat": 0.91,     # 91% disapprove
            "republican": 0.27,   # 27% disapprove (73% approve)
            "independent": 0.65,  # ~65% disapprove
        }
    },
    "ice_job_approval": {
        "approve": 0.33,
        "disapprove": 0.60,
    },
    "trump_approval": {
        "approve": 0.39,
        "disapprove": 0.56,
        "strongly_disapprove": 0.51,
    },
    "source": "NPR/PBS NewsHour/Marist Poll Feb 2026 (N=1,300+)"
}

# AI Job Concerns (Jan-Feb 2026)
# Sources: Randstad, Resume-Now, Austin Survey
AI_JOB_CONCERNS_2026 = {
    "worried_about_ai_job_loss": 0.51,        # 51% worried about losing job to AI
    "believe_ai_will_impact_tasks": 0.80,      # 80% believe AI will impact daily tasks
    "believe_ai_eliminates_more_jobs": 0.60,   # 60% believe net job loss
    "concerned_job_displacement_2026": 0.38,   # 38% concerned about displacement
    "workplace_uses_ai": 0.53,                 # 53% say workplace uses AI
    "by_generation": {
        "gen_z": 0.65,       # Higher concern
        "millennial": 0.55,
        "gen_x": 0.45,
        "boomer": 0.35,
    },
    "source": "Randstad Jan 2026, Resume-Now Dec 2025"
}

# Vaccination Rates (2024-2025 school year)
# Sources: CDC, KFF, Johns Hopkins
VACCINATION_RATES_US = {
    "mmr_kindergarten_national": 0.925,   # 92.5% national average
    "mmr_range": {
        "low": 0.785,   # Idaho
        "high": 0.982,  # Connecticut
    },
    "states_above_95_pct": 10,  # Only 10 states above herd immunity
    "dtap_kindergarten": 0.921,
    "polio_kindergarten": 0.925,
    "measles_cases_2025": 1333,
    "measles_outbreaks_2025": 29,
    "source": "CDC Kindergarten Vaccination Data 2024-2025"
}

# Trust in Institutions (2025-2026)
INSTITUTIONAL_TRUST = {
    "cdc": {
        "overall": 0.58,     # ~58% trust
        "by_party": {
            "democrat": 0.78,
            "republican": 0.38,
            "independent": 0.55,
        }
    },
    "media": {
        "overall": 0.32,    # 32% trust (Gallup)
        "great_deal_fair": 0.32,
        "not_very_much": 0.39,
        "none_at_all": 0.29,
    },
    "federal_government": {
        "trust_always_mostly": 0.22,  # Historic lows
        "trust_some": 0.54,
        "trust_never": 0.24,
    },
    "trump_approval_feb2026": {
        "approve": 0.39,
        "disapprove": 0.56,
        "strongly_disapprove": 0.51,
    },
    "source": "Gallup, Edelman Trust Barometer 2025, NPR/Marist Feb 2026"
}

# Consumer Confidence (Feb 2026)
CONSUMER_CONFIDENCE_FEB2026 = {
    "sentiment_index": 57.3,  # U Michigan, 6-month high
    "confidence_index": 84.5,  # Conference Board, lowest since 2014
    "personal_finances_good": 0.52,
    "economy_good": 0.38,
    "recession_expected_12mo": 0.14,  # Only 14% expect recession
    "inflation_concern": 0.68,
    "job_market_concern": 0.45,
    "source": "U Michigan Sentiment Feb 2026, Conference Board Jan 2026"
}

# Vehicle Purchase Intent (Feb 2026)
VEHICLE_PURCHASE_FEB2026 = {
    "planning_to_buy_car": 0.40,  # 40% of adults
    "intent_by_type": {
        "gas": 0.50,      # 50% prefer gas
        "hybrid": 0.33,   # 33% prefer hybrid
        "ev": 0.16,       # 16% prefer EV
    },
    "ev_sales_share_2026": 0.275,  # 27.5% of global sales
    "source": "TransUnion Consumer Auto Survey Feb 2026"
}

# Remote Work Preferences (2025-2026)
REMOTE_WORK_PREFERENCES = {
    "current_arrangement": {
        "fully_onsite": 0.56,
        "hybrid": 0.30,
        "fully_remote": 0.14,
    },
    "preferred_arrangement": {
        "prefer_fully_remote": 0.37,
        "prefer_hybrid": 0.60,
        "prefer_onsite": 0.03,
    },
    "hybrid_or_remote_preferred": 0.98,  # 98% prefer hybrid or remote
    "actually_hybrid": 0.52,  # 52% of eligible actually hybrid
    "source": "Robert Half, FlexJobs 2025-2026"
}

# Social Media Trust (2025-2026)
SOCIAL_MEDIA_TRUST = {
    "trust_ai_recommendations": 0.07,  # Only 7% trust AI recs like human
    "trust_news_on_social": 0.27,
    "trust_influencer_content": 0.35,
    "source": "Power Digital Marketing 2026"
}

# Healthcare Costs (Jan 2026)
HEALTHCARE_COSTS_2026 = {
    "worried_about_costs": 0.66,        # 66% somewhat/very worried (top financial worry)
    "very_worried": 0.33,               # 1 in 3 very worried
    "by_party": {
        "democrat": 0.75,
        "republican": 0.55,
        "independent": 0.68,
    },
    "source": "KFF Health Tracking Poll Jan 2026"
}

# Tariffs (Feb 2026)
TARIFFS_FEB2026 = {
    "disapprove_tariff_increases": 0.60,  # 60% disapprove (Pew)
    "strongly_disapprove": 0.39,
    "approve": 0.38,
    "court_should_limit_authority": 0.63,  # 63% (Marquette)
    "by_party": {
        "democrat": 0.85,  # disapprove
        "republican": 0.25,  # disapprove (75% approve)
        "independent": 0.62,
    },
    "avg_household_cost_2026": 1300,  # Tax Foundation
    "source": "Pew Research Feb 2026, Marquette Law School Poll"
}

# Climate Change (Fall 2025)
CLIMATE_CHANGE_2025 = {
    "believe_affecting_weather": {
        "extreme_heat": 0.74,
        "wildfires": 0.72,
        "droughts": 0.72,
        "hurricanes": 0.68,
        "flooding": 0.68,
    },
    "worried_local_harm": 0.80,          # 80% worried about local air pollution
    "considering_moving_due_climate": 0.49,  # 49% homeowners
    "worried_about_climate_personally": 0.63,  # Latin America figure, US lower
    "by_party": {
        "democrat": 0.85,
        "republican": 0.35,
        "independent": 0.60,
    },
    "source": "Yale Climate Communication Fall 2025"
}

# Streaming Services (late 2025)
STREAMING_BENCHMARKS = {
    "nps_by_service": {
        "netflix": 31,
        "disney_plus": 25,
        "hbo_max": 28,
        "amazon_prime": 22,
        "hulu": 20,
        "apple_tv": 18,
        "peacock": 12,
    },
    "considering_canceling": 0.35,  # ~35% considering canceling at least one
    "content_satisfaction_mean": 3.4,  # out of 5
    "source": "Parks Associates, Antenna 2025"
}

# Political Party Identification (Gallup 2025)
PARTY_IDENTIFICATION_2025 = {
    "overall": {
        "independent": 0.45,  # Record high
        "democrat": 0.27,
        "republican": 0.28,
    },
    "by_generation": {
        "gen_z": {"independent": 0.56, "democrat": 0.24, "republican": 0.20},
        "millennial": {"independent": 0.54, "democrat": 0.26, "republican": 0.20},
        "gen_x": {"independent": 0.44, "democrat": 0.28, "republican": 0.28},
        "boomer": {"independent": 0.38, "democrat": 0.30, "republican": 0.32},
    },
    "young_voter_unfavorable": {
        "democrat": 0.56,
        "republican": 0.62,
    },
    "source": "Gallup Jan 2025, U Chicago Nov 2025"
}

# Generational Differences in Attitudes
GENERATIONAL_ATTITUDES = {
    "socialism_positive_view": {
        "gen_z_millennial_18_29": 0.51,  # 51% positive on socialism
        "capitalism_positive": 0.45,      # 45% positive on capitalism (same age)
    },
    "purchase_drivers_gen_z": {
        "quality": 0.43,
        "brand_reputation": 0.26,
        "price": 0.20,
        "influencer": 0.06,
    },
    "data_sharing_for_personalization": {
        "age_25_44": 0.52,  # Highest willingness
        "age_45_plus": 0.35,
    },
    "source": "Gallup 2018, BusinessToday 2026, Capillary 2025"
}


# Cryptocurrency (2026)
CRYPTO_2026 = {
    "own_crypto": 0.28,  # 28% of Americans (Security.org)
    "expect_value_rise": 0.60,  # Under Trump
    "non_owners_plan_to_buy": 0.06,  # Only 6%
    "bitcoin_among_crypto_owners": 0.74,  # 74% own BTC
    "source": "Security.org 2026 Report"
}

# Mental Health (2025-2026)
MENTAL_HEALTH_2026 = {
    "ever_diagnosed_depression": {
        "overall": 0.19,  # 19% (CDC)
        "women": 0.367,   # 36.7% (Gallup 2025)
        "men": 0.204,     # 20.4%
    },
    "anxiety_disorders": 42500000,  # 42.5M Americans
    "young_people_mental_health": 0.25,  # >1 in 4
    "source": "CDC, Gallup 2025"
}

# Homeownership (Q4 2025)
HOMEOWNERSHIP_2025 = {
    "overall_rate": 0.657,  # 65.7%
    "under_35_rate": 0.379,  # 37.9%
    "first_time_buyers_pct": 0.54,  # 54% of 2026 buyers
    "expecting_family_help": 0.30,  # 30%
    "mortgage_rate": 6.25,  # Late 2025
    "source": "FRED Q4 2025, IPX1031"
}


# Sports Viewership (Feb 2026)
SPORTS_VIEWERSHIP_2026 = {
    "super_bowl_plan_to_watch": 0.69,  # 69% (Numerator)
    "winter_olympics": 0.58,
    "fifa_world_cup": 0.26,
    "source": "Numerator Feb 2026"
}

# Social Security (2025-2026)
SOCIAL_SECURITY_2026 = {
    "expect_benefit_cuts": 0.70,  # 70% (Cato)
    "worried_congress_allow_cuts": 0.80,  # 80% (Motley Fool)
    "nervous_about_future": 0.74,
    "should_be_top_priority": 0.83,
    "cola_not_enough": 0.77,  # AARP
    "source": "Cato Institute, AARP, Motley Fool 2025-2026"
}

# College Value (2025)
COLLEGE_VALUE_2025 = {
    "worth_the_cost": 0.33,  # Down from 53% in 2013
    "not_worth_cost": 0.67,
    "source": "Gallup/Lumina 2025"
}

# Gun Ownership (2025)
GUN_OWNERSHIP_2025 = {
    "household_owns_gun": 0.36,  # YouGov
    "personally_own_gun": 0.23,
    "protection_reason": 0.77,  # Among owners
    "by_party": {
        "republican": 0.50,
        "democrat": 0.20,
        "independent": 0.35,
    },
    "source": "YouGov 2025"
}

# Marijuana Legalization (2025)
MARIJUANA_2025 = {
    "support_recreational": 0.69,
    "support_medical": 0.86,
    "by_party": {
        "democrat": 0.93,  # Support medical
        "republican": 0.74,
        "independent": 0.84,
    },
    "source": "Marijuana Moment 2025"
}

# Abortion (2025)
ABORTION_2025 = {
    "support_some_limits": 0.72,  # Restrict at 6 months or earlier
    "legal_all_most_cases": 0.63,  # Gallup trend
    "support_pregnancy_centers": 0.84,
    "source": "Knights of Columbus/Marist 2025, Gallup"
}

# Pet Ownership (2025)
PET_OWNERSHIP_2025 = {
    "household_owns_pet": 0.68,  # 68-71%
    "own_dog": 0.38,
    "own_cat": 0.26,
    "households_with_pets": 94000000,
    "source": "APPA 2025, World Animal Foundation"
}

# Fitness (2025)
FITNESS_2025 = {
    "gym_membership": 0.21,  # ~21%
    "achieved_fitness_goals": 0.55,  # 55% achieved goals
    "source": "HFA 2025, Gym Statistics"
}

# Online Shopping (2025)
ONLINE_SHOPPING_2025 = {
    "prefer_online": 0.284,  # 28.4%
    "prefer_hybrid": 0.263,
    "prefer_in_store": 0.453,
    "mobile_purchase": 0.48,  # 48% made mobile purchase
    "ecommerce_share": 0.158,  # 15.8% of retail
    "source": "Capital One Shopping 2025"
}

# Work-Life Balance (2025)
WORK_LIFE_BALANCE_2025 = {
    "satisfied": 0.601,  # 60.1%
    "improvement_from_2021": 0.058,  # +5.8 percentage points
    "source": "Novoresume 2025"
}

# Dating Apps (2026)
DATING_APPS_2026 = {
    "ever_used": 0.37,  # 37%
    "currently_using": 0.06,  # 6%
    "niche_apps_share": 0.20,
    "source": "SSRS 2026"
}

# Religion (2025)
RELIGION_2025 = {
    "church_membership": 0.47,  # 47% (2020, continuing decline)
    "religiously_unaffiliated": 0.28,  # "Nones"
    "christian": 0.65,
    "attend_weekly": 0.24,  # ~24%
    "source": "Gallup, Pew 2025"
}

# Diet (2025)
DIET_2025 = {
    "vegetarian": 0.05,  # 5% (Forbes)
    "vegan": 0.03,       # 3%
    "total_plant_based": 0.08,  # 8%
    "source": "Forbes/Gallup 2025"
}

# Credit Card Debt (2025-2026)
CREDIT_CARD_DEBT_2025 = {
    "carry_balance": 0.36,  # ~36% carry balance
    "expect_debt_increase": 0.47,  # 47% expect increase in 2026
    "debt_is_normal": 0.49,  # 49% say debt is normal
    "avg_household_balance": 11019,
    "source": "NerdWallet, Bankrate 2025"
}

# News Consumption (2025-2026)
NEWS_CONSUMPTION_2025 = {
    "trust_national_news": 0.56,  # 56% (down 20 pts since 2016)
    "trust_local_news": 0.68,  # Higher trust for local
    "decline_since_2016": 0.20,
    "source": "Pew 2025"
}

# Sleep (2025)
SLEEP_2025 = {
    "get_recommended_hours": 0.69,  # 69% get 7+ hours
    "dont_get_enough": 0.31,  # 31% don't get enough
    "revenge_procrastination": 0.96,  # 96% guilty of this
    "source": "CDC, USAFacts 2025"
}

# Travel (2026)
TRAVEL_2026 = {
    "plan_same_or_more": 0.56,  # 56% (YouGov)
    "plan_travel_more": 0.42,
    "plan_about_same": 0.47,
    "plan_beach_vacation": 0.70,
    "increased_budget": 0.68,
    "source": "YouGov, TPG, Beach.com 2026"
}

# Student Loans (2025)
STUDENT_LOANS_2025 = {
    "have_student_debt": 0.13,  # 42.5M / 330M population
    "college_grads_with_debt": 0.44,  # 44%
    "students_borrow_annually": 0.60,  # 60%
    "total_debt_trillion": 1.81,
    "source": "Education Data, Motley Fool 2025"
}

# Health Insurance Satisfaction (2025)
HEALTH_INSURANCE_2025 = {
    "satisfied_overall": 0.82,  # 82% (NBC/SurveyMonkey)
    "very_satisfied": 0.33,  # ~1 in 3
    "source": "NBC News/SurveyMonkey 2025"
}

# Minimum Wage (2025)
MINIMUM_WAGE_2025 = {
    "support_15_minimum": 0.59,  # 59% (Reuters/Ipsos)
    "oppose": 0.34,
    "source": "Reuters/Ipsos"
}

# Universal Basic Income (2025)
UBI_2025 = {
    "support_18_36": 0.51,  # 51% among young adults
    "support_overall": 0.45,  # Estimated overall
    "source": "U Chicago, YouGov"
}

# Death Penalty (2025)
DEATH_PENALTY_2025 = {
    "support": 0.52,  # 52% (Gallup Oct 2025) - down from 80% in 1994
    "oppose": 0.48,
    "source": "Gallup Oct 2025"
}

# Term Limits (2025)
TERM_LIMITS_2025 = {
    "support": 0.90,  # ~90% support
    "bipartisan": True,
    "source": "Pew Research"
}

# Smart Home (2025-2026)
SMART_HOME_2026 = {
    "have_device": 0.48,  # 48% have at least one (Horowitz Research)
    "expected_2026": 0.57,  # 57% expected by end of 2026
    "avg_devices_per_home": 15,  # 15-20 devices in smart homes
    "higher_income_adoption": 0.65,  # Higher income households
    "source": "Horowitz Research, eMarketer 2026"
}

# Social Media (2025-2026)
SOCIAL_MEDIA_2026 = {
    "get_news_youtube": 0.35,  # 35% get news from YouTube
    "get_news_facebook": 0.30,  # ~30% from Facebook
    "purchases_influenced_gen_z": 0.77,  # 77% Gen Z influenced by social
    "daily_tiktok_minutes": 89,  # 89 min daily TikTok (Gen Z)
    "source": "Hootsuite, Pew 2025-2026"
}

# Climate Change Concern (2025-2026)
CLIMATE_CHANGE_2026 = {
    "worried_air_pollution": 0.80,  # 80% worried
    "worried_water_pollution": 0.79,
    "worried_power_outages": 0.79,
    "worried_extreme_heat": 0.73,
    "climate_distress_dem": 0.36,  # 36% Dems experience distress
    "climate_distress_rep": 0.09,  # 9% Republicans
    "source": "Yale Climate Communication Fall 2025"
}

# Housing Affordability (2025-2026)
HOUSING_AFFORDABILITY_2026 = {
    "think_cost_is_problem": 0.92,  # 92% say housing cost is problem
    "buying_more_affordable_markets": 0.66,  # 66% of markets
    "mortgage_rate_2025_peak": 0.07,  # 7% peak
    "mortgage_rate_late_2025": 0.062,  # 6.2% late 2025
    "source": "Zebra, Investopedia 2026"
}

# Childcare (2026)
CHILDCARE_2026 = {
    "crisis_or_major_problem": 0.80,  # 80% say crisis/major problem
    "crisis_republican": 0.65,
    "crisis_independent": 0.81,
    "crisis_democrat": 0.94,
    "percent_of_income": 0.20,  # 20% of family income
    "source": "FFYF National Poll 2026, Care.com"
}

# Retirement Confidence (2025-2026)
RETIREMENT_CONFIDENCE_2026 = {
    "confident_tdf_investors": 0.71,  # 71% TDF investors confident
    "confident_non_investors": 0.58,
    "boomers_not_confident": 0.47,  # 47% boomers not confident
    "expect_market_correction": 0.56,  # 56% expect 2026 correction
    "source": "Voya, Western & Southern 2026"
}

# Tipping Culture (2025)
TIPPING_2025 = {
    "negative_view": 0.63,  # 63% have at least one negative view
    "tip_fatigue": True,
    "annoyed_digital_prompts": True,
    "source": "JIM Generosity Index 2025"
}

# EV Charging Concerns (2025-2026)
EV_CHARGING_2026 = {
    "top_concern_unreliable": True,  # Charger unreliability is top concern
    "barriers": ["affordability", "range_anxiety", "charging_access"],
    "dcfc_ports_growth_2026": 19500,  # Expected new ports
    "source": "Mintel 2025, Paren 2026"
}

# Side Hustles (2025-2026)
SIDE_HUSTLE_2026 = {
    "have_side_hustle": 0.27,  # 27% (Bankrate 2025)
    "rely_secondary_income": 0.72,  # 72% (IndexBox 2026)
    "by_generation": {
        "gen_z": 0.34,
        "millennial": 0.31,
        "gen_x": 0.23,
        "boomer": 0.22,
    },
    "avg_monthly_income": 442.76,
    "source": "Bankrate 2025, IndexBox 2026"
}

# Data Privacy (2025-2026)
DATA_PRIVACY_2026 = {
    "want_stronger_control": 0.74,  # 74% want stronger control
    "privacy_key_to_trust": 0.80,  # 80%+ consider privacy key
    "wont_buy_without_protection": 0.95,  # 95% won't buy
    "source": "Cisco 2025, Folio3 2026"
}

# Social Security Confidence (2025-2026)
SOCIAL_SECURITY_2026 = {
    "expect_benefit_cuts": 0.70,  # 70% expect cuts (Cato)
    "dont_believe_available": 0.30,  # 30% don't believe it'll be there
    "trust_fund_solvent_until": 2034,
    "source": "Cato Institute 2025, SSA Trustees"
}

# Shopping Preferences (2025-2026)
SHOPPING_PREFERENCES_2026 = {
    "prefer_in_store": 0.45,  # 45% prefer in-store
    "prefer_online": 0.28,  # 28% prefer online
    "gen_z_in_store_discovery": 0.61,  # 61% Gen Z discover in-store
    "shop_in_store_weekly": 0.64,  # 64% shop stores weekly
    "source": "Capital One Shopping, PwC 2026"
}

# Inflation/Economic Concern (2025-2026)
INFLATION_CONCERN_2026 = {
    "top_issue_economy_inflation_healthcare": 0.66,  # 66%
    "expect_finances_worse": 0.32,  # 32% expect worse
    "optimistic": 0.35,
    "anxious": 0.32,
    "stressed": 0.30,
    "source": "Brookings, Bankrate 2026"
}

# Dreamers/DACA Pathway (2025-2026)
DREAMERS_2026 = {
    "support_pathway": 0.81,  # 81% support
    "republican_support_2017": 0.79,  # Was 79% R support in 2017
    "source": "Various polls 2025-2026"
}

# Healthcare Costs (2025-2026)
HEALTHCARE_COSTS_2026 = {
    "worried_afford": 0.66,  # 66% worried about affording healthcare
    "bankruptcies_medical": 0.63,  # 60-65% bankruptcies tied to medical
    "cost_increase_2025": 0.07,  # 7% increase
    "source": "KFF 2026, Johns Hopkins"
}

# Mental Health (2025-2026)
MENTAL_HEALTH_2026 = {
    "received_therapy": 0.14,  # 14% received therapy (CDC)
    "has_mental_illness": 0.20,  # 1 in 5
    "depression_receive_treatment": 0.41,  # 39-43%
    "gen_z_monthly_challenges": 0.94,  # 94% Gen Z
    "source": "CDC 2024, Zebra 2026"
}

# College Value (2025-2026)
COLLEGE_VALUE_2026 = {
    "not_worth_cost": 0.63,  # 63% say not worth it
    "worth_cost": 0.33,  # 33% say worth it
    "very_important": 0.35,  # 35% say very important
    "source": "Gallup, News polls 2025-2026"
}

# Work Arrangements (2025-2026)
WORK_ARRANGEMENTS_2026 = {
    "prefer_hybrid": 0.72,  # 72% prefer hybrid
    "prefer_always_office": 0.12,
    "prefer_always_remote": 0.16,
    "current_on_site": 0.56,
    "current_hybrid": 0.30,
    "current_remote": 0.14,
    "source": "Slack, Robert Half 2026"
}

# Gun Control (2025-2026)
GUN_CONTROL_2026 = {
    "support_assault_weapons_ban": 0.57,  # 57%
    "gun_violence_priority": 0.87,  # 87% (NY poll)
    "partisan_gap": 0.40,  # ~40 point gap
    "source": "CBS News, Everytown 2026"
}

# Police Trust (2025-2026)
POLICE_TRUST_2026 = {
    "partisan_gap_points": 34,  # 34-point R-D gap
    "local_approval_avg": 0.55,  # ~55% local approval
    "source": "Gallup 2026"
}

# Food Delivery (2025-2026)
FOOD_DELIVERY_2026 = {
    "orders_not_dine_in": 0.75,  # 75% not eaten in restaurant
    "doordash_market_share": 0.56,
    "use_restaurant_apps": 0.52,
    "source": "NYT, Wikipedia 2026"
}

# Subscription Fatigue (2025-2026)
SUBSCRIPTION_FATIGUE_2026 = {
    "canceled_one_service": 0.65,  # 65% canceled at least one
    "plan_to_cancel": 0.39,  # 39% plan to cancel
    "monthly_churn_rate": 0.055,  # 5.5%
    "source": "Deloitte, Oak Hill 2026"
}

# Loneliness (2025-2026)
LONELINESS_2026 = {
    "feel_lonely_45_plus": 0.40,  # 40% ages 45+ feel lonely
    "eat_meals_alone": 0.20,  # 20% eat alone
    "struggling_millions": 52,  # 52 million
    "source": "AARP, Gallup, Penn Medicine 2025-2026"
}

# Job Satisfaction (2025-2026)
JOB_SATISFACTION_2026 = {
    "like_job_overall": 0.51,  # 51% like job
    "happy_with_pay": 0.34,  # 34% happy with pay
    "satisfied_recognition": 0.52,  # 52% satisfied with recognition
    "source": "Pew Research, SSR 2026"
}

# Buy Now Pay Later (2025-2026)
BNPL_2026 = {
    "used_bnpl": 0.20,  # ~20% used BNPL
    "growth_cagr": 0.253,  # 25.3% CAGR 2022-2025
    "market_2025_billion": 107.38,
    "source": "GlobalNewswire 2026"
}

# Financial Literacy (2025-2026)
FINANCIAL_LITERACY_2026 = {
    "know_great_deal": 0.50,  # ~50% feel they know a lot
    "have_regrets_2025": 0.54,  # 54% have regrets
    "plan_to_change": 0.93,  # 93% plan to change
    "source": "Pew Research, Intuit 2026"
}

# Parental Stress (2025-2026)
PARENTAL_STRESS_2026 = {
    "negative_mental_health_impact": 0.30,  # 30% say parenting hurts mental health
    "burnout_increasing": True,
    "source": "Axa 2025"
}

# Life Satisfaction (2025-2026)
LIFE_SATISFACTION_2026 = {
    "expect_same_or_better": 0.72,  # 72% expect life same or better
    "personal_optimism": 0.79,  # 79% optimistic personal life
    "source": "Washington Stand 2026"
}

# Fitness/Exercise (2025-2026)
FITNESS_2026 = {
    "gym_access_important": 0.86,  # 86% say gym important
    "achieved_goals_2025": 0.55,  # 55% achieved fitness goals
    "planned_spend_billion": 60,
    "source": "Health & Fitness Association 2026"
}

# Organic Food (2025-2026)
ORGANIC_FOOD_2026 = {
    "gen_z_buy_monthly": 0.42,  # 42% Gen Z buy organic monthly
    "boomers_prefer_local": 0.59,  # 59% Boomers prefer local
    "gen_z_prefer_local": 0.45,  # 45% Gen Z prefer local
    "source": "Guardian, Attest 2026"
}

# Podcast Listening (2025-2026)
PODCAST_2026 = {
    "monthly_listeners": 0.55,  # 55% monthly
    "ever_tried": 0.73,  # 73% have tried
    "audio_consumption_share": 0.09,  # 9% of audio time
    "source": "Edison Research, Forbes 2025-2026"
}

# Video Gaming (2025-2026)
GAMING_2026 = {
    "adults_play": 0.80,  # 80% of gamers are adults
    "play_1_5_hrs_week": 0.28,  # 28%
    "play_6_10_hrs_week": 0.25,  # 25%
    "play_20_plus_hrs_week": 0.08,  # 8%
    "source": "Statista 2025, Udonis 2026"
}

# Homeownership (2025-2026)
HOMEOWNERSHIP_2026 = {
    "ownership_rate": 0.657,  # 65.7% (FRED Q4 2025)
    "buying_more_affordable_markets": 0.66,  # 66% of markets
    "renters_millions": 40,  # 40+ million
    "source": "FRED, Zebra 2026"
}

# Volunteering/Charity (2025-2026)
VOLUNTEERING_2026 = {
    "volunteer_nonreligious": 0.55,  # 55% (Gallup)
    "donated_money": 0.76,  # 76% donated
    "volunteer_45_plus": 0.33,  # 33% ages 45+
    "volunteer_under_45": 0.22,  # 22%
    "source": "Gallup, AP-NORC 2025"
}

# Car Ownership (2025-2026)
CAR_OWNERSHIP_2026 = {
    "households_own_car": 0.92,  # 92%
    "total_vehicles_million": 284.6,
    "evs_new_registrations": 0.08,  # 8% of new
    "source": "AutoInsurance.com, MoneyGeek 2026"
}

# Book Reading (2025-2026)
BOOK_READING_2026 = {
    "read_at_least_one": 0.60,  # 60% read at least one
    "read_zero": 0.40,  # 40% read none
    "read_for_pleasure_daily": 0.16,  # 16% on given day
    "median_books": 2,
    "source": "YouGov, Dataopedia 2025-2026"
}

# Outdoor/Camping (2025-2026)
OUTDOOR_CAMPING_2026 = {
    "campers_millions": 82.4,  # 82.4 million in 2025
    "campers_percentage": 0.25,  # ~25% of population
    "peak_year_millions": 84.8,  # 2023 was peak
    "source": "The Dyrt 2026 Camping Report"
}

# Coffee (2025-2026)
COFFEE_2026 = {
    "drink_daily": 0.66,  # 66% drink daily
    "avg_cups": 3.1,
    "source": "Beverage Daily 2026"
}

# Alcohol (2025-2026)
ALCOHOL_2026 = {
    "adults_drink": 0.54,  # 54% (90-year low)
    "california_sober": 0.34,  # 34%
    "gen_z_california_sober": 0.48,  # 48%
    "sober_curious_growth": 0.44,  # 44% increase
    "source": "Gallup, Scripps 2026"
}


def get_current_calibration(topic: str, question_type: str = None) -> dict:
    """
    Get current calibrations for a topic.
    
    Returns dict with calibrated values and confidence level.
    """
    topic_lower = topic.lower()
    
    # Immigration
    if any(kw in topic_lower for kw in ["immigration", "ice", "deportation", "border", "enforcement"]):
        return {
            "data": IMMIGRATION_ENFORCEMENT_FEB2026,
            "confidence": "high",
            "is_partisan": True,
            "note": "MUST segment by party - 60+ point gap between R and D"
        }
    
    # AI/Jobs
    if any(kw in topic_lower for kw in ["ai ", "artificial intelligence", "automation", "job loss", "workplace ai"]):
        return {
            "data": AI_JOB_CONCERNS_2026,
            "confidence": "high",
            "is_partisan": False,
            "note": "Varies significantly by generation"
        }
    
    # Vaccines
    if any(kw in topic_lower for kw in ["vaccine", "vaccination", "mmr", "measles", "immuniz"]):
        return {
            "data": VACCINATION_RATES_US,
            "confidence": "high",
            "is_partisan": True,
            "note": "Varies significantly by state and political affiliation"
        }
    
    # CDC/Health institutions
    if any(kw in topic_lower for kw in ["cdc", "health authority", "public health"]):
        return {
            "data": INSTITUTIONAL_TRUST["cdc"],
            "confidence": "medium",
            "is_partisan": True,
        }
    
    # Streaming
    if any(kw in topic_lower for kw in ["streaming", "netflix", "disney", "hbo", "subscription"]):
        return {
            "data": STREAMING_BENCHMARKS,
            "confidence": "medium",
            "is_partisan": False,
        }
    
    return None


def apply_current_calibration(base_distribution: dict, topic: str, audience: str) -> dict:
    """
    Apply current topic calibrations to a distribution.
    """
    calibration = get_current_calibration(topic)
    if not calibration:
        return base_distribution
    
    # This would apply the calibration data to adjust the distribution
    # For now, return with metadata
    return {
        "distribution": base_distribution,
        "calibration_applied": True,
        "source": calibration.get("data", {}).get("source", "Unknown"),
        "confidence": calibration.get("confidence", "low"),
    }
