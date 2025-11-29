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
from utils.nlp_utils import (
    extract_skills,
    extract_basic_entities,
    recommend_jobs_via_embeddings,
    normalize_text
)

# ------------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# ------------------------------------------------------
load_dotenv()

YOUR_EMAIL = "hridayeshdebsarma6@gmail.com"

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
        APP_PASSWORD = get_decrypted_gmail_password()

        msg = MIMEMultipart()
        msg["From"] = YOUR_EMAIL  # Always FROM you
        msg["To"] = YOUR_EMAIL    # Always TO you
        msg["Subject"] = f"New Contact Form Message from {data.name}"

        body = f"""
📩 New message received from ElevateCV Contact Form

👤 Name: {data.name}
📧 Email: {data.email}

📝 Message:
{data.message}
        """

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(YOUR_EMAIL, APP_PASSWORD)
        server.sendmail(YOUR_EMAIL, YOUR_EMAIL, msg.as_string())
        server.quit()

        return {"success": True, "message": "Email sent successfully"}

    except Exception as e:
        print("Email error:", e)
        return {"success": False, "message": "Failed to send email"}


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

        temp_filename = f"{uuid.uuid4()}_{file.filename}"
        temp_path = os.path.join(UPLOAD_DIR, temp_filename)

        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("📄 Saved at:", temp_path)

        raw_text = extract_text_from_file(temp_path, file.filename)
        raw_text = normalize_text(raw_text)

        if not raw_text.strip():
            os.remove(temp_path)
            raise HTTPException(status_code=400, detail="Could not extract resume text")

        print("\n📘 Extracted Resume Preview:")
        print(raw_text[:300], "...\n")

        # RUN NLP
        entities = extract_basic_entities(raw_text)
        skills = extract_skills(raw_text)
        # 自动化 ATS score calculation
        ats_score, ats_breakdown = calculate_ats_score(skills, raw_text, entities)

        # Job recommendations (existing method)
        recommendations = recommend_jobs_via_embeddings(raw_text)

        os.remove(temp_path)

        response = {
            "overall_score": ats_score,
            "ats_score": ats_score,
            "ats_breakdown": ats_breakdown,
            "key_metrics": {
                "keyword_density": round(len(skills) / max(1, len(skills) + 10), 2),
                # readability removed per earlier request
                "formatting_clarity": round(ats_breakdown.get("formatting_score", 0), 2),
            },
            "skills_proficiency": skills,
            "job_recommendations": recommendations,
            "entities": entities,
            "summary": "",  # placeholder — can be filled by Gemini if/when used
        }

        print("\n✅ NLP RESULT SENT TO FRONTEND")
        return response

    except Exception as e:
        print("❌ ANALYSIS ERROR:", str(e))
        raise HTTPException(status_code=500, detail="Internal server error")


# ------------------------------------------------------
# ROOT & HEALTH CHECK
# ------------------------------------------------------
@app.get("/")
def root():
    return {"message": "NLP Backend Running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ElevateCV NLP Backend"}
