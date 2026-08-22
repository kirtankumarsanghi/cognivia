const axios = require('axios');

async function runTests() {
  console.log('Testing ML Service (Flask) Endpoints...\n');

  try {
    // 1. Test Early Warning
    console.log('1. Testing Early Warning...');
    const ewRes = await axios.post('http://127.0.0.1:5001/ml/early-warning', {
      features: {
        'avg_time_per_attempt': 120,
        'mistake_count': 3,
        'hint_requests': 1,
        'idle_time': 30
      }
    });
    console.log('Early Warning Response:', ewRes.data);
    
    // 2. Test Student Profile
    console.log('\n2. Testing Student Profile...');
    const spRes = await axios.post('http://127.0.0.1:5001/ml/student-profile', {
      features: {
        'consistency': 0.8,
        'accuracy': 0.85,
        'engagement': 0.9
      }
    });
    console.log('Student Profile Response:', spRes.data);

    // 3. Test Concept Difficulty
    console.log('\n3. Testing Concept Difficulty...');
    const cdRes = await axios.post('http://127.0.0.1:5001/ml/concept-difficulty', {
      concept_stats: { average_time: 120, confusion_frequency: 30 }
    });
    console.log('Concept Difficulty Response:', cdRes.data);

    // 4. Test NLP Classifier
    console.log('\n4. Testing NLP Confusion Classifier...');
    const nlpRes = await axios.post('http://127.0.0.1:5001/ml/classify-confusion', {
      text: "I don't understand how binary search trees work.",
      concept_name: 'Trees'
    });
    console.log('NLP Classifier Response:', nlpRes.data);

    console.log('\n✅ All endpoints verified successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error(error.response.data);
    }
  }
}

runTests();
