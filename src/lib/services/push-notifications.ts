/**
 * Browser Push Notifications Service
 * Handles browser notification API for breaking news alerts
 */

const NOTIFICATION_PERMISSION_KEY = "notification_permission_requested";

export class PushNotificationService {
  /**
   * Check if browser notifications are supported
   */
  static isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  /**
   * Get current notification permission status
   */
  static getPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return "denied";
    }
    return Notification.permission;
  }

  /**
   * Request notification permission
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission === "denied") {
      return "denied";
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    // Store that we've requested permission
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, "true");
    }

    return permission;
  }

  /**
   * Check if permission has been requested before
   */
  static hasRequestedPermission(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(NOTIFICATION_PERMISSION_KEY) === "true";
  }

  /**
   * Show a notification
   */
  static showNotification(
    title: string,
    options?: NotificationOptions
  ): Notification | null {
    if (!this.isSupported()) {
      return null;
    }

    if (Notification.permission !== "granted") {
      return null;
    }

    const notification = new Notification(title, {
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  /**
   * Show breaking news notification
   */
  static showBreakingNewsNotification(
    title: string,
    body: string,
    url?: string
  ): Notification | null {
    const notification = this.showNotification(`BREAKING: ${title}`, {
      body,
      tag: "breaking-news", // Replace previous breaking news notifications
      requireInteraction: false,
      silent: false,
    });

    if (notification && url) {
      notification.onclick = () => {
        window.focus();
        window.location.href = url;
        notification.close();
      };
    }

    return notification;
  }
}

