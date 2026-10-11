import json
import os
import re
import urllib.request
import urllib.error
from datetime import datetime, timezone

GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    + GEMINI_MODEL
    + ":generateContent"
)

# Common non-answer phrases when answer consists entirely/mostly of them
NON_ANSWER_PATTERNS = [
    r"^(idk|i\s*don'?t\s*know|dont\s*know|no\s*idea|have\s*no\s*idea|dunno)$",
    r"^(not\s*sure|n/?a|none|no\s*clue|skip|pass|who\s*knows|can'?t\s*answer|cannot\s*answer)$",
    r"^(i\s*have\s*no\s*clue|i\s*have\s*no\s*idea|no\s*answer|nothing|not\s*applicable)$",
]

# Obvious keyboard mash sequences
KEYBOARD_MASH_PATTERNS = [
    r"^(asdf|asdfg|asdfgh|asdfghjkl|qwerty|qwertyuiop|zxcvbnm|lkjhgfdsa|poiuytrewq)+$",
    r"^(qaz|wsx|edc|rfv|tgb|yhn|ujm|ikol|qazwsx|wsxedc|edcrfv|rfvtgb|tgbzhn|yhnujm|ujmikol)+$",
]


def response(status_code, payload):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(payload),
    }


def call_gemini(prompt, system_instruction=None):
    api_key = os.environ.get("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured.")

    sys_text = system_instruction or (
        "You are PitchPerfect, an honest, supportive, and demanding "
        "hackathon pitch coach. Be specific, constructive, and "
        "realistic. Never invent user research, metrics, completed "
        "features, test results, or technical capabilities. Clearly "
        "distinguish implemented features from plans. Follow the "
        "requested JSON structure exactly."
    )

    payload = {
        "systemInstruction": {
            "parts": [{"text": sys_text}]
        },
        "contents": [{
            "role": "user",
            "parts": [{"text": prompt}],
        }],
        "generationConfig": {
            "temperature": 0.2,
            "responseMimeType": "application/json",
            "thinkingConfig": {"thinkingBudget": 0},
        },
    }

    request = urllib.request.Request(
        GEMINI_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
        method="POST",
    )

    try:
        # 18-second timeout leaves cushion before Lambda's 30s limit
        with urllib.request.urlopen(request, timeout=18) as result:
            data = json.loads(result.read().decode("utf-8"))

    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8", errors="replace")
        print("Gemini HTTP error:", error.code, details[:1000])
        raise RuntimeError(
            f"Gemini API returned HTTP {error.code}"
        ) from None

    except urllib.error.URLError as error:
        print("Gemini connection error:", str(error.reason))
        raise RuntimeError(
            "Could not connect to Gemini API."
        ) from None

    except TimeoutError:
        print("Gemini connection timed out.")
        raise RuntimeError(
            "The AI request timed out."
        ) from None

    try:
        text = "".join(
            part["text"]
            for part in data["candidates"][0]["content"]["parts"]
            if "text" in part
        )
        return json.loads(text)

    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
        print("Unexpected Gemini response format:", json.dumps(data)[:1000])
        raise RuntimeError(
            "Gemini returned an unexpected response format."
        ) from None


def project_context(project):
    return json.dumps(project or {}, ensure_ascii=False)


