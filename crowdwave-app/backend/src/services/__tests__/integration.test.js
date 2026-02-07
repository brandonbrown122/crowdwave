/**
 * Integration test for Crowdwave core services
 */

const services = require('../index');

// Test segment definition
const testSegment = {
  id: 'seg_young_professionals',
  name: 'Young Urban Professionals',
  weight: 0.5,
  demographics: {
    ageRange: [25, 35],
    genders: ['male', 'female', 'nonbinary'],
    locations: ['urban'],
    educationLevels: ['Bachelor\'s', 'Master\'s'],
    occupationTypes: ['professional']
  },
  psychographics: {
    coreValues: ['success', 'innovation'],
    interests: ['technology', 'fitness', 'travel'],
    personalityHints: { organized: true, social: true }
  },
  behaviors: {
    decisionStyles: ['analytical', 'deliberate'],
    riskTolerances: ['medium', 'high'],
    techAdoptions: ['innovator', 'early_adopter']
  }
};

// Test questions
const testQuestions = [
  {
    id: 'q1',
    type: 'multiple_choice',
    text: 'What is your primary motivation for using our product?',
    options: ['Save time', 'Save money', 'Better quality', 'Convenience', 'Other']
  },
  {
    id: 'q2',
    type: 'likert',
    text: 'How satisfied are you with our service?',
    scale: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
  },
  {
    id: 'q3',
    type: 'open_ended',
    text: 'What improvements would you suggest for our product?'
  },
  {
    id: 'q4',
    type: 'ranking',
    text: 'Rank these features by importance:',
    options: ['Speed', 'Price', 'Quality', 'Support', 'Design']
  }
];

async function runIntegrationTest() {
  console.log('🧪 Running Crowdwave Services Integration Test\n');

  // 1. Generate Personas
  console.log('1️⃣ Generating personas...');
  const { personas, metadata } = services.generatePersonas({
    segments: [testSegment],
    sampleSize: 10,
    dataSources: []
  });
  console.log(`   ✅ Generated ${personas.length} personas in ${metadata.generationTimeMs}ms`);
  console.log(`   📋 Sample persona: ${personas[0].name}, ${personas[0].demographics.age}yo ${personas[0].demographics.occupation}\n`);

  // 2. Generate Survey Responses
  console.log('2️⃣ Generating survey responses...');
  const batchResults = services.batchGenerateResponses(personas, testQuestions);
  console.log(`   ✅ Generated ${batchResults.allResponses.length} total responses`);
  console.log(`   ⏱️  Generation time: ${batchResults.summary.generationTimeMs}ms\n`);

  // 3. Sample response for each type
  console.log('3️⃣ Sample responses by question type:');
  const sampleResponses = testQuestions.map(q => {
    const response = batchResults.allResponses.find(r => r.questionId === q.id);
    return { type: q.type, answer: response?.answer, thinking: response?.thinking?.substring(0, 80) + '...' };
  });
  sampleResponses.forEach(r => {
    console.log(`   📝 ${r.type}: ${JSON.stringify(r.answer).substring(0, 60)}`);
  });
  console.log();

  // 4. Analyze distributions
  console.log('4️⃣ Analyzing response distributions...');
  const distributionReport = services.generateDistributionReport(
    batchResults.allResponses,
    testQuestions
  );
  console.log(`   📊 Distribution health: ${distributionReport.overallHealth}`);
  console.log(`   📈 Average deviation: ${(distributionReport.summary.averageDeviation * 100).toFixed(1)}%`);
  console.log(`   💡 Recommendations: ${distributionReport.summary.totalRecommendations}\n`);

  // 5. Calculate confidence scores
  console.log('5️⃣ Calculating confidence scores...');
  const confidenceResults = services.batchCalculateConfidence(
    batchResults.allResponses,
    testQuestions,
    personas,
    { segments: { [testSegment.id]: testSegment } }
  );
  console.log(`   🎯 Average confidence: ${confidenceResults.summary.averageConfidence}/100`);
  console.log(`   ✨ High confidence responses: ${confidenceResults.summary.highConfidence}`);
  console.log(`   ⚠️  Low confidence responses: ${confidenceResults.summary.lowConfidence}\n`);

  // 6. Get recommendations
  console.log('6️⃣ Sample recommendations:');
  const sampleConfidence = confidenceResults.results[0];
  const recommendations = services.generateRecommendations(sampleConfidence);
  recommendations.slice(0, 3).forEach(r => console.log(`   💡 ${r}`));

  console.log('\n✅ Integration test complete!');
}

// Run if executed directly
if (require.main === module) {
  runIntegrationTest().catch(console.error);
}

module.exports = { runIntegrationTest };
