import sys
from PIL import Image

try:
    # Open brandbook page 8
    img = Image.open('/Users/avolo/_Projects/_acso/_docs/brandbook_assets/brandbook_page_8.png')
    
    # We want to crop the top orange icon. 
    # Let's crop a box where we know the top icon is located.
    # Looking at the image, the icons are aligned on the left side of the right panel.
    width, height = img.size
    
    # Estimate coordinates
    left = int(width * 0.35)
    top = int(height * 0.15)
    right = int(width * 0.55)
    bottom = int(height * 0.40)
    
    logo_crop = img.crop((left, top, right, bottom))
    
    # Find bounding box of non-background (non-light-grey) pixels
    # The background is var(--brand-light) #e5e3e8 roughly (229, 227, 232)
    # Let's convert to RGB and find bounding box of anything that is NOT that color
    rgb_img = logo_crop.convert('RGB')
    bg_color = rgb_img.getpixel((0, 0)) # Sample top-left pixel as background
    
    def is_diff(p1, p2, threshold=10):
        return abs(p1[0]-p2[0]) > threshold or abs(p1[1]-p2[1]) > threshold or abs(p1[2]-p2[2]) > threshold

    bbox = None
    min_x, min_y = rgb_img.size
    max_x, max_y = 0, 0
    
    for y in range(rgb_img.height):
        for x in range(rgb_img.width):
            if is_diff(rgb_img.getpixel((x, y)), bg_color):
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
                
    if max_x >= min_x and max_y >= min_y:
        # Add a tiny padding
        pad = 5
        min_x = max(0, min_x - pad)
        min_y = max(0, min_y - pad)
        max_x = min(rgb_img.width, max_x + pad)
        max_y = min(rgb_img.height, max_y + pad)
        final_crop = rgb_img.crop((min_x, min_y, max_x, max_y))
        
        # Make background transparent
        final_rgba = final_crop.convert("RGBA")
        datas = final_rgba.getdata()
        newData = []
        for item in datas:
            if not is_diff(item[:3], bg_color, 15):
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        final_rgba.putdata(newData)
        
        final_rgba.save('/Users/avolo/_Projects/_acso/prototype/logo_icon.png')
        print(f"Successfully cropped icon to {final_rgba.size}")
    else:
        print("Could not find the icon in the estimated region.")

except Exception as e:
    print(f"Error: {e}")
