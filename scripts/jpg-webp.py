#!/usr/bin/env python3
"""
Script to convert JPG images to WebP format while preserving original JPG files.
Converts all JPG files in /home/ubuntu/shadcn-ui/static/pic directory to WebP format.
"""

import os
from PIL import Image
import glob

def convert_jpg_to_webp(input_dir):
    """
    Convert all JPG files in the input directory to WebP format.
    
    Args:
        input_dir (str): Path to the directory containing JPG files
    """
    # Ensure the directory exists
    if not os.path.exists(input_dir):
        print(f"Directory {input_dir} does not exist")
        return
    
    # Find all JPG files (both .jpg and .jpeg extensions)
    jpg_files = glob.glob(os.path.join(input_dir, "*.jpg")) + glob.glob(os.path.join(input_dir, "*.jpeg"))
    
    if not jpg_files:
        print(f"No JPG files found in {input_dir}")
        return
    
    print(f"Found {len(jpg_files)} JPG files to convert")
    
    # Convert each JPG file to WebP
    converted_count = 0
    for jpg_file in jpg_files:
        try:
            # Open the JPG image
            with Image.open(jpg_file) as img:
                # Convert CMYK to RGB if necessary
                if img.mode == 'CMYK':
                    img = img.convert('RGB')
                
                # Generate WebP filename
                base_name = os.path.splitext(jpg_file)[0]
                webp_file = base_name + ".webp"
                
                # Save as WebP with good quality
                img.save(webp_file, 'webp', quality=85, method=6)
                print(f"Converted: {os.path.basename(jpg_file)} -> {os.path.basename(webp_file)}")
                converted_count += 1
                
        except Exception as e:
            print(f"Error converting {jpg_file}: {str(e)}")
    
    print(f"Conversion complete. {converted_count} files converted to WebP format.")

if __name__ == "__main__":
    # Directory containing JPG files
    input_directory = "/home/ubuntu/shadcn-ui/static/pic"
    
    # Convert JPG files to WebP
    convert_jpg_to_webp(input_directory)