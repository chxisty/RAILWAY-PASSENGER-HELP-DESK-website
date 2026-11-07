import requests

BASE = "http://localhost:8000/api/auth"

# Test full profile update and change password
user_email = "priya.verma@railassist.ai"
# 1. Register
r1 = requests.post(f"{BASE}/register", json={
    "full_name": "Priya Verma",
    "email": user_email,
    "password": "Password123#",
    "confirm_password": "Password123#",
    "phone": "+91 91234 56789"
})
print("1. Register status:", r1.status_code)
token = r1.json().get("token")

# 2. Update Profile
r2 = requests.put(f"{BASE}/profile", headers={"Authorization": f"Bearer {token}"}, json={
    "full_name": "Priya S. Verma",
    "phone": "+91 99999 88888"
})
print("2. Update Profile status:", r2.status_code, "New Name:", r2.json().get("full_name"))

# 3. Change Password
r3 = requests.put(f"{BASE}/change-password", headers={"Authorization": f"Bearer {token}"}, json={
    "old_password": "Password123#",
    "new_password": "UpdatedPassword456#",
    "confirm_password": "UpdatedPassword456#"
})
print("3. Change Password status:", r3.status_code, r3.json().get("message"))

# 4. Verify login with updated password
r4 = requests.post(f"{BASE}/login", json={
    "email_or_username": user_email,
    "password": "UpdatedPassword456#"
})
print("4. Login with updated password status:", r4.status_code, r4.json().get("user", {}).get("full_name"))

