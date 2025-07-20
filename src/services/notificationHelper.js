import notificationService from "./notificationService";

/**
 * Helper functions for notification handling
 */

/**
 * Request notification permission using native browser API
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const requestNotificationPermission = async () => {
  try {
    const result = await notificationService.requestPermission();
    if (result.success) {
      // Show welcome notification
      await notificationService.showWelcomeNotification();
    }
    return result;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if notifications are currently enabled
 * @returns {Promise<boolean>}
 */
export const areNotificationsEnabled = async () => {
  if (!("Notification" in window)) {
    return false;
  }

  return Notification.permission === "granted";
};

/**
 * Get current notification permission status
 * @returns {Promise<string>}
 */
export const getNotificationPermission = async () => {
  return await notificationService.getNotificationPermission();
};

/**
 * Show a test notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<boolean>}
 */
export const showTestNotification = async (
  title = "Test",
  body = "Esta es una notificación de prueba"
) => {
  try {
    const isEnabled = await areNotificationsEnabled();
    if (!isEnabled) {
      throw new Error("Notifications are not enabled");
    }

    notificationService.showLocalNotification(title, body);
    return true;
  } catch (error) {
    console.error("Error showing test notification:", error);
    return false;
  }
};

/**
 * Check if the browser supports notifications
 * @returns {boolean}
 */
export const isNotificationSupported = () => {
  return notificationService.isSupported();
};
