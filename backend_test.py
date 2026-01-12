import requests
import sys
import json
from datetime import datetime

class LuminaLearningAPITester:
    def __init__(self, base_url="https://smartquiz-67.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                    print(f"   Response keys: {list(result['response_data'].keys()) if isinstance(result['response_data'], dict) else 'Non-dict response'}")
                except:
                    result["response_data"] = response.text[:200]
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    result["error"] = error_data
                    print(f"   Error: {error_data}")
                except:
                    result["error"] = response.text[:200]
                    print(f"   Error: {response.text[:200]}")

            self.test_results.append(result)
            return success, result["response_data"]

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_generate_quiz(self):
        """Test quiz generation"""
        quiz_data = {
            "subject": "Basic Mathematics",
            "difficulty": "easy",
            "num_questions": 3
        }
        success, response = self.run_test(
            "Generate Quiz",
            "POST",
            "quiz/generate",
            200,
            data=quiz_data,
            timeout=60  # AI generation takes time
        )
        
        if success and response:
            # Validate quiz structure
            required_fields = ['id', 'subject', 'difficulty', 'questions', 'timestamp']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Missing fields in quiz response: {missing_fields}")
                return False, response
            
            # Validate questions structure
            if 'questions' in response and len(response['questions']) > 0:
                question = response['questions'][0]
                required_q_fields = ['question', 'options', 'correct_answer']
                missing_q_fields = [field for field in required_q_fields if field not in question]
                if missing_q_fields:
                    print(f"⚠️  Missing fields in question: {missing_q_fields}")
                    return False, response
                
                print(f"   Generated {len(response['questions'])} questions")
                print(f"   Sample question: {question['question'][:50]}...")
                return True, response
        
        return success, response

    def test_quiz_history(self):
        """Test quiz history retrieval"""
        return self.run_test("Quiz History", "GET", "quiz/history", 200)

    def test_study_explain(self):
        """Test study explanation"""
        study_data = {
            "concept": "What is gravity?"
        }
        success, response = self.run_test(
            "Study Explanation",
            "POST",
            "study/explain",
            200,
            data=study_data,
            timeout=60  # AI generation takes time
        )
        
        if success and response:
            required_fields = ['id', 'concept', 'explanation', 'timestamp']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Missing fields in study response: {missing_fields}")
                return False, response
            
            print(f"   Explanation length: {len(response.get('explanation', ''))} characters")
            print(f"   Explanation preview: {response.get('explanation', '')[:100]}...")
            
        return success, response

    def test_study_history(self):
        """Test study history retrieval"""
        return self.run_test("Study History", "GET", "study/history", 200)

    def test_translate_phrase(self):
        """Test phrase translation"""
        translation_data = {
            "phrase": "Break a leg",
            "source_lang": "English",
            "target_lang": "Spanish"
        }
        success, response = self.run_test(
            "Translate Phrase",
            "POST",
            "translate",
            200,
            data=translation_data,
            timeout=60  # AI generation takes time
        )
        
        if success and response:
            required_fields = ['id', 'phrase', 'source_lang', 'target_lang', 'translation', 'cultural_context', 'timestamp']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Missing fields in translation response: {missing_fields}")
                return False, response
            
            print(f"   Translation: {response.get('translation', '')}")
            print(f"   Cultural context length: {len(response.get('cultural_context', ''))} characters")
            
        return success, response

    def test_translation_history(self):
        """Test translation history retrieval"""
        return self.run_test("Translation History", "GET", "translate/history", 200)

    def test_progress_stats(self):
        """Test progress statistics"""
        success, response = self.run_test("Progress Stats", "GET", "progress", 200)
        
        if success and response:
            required_fields = ['total_quizzes', 'total_study_sessions', 'total_translations', 'recent_activities']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Missing fields in progress response: {missing_fields}")
                return False, response
            
            print(f"   Total quizzes: {response.get('total_quizzes', 0)}")
            print(f"   Total study sessions: {response.get('total_study_sessions', 0)}")
            print(f"   Total translations: {response.get('total_translations', 0)}")
            print(f"   Recent activities: {len(response.get('recent_activities', []))}")
            
        return success, response

def main():
    print("🚀 Starting Lumina Learning API Tests")
    print("=" * 50)
    
    tester = LuminaLearningAPITester()
    
    # Test basic connectivity first
    print("\n📡 Testing Basic Connectivity...")
    if not tester.test_root_endpoint()[0]:
        print("❌ Cannot connect to API. Stopping tests.")
        return 1
    
    # Test all endpoints
    print("\n🧪 Testing Core Features...")
    
    # Test quiz functionality
    print("\n📚 Testing Quiz Builder...")
    tester.test_generate_quiz()
    tester.test_quiz_history()
    
    # Test study functionality  
    print("\n🧠 Testing Study Buddy...")
    tester.test_study_explain()
    tester.test_study_history()
    
    # Test translation functionality
    print("\n🌍 Testing Language Tutor...")
    tester.test_translate_phrase()
    tester.test_translation_history()
    
    # Test progress tracking
    print("\n📊 Testing Progress Tracking...")
    tester.test_progress_stats()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    # Print detailed results
    print("\n📋 Detailed Test Results:")
    for result in tester.test_results:
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"   {status} {result['test_name']} ({result['method']} {result['endpoint']})")
        if not result["success"] and result["error"]:
            print(f"      Error: {result['error']}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    if success_rate < 70:
        print("⚠️  Low success rate - significant issues detected")
        return 1
    elif success_rate < 100:
        print("⚠️  Some tests failed - minor issues detected")
        return 1
    else:
        print("🎉 All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())