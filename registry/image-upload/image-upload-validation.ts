export const IMAGE_UPLOAD_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export const MAX_IMAGE_UPLOAD_BYTES = 500 * 1024; // 500 KB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!IMAGE_UPLOAD_ACCEPT.split(",").includes(file.type)) {
    return {
      error: `Invalid file type: ${file.type}. Allowed: JPG, PNG, WebP, GIF.`,
      valid: false,
    };
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return {
      error: `File too large: ${(file.size / 1024).toFixed(1)} KB. Max: ${MAX_IMAGE_UPLOAD_BYTES / 1024} KB.`,
      valid: false,
    };
  }

  return { valid: true };
}
