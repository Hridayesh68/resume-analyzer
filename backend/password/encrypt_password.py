from cryptography.fernet import Fernet

# Load key
with open("secret.key", "rb") as f:
    key = f.read()

cipher = Fernet(key)

# Your Gmail App Password (16 chars)
PLAIN_PASSWORD = "xhli wffy ntaf xmfc".encode()

encrypted = cipher.encrypt(PLAIN_PASSWORD)

with open("encrypted_password.bin", "wb") as f:
    f.write(encrypted)

print("Encrypted password saved to encrypted_password.bin")
