from PIL import Image
import os

# Ruta base de los iconos
base_path = os.path.join(os.path.dirname(__file__), '../public/icons')

# Archivo base para redimensionar (512x512)
base_icon = os.path.join(base_path, 'icon-512x512.png')

# Tamaños requeridos
sizes = [256, 384]

for size in sizes:
    out_path = os.path.join(base_path, f'icon-{size}x{size}.png')
    with Image.open(base_icon) as img:
        img = img.resize((size, size), Image.LANCZOS)
        img.save(out_path, format='PNG')
    print(f'Icono generado: {out_path}')