def detect_nonsense_or_non_answer(answer_text):
    """
    Deterministic answer-quality validator.
    Detects empty strings, explicit non-answers, repeated character spam,
    and keyboard mashing before invoking the LLM.
    Returns (is_invalid, score, quality, feedback, pro_tip, missing_info).
    """
    cleaned = (answer_text or "").strip()

    if not cleaned:
        return (
            True,
            0,
            "Fundamentally Incorrect",
            "No answer was provided. Judges expect a direct, substantive technical response.",
            "Answer the judge's question directly by describing the relevant component or architectural mechanism.",
            "Complete answer addressing the question.",
        )

    lower = cleaned.lower()
    words = re.findall(r"\b[\w'-]+\b", lower)
    char_len = len(cleaned)

    # 1. Explicit non-answers (e.g. 'idk', 'I don't know', 'no idea', etc.)
    # Check if the text matches explicit non-answer patterns
    for pat in NON_ANSWER_PATTERNS:
        if re.match(pat, lower):
            return (
                True,
                0,
                "Fundamentally Incorrect",
                "Your response is an explicit admission of having no answer ('" + cleaned + "'). While honest, it provides zero technical substance or reasoning for judges to evaluate.",
                "If you haven't implemented this aspect yet, describe your planned architecture or test approach instead of simply saying you don't know.",
                "Substantive technical explanation or realistic implementation roadmap.",
            )

    # If it starts with 'i don't know' or 'idk' with fewer than 6 words total and no technical details
    if len(words) <= 5 and any(lower.startswith(p) for p in ["idk", "i don't know", "i dont know", "no idea", "not sure"]):
        return (
            True,
            0,
            "Fundamentally Incorrect",
            "Your answer is essentially an admission of uncertainty without any supporting explanation or architectural plan.",
            "Acknowledge what is built today, then specify your exact next technical step or benchmark.",
            "Technical details or investigation plan.",
        )

    # 2. Repeated character spam (e.g. 'aaaaaaaaaaaaaaaaaaaa', 'dddddddddddddddddddddddd')
    # Check for 5 or more identical consecutive characters
    if re.search(r"(.)\1{4,}", lower):
        # Allow legitimate technical repeats like '...' or '---' if not alpha spam
        if re.search(r"[a-z0-9]([a-z0-9])\1{4,}", lower):
            return (
                True,
                0,
                "Fundamentally Incorrect",
                "Your answer contains repeated character sequences ('" + cleaned[:30] + "...') with no meaningful technical content.",
                "Provide a real technical explanation using clear technical terms.",
                "Coherent technical explanation.",
            )

    # Check if a single character dominates > 45% of an answer of length >= 12
    if char_len >= 12:
        char_counts = {}
        for c in lower:
            if c.isalnum():
                char_counts[c] = char_counts.get(c, 0) + 1
        if char_counts:
            max_char, count = max(char_counts.items(), key=lambda item: item[1])
            if count / float(char_len) > 0.45:
                return (
                    True,
                    0,
                    "Fundamentally Incorrect",
                    f"The submitted text contains repetitive character spam dominated by '{max_char}'. Judges cannot evaluate this as an answer.",
                    "Explain your design trade-offs and implementation using standard terminology.",
                    "Substantive technical answer.",
                )

    # 3. Obvious keyboard mashing patterns (home-row or sequence mash)
    for pat in KEYBOARD_MASH_PATTERNS:
        if re.match(pat, lower):
            return (
                True,
                0,
                "Fundamentally Incorrect",
                "Your response appears to be random keyboard mashing without technical meaning.",
                "Address the question directly with concrete frameworks, data structures, or APIs used in your project.",
                "Real technical substance.",
            )

    # 4. Long gibberish strings with no vowels or impossible consonant clusters
    # E.g. 'sdjbhcdncdddddddddddddddddddddddd' or 'qwrtypfg'
    for w in words:
        if len(w) >= 10:
            vowels = len(re.findall(r"[aeiouy]", w))
            # Known tech exceptions with low vowels: none exceed 10 chars with < 2 vowels
            if vowels <= 1 and not re.search(r"(postgresql|javascript|typescript|kubernetes|blockchain)", w):
                return (
                    True,
                    0,
                    "Fundamentally Incorrect",
                    "Your answer contains unreadable or random text sequences with no recognizable words or technical concepts.",
                    "Focus on explaining the relevant system components, APIs, or database queries.",
                    "Clear architectural explanation.",
                )

    return (False, 0, "", "", "", "")


