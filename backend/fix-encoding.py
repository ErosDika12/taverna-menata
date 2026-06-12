import pathlib
import re

p = pathlib.Path(__file__).with_name('seed-data.js')
text = p.read_text(encoding='utf-8', errors='replace')
text = re.sub(r"Shampanj.", "Shampanj\u00eb", text)
text = text.replace("Shampanj\u00eb\u00eb", "Shampanj\u00eb")
p.write_text(text, encoding='utf-8')
print('Fixed seed-data.js encoding')
