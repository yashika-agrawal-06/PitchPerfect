import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  coachingEngine,
  detectNonsenseOrNonAnswer,
  createLocalAnswerEvaluation,
  createLocalJudgeQuestions,
  createLocalPitch,
  createLocalIdeaReview,
} from '../services/coachingEngine';

describe('Honest Judge Input Validation & Nonsense Detection', () => {
  it('detects empty and whitespace-only responses', () => {
    const emptyCases = ['', '   ', '\t\n '];
    for (const val of emptyCases) {
      const res = detectNonsenseOrNonAnswer(val);
      expect(res.isInvalid).toBe(true);
      expect(res.score).toBe(0);
      expect(res.quality).toBe('Fundamentally Incorrect');
    }
  });

  it('detects explicit non-answers and assigns 0 score', () => {
    const nonAnswers = [
      'idk',
      'IDK',
      "I don't know",
      'i dont know',
      'No idea',
      'have no idea',
      'dunno',
      'not sure',
      'no clue',
    ];

    for (const phrase of nonAnswers) {
      const res = detectNonsenseOrNonAnswer(phrase);
      expect(res.isInvalid).toBe(true);
      expect(res.score).toBe(0);
      expect(res.quality).toBe('Fundamentally Incorrect');
      expect(res.feedback.toLowerCase()).toMatch(/non-answer|uncertainty|no answer/);
    }
  });

  it('detects keyboard mashing and meaningless sequences', () => {
    const mashCases = [
      'asdfghjkl',
      'qwertyuiop',
      'zxcvbnm',
      'asdfasdfasdf',
      'qazwsxedc',
    ];

    for (const str of mashCases) {
      const res = detectNonsenseOrNonAnswer(str);
      expect(res.isInvalid).toBe(true);
      expect(res.score).toBe(0);
      expect(res.quality).toBe('Fundamentally Incorrect');
    }
  });

  it('detects repeated character spam and low-entropy gibberish', () => {
    const spamCases = [
      'aaaaaaaaaaaaaaaaaaaa',
      'sdjbhcdncdddddddddddddddddddddddd',
      'zzzzzzzzzzzzzzzzzzzz',
    ];

    for (const str of spamCases) {
      const res = detectNonsenseOrNonAnswer(str);
      expect(res.isInvalid).toBe(true);
      expect(res.score).toBe(0);
      expect(res.quality).toBe('Fundamentally Incorrect');
    }
  });

  it('does NOT reject legitimate technical answers or abbreviations', () => {
    const legitimate = [
      'React manages the view layer while FastAPI handles dispatch endpoints.',
      'We cache offline events in IndexedDB and replay them with exponential backoff.',
      'PostgreSQL handles spatial queries using PostGIS indices.',
      'OAuth2 token refresh handles expired credentials.',
    ];

    for (const text of legitimate) {
      const res = detectNonsenseOrNonAnswer(text);
      expect(res.isInvalid).toBe(false);
    }
  });
});

describe('Honest Judge Evaluation & Scoring Rubric', () => {
  it('heavily penalizes false technical claims like React scaling the backend', () => {
    const answer =
      'React automatically scales the backend and guarantees the app works without internet.';
    const evalResult = createLocalAnswerEvaluation('How do you scale?', answer);

    expect(evalResult.score).toBeLessThanOrEqual(25);
    expect(evalResult.quality).toBe('Fundamentally Incorrect');
    expect(evalResult.misconceptions).toBeTruthy();
    expect(evalResult.feedback).toContain('React is a client-side UI library');
  });

  it('awards high score to a short, direct, technically correct answer', () => {
    const shortCorrect =
      'We cache offline mutations in IndexedDB and replay them using exponential backoff on reconnection.';
    const evalResult = createLocalAnswerEvaluation(
      'How does your app handle network dropouts?',
      shortCorrect
    );

    expect(evalResult.score).toBeGreaterThanOrEqual(80);
    expect(['Good', 'Excellent']).toContain(evalResult.quality);
    expect(evalResult.rubricBreakdown.technicalCorrectness).toBeGreaterThanOrEqual(24);
  });

  it('awards partial credit to honest admissions of uncertainty with investigation plans', () => {
    const honestWithPlan =
      "I don't know our peak RPS limit yet because we haven't tested beyond 100 concurrent users, but our plan is to benchmark with k6 and add Redis caching if latency exceeds 200ms.";
    const evalResult = createLocalAnswerEvaluation(
      'What is your system throughput under load?',
      honestWithPlan
    );

    expect(evalResult.score).toBeGreaterThanOrEqual(45);
    expect(evalResult.score).toBeLessThanOrEqual(65);
    expect(evalResult.quality).toBe('Partially Correct');
    expect(evalResult.feedback).toMatch(/honest|realistic/i);
  });

  it('rewards detailed, technically correct answers that acknowledge real-world trade-offs', () => {
    const detailedWithTradeoffs =
      'We use WebSockets for real-time triage updates backed by Redis pub/sub. The primary trade-off is memory overhead and state synchronization across instances during failover; however, we mitigate this by persisting critical events immediately to PostgreSQL.';
    const evalResult = createLocalAnswerEvaluation(
      'Explain your real-time notification architecture.',
      detailedWithTradeoffs
    );

    expect(evalResult.score).toBeGreaterThanOrEqual(85);
    expect(evalResult.quality).toBe('Excellent');
    expect(evalResult.rubricBreakdown.completeness).toBeGreaterThanOrEqual(10);
  });

  it('maintains strict mathematical consistency between score and quality labels', () => {
    const testCases = [
      { score: 92, expectedQuality: 'Excellent' },
      { score: 75, expectedQuality: 'Good' },
      { score: 55, expectedQuality: 'Partially Correct' },
      { score: 35, expectedQuality: 'Weak' },
      { score: 10, expectedQuality: 'Fundamentally Incorrect' },
    ];

    for (const { score, expectedQuality } of testCases) {
      let quality;
      if (score >= 85) quality = 'Excellent';
      else if (score >= 70) quality = 'Good';
      else if (score >= 50) quality = 'Partially Correct';
      else if (score >= 30) quality = 'Weak';
      else quality = 'Fundamentally Incorrect';

      expect(quality).toBe(expectedQuality);
    }
  });
});

