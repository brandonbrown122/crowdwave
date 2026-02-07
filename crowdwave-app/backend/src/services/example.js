/**
 * Example usage of Crowdwave Output & Insights modules
 * 
 * This file demonstrates how to use all the services together.
 * Run with: node example.js
 */

const {
  generateCompleteOutput,
  generateCSV,
  generateInsights,
  buildReport,
  generateConfidenceReport,
  QUESTION_TYPES
} = require('./index');

// ============================================
// Sample Study Data
// ============================================

const sampleStudyData = {
  studyMetadata: {
    title: 'Product Launch Concept Test',
    description: 'Testing consumer response to new product concepts',
    objective: 'Determine market viability and target segment preferences'
  },

  // Question definitions
  questions: [
    {
      id: 'Q1',
      question: 'How interested are you in this product concept?',
      text: 'How interested are you in this product concept?',
      type: 'likert',
      scale: 5
    },
    {
      id: 'Q2',
      question: 'Which feature is most important to you?',
      text: 'Which feature is most important to you?',
      type: 'single_choice',
      options: ['Price', 'Quality', 'Convenience', 'Brand', 'Sustainability']
    },
    {
      id: 'Q3',
      question: 'How likely are you to recommend this product to a friend?',
      text: 'How likely are you to recommend this product to a friend?',
      type: 'nps',
      scale: 10
    },
    {
      id: 'Q4',
      question: 'Would you purchase this product in the next 6 months?',
      text: 'Would you purchase this product in the next 6 months?',
      type: 'yes_no'
    },
    {
      id: 'Q5',
      question: 'Select all benefits that appeal to you:',
      text: 'Select all benefits that appeal to you:',
      type: 'multiple_choice',
      options: ['Saves time', 'Saves money', 'Better quality', 'Eco-friendly', 'Status symbol']
    }
  ],

  // Segment definitions
  segments: [
    { id: 'seg1', name: 'Budget-conscious Millennials', traits: { demographics: { age_range: [25, 40], income_level: 'middle' } } },
    { id: 'seg2', name: 'Affluent Boomers', traits: { demographics: { age_range: [55, 75], income_level: 'high' } } },
    { id: 'seg3', name: 'Tech-savvy Gen Z', traits: { demographics: { age_range: [18, 28], income_level: 'entry' } } }
  ],

  // Demographic fields collected
  demographicFields: ['age', 'gender', 'income', 'location'],

  // Synthetic respondent data
  respondents: generateSampleRespondents(150)
};

// ============================================
// Generate sample respondents
// ============================================

function generateSampleRespondents(count) {
  const segments = ['Budget-conscious Millennials', 'Affluent Boomers', 'Tech-savvy Gen Z'];
  const segmentIds = ['seg1', 'seg2', 'seg3'];
  const genders = ['Male', 'Female', 'Non-binary'];
  const ages = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
  const incomes = ['<$30K', '$30-50K', '$50-75K', '$75-100K', '$100K+'];
  const locations = ['Urban', 'Suburban', 'Rural'];

  const respondents = [];

  for (let i = 0; i < count; i++) {
    const segIdx = i % segments.length;
    const segment = segments[segIdx];
    const segmentId = segmentIds[segIdx];
    
    // Segment-specific response tendencies
    let interestBias = 3;
    let featurePref = 'Quality';
    let npsBias = 7;
    let purchaseBias = 0.5;

    if (segment === 'Budget-conscious Millennials') {
      interestBias = 3.2;
      featurePref = 'Price';
      npsBias = 6.5;
      purchaseBias = 0.4;
    } else if (segment === 'Affluent Boomers') {
      interestBias = 3.8;
      featurePref = 'Quality';
      npsBias = 7.5;
      purchaseBias = 0.6;
    } else if (segment === 'Tech-savvy Gen Z') {
      interestBias = 4.1;
      featurePref = 'Convenience';
      npsBias = 8;
      purchaseBias = 0.65;
    }

    respondents.push({
      id: `R${String(i + 1).padStart(4, '0')}`,
      segment_id: segmentId,
      segment_name: segment,
      segment: segment,
      persona: {
        segment_name: segment,
        demographics: {
          age: ages[Math.floor(Math.random() * ages.length)],
          gender: genders[Math.floor(Math.random() * genders.length)],
          income: incomes[Math.floor(Math.random() * incomes.length)],
          location: locations[Math.floor(Math.random() * locations.length)]
        }
      },
      responses: [
        { question_id: 'Q1', answer: Math.max(1, Math.min(5, Math.round(interestBias + (Math.random() - 0.5) * 2))) },
        { question_id: 'Q2', answer: weightedRandom(['Price', 'Quality', 'Convenience', 'Brand', 'Sustainability'], 
                           featurePref === 'Price' ? [0.4, 0.2, 0.2, 0.1, 0.1] :
                           featurePref === 'Quality' ? [0.1, 0.4, 0.2, 0.2, 0.1] :
                           [0.1, 0.2, 0.4, 0.15, 0.15]) },
        { question_id: 'Q3', answer: Math.max(0, Math.min(10, Math.round(npsBias + (Math.random() - 0.5) * 4))) },
        { question_id: 'Q4', answer: Math.random() < purchaseBias },
        { question_id: 'Q5', answer: selectMultiple(['Saves time', 'Saves money', 'Better quality', 'Eco-friendly', 'Status symbol'], 
                           Math.floor(Math.random() * 3) + 1) }
      ],
      confidence_score: 70 + Math.random() * 25,
      generated_at: new Date().toISOString()
    });
  }

  return respondents;
}

