import re

with open('e:/Downloads/ONLYMED/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace CareShop with ONLYMED
html = html.replace('CareShop', 'ONLYMED')
html = html.replace('careshop', 'onlymed')

# 2. Replace CSS colors
# Original:
# --pk:#e8547a;--pk2:#f07fa0;--pk3:#fce8ee;--pk4:#fff0f4;--pk5:#fdf6f8;
# --wh:#ffffff;--dark:#1a0a10;--dark2:#3d1a26;--gray:#6b7280;--gray2:#9ca3af;
css_replacements = {
    '--pk:#e8547a;--pk2:#f07fa0;--pk3:#fce8ee;--pk4:#fff0f4;--pk5:#fdf6f8;': '--pk:#E51D2A;--pk2:#ff4d4d;--pk3:#ffebee;--pk4:#fff5f5;--pk5:#fffafa;',
    '--dark:#1a0a10;--dark2:#3d1a26;': '--dark:#111111;--dark2:#333333;'
}
for old, new in css_replacements.items():
    html = html.replace(old, new)

# 3. Replace Logo in Navbar
old_logo = '''<div class="logo-icon"><i class="fa fa-heart-pulse"></i></div>
      <div>
        <div class="logo-text">ONLYMED</div>
        <span class="logo-sub" id="nav-tagline">Healthcare & Wellness</span>
      </div>'''
new_logo = '''<img src="ONLYMED Logo RGB AI.png" alt="ONLYMED Logo" style="height: 48px; object-fit: contain;">'''
html = html.replace(old_logo, new_logo)

# Also fix the footer brand logo
old_footer_logo = '''<div class="logo-icon"><i class="fa fa-heart-pulse"></i></div>
          <div>
            <div class="logo-text">ONLYMED</div>
          </div>'''
new_footer_logo = '''<img src="ONLYMED Logo RGB AI.png" alt="ONLYMED Logo" style="height: 48px; object-fit: contain; filter: brightness(0) invert(1);">'''
html = html.replace(old_footer_logo, new_footer_logo)

# 4. Extract CSS
style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL)
if style_match:
    css_content = style_match.group(1).strip()
    html = html[:style_match.start()] + '<link rel="stylesheet" href="style.css">' + html[style_match.end():]
    with open('e:/Downloads/ONLYMED/style.css', 'w', encoding='utf-8') as f:
        f.write(css_content)

# 5. Extract JS
script_match = re.search(r'<script>(.*?)</script>', html, re.DOTALL)
if script_match:
    js_content = script_match.group(1).strip()
    html = html[:script_match.start()] + '<script src="script.js"></script>' + html[script_match.end():]
    with open('e:/Downloads/ONLYMED/script.js', 'w', encoding='utf-8') as f:
        f.write(js_content)

# Write back HTML
with open('e:/Downloads/ONLYMED/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Refactoring complete.")
