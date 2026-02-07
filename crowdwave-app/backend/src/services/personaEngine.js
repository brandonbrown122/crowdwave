/**
 * @fileoverview Persona Engine - Generates synthetic personas for audience research
 * @module services/personaEngine
 */

const crypto = require('crypto');

/**
 * @typedef {Object} DemographicProfile
 * @property {number} age - Age in years
 * @property {string} gender - Gender identity
 * @property {string} location - Geographic location
 * @property {string} education - Education level
 * @property {string} occupation - Current occupation
 * @property {string} incomeRange - Household income range
 * @property {string} householdSize - Number of people in household
 * @property {string} maritalStatus - Marital status
 */

/**
 * @typedef {Object} PsychographicTraits
 * @property {string[]} values - Core values (e.g., "family", "success", "adventure")
 * @property {string[]} interests - Areas of interest
 * @property {string} personality - Personality type summary
 * @property {string} lifestyle - Lifestyle category
 * @property {Object} bigFive - Big Five personality scores (0-100)
 * @property {number} bigFive.openness
 * @property {number} bigFive.conscientiousness
 * @property {number} bigFive.extraversion
 * @property {number} bigFive.agreeableness
 * @property {number} bigFive.neuroticism
 */

/**
 * @typedef {Object} BehavioralTendencies
 * @property {string} decisionStyle - How they make decisions
 * @property {string} riskTolerance - Low, medium, or high
 * @property {string} brandLoyalty - Tendency toward brand loyalty
 * @property {string[]} mediaConsumption - Preferred media channels
 * @property {string} shoppingBehavior - Shopping preference patterns
 * @property {string} techAdoption - Innovator, early adopter, majority, laggard
 */

/**
 * @typedef {Object} Persona
 * @property {string} id - Unique persona identifier
 * @property {string} name - Generated persona name
 * @property {DemographicProfile} demographics - Demographic profile
 * @property {PsychographicTraits} psychographics - Psychographic traits
 * @property {BehavioralTendencies} behaviors - Behavioral tendencies
 * @property {Object} context - Background context from data sources
 * @property {string} context.summary - Narrative summary of persona
 * @property {Object[]} context.dataSourceInsights - Insights from uploaded data
 * @property {string} segmentId - ID of the segment this persona belongs to
 * @property {number} createdAt - Unix timestamp of creation
 */

/**
 * @typedef {Object} SegmentDefinition
 * @property {string} id - Segment identifier
 * @property {string} name - Segment name
 * @property {Object} demographics - Target demographic ranges/values
 * @property {Object} psychographics - Target psychographic traits
 * @property {Object} behaviors - Target behavioral patterns
 * @property {number} weight - Relative weight in sample (0-1)
 */

/**
 * @typedef {Object} DataSource
 * @property {string} id - Data source identifier
 * @property {string} type - Type: 'excel', 'pdf', 'image', 'video_transcript'
 * @property {Object} extractedData - Processed data from the source
 * @property {string[]} insights - Key insights extracted
 * @property {string[]} relevantSegments - Segment IDs this data applies to
 */

