import os
from PIL import Image

input_dir = "/home/ubuntu/shadcn-ui/static/pic/"
output_dir = "/home/ubuntu/shadcn-ui/static/pic-jpg/"

# создаём папку для результата, если её нет
os.makedirs(output_dir, exist_ok=True)

# перебор файлов в исходной папке
for file_name in os.listdir(input_dir):
    if file_name.lower().endswith(".webp"):
        input_path = os.path.join(input_dir, file_name)
        output_name = os.path.splitext(file_name)[0] + ".jpg"
        output_path = os.path.join(output_dir, output_name)

        try:
            img = Image.open(input_path).convert("RGB")
            img.save(output_path, "JPEG", quality=90)
            print(f"✅ {file_name} -> {output_name}")
        except Exception as e:
            print(f"❌ Ошибка при обработке {file_name}: {e}")
