export const APP_STORAGE_KEY = "phap-mon-tam-linh";

export interface AppStoredData {
  "access-token"?: string | null;
  "refresh-token"?: string | null;
  favorites?: any[];
  user?: any;
  "listening-history"?: any[];
}

/**
 * Safely reads data from localStorage['phap-mon-tam-linh'].
 * Automatically migrates from legacy individual keys if needed.
 */
export const getAppStorage = (): AppStoredData => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppStoredData;
    }

    // Migration from legacy separate keys if present
    const legacyAccessToken =
      localStorage.getItem("access_token") || localStorage.getItem("accessToken");
    const legacyRefreshToken =
      localStorage.getItem("refresh_token") || localStorage.getItem("refreshToken");

    let legacyFavorites: any[] = [];
    try {
      const favRaw = localStorage.getItem("phat-phap-favorites-storage");
      if (favRaw) {
        const parsed = JSON.parse(favRaw);
        legacyFavorites = parsed?.state?.favorites || [];
      }
    } catch {
      legacyFavorites = [];
    }

    let legacyUser: any = null;
    try {
      const authRaw = localStorage.getItem("auth-storage");
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        legacyUser = parsed?.state?.user || null;
      }
    } catch {
      legacyUser = null;
    }

    if (legacyAccessToken || legacyRefreshToken || legacyFavorites.length > 0 || legacyUser) {
      const migrated: AppStoredData = {
        "access-token": legacyAccessToken || null,
        "refresh-token": legacyRefreshToken || null,
        favorites: legacyFavorites,
        ...(legacyUser ? { user: legacyUser } : {}),
      };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(migrated));

      // Remove legacy keys
      localStorage.removeItem("access_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("phat-phap-favorites-storage");
      localStorage.removeItem("auth-storage");

      return migrated;
    }

    return {};
  } catch (error) {
    console.error("Error reading localStorage:", error);
    return {};
  }
};

/**
 * Merges and writes updated fields into localStorage['phap-mon-tam-linh'].
 */
export const setAppStorage = (patch: Partial<AppStoredData>): void => {
  if (typeof window === "undefined") return;
  try {
    const current = getAppStorage();
    const updated: AppStoredData = {
      ...current,
      ...patch,
    };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error writing localStorage:", error);
  }
};
