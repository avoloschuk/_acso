import os
from PIL import Image

brandbook_dir = '/Users/avolo/_Projects/_acso/_docs/brandbook_assets/'
output_path = '/Users/avolo/_Projects/_acso/prototype/logo_full.png'

# Define target colors roughly
# Dark Blue: ~ (20, 17, 36)
# Orange: ~ (240, 90, 53)
# White: ~ (255, 255, 255)

def find_logo():
    for i in range(1, 31):
        filename = f'brandbook_page_{i}.png'
        path = os.path.join(brandbook_dir, filename)
        if not os.path.exists(path): continue
        
        try:
            img = Image.open(path).convert('RGB')
            # Look for the combination of dark blue text and orange in the same image
            # We will just write a simple crop if it's the cover page (page 1)
            # Usually the cover page has the full logo centered or top left.
            if i == 1:
                # Crop a section of page 1 to see if we get the logo
                # This is a bit blind. Let's just crop a few likely spots from page 1
                img.save('/Users/avolo/_Projects/_acso/prototype/page1_test.png')
                print(f"Saved page 1 for inspection.")
                return True
        except Exception as e:
            print(f"Error on {filename}: {e}")

if not find_logo():
    print("Could not find logo.")
