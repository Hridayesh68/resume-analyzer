# backend/utils/nlp_utils.py
"""
Lightweight NLP utilities for resume analysis.
NO spaCy, NO models, NO transformers.
Everything uses regex + TF-IDF + heuristics.
"""

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------------------
# COMMON SKILLS LIST
# ---------------------------------------
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

# ---------------------------------------
# JOB ROLES
# ---------------------------------------
JOB_ROLES = [
    "Data Analyst",
    "Machine Learning Engineer",
    "Data Scientist",
    "Full Stack Developer",
    "Backend Developer",
    "DevOps Engineer",
    "Frontend Developer",
    "Business Intelligence Analyst",
]


# ---------------------------------------
# NORMALIZATION
# ---------------------------------------
def normalize_text(text: str) -> str:
    """Basic cleanup + whitespace fix."""
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()


# ---------------------------------------
# ENTITY EXTRACTION (NO SPACY)
# ---------------------------------------
def extract_basic_entities(text: str) -> dict:
    """Extract emails, phones, and some name-like patterns."""
    
    emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    phones = re.findall(r'\+?\d[\d\s\-]{8,}\d', text)

    # "Persons" extracted using simple capitalized word heuristics
    persons = re.findall(r'\b[A-Z][a-z]+\s[A-Z][a-z]+\b', text)

    # ORG using uppercase tokens (e.g., GOOGLE, MICROSOFT)
    organizations = [
        w for w in re.findall(r'\b[A-Z][A-Z]+\b', text)
        if len(w) > 2
    ]

    # remove duplicates
    def dedupe(lst):
        return list(dict.fromkeys(lst))

    return {
        "persons": dedupe(persons),
        "organizations": dedupe(organizations),
        "emails": dedupe(emails),
        "phones": dedupe(phones),
    }


# ---------------------------------------
# SKILL EXTRACTION WITHOUT SPACY
# ---------------------------------------
def extract_skills(text: str) -> list:
    """Keyword matching with scoring heuristics."""
    text_l = text.lower()
    results = []

    for skill in COMMON_SKILLS:
        count = text_l.count(skill)
        if count > 0:
            base = 40
            freq_bonus = min(30, count * 10)
            early_bonus = 10 if text_l.find(skill) < 300 else 0
            confidence = min(100, base + freq_bonus + early_bonus)
            results.append({
                "skill": skill,
                "confidence": confidence,
                "count": count
            })

    results.sort(key=lambda x: (x["confidence"], x["count"]), reverse=True)
    return results


# ---------------------------------------
# ATS SCORE
# ---------------------------------------
def compute_ats_score(skills: list, text: str) -> int:
    """Simple ATS score using counts + heuristics."""

    skills_component = min(50, int((len(skills) / len(COMMON_SKILLS)) * 50))

    entities = extract_basic_entities(text)
    contact = 10 if (entities["emails"] or entities["phones"]) else 0
    education_kw = ["bachelor", "master", "phd", "b.sc", "m.sc", "mba"]
    education = 10 if any(k in text.lower() for k in education_kw) else 0

    words = len(text.split())
    if words >= 400:
        length = 30
    elif words >= 200:
        length = 20
    else:
        length = 10

    return min(100, skills_component + contact + education + length)


# ---------------------------------------
# JOB RECOMMENDATIONS
# ---------------------------------------
def recommend_jobs_via_embeddings(text, job_roles=None, top_k=5):
    """TF-IDF + cosine similarity job role ranking."""
    roles = job_roles or JOB_ROLES
    corpus = [text] + roles

    try:
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf = vectorizer.fit_transform(corpus)

        resume_vec = tfidf[0:1]
        role_vecs = tfidf[1:]

        sims = cosine_similarity(resume_vec, role_vecs).flatten()
        results = [
            {"role": r, "score": int(s * 100)}
            for r, s in zip(roles, sims)
        ]

        return sorted(results, key=lambda x: x["score"], reverse=True)[:top_k]

    except Exception:
        return [{"role": r, "score": 50} for r in roles][:top_k]
