
const API_URL = "http://185.96.163.183:8000/api/v1";

export interface User {
  id: string;
  email: string;
  role: string;
  full_name: string;
  is_active: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Login failed";
      try {
        const jsonError = JSON.parse(errorText);
        errorMessage = jsonError.detail || jsonError.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function getProfile(token: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Get profile error:", error);
    throw error;
  }
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ehankki_token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ehankki_token");
  }
  return null;
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ehankki_token");
  }
}

export function isAuthenticated(): boolean {
  const token = getToken();
  // Basic check. In a real app, you might want to decode the JWT and check expiration
  return !!token;
}
