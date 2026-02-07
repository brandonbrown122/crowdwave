const http = require('http');

const PORT = 3001;
const BASE = `http://localhost:${PORT}`;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('Starting API tests...\n');

  // Start the server
  require('./src/index.js');
  await new Promise(r => setTimeout(r, 2000));

  try {
    // Test 1: Health check
    console.log('1. Health check...');
    const health = await request('GET', '/health');
    console.log('   ✓ Status:', health.data.status);

    // Test 2: Create segment
    console.log('\n2. Create segment...');
    const segment = await request('POST', '/api/segments', {
      name: 'Gen Z',
      description: 'Young adults 18-24',
      traits: { ageRange: '18-24', interests: ['social media', 'gaming'] }
    });
    console.log('   ✓ Created segment:', segment.data.id);
    const segmentId = segment.data.id;

    // Test 3: List segments
    console.log('\n3. List segments...');
    const segments = await request('GET', '/api/segments');
    console.log('   ✓ Found', segments.data.length, 'segment(s)');

    // Test 4: Create survey
    console.log('\n4. Create survey...');
    const survey = await request('POST', '/api/surveys', {
      name: 'Product Feedback',
      description: 'Customer satisfaction survey',
      questions: [
        { text: 'How satisfied are you?', type: 'likert', scale: 5 },
        { text: 'Which feature is most important?', type: 'multiple_choice', options: ['Price', 'Quality', 'Speed'] },
        { text: 'Any other feedback?', type: 'open_ended' },
        { text: 'Rank these features', type: 'ranking', options: ['A', 'B', 'C'] }
      ]
    });
    console.log('   ✓ Created survey:', survey.data.id);
    const surveyId = survey.data.id;

    // Test 5: Run simulation
    console.log('\n5. Run simulation...');
    const simulation = await request('POST', '/api/simulate', {
      surveyId,
      segmentIds: [segmentId],
      sampleSize: 10
    });
    console.log('   ✓ Simulation status:', simulation.data.status);
    console.log('   ✓ Generated', simulation.data.results.responses.length, 'responses');

    // Test 6: Get results
    console.log('\n6. Get results...');
    const results = await request('GET', `/api/results/${simulation.data.id}`);
    console.log('   ✓ Retrieved results for simulation:', results.data.id);

    console.log('\n' + '='.repeat(50));
    console.log('All tests passed! ✓');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('\nTest failed:', error.message);
    process.exit(1);
  }
}

runTests();
