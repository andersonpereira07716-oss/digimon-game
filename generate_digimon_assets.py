import os
from PIL import Image, ImageDraw

output_dir = "digimon_full_assets"
os.makedirs(output_dir, exist_ok=True)

# 1. Gerar imagem base mestra (512x512)
master_img = Image.new("RGB", (512, 512), color=(10, 14, 26))
draw = ImageDraw.Draw(master_img)
draw.ellipse([50, 50, 462, 462], outline=(37, 99, 235), width=16)
draw.ellipse([90, 90, 422, 422], fill=(15, 23, 42), outline=(96, 165, 250), width=8)
points = [(256, 100), (360, 256), (256, 412), (152, 256)]
draw.polygon(points, fill=(245, 158, 11), outline=(251, 191, 36))
inner_points = [(256, 140), (320, 256), (256, 372), (192, 256)]
draw.polygon(inner_points, fill=(252, 211, 77))
master_img.save(f"{output_dir}/digimon_master_icon.png")

# 2. Gerar tamanhos para Android (Mipmaps)
densities = {"mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96, "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192}
for density, size in densities.items():
    density_folder = f"{output_dir}/{density}"
    os.makedirs(density_folder, exist_ok=True)
    resized = master_img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(f"{density_folder}/ic_launcher.png")
    resized.save(f"{density_folder}/ic_launcher_round.png")

# 3. Gerar Foreground Adaptativo
adaptive_folder = f"{output_dir}/mipmap-anydpi-v26"
os.makedirs(adaptive_folder, exist_ok=True)
master_img.resize((432, 432), Image.Resampling.LANCZOS).save(f"{adaptive_folder}/ic_launcher_foreground.png")

# 4. Gerar Splash Screen
banner_img = Image.new("RGB", (1080, 1920), color=(15, 23, 42))
banner_draw = ImageDraw.Draw(banner_img)
banner_draw.rectangle([100, 100, 980, 1820], outline=(37, 99, 235), width=12)
banner_draw.ellipse([340, 740, 740, 1140], fill=(30, 58, 138), outline=(251, 191, 250), width=8)
banner_img.save(f"{output_dir}/digimon_splash_screen.png")

print("Assets gerados com sucesso na pasta 'digimon_full_assets'.")