def generate_pitch(project):
    prompt = f"""
Create a structured, evidence-based hackathon pitch for this project.

PROJECT DETAILS:
{project_context(project)}

Return valid JSON with this exact structure:
{{
  "metadata": {{}},
  "sections": {{
    "problem": {{
      "title": "1. The Pain Point & Market Friction",
      "content": "...",
      "coachTip": "..."
    }},
    "solution": {{
      "title": "2. The Proposed Innovation",
      "content": "...",
      "coachTip": "..."
    }},
    "differentiator": {{
      "title": "3. Competitive Moat & Unfair Advantage",
      "content": "...",
      "coachTip": "..."
    }},
    "technicalApproach": {{
      "title": "4. Architecture & Technical Viability",
      "content": "...",
      "coachTip": "..."
    }},
    "sixtySecondPitch": {{
      "title": "5. The 60-Second Verbal Script",
      "content": "...",
      "coachTip": "..."
    }}
  }}
}}

Requirements:
- Ground every section in the provided project details: title, problem, target users, and technologies.
- Address the actual technical architecture instead of generic cloud filler.
- Distinguish clearly between prototype capabilities built during the hackathon and roadmap features.
- Keep the sixtySecondPitch natural, punchy, and deliverable in 45-60 seconds.
- Provide tactical, high-value coach tips for each section.
"""

    result = call_gemini(prompt)
    sections = result.get("sections", {})

    required = [
        "problem",
        "solution",
        "differentiator",
        "technicalApproach",
        "sixtySecondPitch",
    ]

    for key in required:
        section = sections.get(key)
        if not isinstance(section, dict):
            raise RuntimeError(f"Gemini returned an incomplete pitch section: {key}")

        if not isinstance(section.get("content"), str):
            raise RuntimeError(f"Gemini returned invalid pitch content: {key}")

        section.setdefault("title", key)
        section.setdefault("coachTip", "")

    return {
        "id": "pitch_" + datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f"),
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "metadata": result.get("metadata") or project,
        "sections": sections,
    }


def improve_idea(project):
    prompt = f"""
Review this hackathon idea critically and constructively.

PROJECT DETAILS:
{project_context(project)}

Return valid JSON with this structure:
{{
  "score": 0,
  "strengths": [
    "A specific strength and why it matters"
  ],
  "critiques": [
    {{
      "category": "Problem Definition",
      "severity": "high",
      "message": "A specific weakness and why it matters"
    }}
  ],
  "suggestions": [
    "A concrete next step"
  ]
}}

Scoring & Evaluation Requirements:
- Score from 0 to 100 based on concrete problem clarity, beachhead persona, technical feasibility, and differentiation.
- Identify missing metrics, unvalidated assumptions, and potential bottlenecks.
- Never inflate scores; judge as a seasoned hackathon evaluator.
- Provide at least 2 distinct strengths, 2 specific critiques, and 3 actionable suggestions.
"""

    result = call_gemini(prompt)

    if not isinstance(result.get("score"), (int, float)):
        raise RuntimeError("Gemini returned an invalid idea score.")

    result["score"] = max(0, min(100, int(round(result["score"]))))
    result["strengths"] = result.get("strengths") or []
    result["critiques"] = result.get("critiques") or []
    result["suggestions"] = result.get("suggestions") or []

    return result


