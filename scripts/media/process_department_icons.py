import os
# pyrefly: ignore [missing-import]
from PIL import Image

def transparent_from_corners(img_path, out_path, tolerance=25):
    img = Image.open(img_path).convert("RGBA")
    width, height = img.size
    
    # We will do BFS floodfill from the four corners (0,0), (width-1,0), (0,height-1), (width-1,height-1)
    # Target color is the corner color (near white ~255,255,255)
    pixels = img.load()
    visited = set()
    queue = [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]
    
    for pt in queue:
        visited.add(pt)
        
    def is_bg(x, y):
        r, g, b, _ = pixels[x, y]
        # Check if near white
        return r >= 232 and g >= 232 and b >= 232
        
    while queue:
        cx, cy = queue.pop(0)
        r, g, b, a = pixels[cx, cy]
        pixels[cx, cy] = (r, g, b, 0) # transparent
        
        for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    visited.add((nx, ny))
                    if is_bg(nx, ny):
                        queue.append((nx, ny))
                        
    img.save(out_path, "PNG")
    print(f"Saved: {out_path}")

if __name__ == "__main__":
    os.makedirs("public/images/departments", exist_ok=True)
    brain_dir = r"C:\Users\soory\.gemini\antigravity-ide\brain\34441817-af47-4c33-9fdb-e3c0529f98dc"
    
    files = {
        "dogs.png": "realistic_french_bulldog_1791614143182.jpg",
        "cats.png": "realistic_kitten_yarn_1791614182016.jpg",
        "fish.png": "realistic_flowerhorn_fish_1791614208972.jpg",
        "reptiles.png": "realistic_corn_snake_1791614234011.jpg",
        "birds.png": "realistic_tropical_parrot_1791614253068.jpg",
        "veterinary.png": "realistic_vet_stethoscope_1791614274713.jpg"
    }
    
    for out_name, src_name in files.items():
        src_path = os.path.join(brain_dir, src_name)
        out_path = os.path.join("public/images/departments", out_name)
        if os.path.exists(src_path):
            transparent_from_corners(src_path, out_path)
        else:
            print(f"Missing: {src_path}")
