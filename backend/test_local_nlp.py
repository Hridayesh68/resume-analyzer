import requests
import json
import sys

# The path to the dummy resume
file_path = "dummy_resume.txt"
url = "http://127.0.0.1:8000/analyze_resume"

try:
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(url, files=files, timeout=15)
        
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success! Response JSON:")
        print(json.dumps(response.json(), indent=2))
        sys.exit(0)
    else:
        print(f"Error Response: {response.text}")
        sys.exit(1)
except Exception as e:
    print(f"Connection failed: {e}")
    sys.exit(1)
