
import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def diagnostic():
    print(f"Testing with API Key: {api_key[:4]}...{api_key[-4:]}")
    
    models_to_test = [
        "models/gemini-2.5-flash",
        "models/gemini-1.5-flash", 
        "models/gemini-1.5-flash-latest", 
        "models/gemini-pro"
    ]
    
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
    }

    for model_name in models_to_test:
        print(f"\n--- Testing Model: {model_name} ---")
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config={"response_mime_type": "application/json"},
                safety_settings=safety_settings
            )
            response = model.generate_content("Return a JSON object with 'status': 'ok'")
            print(f"✅ Success! Response: {response.text}")
            return # Stop after first success
        except Exception as e:
            print(f"❌ Failed: {e}")

if __name__ == "__main__":
    diagnostic()
