import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JudgePractice from '../components/JudgePractice';

describe('JudgePractice Component Tests', () => {
  const sampleProject = {
    title: 'PulseGuard',
    problem: 'Emergency response delays',
    technologies: 'React, Web Bluetooth',
  };

  const sampleQuestions = [
    {
      id: 'q1',
      question: 'How do you handle Web Bluetooth disconnects during an emergency?',
      aspect: 'Technical Feasibility',
      difficulty: 'Hard',
      isFallback: false,
    },
    {
      id: 'q2',
      question: 'Why would responders choose this over existing two-way radios?',
      aspect: 'Competitive Moat',
      difficulty: 'Hard',
      isFallback: false,
    },
  ];

  it('renders loading state when questions are generating', () => {
    render(
      <JudgePractice
        project={sampleProject}
        questions={[]}
        currentQuestion={null}
        questionIndex={0}
        setQuestionIndex={vi.fn()}
        judgeResult={null}
        setJudgeResult={vi.fn()}
        isLoading={true}
      />
    );

    expect(screen.getByText(/Synthesizing Project-Specific Questions/i)).toBeInTheDocument();
    expect(screen.queryByText(/Question 1 of/i)).not.toBeInTheDocument();
  });

  it('renders error state and retry button when question loading fails', () => {
    const onReload = vi.fn();
    render(
      <JudgePractice
        project={sampleProject}
        questions={[]}
        currentQuestion={null}
        questionIndex={0}
        setQuestionIndex={vi.fn()}
        judgeResult={null}
        setJudgeResult={vi.fn()}
        isLoading={false}
        error="Network timeout reaching AI service"
        onReloadQuestions={onReload}
      />
    );

    expect(screen.getByText('Could not generate questions')).toBeInTheDocument();
    expect(screen.getByText('Network timeout reaching AI service')).toBeInTheDocument();

    const retryBtn = screen.getByText('Retry Generation');
    fireEvent.click(retryBtn);
    expect(onReload).toHaveBeenCalledTimes(1);
  });

  it('renders active question, badges, and difficulty', () => {
    render(
      <JudgePractice
        project={sampleProject}
        questions={sampleQuestions}
        currentQuestion={sampleQuestions[0]}
        questionIndex={0}
        setQuestionIndex={vi.fn()}
        judgeResult={null}
        setJudgeResult={vi.fn()}
      />
    );

    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    expect(
      screen.getByText('How do you handle Web Bluetooth disconnects during an emergency?')
    ).toBeInTheDocument();
    expect(screen.getByText('Technical Feasibility')).toBeInTheDocument();
    expect(screen.getByText('Difficulty: Hard')).toBeInTheDocument();
  });

  it('renders evaluation result with rubric breakdown, misconception alert, and pro tip', () => {
    const mockResult = {
      score: 85,
      quality: 'Excellent',
      feedback: 'Accurate architectural handling of reconnect routines with exponential backoff.',
      missingInfo: 'Maximum retry duration before giving up.',
      proTip: 'Add an audio cue when connection is re-established.',
      misconceptions: 'Claimed Bluetooth has unlimited outdoor range.',
      rubricBreakdown: {
        technicalCorrectness: 26,
        relevance: 22,
        evidence: 18,
        completeness: 11,
        clarity: 8,
      },
      isFallback: false,
    };

    render(
      <JudgePractice
        project={sampleProject}
        questions={sampleQuestions}
        currentQuestion={sampleQuestions[0]}
        questionIndex={0}
        setQuestionIndex={vi.fn()}
        judgeResult={mockResult}
        setJudgeResult={vi.fn()}
      />
    );

    // Score and quality badge
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();

    // Rubric items
    expect(screen.getByText('Evaluation Rubric Breakdown')).toBeInTheDocument();
    expect(screen.getByText('26/30')).toBeInTheDocument();
    expect(screen.getByText('22/25')).toBeInTheDocument();

    // Misconception warning
    expect(
      screen.getByText(/Identified Technical Misconception \/ False Claim/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText('Claimed Bluetooth has unlimited outdoor range.')
    ).toBeInTheDocument();

    // Feedback and pro tip
    expect(screen.getByText(mockResult.feedback)).toBeInTheDocument();
    expect(screen.getByText(mockResult.proTip)).toBeInTheDocument();
  });

  it('advances to next question cleanly without NaN errors', () => {
    const setIndex = vi.fn();
    render(
      <JudgePractice
        project={sampleProject}
        questions={sampleQuestions}
        currentQuestion={sampleQuestions[0]}
        questionIndex={0}
        setQuestionIndex={setIndex}
        judgeResult={null}
        setJudgeResult={vi.fn()}
      />
    );

    const skipBtn = screen.getByText(/Skip to next question/i);
    fireEvent.click(skipBtn);
    expect(setIndex).toHaveBeenCalled();
  });
});