// Sample data pools for realistic persona generation
const DATA_POOLS = {
  firstNames: {
    male: ['James', 'Michael', 'Robert', 'David', 'William', 'Jose', 'Marcus', 'Anthony', 'Kevin', 'Brian', 'Derek', 'Carlos', 'Ahmed', 'Wei', 'Raj'],
    female: ['Mary', 'Jennifer', 'Lisa', 'Sarah', 'Jessica', 'Maria', 'Ashley', 'Michelle', 'Keisha', 'Priya', 'Mei', 'Fatima', 'Elena', 'Nicole', 'Amanda'],
    nonbinary: ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Quinn', 'Avery', 'Sage', 'River']
  },
  lastNames: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Chen', 'Patel', 'Kim', 'Nguyen', 'O\'Brien'],
  
  locations: {
    urban: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'Austin, TX'],
    suburban: ['Naperville, IL', 'Plano, TX', 'Scottsdale, AZ', 'Irvine, CA', 'Bellevue, WA', 'Raleigh, NC', 'Henderson, NV', 'Chandler, AZ', 'Gilbert, AZ', 'Frisco, TX'],
    rural: ['Bozeman, MT', 'Asheville, NC', 'Burlington, VT', 'Bend, OR', 'Flagstaff, AZ', 'Rapid City, SD', 'Fargo, ND', 'Billings, MT', 'Cheyenne, WY', 'Missoula, MT']
  },
  
  occupations: {
    professional: ['Software Engineer', 'Marketing Manager', 'Financial Analyst', 'Product Manager', 'UX Designer', 'Data Scientist', 'Consultant', 'Attorney', 'Physician', 'Architect'],
    service: ['Nurse', 'Teacher', 'Sales Associate', 'Customer Service Rep', 'Administrative Assistant', 'Real Estate Agent', 'Insurance Agent', 'Social Worker', 'Librarian', 'Flight Attendant'],
    trade: ['Electrician', 'Plumber', 'HVAC Technician', 'Carpenter', 'Auto Mechanic', 'Welder', 'Construction Manager', 'Chef', 'Machinist', 'Heavy Equipment Operator'],
    creative: ['Graphic Designer', 'Content Creator', 'Photographer', 'Writer', 'Musician', 'Video Editor', 'Art Director', 'Fashion Designer', 'Interior Designer', 'Game Developer']
  },
  
  values: ['family', 'success', 'adventure', 'security', 'creativity', 'independence', 'community', 'health', 'knowledge', 'spirituality', 'sustainability', 'authenticity', 'tradition', 'innovation', 'justice'],
  
  interests: ['fitness', 'cooking', 'travel', 'technology', 'sports', 'music', 'reading', 'gaming', 'gardening', 'photography', 'fashion', 'investing', 'podcasts', 'DIY projects', 'volunteering', 'art', 'pets', 'outdoor activities', 'meditation', 'social media'],
  
  personalities: ['analytical', 'creative', 'practical', 'social', 'ambitious', 'cautious', 'adventurous', 'nurturing', 'independent', 'collaborative'],
  
  lifestyles: ['health-conscious', 'career-focused', 'family-oriented', 'minimalist', 'luxury-seeking', 'eco-conscious', 'tech-savvy', 'traditional', 'adventurous', 'homebody'],
  
  mediaChannels: ['Instagram', 'Facebook', 'Twitter/X', 'TikTok', 'YouTube', 'LinkedIn', 'Podcasts', 'Cable TV', 'Streaming Services', 'Print Magazines', 'News Websites', 'Reddit', 'Email Newsletters']
};

/**
 * Generates a unique persona ID
 * @returns {string} UUID for the persona
 */
function generatePersonaId() {
  return `persona_${crypto.randomUUID()}`;
}

/**
 * Selects random items from an array
 * @param {any[]} array - Source array
 * @param {number} count - Number of items to select
 * @returns {any[]} Selected items
 */
function selectRandom(array, count = 1) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Generates a random number within a range with optional normal distribution
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} [normal=false] - Use normal distribution centered on midpoint
 * @returns {number} Random number in range
 */
function randomInRange(min, max, normal = false) {
  if (normal) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const mean = (min + max) / 2;
    const stdDev = (max - min) / 6; // 99.7% within range
    const value = mean + z * stdDev;
    return Math.round(Math.max(min, Math.min(max, value)));
  }
  return Math.round(min + Math.random() * (max - min));
}

/**
 * Generates Big Five personality scores based on segment traits
 * @param {Object} segmentPsychographics - Psychographic traits from segment
 * @returns {Object} Big Five scores (0-100 each)
 */
function generateBigFive(segmentPsychographics = {}) {
  const baseScores = {
    openness: randomInRange(30, 70, true),
    conscientiousness: randomInRange(30, 70, true),
    extraversion: randomInRange(30, 70, true),
    agreeableness: randomInRange(30, 70, true),
    neuroticism: randomInRange(30, 70, true)
  };

  // Adjust based on segment hints
  if (segmentPsychographics.adventurous) baseScores.openness += 20;
  if (segmentPsychographics.organized) baseScores.conscientiousness += 15;
  if (segmentPsychographics.social) baseScores.extraversion += 20;
  if (segmentPsychographics.cooperative) baseScores.agreeableness += 15;
  if (segmentPsychographics.anxious) baseScores.neuroticism += 20;

  // Clamp to 0-100
  for (const key of Object.keys(baseScores)) {
    baseScores[key] = Math.max(0, Math.min(100, baseScores[key] + randomInRange(-10, 10)));
  }

  return baseScores;
}

