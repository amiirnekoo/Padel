import os
import math
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter

BASE_DIR = r'g:\My Drive\Company\File\Padel\frontend\public\images\tournaments'
RAW_DIR = r'g:\My Drive\Company\File\Padel\scripts\raw_tournaments'
COURTS_DIR = r'g:\My Drive\Company\File\Padel\frontend\public\images\courts'

CANVAS_W = 1600
CANVAS_H = 800

# ==============================================================================
# 1. KING OF THE COURT (Panoramic Padel Court + Glowing Gold Backlight + Crisp Logo)
# ==============================================================================
def process_king_of_court():
    print("Processing King of the Court...")
    # Background: High-end panoramic outdoor glass court at dusk/night
    bg = Image.open(os.path.join(COURTS_DIR, 'padel_panoramic.jpg')).convert('RGB')
    bg = bg.resize((CANVAS_W, CANVAS_H), Image.Resampling.LANCZOS)
    bg = ImageEnhance.Color(bg).enhance(0.4)
    bg = ImageEnhance.Brightness(bg).enhance(0.24)
    bg = bg.filter(ImageFilter.GaussianBlur(radius=5))

    # Amber / Royal Gold ambient backlight behind the crown & logo
    glow = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    cx, cy = CANVAS_W // 2, 360
    for r in range(480, 0, -12):
        a = int(45 * (1 - r / 480))
        draw.ellipse([cx - r * 1.55, cy - r * 0.85, cx + r * 1.55, cy + r * 0.85], fill=(217, 160, 30, a))
    bg.paste(glow, (0, 0), glow)

    # Isolated clean King logo
    king = Image.open(os.path.join(RAW_DIR, 'king_isolated.png'))
    bbox = king.getbbox()
    king_crop = king.crop(bbox)
    
    # Scale to prominent size
    th = 475
    tw = int(king_crop.width * (th / king_crop.height))
    king_res = king_crop.resize((tw, th), Image.Resampling.LANCZOS)
    king_res = ImageEnhance.Sharpness(king_res).enhance(1.2)

    px = (CANVAS_W - tw) // 2
    py = cy - th // 2
    bg.paste(king_res, (px, py), king_res)

    # Professional bottom vignette for card text overlay readability
    vignette = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for y in range(CANVAS_H - 220, CANVAS_H):
        ratio = (y - (CANVAS_H - 220)) / 220.0
        vdraw.line([(0, y), (CANVAS_W, y)], fill=(8, 12, 18, int(220 * (ratio ** 1.3))))
    for x in range(220):
        ratio = 1.0 - x / 220.0
        vdraw.line([(x, 0), (x, CANVAS_H)], fill=(8, 12, 18, int(150 * ratio)))
        vdraw.line([(CANVAS_W - 1 - x, 0), (CANVAS_W - 1 - x, CANVAS_H)], fill=(8, 12, 18, int(150 * ratio)))

    bg.paste(vignette, (0, 0), vignette)
    out_path = os.path.join(BASE_DIR, 'tournament_king_of_court.jpg')
    bg.save(out_path, quality=95)
    print(f"Saved: {out_path}")


# ==============================================================================
# 2. RULO - FRIDAY WEEKEND CUP (Dark Arena + Regal Gold Glow + Enlarged Rulo Emblem)
# ==============================================================================
def process_rulo_adineh():
    print("Processing Rulo Friday Cup...")
    # Base dark arena background
    bg = Image.open(os.path.join(COURTS_DIR, 'padel_indoor.jpg')).convert('RGB')
    bg = bg.resize((CANVAS_W, CANVAS_H), Image.Resampling.LANCZOS)
    bg = ImageEnhance.Color(bg).enhance(0.3)
    bg = ImageEnhance.Brightness(bg).enhance(0.20)
    bg = bg.filter(ImageFilter.GaussianBlur(radius=5))

    # Rulo raw image
    rulo = Image.open(os.path.join(RAW_DIR, 'raw_rulo.jpg')).convert('RGB')
    
    # Scale Rulo larger so it's ~580px wide and very impactful
    rh = 940
    rw = int(rulo.width * (rh / rulo.height)) # ~527px
    rulo_res = rulo.resize((rw, rh), Image.Resampling.LANCZOS)
    rulo_res = ImageEnhance.Sharpness(rulo_res).enhance(1.35)

    # Smooth elliptical feather mask so the circular spotlight blends organically
    mask = Image.new('L', (rw, rh), 0)
    mdraw = ImageDraw.Draw(mask)
    mcx, mcy = rw // 2, rh // 2 - 25
    
    max_rx = rw // 2 - 15
    max_ry = rh // 2 - 20
    
    # Draw concentric ellipses with cosine smooth falloff
    for step in range(120, 0, -1):
        frac = step / 120.0
        cur_rx = max_rx * frac
        cur_ry = max_ry * frac
        # Cosine smoothstep from 0 to 255
        val = int(255 * (1 - math.cos(math.pi * min(1.0, (1 - frac) * 1.8))) / 2)
        mdraw.ellipse([mcx - cur_rx, mcy - cur_ry, mcx + cur_rx, mcy + cur_ry], fill=val)

    px = (CANVAS_W - rw) // 2
    py = (CANVAS_H - rh) // 2 - 15
    bg.paste(rulo_res, (px, py), mask)

    # Rich golden & cyan dual aura
    aura = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    adraw = ImageDraw.Draw(aura)
    cx, cy = CANVAS_W // 2, CANVAS_H // 2 - 40
    
    # Gold crown halo
    for r in range(320, 0, -10):
        a = int(32 * (1 - r / 320))
        adraw.ellipse([cx - r * 1.3, cy - 85 - r * 0.7, cx + r * 1.3, cy - 85 + r * 0.7], fill=(225, 175, 45, a))
    
    # Deep blue accent glow for the R
    for r in range(420, 0, -12):
        a = int(30 * (1 - r / 420))
        adraw.ellipse([cx - r * 1.5, cy + 40 - r * 0.75, cx + r * 1.5, cy + 40 + r * 0.75], fill=(14, 120, 225, a))
        
    bg.paste(aura, (0, 0), aura)

    # Vignette for card text readability
    vignette = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for y in range(CANVAS_H - 220, CANVAS_H):
        ratio = (y - (CANVAS_H - 220)) / 220.0
        vdraw.line([(0, y), (CANVAS_W, y)], fill=(8, 10, 14, int(220 * (ratio ** 1.3))))
    for x in range(250):
        ratio = 1.0 - x / 250.0
        vdraw.line([(x, 0), (x, CANVAS_H)], fill=(8, 10, 14, int(160 * ratio)))
        vdraw.line([(CANVAS_W - 1 - x, 0), (CANVAS_W - 1 - x, CANVAS_H)], fill=(8, 10, 14, int(160 * ratio)))
        
    bg.paste(vignette, (0, 0), vignette)
    out_path = os.path.join(BASE_DIR, 'tournament_friday_cup.jpg')
    bg.save(out_path, quality=95)
    print(f"Saved: {out_path}")


