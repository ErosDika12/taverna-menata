# Checks that all source files are valid UTF-8 and converts any file
# accidentally saved as Windows-1252 (a recurring editor problem on this
# machine). Run: python scripts/check-encoding.py
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTS = ('.js', '.jsx', '.css', '.html', '.json', '.md', '.py')
SKIP_DIRS = {'node_modules', 'uploads', 'dist', '.git'}

problems = 0
for dirpath, dirs, files in os.walk(ROOT):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for fname in files:
        if not fname.endswith(EXTS):
            continue
        path = os.path.join(dirpath, fname)
        rel = os.path.relpath(path, ROOT)
        raw = open(path, 'rb').read()
        try:
            text = raw.decode('utf-8')
        except UnicodeDecodeError:
            try:
                text = raw.decode('cp1252')
                note = 'converted cp1252 -> utf-8'
            except UnicodeDecodeError:
                text = raw.decode('latin-1')
                note = 'converted latin-1 -> utf-8'
            open(path, 'wb').write(text.encode('utf-8'))
            print(f'{rel}: {note}')
        # bytes like 0x9d come from a lossy save and cannot be recovered automatically
        suspicious = [c for c in text if 0x80 <= ord(c) <= 0x9f or c == '\ufffd']
        if suspicious:
            problems += 1
            codes = ', '.join(sorted({hex(ord(c)) for c in suspicious}))
            print(f'{rel}: UNRECOVERABLE characters ({codes}) - fix this file by hand!')

print('OK - all files clean' if problems == 0 else f'{problems} file(s) need manual fixes')
sys.exit(1 if problems else 0)
