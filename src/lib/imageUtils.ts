
/**
 * Compresses an image file using HTMLCanvasElement.
 * @param file The original image File object.
 * @param maxWidth The maximum width for the compressed image (default: 1200px).
 * @param quality The image quality from 0 to 1 (default: 0.8).
 * @returns A Promise that resolves to a compressed Blob or File.
 */
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  // If not an image, return original
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback if context is not available
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed"));
              return;
            }
            // Create a new File object from Blob
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg", // Force JPEG for better compression
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}
