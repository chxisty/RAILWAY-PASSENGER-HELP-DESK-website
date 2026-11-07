import urllib.request
import re

url = "http://localhost:3000"
try:
    with urllib.request.urlopen(url, timeout=5) as resp:
        status = resp.status
        html = resp.read().decode('utf-8', errors='ignore')
        print(f"Status: {status}")
        
        has_theme_script = "rail_theme" in html
        print(f"Theme localStorage bootstrap script present: {has_theme_script}")
        
        has_theme_class = "theme-" in html
        print(f"Theme CSS class present: {has_theme_class}")
        
        has_toggle = ("Switch to" in html) or ("aria-label" in html and "Mode" in html)
        print(f"Interactive theme toggle button found: {has_toggle}")

        # Check subpages
        subpages = ["/trains", "/chat", "/explore", "/dashboard", "/about"]
        for sp in subpages:
            try:
                with urllib.request.urlopen(url + sp, timeout=5) as sp_resp:
                    print(f"Subpage {sp}: HTTP {sp_resp.status}")
            except Exception as e:
                print(f"Subpage {sp} error: {e}")

except Exception as ex:
    print(f"Could not connect to {url}: {ex}")

