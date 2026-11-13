import os
from PIL import Image

brandbook_dir = '/Users/avolo/_Projects/_acso/_docs/brandbook_assets/'
output_path = '/Users/avolo/_Projects/_acso/prototype/logo_full.png'

# Colors
ORANGE = (240, 90, 53)
DARK_BLUE = (20, 17, 36)

def color_diff(c1, c2):
    return abs(c1[0]-c2[0]) + abs(c1[1]-c2[1]) + abs(c1[2]-c2[2])

def find_logo():
    for i in range(1, 31):
        filename = f'brandbook_page_{i}.png'
        path = os.path.join(brandbook_dir, filename)
        if not os.path.exists(path): continue
        
        try:
            img = Image.open(path).convert('RGB')
            pixels = img.load()
            width, height = img.size
            
            # Find an orange pixel
            found_orange = False
            ox, oy = 0, 0
            for y in range(0, height, 5):
                for x in range(0, width, 5):
                    if color_diff(pixels[x, y], ORANGE) < 40:
                        ox, oy = x, y
                        found_orange = True
                        break
                if found_orange: break
                
            if found_orange:
                # Check if there is dark blue nearby (to confirm it's the 3-color logo)
                found_blue = False
                for dy in range(-100, 100, 10):
                    for dx in range(-100, 100, 10):
                        if 0 <= ox+dx < width and 0 <= oy+dy < height:
                            if color_diff(pixels[ox+dx, oy+dy], DARK_BLUE) < 40:
                                found_blue = True
                                break
                    if found_blue: break
                
                if found_blue:
                    print(f"Found 3-color logo candidate on page {i} at {ox},{oy}")
                    # Now find the bounding box of the dark blue shape
                    # We start from the blue pixel and expand, or just do a simple bounding box
                    # Since it's a clean logo, let's just find all blue pixels in a 300x300 area
                    bx, by = ox, oy
                    min_x, min_y = width, height
                    max_x, max_y = 0, 0
                    
                    search_radius = 200
                    for y in range(max(0, by-search_radius), min(height, by+search_radius)):
                        for x in range(max(0, bx-search_radius), min(width, bx+search_radius)):
                            if color_diff(pixels[x, y], DARK_BLUE) < 50:
                                min_x = min(min_x, x)
                                min_y = min(min_y, y)
                                max_x = max(max_x, x)
                                max_y = max(max_y, y)
                                
                    if max_x > min_x and max_y > min_y:
                        # Add padding
                        pad = 5
                        min_x = max(0, min_x - pad)
                        min_y = max(0, min_y - pad)
                        max_x = min(width, max_x + pad)
                        max_y = min(height, max_y + pad)
                        
                        logo_crop = img.crop((min_x, min_y, max_x, max_y))
                        
                        # Make background transparent (if any white/gray around the blue square)
                        # The bounding box might include some white background. 
                        # We can just save it as is first.
                        logo_crop.save(output_path)
                        print(f"Saved full logo to {output_path}")
                        return True
        except Exception as e:
            print(f"Error on {filename}: {e}")
            
    return False

if not find_logo():
    print("Could not find the 3-color logo.")
