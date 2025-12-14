import { User } from "@/types/user.types";

/**
 * Get role-based dashboard URL
 */
export function getDashboardUrl(role: User["role"]): string {
  switch (role) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/admin/dashboard";
    case "EDITOR":
      return "/editor";
    case "ADVERTISER":
      return "/advertiser/dashboard";
    case "USER":
    default:
      return "/dashboard";
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: User["role"], language: "en" | "it" = "en"): string {
  const roleNames: Record<User["role"], { en: string; it: string }> = {
    SUPER_ADMIN: { en: "Super Admin", it: "Super Amministratore" },
    ADMIN: { en: "Admin", it: "Amministratore" },
    EDITOR: { en: "Editor", it: "Redattore" },
    ADVERTISER: { en: "Advertiser", it: "Inserzionista" },
    USER: { en: "User", it: "Utente" },
  };
  return roleNames[role]?.[language] || role;
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
}

/**
 * Check if route is active
 * For category routes, uses exact matching to prevent false positives
 */
export function isActiveRoute(pathname: string, route: string): boolean {
  if (route === "/") {
    return pathname === "/";
  }
  
  // For category routes, use exact matching or allow trailing slash
  // This prevents false matches when one category slug is a prefix of another
  if (route.startsWith("/category/")) {
    // Exact match or match with trailing slash (for nested routes)
    return pathname === route || pathname === route + "/" || pathname.startsWith(route + "/");
  }
  
  // For other routes, use startsWith as before
  return pathname.startsWith(route);
}

