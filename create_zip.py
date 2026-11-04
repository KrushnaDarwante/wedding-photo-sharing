import os
import zipfile

def create_project_zip(output_path="public/aurawed-wedding-saas.zip"):
    # Ensure parent dir exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    exclude_dirs = {
        'node_modules',
        '.git',
        '.playwright-cli',
        'dist',
        '.tempmediaStorage',
        '__pycache__',
        '.cache',
        '.aistudio'
    }
    
    exclude_files = {
        'aurawed-wedding-saas.zip',
        'create_zip.py'
    }

    print(f"Creating project zip at: {output_path}")
    count = 0

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Modify dirs in-place to skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            for file in files:
                if file in exclude_files or file.endswith('.zip'):
                    continue
                file_path = os.path.join(root, file)
                # archive name relative to root
                rel_path = os.path.relpath(file_path, '.')
                if rel_path.startswith('public/aurawed-wedding-saas.zip'):
                    continue
                zipf.write(file_path, rel_path)
                count += 1
                
    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Successfully zipped {count} files ({file_size_mb:.2f} MB) into {output_path}")

if __name__ == '__main__':
    create_project_zip()
