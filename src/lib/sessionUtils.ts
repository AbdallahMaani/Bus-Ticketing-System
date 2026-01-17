// lib/sessionUtils.ts
import { getSession } from "next-auth/react";

/**
 * Safely retrieve the current user's access token
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await getSession();
    return (session as any)?.accessToken || null;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}

/**
 * Safely retrieve the current user's ID
 */
export async function getUserId(): Promise<string | null> {
  try {
    const session = await getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

/**
 * Safely retrieve the current user's role
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const session = await getSession();
    return (session?.user as any)?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session?.user;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const userRole = await getUserRole();
    return userRole === role;
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
}
