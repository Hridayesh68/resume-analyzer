# backend/utils/nlp_utils.py
"""
NLP utilities for resume analysis (spaCy + TF-IDF)
No transformers, no torch. Uses scikit-learn TF-IDF for job matching.
"""

import re
import spacy
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load spaCy model (make sure to run: python -m spacy download en_core_web_sm)
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    print("⚠️  Warning: spaCy model not found. Run: python -m spacy download en_core_web_sm")
    nlp = None

# Skill set (adjustable)
COMMON_SKILLS = [
    "python", "javascript", "java", "c++", "c#", "ruby", "php", "swift", "kotlin",
    "typescript", "go", "rust", "scala", "r", "matlab",
    "react", "angular", "vue", "node", "express", "django", "flask", "fastapi",
    "html", "css", "tailwind", "bootstrap",
    "sql", "mysql", "postgresql", "mongodb", "redis",
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "git",
    "pandas", "numpy", "scikit-learn", "tensorflow", "keras", "pytorch",
    "machine learning", "deep learning", "nlp", "computer vision",
    "tableau", "power bi", "excel"
]

JOB_ROLES = [
    "Data Analyst",
    "Machine Learning Engineer",
    "Data Scientist",
    "Full Stack Developer",
    "Backend Developer",
    "DevOps Engineer",
    "Frontend Developer",
    "Business Intelligence Analyst"
]


def normalize_text(text: str) -> str:
    """Normalize whitespace and return lowercased text for analysis when needed."""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()


def extract_basic_entities(text: str) -> dict:
    """Extract simple entities: persons, orgs, emails, phones."""
    if not nlp:
        return {"persons": [], "organizations": [], "emails": [], "phones": []}

    doc = nlp(text)
    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phones = re.findall(r'(\+?\d[\d\-\s]{7,}\d)', text)

    orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
    persons = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]

    # dedupe preserving order
    def dedupe(seq):
        seen = set()
        out = []
        for s in seq:
            if s not in seen:
                seen.add(s)
                out.append(s)
        return out

    return {
        "persons": dedupe(persons),
        "organizations": dedupe(orgs),
        "emails": dedupe(emails),
        "phones": dedupe(phones),
    }


def extract_skills(text: str) -> list:
    """
    Keyword-based skill extraction.
    Returns sorted list of {skill, confidence, count}.
    Confidence scales with occurrences and early appearance.
    """
    text_l = text.lower()
    skills = []

    for kw in COMMON_SKILLS:
        count = text_l.count(kw)
        if count > 0:
            # base score + frequency + early-appearance bonus
            base = 40
            freq_bonus = min(30, count * 10)
            position_bonus = 10 if text_l.find(kw) >= 0 and text_l.find(kw) < 400 else 0
            score = min(100, base + freq_bonus + position_bonus)
            skills.append({"skill": kw, "confidence": score, "count": count})

    # sort by confidence and frequency
    skills.sort(key=lambda x: (x["confidence"], x["count"]), reverse=True)
    return skills


def compute_ats_score(skills: list, text: str) -> int:
    """
    Compute a simple ATS score (0-100).
    Composition:
      - skills coverage (0-50)
      - contact & education presence (0-20)
      - length heuristics (0-30)
    """
    num_skills = len(skills)
    skills_component = min(50, int((num_skills / max(1, len(COMMON_SKILLS))) * 50))

    entities = extract_basic_entities(text)
    contact_bonus = 10 if (entities["emails"] or entities["phones"]) else 0

    # simple education detection
    ed = 10 if any(keyword in text.lower() for keyword in ["bachelor", "master", "phd", "mba", "b.sc", "m.sc"]) else 0
    contact_education = contact_bonus + ed

    # length score
    words = len(text.split())
    if words >= 400:
        length_score = 30
    elif words >= 200:
        length_score = 15
    else:
        length_score = 5

    total = skills_component + contact_education + length_score
    return max(0, min(100, int(total)))


def recommend_jobs_via_embeddings(text: str, job_roles=None, top_k=5) -> list:
    """
    Recommend job roles using TF-IDF + cosine similarity.
    Lightweight and deterministic, no external heavy deps.
    """
    job_roles = job_roles or JOB_ROLES

    corpus = [text] + job_roles
    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf = vectorizer.fit_transform(corpus)
        resume_vec = tfidf[0]
        role_vecs = tfidf[1:]
        sims = cosine_similarity(resume_vec, role_vecs).flatten()
        results = []
        for role, score in zip(job_roles, sims):
            results.append({"role": role, "score": int(round(float(score) * 100))})
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]
    except Exception as e:
        print("⚠️ TF-IDF recommendation error:", e)
        # fallback
        return [{"role": r, "score": 60} for r in job_roles][:top_k]
