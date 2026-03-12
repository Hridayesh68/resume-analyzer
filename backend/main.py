# backend/main.py
"""
ELEVATECV NLP BACKEND (spaCy + TF-IDF)
Secure Gmail Email System + Resume Analysis
"""

import os
import shutil
import uuid
import re
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Email imports
from cryptography.fernet import Fernet
from dotenv import load_dotenv
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# NLP imports
from utils.text_extraction import extract_text_from_file
from utils.nlp_utils import normalize_text
import google.generativeai as genai
import json
import requests
import traceback

# ------------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# ------------------------------------------------------
load_dotenv()

# Setup logging to file
import logging
logging.basicConfig(filename='server_errors.log', level=logging.ERROR, 
                    format='%(asctime)s %(levelname)s:%(message)s')

YOUR_EMAIL = os.getenv("Email")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ------------------------------------------------------
# DECRYPT GMAIL APP PASSWORD
# ------------------------------------------------------
def get_decrypted_gmail_password():
    try:
        key = os.getenv("EMAIL_KEY")
        if not key:
            raise Exception("EMAIL_KEY missing from environment")

        key = key.encode()
        cipher = Fernet(key)

        with open("encrypted_password.bin", "rb") as f:
            encrypted_password = f.read()

        decrypted = cipher.decrypt(encrypted_password)
        return decrypted.decode()

    except Exception as e:
        print("Decryption Error:", e)
        raise Exception("Failed to decrypt Gmail App Password")


# ------------------------------------------------------
# CONTACT FORM SCHEMA
# ------------------------------------------------------
class ContactForm(BaseModel):
    name: str
    email: str
    message: str


# ------------------------------------------------------
# FASTAPI APP & CORS CONFIG
# ------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # In production change to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary file directory
UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

print("🔥 USING NLP BACKEND (spaCy + TF-IDF) 🔥")
print("RUNNING FROM:", os.path.abspath(__file__))


# ------------------------------------------------------
# ATS SCORING AUTOMATION
# ------------------------------------------------------
def _has_contact(entities: dict) -> float:
    """Return contact presence score: 1.0 if email+phone, 0.5 if one, 0 otherwise."""
    emails = entities.get("emails", []) if isinstance(entities, dict) else []
    phones = entities.get("phones", []) if isinstance(entities, dict) else []
    has_email = len(emails) > 0
    has_phone = len(phones) > 0
    if has_email and has_phone:
        return 1.0
    if has_email or has_phone:
        return 0.5
    return 0.0


def _education_score(text: str) -> float:
    """Simple education matching heuristics (bachelor/master/phd -> 1.0, diploma -> 0.6, none -> 0)."""
    t = text.lower()
    if re.search(r'\b(phd|doctorate)\b', t):
        return 1.0
    if re.search(r'\b(master|msc|m\.sc|mtech|m\.tech|mba)\b', t):
        return 1.0
    if re.search(r'\b(bachelor|bsc|b\.sc|btech|b\.tech|bachelor of technology|bachelor of science)\b', t):
        return 1.0
    if re.search(r'\b(diploma|associate|certificate)\b', t):
        return 0.6
    return 0.0


def _formatting_quality(text: str) -> float:
    """Heuristic formatting score (0-1). Checks length, presence of many short lines, and non-printables."""
    if not text:
        return 0.0

    # Remove long whitespace
    clean = re.sub(r'\s+', ' ', text).strip()
    words = clean.split()
    words_count = len(words)

    # Basic length heuristic
    length_score = 1.0 if words_count >= 300 else (0.6 if words_count >= 150 else 0.3)

    # Check for many short lines (bad formatting) - penalize if too many short lines
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    short_lines = sum(1 for ln in lines if len(ln.split()) <= 3)
    if lines:
        short_ratio = short_lines / len(lines)
    else:
        short_ratio = 0.0

    short_penalty = max(0.0, 1.0 - short_ratio * 1.5)  # if many short lines, reduce

    # Check non-printable / weird characters
    nonprintables = len(re.findall(r'[^\x00-\x7F]', text))
    nonprint_penalty = 1.0 if nonprintables == 0 else max(0.0, 1.0 - (nonprintables / 50.0))

    score = length_score * 0.6 + short_penalty * 0.25 + nonprint_penalty * 0.15
    return max(0.0, min(1.0, score))


