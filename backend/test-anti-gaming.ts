/**
 * Anti-Gaming Feature Test Script
 * 
 * This script tests the anti-gaming rate limits feature:
 * 1. Cooldown enforcement
 * 2. Diminishing weight calculation
 * 3. Spam detection
 * 4. Anomaly detection (requires multiple concurrent students)
 */

import axios from 'axios';
import chalk from 'chalk';

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const TEST_STUDENT_EMAIL = 'student@cognivia.dev';
const TEST_STUDENT_PASSWORD = 'demo123';

interface AttemptResponse {
  id: string;
  student_id: string;
  concept_id: string;
  correct: boolean;
  weight: number;
  antiGaming?: {
    weight: string;
    recentAttempts: number;
    anomalyDetected: boolean;
    message?: string;
  };
}

interface RateLimitError {
  error: string;
  message: string;
  waitTime?: number;
  type: string;
  attemptsInWindow?: number;
  maxAllowed?: number;
}

let authToken: string = '';
let testConceptId: string = '';

/**
 * Authenticate and get token
 */
async function authenticate() {
  console.log(chalk.blue('\n📋 Step 1: Authenticating...'));
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_STUDENT_EMAIL,
      password: TEST_STUDENT_PASSWORD
    });
    
    authToken = response.data.token;
    console.log(chalk.green('✅ Authenticated successfully'));
  } catch (error: any) {
    console.error(chalk.red('❌ Authentication failed:'), error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Get a test concept ID
 */
async function getTestConcept() {
  console.log(chalk.blue('\n📋 Step 2: Getting test concept...'));
  
  try {
    const response = await axios.get(`${API_URL}/courses`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const firstCourse = response.data[0];
    if (!firstCourse) {
      throw new Error('No courses available');
    }
    
    const lessonsResponse = await axios.get(`${API_URL}/courses/${firstCourse.id}/lessons`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const firstLesson = lessonsResponse.data[0];
    if (!firstLesson) {
      throw new Error('No lessons available');
    }
    
    const conceptsResponse = await axios.get(`${API_URL}/lessons/${firstLesson.id}/concepts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    testConceptId = conceptsResponse.data[0]?.id;
    if (!testConceptId) {
      throw new Error('No concepts available');
    }
    
    console.log(chalk.green(`✅ Using concept: ${conceptsResponse.data[0].name} (${testConceptId})`));
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to get test concept:'), error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Submit a practice attempt
 */
async function submitAttempt(correct: boolean = true): Promise<AttemptResponse | RateLimitError | null> {
  try {
    const response = await axios.post(
      `${API_URL}/practice/attempt`,
      {
        concept_id: testConceptId,
        correct
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      return error.response.data as RateLimitError;
    }
    console.error(chalk.red('❌ Unexpected error:'), error.response?.data || error.message);
    return null;
  }
}

/**
 * Sleep helper
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test 1: Cooldown Enforcement
 */
async function testCooldown() {
  console.log(chalk.blue('\n📋 Test 1: Cooldown Enforcement'));
  console.log(chalk.gray('Testing 5-second cooldown between attempts...\n'));
  
  // First attempt
  console.log(chalk.yellow('Attempt 1: Submitting...'));
  const result1 = await submitAttempt(true);
  if (!result1) return;
  
  if ('error' in result1) {
    console.log(chalk.red(`❌ Unexpected error: ${result1.message}`));
    return;
  }
  
  console.log(chalk.green(`✅ Success (weight: ${result1.antiGaming?.weight || '1.00'})`));
  
  // Second attempt (should be blocked)
  console.log(chalk.yellow('\nAttempt 2: Submitting immediately (should fail)...'));
  const result2 = await submitAttempt(false);
  if (!result2) return;
  
  if ('error' in result2 && result2.type === 'cooldown') {
    console.log(chalk.green(`✅ Cooldown enforced: ${result2.message}`));
    console.log(chalk.gray(`   Wait time: ${result2.waitTime}s`));
  } else {
    console.log(chalk.red('❌ Expected cooldown error but got success'));
  }
  
  // Wait and try again
  console.log(chalk.yellow(`\nAttempt 3: Waiting 5 seconds...`));
  await sleep(5000);
  console.log(chalk.yellow('Submitting after cooldown...'));
  const result3 = await submitAttempt(true);
  if (!result3) return;
  
  if ('error' in result3) {
    console.log(chalk.red(`❌ Should succeed after cooldown: ${result3.message}`));
  } else {
    console.log(chalk.green(`✅ Success after cooldown (weight: ${result3.antiGaming?.weight || '1.00'})`));
  }
}

/**
 * Test 2: Diminishing Returns
 */
async function testDiminishingReturns() {
  console.log(chalk.blue('\n📋 Test 2: Diminishing Returns'));
  console.log(chalk.gray('Submitting 8 attempts with cooldown to see weight decrease...\n'));
  
  const weights: number[] = [];
  
  for (let i = 1; i <= 8; i++) {
    console.log(chalk.yellow(`Attempt ${i}: Submitting...`));
    const result = await submitAttempt(i % 2 === 0); // Alternate correct/incorrect
    
    if (!result) continue;
    
    if ('error' in result) {
      console.log(chalk.red(`❌ Error: ${result.message}`));
      break;
    } else {
      const weight = parseFloat(result.antiGaming?.weight || '1.00');
      weights.push(weight);
      console.log(chalk.green(`✅ Success (weight: ${weight.toFixed(2)})`));
      
      if (result.antiGaming?.message) {
        console.log(chalk.gray(`   ${result.antiGaming.message}`));
      }
    }
    
    // Wait for cooldown
    if (i < 8) {
      await sleep(5500); // 5.5 seconds to account for request time
    }
  }
  
  console.log(chalk.blue('\n📊 Weight Progression:'));
  weights.forEach((w, i) => {
    const bar = '█'.repeat(Math.floor(w * 20));
    console.log(chalk.gray(`   Attempt ${i + 1}: ${bar} ${w.toFixed(2)}`));
  });
  
  if (weights.length > 4 && weights[weights.length - 1] < 1.0) {
    console.log(chalk.green('\n✅ Diminishing returns working correctly'));
  } else {
    console.log(chalk.yellow('\n⚠️  Weight did not decrease as expected'));
  }
}

/**
 * Test 3: Spam Detection
 */
async function testSpamDetection() {
  console.log(chalk.blue('\n📋 Test 3: Spam Detection'));
  console.log(chalk.gray('Attempting to submit 15 rapid attempts (max 10 allowed)...\n'));
  
  let attemptCount = 0;
  let spamDetected = false;
  
  for (let i = 1; i <= 15; i++) {
    console.log(chalk.yellow(`Rapid attempt ${i}...`));
    const result = await submitAttempt(true);
    
    if (!result) continue;
    
    if ('error' in result && result.type === 'spam') {
      console.log(chalk.green(`✅ Spam detected at attempt ${i}: ${result.message}`));
      console.log(chalk.gray(`   Attempts in window: ${result.attemptsInWindow}`));
      console.log(chalk.gray(`   Max allowed: ${result.maxAllowed}`));
      spamDetected = true;
      break;
    } else if ('error' in result && result.type === 'cooldown') {
      // Expected cooldown errors
      await sleep(5500);
      i--; // Retry this attempt
    } else {
      attemptCount++;
    }
    
    await sleep(100); // Small delay between requests
  }
  
  if (spamDetected) {
    console.log(chalk.green('\n✅ Spam detection working correctly'));
  } else {
    console.log(chalk.yellow('\n⚠️  Spam not detected (this might be due to cooldown enforcement)'));
  }
}

/**
 * Test 4: Check Rate Limit Status
 */
async function testRateLimitStatus() {
  console.log(chalk.blue('\n📋 Test 4: Rate Limit Status'));
  console.log(chalk.gray('Checking current rate limit status...\n'));
  
  try {
    const response = await axios.get(
      `${API_URL}/anti-gaming/status/${testConceptId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const status = response.data.status;
    console.log(chalk.green('✅ Rate Limit Status:'));
    console.log(chalk.gray(`   Can Submit: ${status.canSubmit}`));
    console.log(chalk.gray(`   Current Weight: ${status.weight.toFixed(2)}`));
    console.log(chalk.gray(`   Recent Attempts: ${status.recentAttempts}`));
    console.log(chalk.gray(`   Violation Count: ${status.violationCount}`));
    if (status.cooldownRemaining > 0) {
      console.log(chalk.gray(`   Cooldown Remaining: ${status.cooldownRemaining}s`));
    }
  } catch (error: any) {
    console.error(chalk.red('❌ Failed to get status:'), error.response?.data || error.message);
  }
}

/**
 * Main test suite
 */
async function runTests() {
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║  Anti-Gaming Rate Limits - Test Suite         ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════╝'));
  
  await authenticate();
  await getTestConcept();
  
  console.log(chalk.blue('\n⏸️  Starting tests in 2 seconds...\n'));
  await sleep(2000);
  
  // Run tests
  await testCooldown();
  await sleep(2000);
  
  await testDiminishingReturns();
  await sleep(2000);
  
  await testSpamDetection();
  await sleep(2000);
  
  await testRateLimitStatus();
  
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║  Test Suite Complete                           ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════╝\n'));
}

// Run the test suite
runTests().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});
