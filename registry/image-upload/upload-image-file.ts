import { validateImageFile } from "./image-upload-validation";

/**
 * Upload an image file to your server endpoint.
 *
 * This function expects your server to handle the upload at the given endpoint
 * and return a JSON response with `{ url: string }`.
 *
 * You can customize the endpoint and headers to match your server setup.
 */
export async function uploadImageFile(
  file: File,
  options?: {
    endpoint?: string;
    headers?: Record<string, string>;
  }
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const endpoint = options?.endpoint ?? "/api/uploads";
  const headers = options?.headers ?? {};

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(endpoint, {
    body: formData,
    method: "POST",
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.url) {
    throw new Error("No URL returned from upload");
  }

  return data.url;
}