# ==============================================================================
# 3. LEAGUE - MEL & MOJ LEAGUE / TEHRAN LEAGUE (Ultra-Smooth Stadium Blend)
# ==============================================================================
def process_league():
    print("Processing Mel & Moj League...")
    raw_path = os.path.join(RAW_DIR, 'raw_mel_moj_league.jpg')
    league = Image.open(raw_path).convert('RGB')
    
    # Poster is 399 x 501. Scale so height is 800
    lh = 800
    lw = int(league.width * (lh / league.height)) # 637
    league_res = league.resize((lw, lh), Image.Resampling.LANCZOS)
    league_res = ImageEnhance.Sharpness(league_res).enhance(1.3)
    league_res = ImageEnhance.Contrast(league_res).enhance(1.05)

    # Get sample colors of top-left and top-right of poster
    # Sample average color of sides to tint the background arena
    bg = Image.open(os.path.join(COURTS_DIR, 'padel_indoor.jpg')).convert('RGB')
    bg = bg.resize((CANVAS_W, CANVAS_H), Image.Resampling.LANCZOS)
    
    # Color grade background arena to match the dark teal-slate of the Mel & Moj poster
    bg = ImageEnhance.Color(bg).enhance(0.25)
    bg = ImageEnhance.Brightness(bg).enhance(0.20)
    bg = bg.filter(ImageFilter.GaussianBlur(radius=6))

    # Create dark slate tint layer (matching poster edges ~ 24, 32, 38)
    tint = Image.new('RGB', (CANVAS_W, CANVAS_H), (20, 27, 34))
    bg = Image.blend(bg, tint, 0.45)

    # Ultra-smooth horizontal cosine fade on the poster sides (fade width = 140px)
    fade_w = 140
    mask = Image.new('L', (lw, lh), 255)
    mdraw = ImageDraw.Draw(mask)
    for i in range(fade_w):
        frac = i / float(fade_w)
        # Cosine smooth curve for seamless transition
        alpha = int(255 * (1 - math.cos(math.pi * frac)) / 2)
        mdraw.line([(i, 0), (i, lh)], fill=alpha)
        mdraw.line([(lw - 1 - i, 0), (lw - 1 - i, lh)], fill=alpha)

    px = (CANVAS_W - lw) // 2
    bg.paste(league_res, (px, 0), mask)

    # Add dark vignette across the sides and bottom
    vignette = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    v_draw = ImageDraw.Draw(vignette)
    
    # Side shadow fades
    for x in range(280):
        ratio = 1.0 - x / 280.0
        v_draw.line([(x, 0), (x, CANVAS_H)], fill=(10, 14, 18, int(170 * (ratio ** 1.2))))
        v_draw.line([(CANVAS_W - 1 - x, 0), (CANVAS_W - 1 - x, CANVAS_H)], fill=(10, 14, 18, int(170 * (ratio ** 1.2))))
        
    # Bottom shadow fade for text overlay
    for y in range(CANVAS_H - 220, CANVAS_H):
        ratio = (y - (CANVAS_H - 220)) / 220.0
        v_draw.line([(0, y), (CANVAS_W, y)], fill=(8, 12, 16, int(220 * (ratio ** 1.3))))
        
    bg.paste(vignette, (0, 0), vignette)
    out_path = os.path.join(BASE_DIR, 'tournament_league.jpg')
    bg.save(out_path, quality=95)
    print(f"Saved: {out_path}")


if __name__ == '__main__':
    process_king_of_court()
    process_rulo_adineh()
    process_league()
    print("Done!")
