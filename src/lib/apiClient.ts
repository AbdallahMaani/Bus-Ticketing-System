'use client';

import { getSession } from "next-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7088";

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Client-side API wrapper for fetching with JWT token
 * Used in CLIENT COMPONENTS only (Header, TopUp, Booking, etc.)
 * Uses getSession() which is safe in client context
 */
export async function apiClientFetch(
  endpoint: string,
  options: RequestOptions = {}
) {
  const { requireAuth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add access token if authentication required
  if (requireAuth) {
    try {
      const session = await getSession();
      if (session?.accessToken) {
        headers["Authorization"] = `Bearer ${(session as any).accessToken}`;
      } else {
        console.warn("No access token found in session");
      }
    } catch (error) {
      console.error("Error getting session:", error);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });

    return response;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Get current user profile from backend
 */
export async function getCurrentUser() {
  const res = await apiClientFetch("/api/User/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

/**
 * Update user balance in backend
 */
export async function updateBalance(amount: number) {
  const res = await apiClientFetch("/api/User/topup", {
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
    await apiClientFetch("/api/User/logout", {
      method: "POST",
      requireAuth: true,
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
}