def _keyword_density_score(skills_list: list, text: str) -> float:
    """
    Keyword density heuristic:
    - number of unique skills found vs expected (we treat top 10 skills as ideal).
    - scaled to 0-1
    """
    if not skills_list:
        return 0.0
    unique_skills = { (s.get("skill") if isinstance(s, dict) else str(s)).lower() for s in skills_list }
    found = len(unique_skills)
    # ideal target is 10 unique relevant skills
    return min(1.0, found / 10.0)


def _skill_match_score(skills_list: list) -> float:
    """
    Skill match based on avg confidence (if provided) or presence.
    Expect skills_list to be a list of dicts: [{"skill":"python","confidence":80}, ...]
    """
    if not skills_list:
        return 0.0

    confidences = []
    for s in skills_list:
        if isinstance(s, dict):
            c = s.get("confidence")
            if isinstance(c, (int, float)):
                confidences.append(max(0.0, min(100.0, float(c))))
            else:
                # if confidence not present, assume moderate (60)
                confidences.append(60.0)
        else:
            confidences.append(60.0)

    avg_conf = sum(confidences) / len(confidences)
    return max(0.0, min(1.0, avg_conf / 100.0))


def calculate_ats_score(skills_list: list, text: str, entities: dict = None) -> tuple:
    """
    Returns (ats_score_int, breakdown_dict)
    breakdown values are floats in [0,1].
    Weights:
      skill_match: 50%
      keyword_density: 20%
      contact: 10%
      education: 10%
      formatting: 10%
    """
    entities = entities or {}
    # Sub-scores 0..1
    skill_match = _skill_match_score(skills_list)
    keyword_density = _keyword_density_score(skills_list, text)
    contact = _has_contact(entities)
    education = _education_score(text)
    formatting = _formatting_quality(text)

    # weights
    w_skill = 0.50
    w_keyword = 0.20
    w_contact = 0.10
    w_edu = 0.10
    w_format = 0.10

    overall = (skill_match * w_skill +
               keyword_density * w_keyword +
               contact * w_contact +
               education * w_edu +
               formatting * w_format)

    ats_score = int(round(overall * 100))

    breakdown = {
        "skill_match": round(skill_match, 2),
        "keyword_coverage": round(keyword_density, 2),
        "contact_score": round(contact, 2),
        "education_score": round(education, 2),
        "formatting_score": round(formatting, 2),
    }

    return ats_score, breakdown


# ------------------------------------------------------
# SEND EMAIL ENDPOINT (CONTACT FORM)
# ------------------------------------------------------
@app.post("/send_email")
def send_email(data: ContactForm):
    try:
        APP_PASSWORD = os.getenv("App_password")

        msg = MIMEMultipart()
        msg["From"] = YOUR_EMAIL
        msg["To"] = YOUR_EMAIL
        msg["Subject"] = f"New Contact Form Message from {data.name}"

        body = f"""
New message from ElevateCV Contact Form:

Name: {data.name}
Email: {data.email}

Message:
{data.message}
        """

        msg.attach(MIMEText(body, "plain"))

        # Add timeout so endpoint doesn't freeze
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10)
        server.starttls()

        server.login(YOUR_EMAIL, APP_PASSWORD)
        server.sendmail(YOUR_EMAIL, YOUR_EMAIL, msg.as_string())
        server.quit()

        return {"success": True, "message": "Email sent successfully"}

    except Exception as e:
        print("Email error:", e)
        return {"success": False, "message": f"Failed to send email: {str(e)}"}


# ------------------------------------------------------
# TEST UPLOAD
# ------------------------------------------------------
@app.post("/test_upload")
async def test_upload(file: UploadFile = File(...)):
    print("📥 TEST UPLOAD:", file.filename)
    return {"filename": file.filename}


