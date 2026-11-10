"""Cuenta regresiva de 60 -> 0 como GIF animado (1 cuadro por segundo, se reproduce UNA vez y se queda en 0).
Salida: ../assets/contador_60s.gif  (la usa build_deck.js en la diapositiva 2)
"""
import math
import sys
from PIL import Image, ImageDraw, ImageFont

SEGUNDOS = 60
W = 420          # px finales
K = 3            # sobremuestreo para bordes suaves
CLARO = len(sys.argv) > 1 and sys.argv[1] == "claro"   # python hacer_contador.py claro  -> contador_60s_claro.gif (fondo blanco)
if CLARO:
    BG, CARD, TRACK, GREEN, ORANGE, MUTED, TEXT = "#FFFFFF", "#EAF1FC", "#D3E0F5", "#0B4DB8", "#D45A00", "#4B5B7C", "#0B1F44"
else:
    BG, CARD, TRACK, GREEN, ORANGE, MUTED, TEXT = "#071A3E", "#0F2A5C", "#1B3A78", "#1FD18B", "#FF7F00", "#A9B8D6", "#FFFFFF"
FB = "C:/Windows/Fonts/arialbd.ttf" if CLARO else "C:/Windows/Fonts/segoeuib.ttf"   # la version clara (v4) usa Arial
FR = "C:/Windows/Fonts/arial.ttf" if CLARO else "C:/Windows/Fonts/segoeui.ttf"


def cuadro(t):
    S = W * K
    im = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(im)
    cx = cy = S // 2
    R = int(S * 0.47)
    d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=CARD)
    ring_w = int(S * 0.045)
    r_out = int(S * 0.465)
    box = (cx - r_out, cy - r_out, cx + r_out, cy + r_out)
    d.arc(box, 0, 360, fill=TRACK, width=ring_w)
    color = ORANGE if t <= 10 else GREEN
    if t > 0:
        d.arc(box, -90, -90 + 360 * t / SEGUNDOS, fill=color, width=ring_w)
    txt = str(t)
    size = int(S * (0.42 if len(txt) == 2 else 0.5))
    f = ImageFont.truetype(FB, size)
    bb = d.textbbox((0, 0), txt, font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    d.text((cx - tw / 2 - bb[0], cy - th / 2 - bb[1] - int(S * 0.045)), txt, font=f, fill=ORANGE if t <= 10 else TEXT)
    cap = "segundos" if t > 0 else "¡tiempo!"
    f2 = ImageFont.truetype(FR, int(S * 0.075))
    b2 = d.textbbox((0, 0), cap, font=f2)
    d.text((cx - (b2[2] - b2[0]) / 2 - b2[0], cy + int(S * 0.20)), cap, font=f2, fill=MUTED)
    return im.resize((W, W), Image.LANCZOS)


frames = [cuadro(t).quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE) for t in range(SEGUNDOS, -1, -1)]
dur = [1000] * SEGUNDOS + [600000]  # el ultimo cuadro (0) se queda en pantalla
out = "C:/Users/user/Downloads/LEVO/Andahuaylas/assets/" + ("contador_60s_claro.gif" if CLARO else "contador_60s.gif")
frames[0].save(out, save_all=True, append_images=frames[1:], duration=dur, optimize=False, disposal=1)
chk = Image.open(out)
print("cuadros:", chk.n_frames, "| loop:", chk.info.get("loop", "sin bucle (una vez)"), "| tamaño:", round(len(open(out, 'rb').read()) / 1024), "KB")
# tira de prueba: 60, 45, 30, 11, 10, 3, 0
tira = Image.new("RGB", (W * 7, W), BG)
for i, t in enumerate([60, 45, 30, 11, 10, 3, 0]):
    chk.seek(SEGUNDOS - t); tira.paste(chk.convert("RGB"), (i * W, 0))
tira.save("C:/Users/user/AppData/Local/Temp/claude/cceafa268ab4f357/ec01f1a5-f68b-42c0-8f44-0e4fe2d4e0f2/scratchpad/tira_contador" + ("_claro" if CLARO else "") + ".png")
