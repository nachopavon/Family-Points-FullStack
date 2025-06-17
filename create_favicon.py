#!/usr/bin/env python3
"""
Script para crear un favicon personalizado para Family Points
"""
from PIL import Image, ImageDraw, ImageFont
import io
import base64

def create_favicon():
    # Crear imagen de 32x32 (favicon estándar)
    size = 32
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colores: azul para el fondo, blanco para el texto
    bg_color = (59, 130, 246)  # Blue-500 (similar al tema de la app)
    text_color = (255, 255, 255)  # Blanco
    
    # Dibujar fondo circular
    margin = 2
    draw.ellipse([margin, margin, size-margin, size-margin], fill=bg_color)
    
    # Intentar usar una fuente por defecto
    try:
        # Fuente más pequeña para que quepa "FP"
        font = ImageFont.load_default()
    except:
        font = None
    
    # Dibujar texto "FP"
    text = "FP"
    if font:
        # Calcular posición centrada
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (size - text_width) // 2
        y = (size - text_height) // 2 - 2  # Ajustar un poco hacia arriba
        
        draw.text((x, y), text, fill=text_color, font=font)
    else:
        # Si no hay fuente, dibujar puntos simples
        draw.ellipse([8, 10, 12, 14], fill=text_color)  # F
        draw.ellipse([16, 10, 20, 14], fill=text_color)  # P
        draw.ellipse([8, 18, 12, 22], fill=text_color)  # punto inferior F
    
    return img

def main():
    print("Creando favicon personalizado para Family Points...")
    
    # Crear favicon
    favicon = create_favicon()
    
    # Guardar como ICO
    favicon.save('/Users/nachopavon/workspace/test-copilot-backend/frontend/public/favicon.ico', format='ICO', sizes=[(32, 32)])
    
    # También crear PNG para usar como referencia
    favicon.save('/Users/nachopavon/workspace/test-copilot-backend/frontend/public/favicon.png', format='PNG')
    
    print("✅ Favicon creado exitosamente:")
    print("  - /frontend/public/favicon.ico")
    print("  - /frontend/public/favicon.png")

if __name__ == "__main__":
    main()
