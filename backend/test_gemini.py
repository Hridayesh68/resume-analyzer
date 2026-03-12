
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

def test_gemini():
    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash-latest", generation_config={"response_mime_type": "application/json"})
        prompt = "Analyze this fake resume text and return JSON: 'John Doe, Python Developer, 5 years experience at Google. Skill: Python, React.'"
        
        print("Sending request to Gemini...")
        result = model.generate_content(prompt)
        print("Response received.")
        print("Raw Content:", result.text)
        
        data = json.loads(result.text)
        print("Successfully parsed JSON.")
        return data
    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    test_gemini()
