/**
 * Client-side image compressor for admin uploads.
 * Shrinks massive phone/camera photos to fast, web-optimized WebP format
 * before network upload, saving bandwidth, reducing database size, and speeding up load times.
 */
export async function compressImageClient(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<File> {
  // Never re-encode GIFs (preserves animations) or SVGs or already tiny files (< 400KB)
  if (
    file.type === "image/gif" ||
    file.type === "image/svg+xml" ||
    file.size < 400 * 1024
  ) {
    return file;
  }

  // Ensure running in browser environment
  if (typeof window === "undefined" || !window.FileReader) {
    return file;
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              return resolve(file);
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
              (blob) => {
                if (!blob || blob.size >= file.size) {
                  return resolve(file);
                }
                const baseName = file.name.replace(/\.[^.]+$/, "");
                const compressedFile = new File([blob], `${baseName}.webp`, {
                  type: "image/webp",
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              },
              "image/webp",
              quality
            );
          } catch {
            resolve(file);
          }
        };

        img.onerror = () => resolve(file);
        img.src = e.target?.result as string;
      };

      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    } catch {
      resolve(file);
    }
  });
}