/**
 * Generates a demographic profile for a persona
 * @param {Object} segmentDemographics - Target demographics from segment definition
 * @returns {DemographicProfile} Generated demographic profile
 */
function generateDemographics(segmentDemographics = {}) {
  const {
    ageRange = [25, 55],
    genders = ['male', 'female', 'nonbinary'],
    genderWeights = [0.48, 0.48, 0.04],
    locations = ['urban', 'suburban', 'rural'],
    locationWeights = [0.4, 0.45, 0.15],
    educationLevels = ['High School', 'Some College', 'Bachelor\'s', 'Master\'s', 'Doctorate'],
    educationWeights = [0.2, 0.2, 0.35, 0.2, 0.05],
    occupationTypes = ['professional', 'service', 'trade', 'creative'],
    incomeRanges = ['Under $30k', '$30k-$50k', '$50k-$75k', '$75k-$100k', '$100k-$150k', '$150k+'],
    incomeWeights = [0.15, 0.2, 0.25, 0.2, 0.12, 0.08]
  } = segmentDemographics;

  // Weighted random selection helper
  const weightedSelect = (options, weights) => {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < options.length; i++) {
      cumulative += weights[i] || (1 / options.length);
      if (r <= cumulative) return options[i];
    }
    return options[options.length - 1];
  };

  const gender = weightedSelect(genders, genderWeights);
  const locationType = weightedSelect(locations, locationWeights);
  const education = weightedSelect(educationLevels, educationWeights);
  const occupationType = weightedSelect(occupationTypes, [0.35, 0.3, 0.2, 0.15]);
  const income = weightedSelect(incomeRanges, incomeWeights);

  return {
    age: randomInRange(ageRange[0], ageRange[1], true),
    gender,
    location: selectRandom(DATA_POOLS.locations[locationType])[0],
    education,
    occupation: selectRandom(DATA_POOLS.occupations[occupationType])[0],
    incomeRange: income,
    householdSize: String(randomInRange(1, 5)),
    maritalStatus: weightedSelect(
      ['Single', 'Married', 'Divorced', 'Widowed', 'Partnered'],
      [0.3, 0.45, 0.1, 0.05, 0.1]
    )
  };
}

/**
 * Generates psychographic traits for a persona
 * @param {Object} segmentPsychographics - Target psychographics from segment
 * @param {DemographicProfile} demographics - Generated demographics (for coherence)
 * @returns {PsychographicTraits} Generated psychographic traits
 */
function generatePsychographics(segmentPsychographics = {}, demographics = {}) {
  const {
    coreValues = [],
    interests = [],
    personalityHints = {}
  } = segmentPsychographics;

  // Mix segment-specified values with random ones
  const personaValues = [
    ...coreValues.slice(0, 2),
    ...selectRandom(DATA_POOLS.values.filter(v => !coreValues.includes(v)), 3 - coreValues.length)
  ].slice(0, 4);

  const personaInterests = [
    ...interests.slice(0, 3),
    ...selectRandom(DATA_POOLS.interests.filter(i => !interests.includes(i)), 5 - interests.length)
  ].slice(0, 6);

  return {
    values: personaValues,
    interests: personaInterests,
    personality: selectRandom(DATA_POOLS.personalities)[0],
    lifestyle: selectRandom(DATA_POOLS.lifestyles)[0],
    bigFive: generateBigFive(personalityHints)
  };
}

/**
 * Generates behavioral tendencies for a persona
 * @param {Object} segmentBehaviors - Target behaviors from segment
 * @param {PsychographicTraits} psychographics - Generated psychographics (for coherence)
 * @returns {BehavioralTendencies} Generated behavioral tendencies
 */