def initial_judge_questions(project):
    title = project.get("title") or "the project"
    problem = project.get("problem") or "the problem"
    technologies = project.get("technologies") or "the technical stack"
    target_users = project.get("targetUsers") or "the target audience"
    theme = project.get("hackathonTheme") or "the hackathon challenge"

    prompt = f"""
You are an expert, skeptical hackathon judge evaluating this project:
- Title: {title}
- Problem: {problem}
- Target Users: {target_users}
- Theme: {theme}
- Technologies & Stack: {technologies}

Generate exactly four challenging, project-specific questions covering these distinct areas:
1. Technical Feasibility & Architecture: Challenge how {technologies} specifically handles concurrency, state, bottlenecks, or failure modes.
2. Competitive Moat & Differentiation: Challenge why existing incumbents or open-source tools cannot solve this immediately for {target_users}.
3. Engineering Execution & Failure Handling: Ask about the hardest implementation roadblock, offline/network degradation, or data consistency.
4. User Validation & Adoption: Challenge how the team validated that {target_users} genuinely want this solution over existing workflows.

Return valid JSON with this structure:
{{
  "questions": [
    {{
      "id": "q1",
      "question": "A concrete question deeply specific to {technologies} and {title}",
      "aspect": "Technical Feasibility",
      "difficulty": "Hard"
    }},
    {{
      "id": "q2",
      "question": "A concrete question on differentiation vs incumbents",
      "aspect": "Competitive Moat",
      "difficulty": "Hard"
    }},
    {{
      "id": "q3",
      "question": "A concrete question on engineering trade-offs and failure handling",
      "aspect": "Engineering Execution",
      "difficulty": "Medium"
    }},
    {{
      "id": "q4",
      "question": "A concrete question on user validation and adoption",
      "aspect": "User Validation",
      "difficulty": "Hard"
    }}
  ]
}}

Requirements:
- Do not repeat generic boilerplate templates. Mention the actual technologies ({technologies}) and actual problem.
- Do not assume planned features are already implemented.
- Each question must be distinct and provoke technical depth.
"""

    result = call_gemini(prompt)
    questions = result.get("questions")

    if not isinstance(questions, list) or len(questions) != 4:
        raise RuntimeError("Gemini did not return exactly four judge questions.")

    for index, q in enumerate(questions):
        if not isinstance(q, dict) or not isinstance(q.get("question"), str):
            raise RuntimeError("Gemini returned an invalid judge question.")

        q.setdefault("id", f"q{index + 1}")
        q.setdefault("aspect", "General")
        q.setdefault("difficulty", "Hard")

    return questions


def evaluate_answer(question, answer):
    # Step 1: Deterministic check for non-answers, gibberish, and spam
    is_invalid, zero_score, zero_quality, zero_fb, zero_tip, zero_missing = detect_nonsense_or_non_answer(answer)
    if is_invalid:
        return {
            "question": question,
            "quality": zero_quality,
            "score": zero_score,
            "feedback": zero_fb,
            "missingInfo": zero_missing,
            "proTip": zero_tip,
            "misconceptions": "None detected; answer lacked substantive content.",
            "rubricBreakdown": {
                "technicalCorrectness": 0,
                "relevance": 0,
                "evidence": 0,
                "completeness": 0,
                "clarity": 0,
            },
        }

    # Step 2: Demanding Honest Judge Evaluation with Structured Rubric
    prompt = f"""
You are PitchPerfect's Honest Judge: a demanding, fair, technically rigorous hackathon judge.

JUDGE QUESTION:
{question}

TEAM MEMBER'S ANSWER:
{answer}

PRIORITY RULES:
1. Technical correctness is the #1 priority (30% weight). Factual errors, impossible claims, or conflating frontend with backend must be heavily penalized.
2. A short, crisp, technically correct answer must NOT be penalized for length—give it a high score if accurate!
3. Long answers must NOT receive high scores merely for verbosity or jargon.
4. Explicit false claims (e.g. claiming React scales the backend or guarantees offline operation without service workers/caching, or inventing imaginary protocols) must result in a score penalty and be explicitly called out in 'misconceptions'.
5. An honest admission of uncertainty (e.g., 'We haven't load-tested beyond 100 RPS yet, but our bottleneck will likely be DB connections so we plan to add PgBouncer') is rewarded with partial credit (40-60) if accompanied by sound reasoning or an investigation plan.
6. Unsupported claims, invented benchmarks, or unproven assumptions must be penalized.

SCORING RUBRIC (TOTAL 100 POINTS):
- technicalCorrectness (0-30 points): Are the technical claims accurate, feasible, and sound?
- relevance (0-25 points): Does the answer directly address the specific question asked?
- evidence (0-20 points): Are concrete architectural components, libraries, APIs, or metrics cited?
- completeness (0-15 points): Are edge cases, trade-offs, and failure handling addressed?
- clarity (0-10 points): Is the communication crisp, structured, and free of fluff?

Return valid JSON with this exact schema:
{{
  "score": 0,
  "rubricBreakdown": {{
    "technicalCorrectness": 0,
    "relevance": 0,
    "evidence": 0,
    "completeness": 0,
    "clarity": 0
  }},
  "feedback": "Specific explanation of what was technically sound or flawed in the response.",
  "missingInfo": "Critical missing details, unaddressed trade-offs, or unsupported assumptions.",
  "proTip": "One actionable, concrete engineering improvement.",
  "misconceptions": "Specific technical misconception identified, or null if none."
}}
"""

    result = call_gemini(prompt)

    # Validate and clamp score
    rubric = result.get("rubricBreakdown") or {}
    tc = max(0, min(30, int(round(rubric.get("technicalCorrectness", 0)))))
    rel = max(0, min(25, int(round(rubric.get("relevance", 0)))))
    ev = max(0, min(20, int(round(rubric.get("evidence", 0)))))
    comp = max(0, min(15, int(round(rubric.get("completeness", 0)))))
    clar = max(0, min(10, int(round(rubric.get("clarity", 0)))))

    calculated_score = tc + rel + ev + comp + clar
    score = max(0, min(100, calculated_score))

    # Determine synchronized quality label
    if score >= 85:
        quality = "Excellent"
    elif score >= 70:
        quality = "Good"
    elif score >= 50:
        quality = "Partially Correct"
    elif score >= 30:
        quality = "Weak"
    else:
        quality = "Fundamentally Incorrect"

    feedback = result.get("feedback") or "Provide a clear, evidence-based technical response."
    missing_info = result.get("missingInfo") or "Edge cases and failure recovery mechanisms."
    pro_tip = result.get("proTip") or "Cite specific libraries, error handlers, and benchmarks used in your demo."
    misconceptions = result.get("misconceptions")

    return {
        "question": question,
        "quality": quality,
        "score": score,
        "feedback": feedback,
        "missingInfo": missing_info,
        "proTip": pro_tip,
        "misconceptions": misconceptions,
        "rubricBreakdown": {
            "technicalCorrectness": tc,
            "relevance": rel,
            "evidence": ev,
            "completeness": comp,
            "clarity": clar,
        },
    }


