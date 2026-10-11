import { describe, it, expect } from 'vitest';
import {
  detectNonsenseOrNonAnswer,
  createLocalAnswerEvaluation,
} from '../services/coachingEngine';

describe('Acceptance Criteria Specific Input Verification', () => {
  const question = 'How does your solution scale and handle network failure?';

  it('verifies: Empty or whitespace-only response', () => {
    const res = createLocalAnswerEvaluation(question, '   ');
    expect(res.score).toBe(0);
    expect(res.quality).toBe('Fundamentally Incorrect');
    expect(res.feedback).toContain('No answer was provided');
  });

  it('verifies: idk', () => {
    const res = createLocalAnswerEvaluation(question, 'idk');
    expect(res.score).toBe(0);
    expect(res.quality).toBe('Fundamentally Incorrect');
    expect(res.feedback).toMatch(/explicit non-answer/i);
  });

  it("verifies: I don't know", () => {
    const res = createLocalAnswerEvaluation(question, "I don't know");
    expect(res.score).toBe(0);
    expect(res.quality).toBe('Fundamentally Incorrect');
  });

  it('verifies: No idea', () => {
    const res = createLocalAnswerEvaluation(question, 'No idea');
    expect(res.score).toBe(0);
    expect(res.quality).toBe('Fundamentally Incorrect');
  });

  it('verifies: asdfghjkl (keyboard mashing)', () => {
    const res = createLocalAnswerEvaluation(question, 'asdfghjkl');
    expect(res.score).toBe(0);
    expect(res.quality).toBe('Fundamentally Incorrect');
    expect(res.feedback).toMatch(/keyboard mashing/i);
  });

  it('verifies: sdjbhcdncdddddddddddddddddddddddd (character spam & nonsense)', () => {
    const res = createLocalAnswerEvaluation(
      question,
      'sdjbhcdncdddddddddddddddddddddddd'
    );
    expect(res.score).toBe(0);
    expect(res.quality).toBe('Fundamentally Incorrect');
  });

  it('verifies: aaaaaaaaaaaaaaaaaaaa (repeated character spam)', () => {
    const res = createLocalAnswerEvaluation(question, 'aaaaaaaaaaaaaaaaaaaa');
    expect(res.score).toBe(0);
    expect(res.quality).toBe('Fundamentally Incorrect');
    expect(res.feedback).toMatch(/repeated character/i);
  });

  it('verifies: React automatically scales the backend and guarantees the app works without internet.', () => {
    const answer =
      'React automatically scales the backend and guarantees the app works without internet.';
    const res = createLocalAnswerEvaluation(question, answer);
    expect(res.score).toBeLessThanOrEqual(25);
    expect(res.quality).toBe('Fundamentally Incorrect');
    expect(res.misconceptions).toContain('React scales backend');
    expect(res.feedback).toContain('React is a client-side UI library');
  });

  it('verifies: A short but technically correct answer', () => {
    const shortCorrect =
      'We cache mutations in IndexedDB and replay them using exponential backoff on reconnection.';
    const res = createLocalAnswerEvaluation(question, shortCorrect);
    expect(res.score).toBeGreaterThanOrEqual(80);
    expect(['Good', 'Excellent']).toContain(res.quality);
  });

  it('verifies: A detailed answer containing incorrect technical claims', () => {
    const detailedIncorrect =
      'We architected our application with modern best practices across all modules. Specifically, React automatically scales the backend microservices horizontally under load and guarantees the app works without internet for every user.';
    const res = createLocalAnswerEvaluation(question, detailedIncorrect);
    expect(res.score).toBeLessThanOrEqual(25);
    expect(res.quality).toBe('Fundamentally Incorrect');
    expect(res.misconceptions).toBeTruthy();
  });

  it('verifies: A detailed, technically correct answer that acknowledges limitations', () => {
    const detailedCorrectWithLimitations =
      'We use WebSockets for low-latency live dispatching backed by Redis pub/sub. The primary trade-off is state synchronization across nodes during network failover; however, we mitigate this by checkpointing emergency state to PostgreSQL every 500ms.';
    const res = createLocalAnswerEvaluation(question, detailedCorrectWithLimitations);
    expect(res.score).toBeGreaterThanOrEqual(85);
    expect(res.quality).toBe('Excellent');
    expect(res.rubricBreakdown.completeness).toBeGreaterThanOrEqual(10);
  });
});