# ------------------------------------------------------
# RESUME ANALYZER ENDPOINT
# ------------------------------------------------------
@app.post("/analyze_resume")
async def analyze_resume(file: UploadFile = File(...)):
    try:
        print("\n=====================================")
        print("📥 Resume received for analysis")
        print("=====================================")

        # Sanitize filename
        safe_filename = re.sub(r'[^a-zA-Z0-9.-]', '_', file.filename)
        temp_filename = f"{uuid.uuid4()}_{safe_filename}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)

        print(f"📂 Saving file to: {temp_path}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("📄 Extracting text...")
        raw_text = extract_text_from_file(temp_path, file.filename)
        print(f"✨ Extraction complete. Length: {len(raw_text)}")
        raw_text = normalize_text(raw_text)

        if not raw_text.strip():
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail="Could not extract resume text")

        print("\n📘 Extracted Resume Preview:")
        print(raw_text[:300], "...\n")

        os.remove(temp_path)

        if not GEMINI_API_KEY:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured in the backend .env file.")

        print("\n🤖 Calling Gemini API...")
        prompt = f"""
        Analyze the following resume text and provide a structured JSON response. 
        The JSON must adhere to the following structure exactly:
        {{
            "overall_score": <int 0-100 ATS score>,
            "ats_score": <int 0-100 ATS score>,
            "ats_breakdown": {{
                "skill_match": <float 0-1>,
                "keyword_coverage": <float 0-1>,
                "contact_score": <float 0-1>,
                "education_score": <float 0-1>,
                "formatting_score": <float 0-1>
            }},
            "key_metrics": {{
                "keyword_density": <float 0-1>,
                "formatting_clarity": <float 0-1>
            }},
            "skills_proficiency": [
                {{"skill": "<skill_name>", "confidence": <int 0-100>}}
            ],
            "job_recommendations": [
                {{"role": "<role_name>", "score": <int 0-100>, "reason": "<short reason>"}}
            ],
            "entities": {{
                "persons": ["<name>"],
                "organizations": ["<org>"],
                "emails": ["<email>"],
                "phones": ["<phone>"]
            }},
            "summary": "<A 2-3 sentence personalized summary/feedback for the candidate on how to improve>"
        }}

        Resume Text:
        {raw_text}
        """

        if not GEMINI_API_KEY:
             raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured.")

        print(f"📝 Raw Text Length: {len(raw_text)} characters")
        print("\n🚀 Sending to Gemini (REST API)...")
        URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        try:
            api_response = requests.post(
                URL,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=30
            )
            
            if api_response.status_code != 200:
                error_detail = api_response.text
                logging.error(f"Gemini API Error {api_response.status_code}: {error_detail}")
                raise Exception(f"Gemini API returned {api_response.status_code}")

            result_json = api_response.json()
            
            # Extract text from the nested structure
            try:
                raw_response = result_json['candidates'][0]['content']['parts'][0]['text']
            except (KeyError, IndexError):
                logging.error(f"Unexpected Gemini Response Structure: {result_json}")
                raise Exception("Could not parse Gemini response parts.")

            raw_response = raw_response.strip()
            if raw_response.startswith("```"):
                raw_response = re.sub(r'^```(?:json)?\s*', '', raw_response)
                raw_response = re.sub(r'\s*```$', '', raw_response)
            
            response = json.loads(raw_response)
        except Exception as e:
            error_msg = traceback.format_exc()
            logging.error(f"Gemini API/Parsing Error: {error_msg}")
            print(error_msg)
            raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")

        print("\n✅ GEMINI RESULT SENT TO FRONTEND")
        return response

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        logging.error(f"General Analysis Error: {error_msg}")
        print(error_msg)
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")


# ------------------------------------------------------
# ROOT & HEALTH CHECK
# ------------------------------------------------------
@app.get("/")
def root():
    return {"message": "NLP Backend Running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ElevateCV NLP Backend"}