function weightedRandom(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  return items[items.length - 1];
}

function selectMultiple(items, count) {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ============================================
// Demo: Generate all outputs
// ============================================

async function runDemo() {
  console.log('='.repeat(60));
  console.log('CROWDWAVE OUTPUT MODULES DEMO');
  console.log('='.repeat(60));
  console.log('');

  // 1. Generate complete output package
  console.log('1. Generating complete output package...');
  const output = await generateCompleteOutput(sampleStudyData, {
    includeCSV: true,
    includeInsights: true,
    includeReport: true,
    includeConfidence: true,
    reportFormat: 'json'
  });
  console.log('   ✓ Complete output generated');
  console.log('');

  // 2. Display summary
  console.log('2. Study Summary:');
  console.log(`   Title: ${output.meta.studyTitle}`);
  console.log(`   Respondents: ${output.meta.respondentCount}`);
  console.log(`   Questions: ${output.meta.questionCount}`);
  console.log('');

  // 3. Display key insights
  console.log('3. Key Findings:');
  const findings = output.insights?.keyFindings || output.insights?.key_findings || [];
  for (const finding of findings.slice(0, 3)) {
    console.log(`   [${(finding.level || 'info').toUpperCase()}] ${finding.finding}`);
  }
  console.log('');

  // 4. Display confidence
  console.log('4. Confidence Assessment:');
  if (output.confidence) {
    console.log(`   Overall: ${output.confidence.overallConfidence?.toFixed(1) || 'N/A'}% (${output.confidence.overallRating || 'N/A'})`);
    if (output.confidence.lowConfidenceFlags?.length > 0) {
      console.log('   Flags:');
      for (const flag of output.confidence.lowConfidenceFlags.slice(0, 2)) {
        console.log(`   - ${flag.message}`);
      }
    }
  }
  console.log('');

  // 5. Display CSV preview
  console.log('5. CSV Preview (first 5 lines):');
  if (output.csvData?.fullData?.content) {
    const csvLines = output.csvData.fullData.content.split('\n').slice(0, 5);
    for (const line of csvLines) {
      console.log(`   ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
    }
  }
  console.log('');

  // 6. Frontend data structure
  console.log('6. Frontend Data Structure:');
  if (output.frontendData?.summary) {
    console.log('   Summary:', JSON.stringify(output.frontendData.summary, null, 2).split('\n').map(l => '   ' + l).join('\n'));
  }
  console.log('');

  // 7. Recommendations
  console.log('7. Recommendations:');
  const recs = output.frontendData?.recommendations || [];
  for (const rec of recs.slice(0, 3)) {
    console.log(`   [${(rec.priority || 'info').toUpperCase()}] ${rec.action}`);
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('Demo complete! All modules working correctly.');
  console.log('='.repeat(60));

  return output;
}

// Run if executed directly
if (require.main === module) {
  runDemo().then(() => {
    console.log('\nDemo finished successfully.');
  }).catch(err => {
    console.error('Demo failed:', err);
    process.exit(1);
  });
}

module.exports = { sampleStudyData, runDemo };
