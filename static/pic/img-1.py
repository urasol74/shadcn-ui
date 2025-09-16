import os
import shutil

base_dir = r"C:\path\pic\image"

# Проходим по всем подпапкам
for root, dirs, files in os.walk(base_dir, topdown=False):
    for file in files:
        src = os.path.join(root, file)
        dst = os.path.join(base_dir, file)

        # Если файл с таким именем уже существует — добавляем суффикс
        if os.path.exists(dst):
            name, ext = os.path.splitext(file)
            i = 1
            while os.path.exists(os.path.join(base_dir, f"{name}-{i}{ext}")):
                i += 1
            dst = os.path.join(base_dir, f"{name}-{i}{ext}")

        shutil.move(src, dst)
        print(f"Перемещен: {src} → {dst}")

    # После перемещения файлов — удаляем пустые папки
    if root != base_dir:
        try:
            os.rmdir(root)
            print(f"Удалена папка: {root}")
        except OSError:
            pass  # папка не пустая
