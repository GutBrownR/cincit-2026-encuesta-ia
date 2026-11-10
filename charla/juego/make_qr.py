"""Genera el QR del formulario para la presentacion.

Uso: python make_qr.py https://forms.gle/XXXXXXXX
Despues reconstruye la presentacion:  cd ../build && node build_deck.js
"""
import sys
import qrcode

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(1)
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=24, border=2)
qr.add_data(sys.argv[1])
qr.make(fit=True)
qr.make_image(fill_color="#071A3E", back_color="white").save("../assets/qr_formulario.png")
print("QR guardado en ../assets/qr_formulario.png ->", sys.argv[1])
