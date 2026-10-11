/**
 * PitchPerfect Coaching Engine
 * Integrates with the AWS Lambda + Gemini backend, with robust
 * client-side heuristics and fallback verification.
 */

const API_URL =
  'https://g390y91167.execute-api.us-east-1.amazonaws.com/coach';

const REQUEST_TIMEOUT_MS = 18000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Deterministic Non-Answer & Keyboard Mash Detection Patterns
const NON_ANSWER_PATTERNS = [
  /^(idk|i\s*don'?t\s*know|dont\s*know|no\s*idea|have\s*no\s*idea|dunno)$/i,
  /^(not\s*sure|n\/?a|none|no\s*clue|skip|pass|who\s*knows|can'?t\s*answer|cannot\s*answer)$/i,
  /^(i\s*have\s*no\s*clue|i\s*have\s*no\s*idea|no\s*answer|nothing|not\s*applicable)$/i,
];

const KEYBOARD_MASH_PATTERNS = [
  /^(asdf|asdfg|asdfgh|asdfghjkl|qwerty|qwertyuiop|zxcvbnm|lkjhgfdsa|poiuytrewq)+$/i,
  /^(qaz|wsx|edc|rfv|tgb|yhn|ujm|ikol|qazwsx|wsxedc|edcrfv|rfvtgb|tgbzhn|yhnujm|ujmikol)+$/i,
];

export function detectNonsenseOrNonAnswer(answerText) {
  const cleaned = String(answerText || '').trim();

  if (!cleaned) {
    return {
      isInvalid: true,
      score: 0,
      quality: 'Fundamentally Incorrect',
      feedback:
        'No answer was provided. Judges expect a direct, substantive technical response.',
      missingInfo: 'Direct answer addressing the question.',
      proTip:
        "Address the judge's question directly by describing the relevant component or architectural mechanism.",
      misconceptions: 'None provided.',
    };
  }

  const lower = cleaned.toLowerCase();
  const words = lower.match(/\b[\w'-]+\b/g) || [];
  const charLen = cleaned.length;

  // 1. Explicit non-answers (e.g. 'idk', 'I don't know', 'no idea')
  for (const pat of NON_ANSWER_PATTERNS) {
    if (pat.test(lower)) {
      return {
        isInvalid: true,
        score: 0,
        quality: 'Fundamentally Incorrect',
        feedback: `Your response is an explicit non-answer ("${cleaned}"). While honest, it provides zero technical substance or reasoning for judges to evaluate.`,
        missingInfo: 'Substantive technical explanation or realistic implementation roadmap.',
        proTip:
          'If you have not built this yet, describe your planned architecture or test approach instead of merely stating you do not know.',
        misconceptions: 'None detected; answer lacked substantive content.',
      };
    }
  }

  // If starts with non-answer and has fewer than 6 words total without technical reasoning
  if (
    words.length <= 5 &&
    ['idk', "i don't know", 'i dont know', 'no idea', 'not sure'].some((p) =>
      lower.startsWith(p)
    )
  ) {
    return {
      isInvalid: true,
      score: 0,
      quality: 'Fundamentally Incorrect',
      feedback:
        'Your answer is essentially an admission of uncertainty without supporting explanation or architectural plan.',
      missingInfo: 'Technical details or investigation plan.',
      proTip:
        'Acknowledge what is built today, then specify your exact next technical step or benchmark.',
      misconceptions: 'None detected.',
    };
  }

  // 2. Repeated character spam (e.g. 'aaaaaaaaaaaaaaaaaaaa', 'dddddddddddddddddddddddd')
  if (/(.)\1{4,}/i.test(lower) && /[a-z0-9]([a-z0-9])\1{4,}/i.test(lower)) {
    return {
      isInvalid: true,
      score: 0,
      quality: 'Fundamentally Incorrect',
      feedback: `Your answer contains repeated character sequences ("${cleaned.slice(
        0,
        25
      )}...") with no meaningful technical content.`,
      missingInfo: 'Coherent technical explanation.',
      proTip:
        'Provide a real technical explanation using clear engineering terminology.',
      misconceptions: 'Nonsense input.',
    };
  }

  // Character frequency dominance > 45% in strings >= 12 chars
  if (charLen >= 12) {
    const charCounts = {};
    for (const char of lower) {
      if (/[a-z0-9]/.test(char)) {
        charCounts[char] = (charCounts[char] || 0) + 1;
      }
    }
    const maxEntry = Object.entries(charCounts).sort((a, b) => b[1] - a[1])[0];
    if (maxEntry && maxEntry[1] / charLen > 0.45) {
      return {
        isInvalid: true,
        score: 0,
        quality: 'Fundamentally Incorrect',
        feedback: `The submitted text contains repetitive character spam dominated by '${maxEntry[0]}'. Judges cannot evaluate this as an answer.`,
        missingInfo: 'Substantive technical answer.',
        proTip:
          'Explain your design trade-offs and implementation using standard terminology.',
        misconceptions: 'Character repetition spam.',
      };
    }
  }

  // 3. Obvious keyboard mashing patterns
  for (const pat of KEYBOARD_MASH_PATTERNS) {
    if (pat.test(lower)) {
      return {
        isInvalid: true,
        score: 0,
        quality: 'Fundamentally Incorrect',
        feedback:
          'Your response appears to be random keyboard mashing without technical meaning.',
        missingInfo: 'Real technical substance.',
        proTip:
          'Address the question directly with concrete frameworks, data structures, or APIs used in your project.',
        misconceptions: 'Random keystrokes.',
      };
    }
  }

  // 4. Long gibberish strings with no vowels or impossible consonant clusters
  for (const word of words) {
    if (word.length >= 10) {
      const vowels = (word.match(/[aeiouy]/g) || []).length;
      const isKnownTech =
        /(postgresql|javascript|typescript|kubernetes|blockchain)/i.test(word);
      if (vowels <= 1 && !isKnownTech) {
        return {
          isInvalid: true,
          score: 0,
          quality: 'Fundamentally Incorrect',
          feedback:
            'Your answer contains unreadable or random text sequences with no recognizable words or technical concepts.',
          missingInfo: 'Clear architectural explanation.',
          proTip:
            'Focus on explaining the relevant system components, APIs, or database queries.',
          misconceptions: 'Gibberish sequence.',
        };
      }
    }
  }

  return { isInvalid: false };
}

async function callBackend(action, payload = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...payload }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AWS API request failed: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'AWS backend returned an error.');
    }

    if (Array.isArray(data.result)) {
      return data.result.map((item) =>
        typeof item === 'object' && item !== null
          ? { ...item, isFallback: false }
          : item
      );
    }

    return {
      ...data.result,
      isFallback: false,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createLocalPitch(project = {}) {
  const title = project.title || 'Our product';
  const problem =
    project.problem || 'We are solving a meaningful problem for our audience.';
  const targetUsers = project.targetUsers || 'target users';
  const hackathonTheme = project.hackathonTheme || 'this challenge';
  const technologies = project.technologies || 'modern web and AI tooling';

  const formattedProblem = problem.trim().endsWith('.')
    ? problem.trim()
    : `${problem.trim()}.`;

  const formattedUsers = targetUsers.toLowerCase().includes('user')
    ? targetUsers
    : `${targetUsers} facing this bottleneck daily`;

  return {
    id: `pitch_${Date.now()}`,
    createdAt: new Date().toISOString(),
    isFallback: true,
    metadata: { ...project },
    sections: {
      problem: {
        title: '1. The Pain Point & Market Friction',
        content: `${formattedProblem} This disproportionately affects ${formattedUsers}, leading to wasted time, operational risks, and measurable inefficiency during critical moments.`,
        coachTip:
          'Judges judge problem clarity within 15 seconds. Keep quantitative impact front and center.',
      },
      solution: {
        title: '2. The Proposed Innovation',
        content: `${title} provides an automated, end-to-end workflow designed specifically for ${hackathonTheme}. Instead of manual overhead, it offers instant triage and context-aware resolution.`,
        coachTip:
          'Show why your approach is faster or cheaper, using evidence rather than unsupported claims.',
      },
      differentiator: {
        title: '3. Competitive Moat & Unfair Advantage',
        content: `While traditional alternatives rely on static dashboards or manual intervention, ${title} uses automated intelligent routing tailored to ${targetUsers}. We convert raw telemetry into actionable steps.`,
        coachTip:
          'State what competing solutions fail to do, and support the comparison with evidence.',
      },
      technicalApproach: {
        title: '4. Architecture & Technical Viability',
        content: `Built on a modular foundation using ${technologies}. The system separates real-time ingestion from asynchronous background processing to guarantee sub-second response times and resilient fallback.`,
        coachTip:
          'Clearly distinguish working prototype features from planned features.',
      },
      sixtySecondPitch: {
        title: '5. The 60-Second Verbal Script',
        content: `"Judges, ${problem.slice(
          0,
          105
        )}... That is why we built ${title}. Using ${
          technologies.split(/[,;]/)[0] || 'modern cloud technology'
        }, we give ${targetUsers} the power to resolve incidents in real time. We built a working prototype during this hackathon, and here is how it works live today."`,
        coachTip:
          'Rehearse this in 45–50 seconds and leave room for judge follow-ups.',
      },
    },
  };
}

export function createLocalIdeaReview(project = {}) {
  const critiques = [];
  const strengths = [];
  let score = 70;

  if (!project.problem || project.problem.trim().length < 40) {
    critiques.push({
      category: 'Problem Definition',
      severity: 'high',
      message:
        'Your problem statement lacks concrete metrics or a clear cost of inaction. Add evidence about the time, money, or frequency involved.',
    });
    score -= 15;
  } else {
    strengths.push('Problem statement provides clear friction and impact context.');
    score += 8;
  }

  if (!project.targetUsers || project.targetUsers.trim().length < 15) {
    critiques.push({
      category: 'Audience Specificity',
      severity: 'medium',
      message:
        'Narrow your target audience to a specific beachhead persona rather than an overly broad group.',
    });
    score -= 10;
  } else {
    strengths.push('Target users have a defined persona and operating context.');
    score += 7;
  }

  const techCount = (project.technologies || '')
    .split(/[,;+]/)
    .filter((t) => t.trim().length > 0).length;

  if (techCount < 2) {
    critiques.push({
      category: 'Tech Stack Detail',
      severity: 'medium',
      message:
        'List at least two concrete libraries, databases, or APIs so judges can evaluate architectural feasibility.',
    });
    score -= 10;
  } else {
    strengths.push('Solid architectural stack with identifiable components.');
    score += 10;
  }

  return {
    score: Math.min(Math.max(score, 35), 96),
    strengths,
    critiques,
    suggestions: [
      'Prepare a 10-second failure contingency: What happens if your main API limits out during live judging?',
      'Add a "Why Now?" catalyst: Explain what recent API, hardware, or model release made this possible.',
      'Highlight what works live in the demo today versus roadmap items.',
    ],
    isFallback: true,
  };
}

export function createLocalJudgeQuestions(project = {}) {
  const title = project.title || 'your project';
  const problem = project.problem || 'the problem you are solving';
  const users = project.targetUsers || 'your target users';
  const techRaw = String(project.technologies || '');
  const techLower = techRaw.toLowerCase();

  const questions = [];

  // Question 1: Technical Feasibility tailored to actual stack
  if (techLower.includes('bluetooth') || techLower.includes('hardware')) {
    questions.push({
      id: `technical-${Date.now()}-1`,
      question: `For ${title}, Web Bluetooth connections can drop or face browser permission hurdles. How does your architecture handle GATT disconnects and background telemetry loss?`,
      aspect: 'Technical Feasibility',
      difficulty: 'Hard',
    });
  } else if (techLower.includes('websocket') || techLower.includes('socket')) {
    questions.push({
      id: `technical-${Date.now()}-1`,
      question: `How does ${title} manage WebSocket connection limits, state synchronization across distributed instances, and reconnect storms after a network drop?`,
      aspect: 'Technical Feasibility',
      difficulty: 'Hard',
    });
  } else if (techLower.includes('lambda') || techLower.includes('serverless')) {
    questions.push({
      id: `technical-${Date.now()}-1`,
      question: `For ${title}, how do you manage AWS Lambda cold starts and database connection pool exhaustion when traffic spikes concurrently?`,
      aspect: 'Technical Feasibility',
      difficulty: 'Hard',
    });
  } else if (techLower.includes('postgis') || techLower.includes('geospatial')) {
    questions.push({
      id: `technical-${Date.now()}-1`,
      question: `How does your PostGIS spatial indexing perform under dense concurrent beacon updates, and how do you prevent geographic query bottlenecks?`,
      aspect: 'Technical Feasibility',
      difficulty: 'Hard',
    });
  } else {
    questions.push({
      id: `technical-${Date.now()}-1`,
      question: `For ${title}, what specific bottleneck in your stack (${techRaw || 'APIs and database'}) will fail first under heavy load, and how do you recover gracefully?`,
      aspect: 'Technical Feasibility',
      difficulty: 'Hard',
    });
  }

  // Question 2: Competitive Moat & Differentiation
  questions.push({
    id: `differentiation-${Date.now()}-2`,
    question: `Why would ${users} choose ${title} over their existing workflow or a simple feature update from incumbents? What is your defensible moat?`,
    aspect: 'Competitive Moat',
    difficulty: 'Hard',
  });

  // Question 3: Engineering Execution & Trade-offs
  questions.push({
    id: `execution-${Date.now()}-3`,
    question: `Which specific part of your engineering pipeline was hardest to implement during the hackathon, what failed initially, and what trade-off did you make?`,
    aspect: 'Engineering Execution',
    difficulty: 'Medium',
  });

  // Question 4: User Validation & Adoption
  questions.push({
    id: `validation-${Date.now()}-4`,
    question: `How did you validate that ${users} genuinely experience "${problem}" and would adopt this solution rather than sticking to workarounds?`,
    aspect: 'User Validation',
    difficulty: 'Hard',
  });

  return questions.map((q) => ({ ...q, isFallback: true }));
}

export function createLocalAnswerEvaluation(question, answer) {
  // 1. Deterministic validation for non-answers and nonsense
  const check = detectNonsenseOrNonAnswer(answer);
  if (check.isInvalid) {
    return {
      question,
      quality: check.quality,
      score: check.score,
      feedback: check.feedback,
      missingInfo: check.missingInfo,
      proTip: check.proTip,
      misconceptions: check.misconceptions,
      rubricBreakdown: {
        technicalCorrectness: 0,
        relevance: 0,
        evidence: 0,
        completeness: 0,
        clarity: 0,
      },
      isFallback: true,
    };
  }

  const text = String(answer || '').trim();
  const lower = text.toLowerCase();
  const words = text ? text.split(/\s+/).length : 0;

  // 2. Explicit false claims check
  const containsFalseReactClaim =
    lower.includes('react automatically scales the backend') ||
    lower.includes('guarantees the app works without internet') ||
    lower.includes('guarantees the app works even without internet') ||
    (lower.includes('react') && lower.includes('scales the backend'));

  if (containsFalseReactClaim) {
    return {
      question,
      quality: 'Fundamentally Incorrect',
      score: 15,
      feedback:
        'This answer makes fundamentally incorrect technical claims. React is a client-side UI library; it does not scale backend servers, and web applications do not automatically work offline without explicit service workers, caching, or IndexedDB storage.',
      missingInfo:
        'Accurate separation of frontend rendering from backend scaling and offline persistence.',
      proTip:
        'Describe only mechanisms your architecture actually implements (e.g. AWS Auto Scaling groups, Redis caches, or Service Worker sync).',
      misconceptions:
        'Claiming React scales backend infrastructure or automatically guarantees offline availability.',
      rubricBreakdown: {
        technicalCorrectness: 2,
        relevance: 6,
        evidence: 3,
        completeness: 2,
        clarity: 2,
      },
      isFallback: true,
    };
  }

  // 3. Honest admission of uncertainty with reasoning or plan
  const admitsUncertainty =
    lower.includes("don't know") ||
    lower.includes('not sure') ||
    lower.includes("haven't tested") ||
    lower.includes('not yet benchmarked');

  const hasReasoningOrPlan =
    lower.includes('plan to') ||
    lower.includes('benchmark') ||
    lower.includes('will use') ||
    lower.includes('bottleneck') ||
    lower.includes('because');

  if (admitsUncertainty && hasReasoningOrPlan && words >= 10) {
    return {
      question,
      quality: 'Partially Correct',
      score: 55,
      feedback:
        'Honest and realistic response. You correctly acknowledge untested boundaries while presenting a sound engineering investigation plan.',
      missingInfo:
        'Actual empirical benchmarks or load test data from the working prototype.',
      proTip:
        'Run a quick 5-minute load test using k6 or Artillery before final judging so you can cite real numbers.',
      misconceptions: null,
      rubricBreakdown: {
        technicalCorrectness: 18,
        relevance: 16,
        evidence: 10,
        completeness: 6,
        clarity: 5,
      },
      isFallback: true,
    };
  }

  // 4. Concrete technical keywords check
  const hasConcreteTechKeywords =
    lower.includes('indexeddb') ||
    lower.includes('backoff') ||
    lower.includes('redis') ||
    lower.includes('cache') ||
    lower.includes('postgis') ||
    lower.includes('websocket') ||
    lower.includes('circuit breaker') ||
    lower.includes('timeout') ||
    lower.includes('retry') ||
    lower.includes('queue') ||
    lower.includes('concurrency');

  const hasTradeOffs =
    lower.includes('trade-off') ||
    lower.includes('limitation') ||
    lower.includes('however') ||
    lower.includes('mitigate') ||
    lower.includes('failover') ||
    lower.includes('latency') ||
    lower.includes('consistency');

  // Detailed, technically thorough answer with trade-offs
  if (words >= 25 && hasConcreteTechKeywords && hasTradeOffs) {
    return {
      question,
      quality: 'Excellent',
      score: 90,
      feedback:
        'Comprehensive, mature technical response that addresses architecture, specific mechanisms, and realistic operational trade-offs.',
      missingInfo:
        'Minor: live test metrics under peak hackathon concurrency.',
      proTip:
        'Rehearse delivering this concisely in under 45 seconds during live judging.',
      misconceptions: null,
      rubricBreakdown: {
        technicalCorrectness: 28,
        relevance: 23,
        evidence: 18,
        completeness: 13,
        clarity: 8,
      },
      isFallback: true,
    };
  }

  // Short, concise, technically correct answer
  if (hasConcreteTechKeywords && words >= 8 && words <= 35) {
    return {
      question,
      quality: 'Good',
      score: 82,
      feedback:
        'Direct, technically sound answer. You cite concrete technical mechanisms without wasting time on fluff.',
      missingInfo:
        'Specific failure thresholds (e.g. max retry attempts, TTL, or timeout limits).',
      proTip:
        'Add one numerical threshold (e.g., "3 retries with 500ms exponential jitter") to make it bulletproof.',
      misconceptions: null,
      rubricBreakdown: {
        technicalCorrectness: 26,
        relevance: 22,
        evidence: 16,
        completeness: 10,
        clarity: 8,
      },
      isFallback: true,
    };
  }

  // Detailed technical answer without explicit trade-offs
  if (words >= 35 && hasConcreteTechKeywords) {
    return {
      question,
      quality: 'Good',
      score: 80,
      feedback:
        'Detailed technical explanation covering relevant architectural components.',
      missingInfo:
        'Explicit discussion of system failure modes and trade-offs.',
      proTip:
        'Acknowledge system bottlenecks or failure recovery modes to demonstrate architectural maturity.',
      misconceptions: null,
      rubricBreakdown: {
        technicalCorrectness: 25,
        relevance: 22,
        evidence: 17,
        completeness: 8,
        clarity: 8,
      },
      isFallback: true,
    };
  }

  // 6. Generic or brief response
  if (words < 12) {
    return {
      question,
      quality: 'Weak',
      score: 35,
      feedback:
        'The answer is too brief to demonstrate technical competence. Judges need to hear specific architectural mechanisms and design choices.',
      missingInfo:
        'Concrete technologies, protocols, or failure recovery steps.',
      proTip:
        'Name the specific library, database, or API endpoint responsible and explain how it handles failures.',
      misconceptions: null,
      rubricBreakdown: {
        technicalCorrectness: 10,
        relevance: 12,
        evidence: 5,
        completeness: 4,
        clarity: 4,
      },
      isFallback: true,
    };
  }

  return {
    question,
    quality: 'Partially Correct',
    score: 55,
    feedback:
      'Reasonable general response, but lacks specific technical depth, metrics, or concrete component names.',
    missingInfo:
      'Specific implementation details and failure handling strategies.',
    proTip:
      'Ground your answer in your actual codebase by mentioning exact components and error-handling routines.',
    misconceptions: null,
    rubricBreakdown: {
      technicalCorrectness: 16,
      relevance: 16,
      evidence: 10,
      completeness: 7,
      clarity: 6,
    },
    isFallback: true,
  };
}

export const coachingEngine = {
  isDemoEngine: false,

  async generatePitch(project = {}) {
    try {
      const result = await callBackend('generatePitch', { project });
      return {
        ...result,
        isFallback: false,
        createdAt: result.createdAt || new Date().toISOString(),
        metadata: result.metadata || { ...project },
      };
    } catch (error) {
      console.warn('AWS pitch generation failed; using local fallback:', error);
      await delay(400);
      return createLocalPitch(project);
    }
  },

  async improveIdea(project = {}) {
    try {
      const result = await callBackend('improveIdea', { project });
      return {
        ...result,
        isFallback: false,
      };
    } catch (error) {
      console.warn('AWS idea review failed; using local fallback:', error);
      await delay(350);
      return createLocalIdeaReview(project);
    }
  },

  async getInitialJudgeQuestions(project = {}) {
    try {
      const result = await callBackend('getInitialJudgeQuestions', {
        project,
      });

      const questions = Array.isArray(result)
        ? result
        : result?.questions;

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('The backend returned no judge questions.');
      }

      return questions.map((item, index) => ({
        ...item,
        id: item.id || `judge-${Date.now()}-${index}`,
        isFallback: false,
      }));
    } catch (error) {
      console.warn(
        'AWS judge-question generation failed; using project-specific local fallback:',
        error
      );
      return createLocalJudgeQuestions(project);
    }
  },

  async evaluateJudgeAnswer(question, answer) {
    try {
      const result = await callBackend('evaluateJudgeAnswer', {
        question,
        answer,
      });
      return {
        ...result,
        isFallback: false,
      };
    } catch (error) {
      console.warn(
        'AWS answer evaluation failed; using local fallback evaluator:',
        error
      );
      await delay(250);
      return createLocalAnswerEvaluation(question, answer);
    }
  },
};