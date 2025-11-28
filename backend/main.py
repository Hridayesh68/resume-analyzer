# backend/main.py
"""
ELEVATECV NLP BACKEND (spaCy + TF-IDF)
Secure Gmail Email System + Resume Analysis
"""

import os
import shutil
import uuid
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
    compute_ats_score,
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
        ats_score = compute_ats_score(skills, raw_text)
        recommendations = recommend_jobs_via_embeddings(raw_text)

        os.remove(temp_path)

        response = {
            "overall_score": ats_score,
            "key_metrics": {
                "keyword_density": round(len(skills) / max(1, len(skills) + 10), 2),
                "readability_grade": 10,
                "formatting_clarity": 0.7,
            },
            "skills_proficiency": skills,
            "job_recommendations": recommendations,
            "entities": entities,
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
