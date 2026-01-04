import { StoredFile } from "@/types/product";

const API_URL = "http://185.96.163.183:8000/api/v1";

export async function uploadFile(
  file: File,
  namespace: string,
  entityId: string,
  token: string
): Promise<StoredFile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/storage/${namespace}/${entityId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  return response.json();
}