function generateBehaviors(segmentBehaviors = {}, psychographics = {}) {
  const {
    decisionStyles = ['analytical', 'intuitive', 'deliberate', 'impulsive'],
    riskTolerances = ['low', 'medium', 'high'],
    techAdoptions = ['innovator', 'early_adopter', 'early_majority', 'late_majority', 'laggard']
  } = segmentBehaviors;

  // Coherence: high openness correlates with higher risk tolerance
  let riskBias = 0;
  if (psychographics.bigFive?.openness > 70) riskBias = 0.2;
  if (psychographics.bigFive?.openness < 30) riskBias = -0.2;

  const riskWeights = [0.3 - riskBias, 0.4, 0.3 + riskBias];
  const riskIndex = (() => {
    const r = Math.random();
    if (r < riskWeights[0]) return 0;
    if (r < riskWeights[0] + riskWeights[1]) return 1;
    return 2;
  })();

  return {
    decisionStyle: selectRandom(decisionStyles)[0],
    riskTolerance: riskTolerances[riskIndex],
    brandLoyalty: selectRandom(['very loyal', 'somewhat loyal', 'neutral', 'variety seeker'])[0],
    mediaConsumption: selectRandom(DATA_POOLS.mediaChannels, randomInRange(3, 6)),
    shoppingBehavior: selectRandom(['bargain hunter', 'quality focused', 'convenience driven', 'research intensive', 'impulse buyer'])[0],
    techAdoption: selectRandom(techAdoptions)[0]
  };
}

/**
 * Generates a persona name based on demographics
 * @param {DemographicProfile} demographics - Demographic profile
 * @returns {string} Full name
 */
function generateName(demographics) {
  const genderKey = demographics.gender === 'male' ? 'male' : 
                    demographics.gender === 'female' ? 'female' : 'nonbinary';
  const firstName = selectRandom(DATA_POOLS.firstNames[genderKey])[0];
  const lastName = selectRandom(DATA_POOLS.lastNames)[0];
  return `${firstName} ${lastName}`;
}

/**
 * Generates a narrative summary of the persona
 * @param {Persona} persona - Partial persona object
 * @returns {string} Narrative summary
 */
function generateSummary(persona) {
  const { demographics, psychographics, behaviors } = persona;
  
  return `${persona.name} is a ${demographics.age}-year-old ${demographics.occupation} ` +
    `living in ${demographics.location}. With a ${demographics.education} education, ` +
    `they earn ${demographics.incomeRange} annually. ` +
    `Their core values include ${psychographics.values.slice(0, 2).join(' and ')}, ` +
    `and they have a ${psychographics.personality} personality with a ${psychographics.lifestyle} lifestyle. ` +
    `As a ${behaviors.decisionStyle} decision-maker with ${behaviors.riskTolerance} risk tolerance, ` +
    `they tend to be ${behaviors.brandLoyalty} when it comes to brands. ` +
    `They primarily consume media through ${behaviors.mediaConsumption.slice(0, 3).join(', ')}.`;
}

/**
 * Incorporates insights from data sources into persona context
 * @param {DataSource[]} dataSources - Uploaded data sources
 * @param {string} segmentId - Segment ID to filter relevant sources
 * @param {Persona} persona - Partial persona for context
 * @returns {Object[]} Data source insights applicable to this persona
 */
function incorporateDataSources(dataSources = [], segmentId, persona) {
  const relevantSources = dataSources.filter(
    ds => !ds.relevantSegments || ds.relevantSegments.includes(segmentId) || ds.relevantSegments.includes('*')
  );

  return relevantSources.map(source => {
    // Sample insights based on source type and persona traits
    const insight = {
      sourceId: source.id,
      sourceType: source.type,
      relevance: Math.random() * 0.3 + 0.7, // 0.7-1.0 relevance score
      insights: []
    };

    // Pull relevant insights from the source
    if (source.insights && source.insights.length > 0) {
      // Select 1-3 insights most relevant to this persona
      insight.insights = selectRandom(source.insights, randomInRange(1, 3));
    }

    // Include any extracted data points
    if (source.extractedData) {
      insight.dataPoints = source.extractedData;
    }

    return insight;
  });
}

/**
 * Generates a single synthetic persona
 * @param {SegmentDefinition} segment - Segment definition
 * @param {DataSource[]} [dataSources=[]] - Available data sources
 * @returns {Persona} Generated persona
 */
