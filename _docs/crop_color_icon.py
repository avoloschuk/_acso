from PIL import Image

# Page 4 has large color icons on light background (right side)
img = Image.open('/Users/avolo/_Projects/_acso/_docs/brandbook_assets/brandbook_page_4.png').convert('RGBA')
width, height = img.size
pixels = img.load()

# Icons are in the CENTER of the page, NOT the dark left sidebar
# Left sidebar ends at ~x=260. Icons start at ~x=340
# Search only x=300..600, and for the TOP icon y=50..250
orange_pixels = []
for y in range(50, 250):
    for x in range(300, 600):
        r, g, b, a = pixels[x, y]
        if r > 180 and 40 < g < 140 and b < 100:
            orange_pixels.append((x, y))

print(f"Orange pixels in target zone: {len(orange_pixels)}")

if not orange_pixels:
    print("No orange found in target zone!")
    exit()

ox_min = min(p[0] for p in orange_pixels)
ox_max = max(p[0] for p in orange_pixels)
oy_min = min(p[1] for p in orange_pixels)
oy_max = max(p[1] for p in orange_pixels)
print(f"Orange bbox: ({ox_min},{oy_min}) to ({ox_max},{oy_max})")

# Search for dark blue + gray icon parts around the orange
expand = 60
min_x, min_y, max_x, max_y = ox_min, oy_min, ox_max, oy_max

for y in range(max(0, oy_min - expand), min(height, oy_max + expand)):
    for x in range(max(300, ox_min - expand), min(600, ox_max + expand)):
        r, g, b, a = pixels[x, y]
        is_dark = r < 60 and g < 50 and b < 80
        is_orange = r > 180 and 40 < g < 140 and b < 100
        is_gray = 100 < r < 200 and 90 < g < 190 and 100 < b < 210 and abs(r - g) < 30
        if is_dark or is_orange or is_gray:
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

print(f"Icon box: ({min_x},{min_y}) to ({max_x},{max_y}), size: {max_x-min_x}x{max_y-min_y}")

pad = 4
crop = img.crop((min_x - pad, min_y - pad, max_x + pad, max_y + pad))

# Make background transparent
cw, ch = crop.size
cp = crop.load()
for y in range(ch):
    for x in range(cw):
        r, g, b, a = cp[x, y]
        if r > 200 and g > 195 and b > 200:
            cp[x, y] = (r, g, b, 0)

crop.save('/Users/avolo/_Projects/_acso/prototype/logo_icon_color.png')
print(f"Saved: {crop.size}")
