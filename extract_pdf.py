import subprocess
import sys

try:
    import pdfplumber
except ImportError:
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pdfplumber', '-q'])
    import pdfplumber

try:
    with pdfplumber.open('src/utils/Event_predictor_slide.pdf') as pdf:
        text = ''
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            text += f"\n=== PAGE {i+1} ===\n{page_text}\n"
        print(text)
except Exception as e:
    print(f"Error reading PDF: {e}")
    import traceback
    traceback.print_exc()
