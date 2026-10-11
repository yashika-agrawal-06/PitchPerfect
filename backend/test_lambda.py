import json
import unittest
from unittest.mock import patch, MagicMock

import lambda_function


class TestNonsenseValidation(unittest.TestCase):
    def test_empty_and_whitespace(self):
        cases = ["", "   ", "\n\t  "]
        for c in cases:
            invalid, score, quality, fb, tip, missing = lambda_function.detect_nonsense_or_non_answer(c)
            self.assertTrue(invalid, f"Failed for '{c}'")
            self.assertEqual(score, 0)
            self.assertEqual(quality, "Fundamentally Incorrect")

    def test_explicit_non_answers(self):
        cases = ["idk", "IDK", "I don't know", "i dont know", "No idea", "have no idea", "dunno", "not sure"]
        for c in cases:
            invalid, score, quality, fb, tip, missing = lambda_function.detect_nonsense_or_non_answer(c)
            self.assertTrue(invalid, f"Failed for '{c}'")
            self.assertEqual(score, 0)
            self.assertEqual(quality, "Fundamentally Incorrect")
            self.assertTrue("explicit admission" in fb.lower() or "uncertainty" in fb.lower() or "no answer" in fb.lower())

    def test_repeated_characters_and_spam(self):
        cases = [
            "aaaaaaaaaaaaaaaaaaaa",
            "sdjbhcdncdddddddddddddddddddddddd",
            "zzzzzzzzzzzzzz",
            "11111111111111",
        ]
        for c in cases:
            invalid, score, quality, fb, tip, missing = lambda_function.detect_nonsense_or_non_answer(c)
            self.assertTrue(invalid, f"Failed for '{c}'")
            self.assertEqual(score, 0)
            self.assertEqual(quality, "Fundamentally Incorrect")

    def test_keyboard_mashing(self):
        cases = [
            "asdfghjkl",
            "asdfasdfasdf",
            "qwertyuiop",
            "zxcvbnm",
        ]
        for c in cases:
            invalid, score, quality, fb, tip, missing = lambda_function.detect_nonsense_or_non_answer(c)
            self.assertTrue(invalid, f"Failed for '{c}'")
            self.assertEqual(score, 0)
            self.assertEqual(quality, "Fundamentally Incorrect")

    def test_legitimate_answers_not_rejected_by_detector(self):
        legitimate = [
            "React renders the UI and communicates with FastAPI via REST endpoints.",
            "We handle offline by caching events in IndexedDB and replaying with exponential backoff.",
            "I don't know our peak RPS limit yet because we haven't load-tested, but our plan is to run k6 and add Redis caching if latency exceeds 200ms.",
            "PostgreSQL handles geospatial queries using PostGIS indices.",
        ]
        for c in legitimate:
            invalid, _, _, _, _, _ = lambda_function.detect_nonsense_or_non_answer(c)
            self.assertFalse(invalid, f"Legitimate answer falsely rejected: '{c}'")


class TestLambdaHandlerRouting(unittest.TestCase):
    def test_options_cors(self):
        event = {"requestContext": {"http": {"method": "OPTIONS"}}}
        res = lambda_function.lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        self.assertIn("Access-Control-Allow-Origin", res["headers"])

    def test_evaluate_judge_answer_non_answer_deterministic(self):
        event = {
            "requestContext": {"http": {"method": "POST"}},
            "body": json.dumps({
                "action": "evaluateJudgeAnswer",
                "question": "How do you scale?",
                "answer": "idk"
            })
        }
        res = lambda_function.lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        data = json.loads(res["body"])
        self.assertTrue(data["success"])
        self.assertEqual(data["result"]["score"], 0)
        self.assertEqual(data["result"]["quality"], "Fundamentally Incorrect")

    @patch("lambda_function.call_gemini")
    def test_evaluate_judge_answer_rubric_and_clamping(self, mock_gemini):
        mock_gemini.return_value = {
            "score": 88,
            "rubricBreakdown": {
                "technicalCorrectness": 28,
                "relevance": 23,
                "evidence": 18,
                "completeness": 12,
                "clarity": 9
            },
            "feedback": "Strong explanation of IndexedDB caching and backoff.",
            "missingInfo": "Conflict resolution strategy for concurrent writes.",
            "proTip": "Specify timestamp vs vector clock resolution.",
            "misconceptions": None
        }

        event = {
            "requestContext": {"http": {"method": "POST"}},
            "body": json.dumps({
                "action": "evaluateJudgeAnswer",
                "question": "How do you handle offline mode?",
                "answer": "We cache mutations in IndexedDB and sync when online."
            })
        }
        res = lambda_function.lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        data = json.loads(res["body"])
        self.assertEqual(data["result"]["score"], 90)
        self.assertEqual(data["result"]["quality"], "Excellent")
        self.assertEqual(data["result"]["rubricBreakdown"]["technicalCorrectness"], 28)

    @patch("lambda_function.call_gemini")
    def test_project_specific_judge_questions(self, mock_gemini):
        mock_gemini.return_value = {
            "questions": [
                {"id": "q1", "question": "How do you handle Web Bluetooth disconnections?", "aspect": "Technical Feasibility", "difficulty": "Hard"},
                {"id": "q2", "question": "Why would campus security adopt this over existing radios?", "aspect": "Competitive Moat", "difficulty": "Hard"},
                {"id": "q3", "question": "What happens if PostGIS spatial queries spike under load?", "aspect": "Engineering Execution", "difficulty": "Medium"},
                {"id": "q4", "question": "How did you validate response times with student responders?", "aspect": "User Validation", "difficulty": "Hard"}
            ]
        }

        event = {
            "requestContext": {"http": {"method": "POST"}},
            "body": json.dumps({
                "action": "getInitialJudgeQuestions",
                "project": {
                    "title": "PulseGuard",
                    "technologies": "React, Web Bluetooth, PostGIS",
                    "targetUsers": "Campus security and student paramedics"
                }
            })
        }
        res = lambda_function.lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        data = json.loads(res["body"])
        self.assertEqual(len(data["result"]), 4)
        self.assertEqual(data["result"][0]["id"], "q1")


if __name__ == "__main__":
    unittest.main()