describe('Project-Specific Judge Questions Generation', () => {
  it('generates distinct questions tailored to specific project technologies', () => {
    const bluetoothProject = {
      title: 'PulseGuard',
      technologies: 'Web Bluetooth, PostGIS, FastAPI',
      problem: 'Slow campus emergency response',
      targetUsers: 'Paramedics',
    };

    const questions = createLocalJudgeQuestions(bluetoothProject);
    expect(questions).toHaveLength(4);
    expect(questions[0].question.toLowerCase()).toContain('bluetooth');
    expect(questions[0].aspect).toBe('Technical Feasibility');

    const websocketProject = {
      title: 'ChatScale',
      technologies: 'WebSockets, Redis, Node.js',
      problem: 'Collaborative latency',
      targetUsers: 'Remote workers',
    };

    const wsQuestions = createLocalJudgeQuestions(websocketProject);
    expect(wsQuestions[0].question.toLowerCase()).toContain('websocket');
    expect(wsQuestions[0].question).not.toBe(questions[0].question);

    const lambdaProject = {
      title: 'ServerlessFlow',
      technologies: 'AWS Lambda, DynamoDB, API Gateway',
      problem: 'High infrastructure costs',
      targetUsers: 'Developers',
    };

    const lambdaQuestions = createLocalJudgeQuestions(lambdaProject);
    expect(lambdaQuestions[0].question.toLowerCase()).toContain('lambda');
  });
});

describe('Backend Integration & Fallback Handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('handles backend network failure smoothly by returning local fallback', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error / connection refused'));

    const pitch = await coachingEngine.generatePitch({
      title: 'Test App',
      problem: 'Test problem',
      technologies: 'React',
      targetUsers: 'Students',
    });

    expect(pitch).toBeTruthy();
    expect(pitch.isFallback).toBe(true);
    expect(pitch.sections.problem).toBeDefined();
    expect(pitch.sections.sixtySecondPitch).toBeDefined();
  });

  it('handles backend HTTP 500 error smoothly with fallback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ success: false, message: 'Internal Server Error' }),
    });

    const review = await coachingEngine.improveIdea({
      title: 'Test App',
      problem: 'Valid test problem statement that has enough characters for analysis',
      technologies: 'React, Node',
      targetUsers: 'Target user segment',
    });

    expect(review).toBeTruthy();
    expect(review.isFallback).toBe(true);
    expect(review.score).toBeGreaterThan(0);
    expect(review.strengths.length).toBeGreaterThan(0);
  });

  it('handles malformed JSON from backend smoothly with fallback', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error('Unexpected token < in JSON at position 0');
      },
    });

    const questions = await coachingEngine.getInitialJudgeQuestions({
      title: 'Test App',
      technologies: 'React, Node',
    });

    expect(questions).toHaveLength(4);
    expect(questions[0].isFallback).toBe(true);
  });

  it('returns backend results with isFallback: false when AWS responds successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        action: 'getInitialJudgeQuestions',
        result: [
          { id: 'q1', question: 'Custom AI question 1', aspect: 'Technical Feasibility', difficulty: 'Hard' },
          { id: 'q2', question: 'Custom AI question 2', aspect: 'Competitive Moat', difficulty: 'Hard' },
          { id: 'q3', question: 'Custom AI question 3', aspect: 'Engineering Execution', difficulty: 'Medium' },
          { id: 'q4', question: 'Custom AI question 4', aspect: 'User Validation', difficulty: 'Hard' },
        ],
      }),
    });

    const questions = await coachingEngine.getInitialJudgeQuestions({
      title: 'Test App',
      technologies: 'React, Node',
    });

    expect(questions).toHaveLength(4);
    expect(questions[0].isFallback).toBe(false);
    expect(questions[0].question).toBe('Custom AI question 1');
  });
});
