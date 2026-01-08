import { StoredFile } from "@/types/product";

const API_URL = "http://185.96.163.183:8000/api/v1";

export async function uploadFile(
  file: File,
  namespace: string,
  entityId: string,
  token: string
): Promise<StoredFile> {
  const formData = new FormData();
  // Explicitly provide filename to ensure Content-Disposition is set correctly
  formData.append("file", file, file.name);

  // Log for debugging
  console.log(`Uploading file: ${file.name}, type: ${file.type}, size: ${file.size}`);

  const response = await fetch(`${API_URL}/storage/${namespace}/${entityId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Do NOT set Content-Type here; let the browser set it with the boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Upload error response:", response.status, errorText);
    try {
        const jsonError = JSON.parse(errorText);
        throw new Error(jsonError.detail || `Upload failed: ${response.statusText}`);
    } catch {
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
  }

  return response.json();
}
