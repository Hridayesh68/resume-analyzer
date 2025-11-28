"""
check_dependencies.py
Checks whether required Python libraries for the ElevateCV backend are installed.
Run with: python check_dependencies.py
"""

import importlib

REQUIRED_PACKAGES = {
    "fastapi": "fastapi",
    "uvicorn": "uvicorn",
    "python-multipart": "python-multipart",
    "spacy": "spacy",
    "PyPDF2": "PyPDF2",
    "docx": "python-docx",
    "sklearn": "scikit-learn",
}

# spaCy model
SPACY_MODEL = "en_core_web_sm"

missing_libs = []
print("\n🔍 Checking Python libraries...\n")

for module_name, pip_name in REQUIRED_PACKAGES.items():
    try:
        importlib.import_module(module_name)
        print(f"✔️  {module_name} ✓ Installed")
    except ImportError:
        print(f"❌ {module_name} ✗ NOT INSTALLED")
        missing_libs.append(pip_name)

# Check spaCy model separately
print("\n🔍 Checking spaCy Model...\n")

try:
    import spacy
    spacy.load(SPACY_MODEL)
    print(f"✔️ spaCy model '{SPACY_MODEL}' ✓ Installed")
except Exception:
    print(f"❌ spaCy model '{SPACY_MODEL}' NOT installed")
    missing_libs.append(f"python -m spacy download {SPACY_MODEL}")

# Summary
print("\n============================================")
print("📦 DEPENDENCY CHECK SUMMARY")
print("============================================")

if not missing_libs:
    print("🎉 All dependencies are installed!")
else:
    print("⚠️ Missing Dependencies:\n")
    for pkg in missing_libs:
        print("   ➤", pkg)

    print("\n💡 Install missing packages using:")
    print("pip install " + " ".join([
        pkg for pkg in missing_libs if not pkg.startswith("python -m spacy")
    ]))

    if any("spacy download" in pkg for pkg in missing_libs):
        print("\n➡️ And install spaCy model using:")
        print("python -m spacy download en_core_web_sm")

print("\nDone.\n")
