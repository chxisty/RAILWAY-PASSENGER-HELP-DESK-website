import requests

BASE = "http://localhost:8000/api/auth"
email = "passenger_test_42@railassist.ai"

# 1. Register
reg = requests.post(f"{BASE}/register", json={
    "full_name": "Arjun Sharma",
    "email": email,
    "password": "RailPassword#2026",
    "phone": "+91 98765 43210"
})
print("1. Register:", reg.status_code, reg.json().get("user", {}).get("email"))

# 2. Duplicate rejection
dup = requests.post(f"{BASE}/register", json={
    "full_name": "Arjun Sharma",
    "email": email,
    "password": "RailPassword#2026"
})
print("2. Duplicate Rejection:", dup.status_code, dup.json().get("detail"))

# 3. Login
login = requests.post(f"{BASE}/login", json={
    "email_or_username": email,
    "password": "RailPassword#2026",
    "remember_me": True
})
print("3. Login:", login.status_code)
token = login.json().get("token")

# 4. Me
me = requests.get(f"{BASE}/me", headers={"Authorization": f"Bearer {token}"})
print("4. Me:", me.status_code, me.json().get("full_name"))

# 5. Forgot Password
forgot = requests.post(f"{BASE}/forgot-password", json={"email": email})
reset_token = forgot.json().get("token")
print("5. Forgot:", forgot.status_code, "Token:", reset_token[:12] if reset_token else None)

# 6. Reset Password
reset = requests.post(f"{BASE}/reset-password", json={
    "token": reset_token,
    "new_password": "NewRailPassword#2026",
    "confirm_password": "NewRailPassword#2026"
})
print("6. Reset:", reset.status_code, reset.json().get("message"))

# 7. Login with New Password
new_login = requests.post(f"{BASE}/login", json={
    "email_or_username": email,
    "password": "NewRailPassword#2026"
})
print("7. Login with new password:", new_login.status_code, new_login.json().get("user", {}).get("email"))

