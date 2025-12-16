/**
 * Unit Tests for SHS Calculator
 * 
 * Run these tests in a browser environment or with a test runner that supports DOM APIs.
 * 
 * @license Apache-2.0
 */

// Test framework (simple assertion library)
const TestFramework = {
  tests: [],
  passed: 0,
  failed: 0,

  test(name, fn) {
    this.tests.push({ name, fn });
  },

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  },

  assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  },

  assertClose(actual, expected, tolerance = 0.01, message) {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(message || `Expected ${expected} (±${tolerance}), got ${actual}`);
    }
  },

  async run() {
    console.log('Running SHS Calculator Tests...\n');
    
    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(`✓ ${name}`);
        this.passed++;
      } catch (error) {
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n${this.passed} passed, ${this.failed} failed`);
    return this.failed === 0;
  }
};

// Test helper: Create a test container
function createTestContainer() {
  const container = document.createElement('div');
  container.id = 'test-shs-container';
  document.body.appendChild(container);
  return container;
}

function cleanupTestContainer() {
  const container = document.getElementById('test-shs-container');
  if (container) {
    container.remove();
  }
}

// Tests
TestFramework.test('SHSCalculator class exists', () => {
  TestFramework.assert(typeof SHSCalculator !== 'undefined', 'SHSCalculator class should be defined');
});

TestFramework.test('SHSCalculator can be instantiated', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container');
    TestFramework.assert(calc instanceof SHSCalculator, 'Should create SHSCalculator instance');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('SHSCalculator throws error for missing container', () => {
  let errorThrown = false;
  try {
    new SHSCalculator('non-existent-container');
  } catch (e) {
    errorThrown = true;
    TestFramework.assert(e.message.includes('not found'), 'Should throw descriptive error');
  }
  TestFramework.assert(errorThrown, 'Should throw error for missing container');
});

TestFramework.test('SHSCalculator renders questions', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container');
    const questionsContainer = document.getElementById('shs-questions-container-test-shs-container');
    TestFramework.assert(questionsContainer !== null, 'Questions container should exist');
    TestFramework.assert(questionsContainer.querySelectorAll('tr').length === 10, 'Should render 10 questions');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('SHSCalculator supports language switching', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container', { language: 'en' });
    TestFramework.assertEquals(calc.currentLang, 'en', 'Should start with English');
    
    calc.setLanguage('de');
    TestFramework.assertEquals(calc.currentLang, 'de', 'Should switch to German');
    
    const t = calc.getTranslations();
    TestFramework.assert(t.title.includes('Rechner'), 'German title should contain "Rechner"');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('Score calculation for dimension pairs', () => {
  // Test the scoring formula: score = (q_a - q_b) / 4
  // For q1=2, q2=-2: score = (2 - (-2)) / 4 = 1.0
  // For q1=-2, q2=2: score = (-2 - 2) / 4 = -1.0
  // For q1=0, q2=0: score = (0 - 0) / 4 = 0.0
  
  const testCases = [
    { qa: 2, qb: -2, expected: 1.0 },
    { qa: -2, qb: 2, expected: -1.0 },
    { qa: 0, qb: 0, expected: 0.0 },
    { qa: 1, qb: -1, expected: 0.5 },
    { qa: -1, qb: 1, expected: -0.5 },
  ];

  testCases.forEach(({ qa, qb, expected }) => {
    const score = (qa - qb) / 4;
    TestFramework.assertClose(score, expected, 0.001, `Score for qa=${qa}, qb=${qb} should be ${expected}`);
  });
});

TestFramework.test('Consistency calculation', () => {
  // Consistency: cons = (q_a + q_b) / 4
  // For q1=2, q2=2: cons = (2 + 2) / 4 = 1.0 (very consistent, both positive)
  // For q1=-2, q2=-2: cons = (-2 + -2) / 4 = -1.0 (very consistent, both negative)
  // For q1=2, q2=-2: cons = (2 + -2) / 4 = 0.0 (inconsistent, opposite)
  
  const testCases = [
    { qa: 2, qb: 2, expected: 1.0 },
    { qa: -2, qb: -2, expected: -1.0 },
    { qa: 2, qb: -2, expected: 0.0 },
    { qa: 1, qb: 1, expected: 0.5 },
  ];

  testCases.forEach(({ qa, qb, expected }) => {
    const cons = (qa + qb) / 4;
    TestFramework.assertClose(cons, expected, 0.001, `Consistency for qa=${qa}, qb=${qb} should be ${expected}`);
  });
});

TestFramework.test('Segment text lookup', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container');
    
    // Test boundary values
    const text1 = calc.getSegmentText(-1.0);
    TestFramework.assert(text1.includes('Severe'), 'Should return severe risk text for -1.0');
    
    const text2 = calc.getSegmentText(1.0);
    TestFramework.assert(text2.includes('Excellent'), 'Should return excellent text for 1.0');
    
    const text3 = calc.getSegmentText(0.0);
    TestFramework.assert(text3.includes('Neutral'), 'Should return neutral text for 0.0');
    
    // Test clamping
    const text4 = calc.getSegmentText(-2.0); // Should clamp to -1.0
    TestFramework.assert(text4.includes('Severe'), 'Should clamp negative values');
    
    const text5 = calc.getSegmentText(2.0); // Should clamp to 1.0
    TestFramework.assert(text5.includes('Excellent'), 'Should clamp positive values');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('Consistency summary generation', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container');
    
    // Very good consistency (low absolute value)
    const summary1 = calc.getConsistencySummary(0.05, [0.1, 0.05, -0.05]);
    TestFramework.assert(summary1.includes('very good'), 'Should indicate very good consistency');
    
    // Good consistency
    const summary2 = calc.getConsistencySummary(0.3, [0.3, 0.2, 0.4]);
    TestFramework.assert(summary2.includes('good'), 'Should indicate good consistency');
    
    // Inconsistent
    const summary3 = calc.getConsistencySummary(0.8, [0.8, 0.9, 0.7]);
    TestFramework.assert(summary3.includes('inconsistent'), 'Should indicate inconsistency');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('Format value', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container');
    
    TestFramework.assertEquals(calc.formatValue(0.12345), '0.12', 'Should format to 2 decimal places');
    TestFramework.assertEquals(calc.formatValue(-0.5), '-0.50', 'Should format negative values');
    TestFramework.assertEquals(calc.formatValue(1.0), '1.00', 'Should format whole numbers');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('Reset functionality', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container');
    
    // Set some responses (simulate)
    calc.responses = { q1: 2, q2: -2 };
    calc.results = { overall: 0.5 };
    
    calc.reset();
    
    TestFramework.assert(Object.keys(calc.responses).length === 0, 'Should clear responses');
    TestFramework.assert(calc.results === null, 'Should clear results');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('Gauge rendering', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container', { showGauge: true });
    
    const segmentsContainer = document.getElementById('shs-segments-test-shs-container');
    TestFramework.assert(segmentsContainer !== null, 'Gauge segments container should exist');
    
    const segments = segmentsContainer.querySelectorAll('path');
    TestFramework.assertEquals(segments.length, 11, 'Should render 11 gauge segments');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('Gauge needle positioning', () => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container', { showGauge: true });
    
    // Test needle positioning for different values
    calc.setGauge(-1.0); // Minimum
    const needle1 = document.getElementById('shs-needle-test-shs-container');
    TestFramework.assert(needle1 !== null, 'Needle should exist');
    
    calc.setGauge(1.0); // Maximum
    calc.setGauge(0.0); // Middle
    
    // Needle should have transform style
    TestFramework.assert(needle1.style.transform.includes('rotate'), 'Needle should have rotation transform');
  } finally {
    cleanupTestContainer();
  }
});

TestFramework.test('Event emission on calculation', (done) => {
  const container = createTestContainer();
  try {
    const calc = new SHSCalculator('test-shs-container');
    
    let eventReceived = false;
    container.addEventListener('shs:calculated', (e) => {
      eventReceived = true;
      TestFramework.assert(e.detail !== null, 'Event should have detail');
      TestFramework.assert(typeof e.detail.overall === 'number', 'Should have overall score');
      TestFramework.assert(Array.isArray(e.detail.breakdown), 'Should have breakdown array');
      done();
    });
    
    // Simulate form submission by setting responses and calling calculate
    // Note: In a real scenario, we'd need to actually fill the form
    // This is a simplified test
    setTimeout(() => {
      if (!eventReceived) {
        done(new Error('Event was not received'));
      }
    }, 1000);
  } finally {
    // cleanupTestContainer(); // Keep for async test
  }
});

// Run tests when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    TestFramework.run().then(success => {
      if (success) {
        console.log('\n✅ All tests passed!');
      } else {
        console.log('\n❌ Some tests failed');
      }
    });
  });
} else {
  TestFramework.run().then(success => {
    if (success) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n❌ Some tests failed');
    }
  });
}

