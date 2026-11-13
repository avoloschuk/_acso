import sys
from PIL import Image

try:
    # Open the brandbook page 7 (which has the clear logo)
    img = Image.open('/Users/avolo/_Projects/_acso/_docs/brandbook_assets/brandbook_page_7.png')
    
    # Crop the first logo (dark blue on light background)
    # Estimated coordinates based on standard page layout
    # The logo is usually in the top middle.
    # Let's crop a generous box and then we can refine if needed.
    # Page is likely 1920x1080 or similar.
    width, height = img.size
    
    # The logo is centered in the right panel. The left panel is dark.
    # Let's say the right panel starts at 30% width.
    left = int(width * 0.3)
    top = int(height * 0.1)
    right = int(width * 0.7)
    bottom = int(height * 0.5)
    
    logo_crop = img.crop((left, top, right, bottom))
    logo_crop.save('/Users/avolo/_Projects/_acso/prototype/logo.png')
    print(f"Successfully cropped logo to {width}x{height}, bounding box: {left},{top},{right},{bottom}")

except Exception as e:
    print(f"Error: {e}")
