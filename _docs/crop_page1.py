import sys
from PIL import Image

try:
    img = Image.open('/Users/avolo/_Projects/_acso/_docs/brandbook_assets/brandbook_page_1.png')
    width, height = img.size
    
    # Let's crop a few areas and save them, then we can pick the best one.
    # Center crop
    center_crop = img.crop((width*0.2, height*0.2, width*0.8, height*0.8))
    center_crop.save('/Users/avolo/_Projects/_acso/prototype/test_crop_center.png')
    
    # Top left crop
    tl_crop = img.crop((0, 0, width*0.5, height*0.5))
    tl_crop.save('/Users/avolo/_Projects/_acso/prototype/test_crop_tl.png')

    print("Cropped page 1 for inspection.")
except Exception as e:
    print(f"Error: {e}")
