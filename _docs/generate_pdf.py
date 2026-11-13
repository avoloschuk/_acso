import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors

# Define the font paths on macOS
FONT_PATHS = [
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial.ttf",
    "/System/Library/Fonts/Supplemental/Geneva.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman.ttf"
]

# Find a valid Cyrillic font
font_path = None
for path in FONT_PATHS:
    if os.path.exists(path):
        font_path = path
        break

if not font_path:
    # Let's try to search supplemental fonts directory
    supp_dir = "/System/Library/Fonts/Supplemental/"
    if os.path.exists(supp_dir):
        for f in os.listdir(supp_dir):
            if f.lower().endswith(".ttf"):
                # Try to use this font
                font_path = os.path.join(supp_dir, f)
                break

if not font_path:
    raise FileNotFoundError("Could not find a suitable TrueType font for Cyrillic text.")

print(f"Using font: {font_path}")

# Register the font
pdfmetrics.registerFont(TTFont('CyrillicFont', font_path))
pdfmetrics.registerFont(TTFont('CyrillicFontBold', font_path.replace("Arial.ttf", "Arial Bold.ttf") if "Arial.ttf" in font_path else font_path))

# Read markdown content
proposal_path = "/Users/avolo/_Projects/_acso/_docs/client_proposal.md"
with open(proposal_path, 'r', encoding='utf-8') as f:
    md_content = f.read()

# Simple markdown parsing for ReportLab Paragraphs
paragraphs = []
lines = md_content.split('\n')

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    'TitleStyle',
    parent=styles['Heading1'],
    fontName='CyrillicFontBold',
    fontSize=22,
    leading=26,
    textColor=colors.HexColor('#141124'),
    spaceAfter=15
)
h2_style = ParagraphStyle(
    'H2Style',
    parent=styles['Heading2'],
    fontName='CyrillicFontBold',
    fontSize=14,
    leading=18,
    textColor=colors.HexColor('#f05a35'),
    spaceBefore=12,
    spaceAfter=6,
    keepWithNext=True
)
body_style = ParagraphStyle(
    'BodyStyle',
    parent=styles['Normal'],
    fontName='CyrillicFont',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#343a40'),
    spaceAfter=8
)
bullet_style = ParagraphStyle(
    'BulletStyle',
    parent=styles['Normal'],
    fontName='CyrillicFont',
    fontSize=10,
    leading=14,
    textColor=colors.HexColor('#343a40'),
    leftIndent=20,
    firstLineIndent=-10,
    spaceAfter=6
)

story = []

# Title Page / Header styled nicely
story.append(Spacer(1, 20))

for line in lines:
    line = line.strip()
    if not line:
        continue
    
    # Header 1 (# Title)
    if line.startswith('# '):
        title_text = line[2:]
        story.append(Paragraph(title_text, title_style))
        story.append(Spacer(1, 10))
    # Header 2 (## Subtitle)
    elif line.startswith('## '):
        story.append(Spacer(1, 10))
        h2_text = line[3:]
        story.append(Paragraph(h2_text, h2_style))
    # Bullet lists
    elif line.startswith('* ') or line.startswith('- '):
        bullet_text = line[2:]
        # Simple inline formatting (bold)
        bullet_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', bullet_text)
        story.append(Paragraph(f"&bull; {bullet_text}", bullet_style))
    else:
        # Paragraph text
        # Simple inline formatting (bold)
        para_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
        story.append(Paragraph(para_text, body_style))

# Generate PDF
pdf_path = "/Users/avolo/_Projects/_acso/_docs/client_proposal.pdf"
doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    rightMargin=54,
    leftMargin=54,
    topMargin=54,
    bottomMargin=54
)

doc.build(story)
print(f"PDF generated successfully at {pdf_path}")