def lambda_handler(event, context):
    # Support both HTTP API (payload 2.0) and REST API (payload 1.0)
    method = (
        event.get("requestContext", {}).get("http", {}).get("method")
        or event.get("httpMethod")
    )

    if method == "OPTIONS":
        return response(200, {"success": True})

    try:
        raw_body = event.get("body") or "{}"
        if isinstance(raw_body, str):
            body = json.loads(raw_body)
        else:
            body = raw_body

        if not isinstance(body, dict):
            return response(400, {
                "success": False,
                "message": "The request body must be a JSON object.",
            })

        action = body.get("action")
        project = body.get("project") or {}

        if not isinstance(project, dict):
            return response(400, {
                "success": False,
                "message": "The project field must be an object.",
            })

        if action == "generatePitch":
            result = generate_pitch(project)

        elif action == "improveIdea":
            result = improve_idea(project)

        elif action == "getInitialJudgeQuestions":
            result = initial_judge_questions(project)

        elif action == "evaluateJudgeAnswer":
            question = body.get("question", "")
            answer = body.get("answer", "")

            if not isinstance(question, str) or not isinstance(answer, str):
                return response(400, {
                    "success": False,
                    "message": "Question and answer must be strings.",
                })

            result = evaluate_answer(question, answer)

        else:
            return response(400, {
                "success": False,
                "message": f"Unknown action '{action}'. Supported actions: generatePitch, improveIdea, getInitialJudgeQuestions, evaluateJudgeAnswer.",
            })

        return response(200, {
            "success": True,
            "action": action,
            "result": result,
        })

    except json.JSONDecodeError:
        return response(400, {
            "success": False,
            "message": "The request body contains invalid JSON.",
        })

    except Exception as error:
        print("PitchPerfect error:", str(error))
        return response(500, {
            "success": False,
            "message": (
                str(error)
                if isinstance(error, RuntimeError)
                else "The AI request failed. Check the Lambda logs."
            ),
        })