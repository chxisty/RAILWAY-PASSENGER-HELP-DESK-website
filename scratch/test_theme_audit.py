import re

def test_file_contains(filepath, expected_patterns):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for pat in expected_patterns:
        assert re.search(pat, content), f"Pattern '{pat}' not found in {filepath}"
    print(f"PASSED: {filepath}")

# 1. Test globals.css
test_file_contains('frontend/app/globals.css', [
    r'--background:\s*#FAF5EE',
    r'--foreground:\s*#1F162B',
    r'--card:\s*#FFFFFF',
    r'--border:\s*#E5D8C6',
    r'\.brand-title',
    r'\.nav-link-active',
    r'\.badge-verified',
    r'\.badge-live',
    r'\.station-info-banner',
    r'\.chat-markdown',
])

# 2. Test Logo.tsx
test_file_contains('frontend/components/Logo/Logo.tsx', [
    r'brand-title',
    r'brand-subtitle',
])

# 3. Test Navbar.tsx
test_file_contains('frontend/components/Navbar.tsx', [
    r'navbar-header',
    r'nav-link-active',
    r'nav-link-inactive',
    r'navbar-dropdown',
])

# 4. Test Badge.tsx
test_file_contains('frontend/primitives/Badge/Badge.tsx', [
    r'badge-verified',
    r'badge-live',
    r'badge-offline',
    r'badge-neutral',
    r'badge-warning',
])

# 5. Test ChatMessageMarkdown.tsx
test_file_contains('frontend/components/ChatMessageMarkdown.tsx', [
    r'chat-markdown',
])

# 6. Test StationHelpDeskEnvironment.tsx
test_file_contains('frontend/components/StationHelpDeskEnvironment.tsx', [
    r'station-ambient-layer',
    r'station-ground-layer',
])

# 7. Test trains/explore/about banners
test_file_contains('frontend/app/trains/page.tsx', [
    r'station-info-banner',
    r'banner-gradient',
])

test_file_contains('frontend/app/explore/page.tsx', [
    r'station-info-banner',
    r'banner-gradient',
])

test_file_contains('frontend/app/about/page.tsx', [
    r'station-info-banner',
    r'banner-gradient',
])

print("\nALL AUDIT CHECKS PASSED SUCCESSFULLY!")

