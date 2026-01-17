import { auth } from "@/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Wrapper for fetch that automatically includes access token from session
 * Used on SERVER SIDE ONLY - Uses auth() which is safe in server context
 */
export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add access token if authentication required
  if (requireAuth) {
    const session = await auth();
    if (session?.accessToken) {
      headers["Authorization"] = `Bearer ${(session as any).accessToken}`;
    } else {
      console.warn("No access token found in session");
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: "include", // Always include cookies for refresh token
  });

  return response;
}

/**
 * Get current user profile from backend
 */
export async function getCurrentUser() {
  const res = await apiFetch("/api/User/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

/**
 * Update user balance in backend
 */
export async function updateBalance(amount: number) {
  const res = await apiFetch("/api/User/topup", {
    method: "POST",
    body: JSON.stringify(amount),
  });
  if (!res.ok) throw new Error("Failed to update balance");
  return res.json();
}

/**
 * Logout - calls backend and clears session
 */
export async function logoutUser() {
  try {
    await apiFetch("/api/User/logout", {
      method: "POST",
      requireAuth: false, // Don't require token for logout
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
}