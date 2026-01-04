import { Category, ConfigItem, CreateCategoryInput, CreateConfigInput } from "@/types/settings";

const API_URL = "http://185.96.163.183:8000/api/v1";

// --- Categories ---

export async function fetchCategories(token?: string): Promise<Category[]> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/categories`, {
      headers,
      cache: "no-store",
    });
    
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createCategory(data: CreateCategoryInput, token: string): Promise<Category> {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create category");
  }

  return response.json();
}

export async function deleteCategory(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete category");
  }
}

export async function updateCategory(id: string, data: Partial<CreateCategoryInput>, token: string): Promise<Category> {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update category");
  }

  return response.json();
}

// --- Configs ---

export async function fetchConfigs(token?: string): Promise<ConfigItem[]> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/configs`, {
      headers,
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Failed to fetch configs");
    return response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function createConfig(data: CreateConfigInput, token: string): Promise<ConfigItem> {
  const response = await fetch(`${API_URL}/configs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create config");
  }

  return response.json();
}

export async function deleteConfig(id: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/configs/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete config");
  }
}

export async function updateConfig(id: string, data: Partial<CreateConfigInput>, token: string): Promise<ConfigItem> {
  const response = await fetch(`${API_URL}/configs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update config");
  }

  return response.json();
}