function generatePersona(segment, dataSources = []) {
  const demographics = generateDemographics(segment.demographics || {});
  const psychographics = generatePsychographics(segment.psychographics || {}, demographics);
  const behaviors = generateBehaviors(segment.behaviors || {}, psychographics);

  const persona = {
    id: generatePersonaId(),
    name: generateName(demographics),
    demographics,
    psychographics,
    behaviors,
    context: {
      summary: '',
      dataSourceInsights: []
    },
    segmentId: segment.id,
    createdAt: Date.now()
  };

  // Generate summary and incorporate data sources
  persona.context.summary = generateSummary(persona);
  persona.context.dataSourceInsights = incorporateDataSources(dataSources, segment.id, persona);

  return persona;
}

/**
 * Generates multiple personas for a study based on segments and sample size
 * @param {Object} options - Generation options
 * @param {SegmentDefinition[]} options.segments - Segment definitions
 * @param {number} options.sampleSize - Total number of personas to generate
 * @param {DataSource[]} [options.dataSources=[]] - Uploaded data sources
 * @param {Object} [options.quotas={}] - Quota requirements for demographics
 * @returns {Object} Generated personas and metadata
 */
function generatePersonas({ segments, sampleSize, dataSources = [], quotas = {} }) {
  if (!segments || segments.length === 0) {
    throw new Error('At least one segment definition is required');
  }

  if (!sampleSize || sampleSize < 1) {
    throw new Error('Sample size must be at least 1');
  }

  const personas = [];
  const segmentCounts = {};
  const startTime = Date.now();

  // Calculate personas per segment based on weights
  const totalWeight = segments.reduce((sum, s) => sum + (s.weight || 1), 0);
  
  for (const segment of segments) {
    const segmentWeight = segment.weight || 1;
    const segmentSampleSize = Math.round((segmentWeight / totalWeight) * sampleSize);
    segmentCounts[segment.id] = { target: segmentSampleSize, generated: 0 };

    for (let i = 0; i < segmentSampleSize; i++) {
      const persona = generatePersona(segment, dataSources);
      personas.push(persona);
      segmentCounts[segment.id].generated++;
    }
  }

  // If rounding caused us to fall short, add more to the largest segment
  while (personas.length < sampleSize) {
    const largestSegment = segments.reduce((a, b) => 
      (a.weight || 1) > (b.weight || 1) ? a : b
    );
    const persona = generatePersona(largestSegment, dataSources);
    personas.push(persona);
    segmentCounts[largestSegment.id].generated++;
  }

  // Calculate generation stats
  const generationTimeMs = Date.now() - startTime;

  return {
    personas,
    metadata: {
      totalGenerated: personas.length,
      requestedSize: sampleSize,
      segmentBreakdown: segmentCounts,
      generationTimeMs,
      dataSourcesUsed: dataSources.length,
      generatedAt: new Date().toISOString()
    }
  };
}

/**
 * Validates a segment definition
 * @param {SegmentDefinition} segment - Segment to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateSegment(segment) {
  const errors = [];

  if (!segment.id) errors.push('Segment must have an id');
  if (!segment.name) errors.push('Segment must have a name');
  if (segment.weight && (segment.weight < 0 || segment.weight > 1)) {
    errors.push('Segment weight must be between 0 and 1');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Enriches a persona with additional context from a specific data source
 * @param {Persona} persona - Persona to enrich
 * @param {DataSource} dataSource - Data source to incorporate
 * @returns {Persona} Enriched persona
 */
function enrichPersonaWithSource(persona, dataSource) {
  const enrichedPersona = { ...persona };
  const newInsights = incorporateDataSources([dataSource], persona.segmentId, persona);
  
  enrichedPersona.context.dataSourceInsights = [
    ...enrichedPersona.context.dataSourceInsights,
    ...newInsights
  ];

  // Regenerate summary with new context
  enrichedPersona.context.summary = generateSummary(enrichedPersona);

  return enrichedPersona;
}

module.exports = {
  generatePersona,
  generatePersonas,
  validateSegment,
  enrichPersonaWithSource,
  generateDemographics,
  generatePsychographics,
  generateBehaviors,
  generateName,
  generateSummary
};
