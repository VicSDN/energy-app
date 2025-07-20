import { initFirebaseApp } from "./firebase";

/**
 * Service to handle Firebase Cloud Messaging (FCM) for notifications
 * with cross-platform support
 */
class NotificationService {
  constructor() {
    this.messaging = null;
    this.vendor = "Firebase";
    this.initialized = false;
    this.vapidKey =
      "BJbqZGiIYyyU1MvKmejZFgsAluhSLJE164pHT_mwVzWGzl707SwK_h01W7OUD5R0yLvUxElwtoHNP7wej3-bwQU";
    this.isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.isAndroid = /Android/.test(navigator.userAgent);
  }

  /**
   * Check if notifications are supported by this browser/device
   * @returns {boolean} True if notifications are supported
   */
  isSupported() {
    return (
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  }

  /**
   * Initialize Firebase Messaging with platform-specific handling
   * @returns {Promise<boolean>} True if initialization was successful, false otherwise
   */
  async init() {
    if (this.initialized) return true;

    try {
      if (!this.isSupported()) {
        throw new Error(
          "Las notificaciones no son soportadas en este dispositivo/navegador"
        );
      }

      // En iOS, solo usar notificaciones web básicas
      if (this.isIOS) {
        this.initialized = true;
        return true;
      }

      // Lazy load Firebase messaging
      const app = await initFirebaseApp();
      const { getMessaging } = await import("firebase/messaging");
      this.messaging = getMessaging(app);
      this.initialized = true;
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error inicializando notificaciones:", error);
      return false;
    }
  }

  /**
   * Request notification permission from the user
   * @returns {Promise<Object>} Result of the permission request
   */
  async requestPermission() {
    try {
      await this.init();

      if (!("Notification" in window)) {
        return {
          success: false,
          error: "Las notificaciones no están soportadas en este navegador",
        };
      }

      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        this.token = await this.getOrGenerateToken();
        this.setupForegroundMessages();
        return {
          success: true,
          permission: "granted",
        };
      }

      return {
        success: false,
        permission,
        userDenied: permission === "denied",
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al solicitar permisos:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get the FCM token or generate a new one with platform-specific handling
   * @returns {Promise<string|null>} The FCM token or null if an error occurred
   */
  async getOrGenerateToken() {
    // Para iOS, usar un token simulado ya que FCM no funciona bien
    if (this.isIOS) {
      return "ios-device-token";
    }

    try {
      const { getToken } = await import("firebase/messaging");
      return await getToken(this.messaging, { vapidKey: this.vapidKey });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al obtener token:", error);
      return null;
    }
  }

  /**
   * Set up foreground message handling with platform-specific optimizations
   */
  async setupForegroundMessages() {
    // No es necesario para iOS ya que usamos notificaciones web estándar
    if (this.isIOS) return;

    if (!this.messaging) return;

    try {
      const { onMessage } = await import("firebase/messaging");
      onMessage(this.messaging, (payload) => {
        if (payload.notification) {
          const { title, body } = payload.notification;
          this.showLocalNotification(title, body);
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error setting up foreground messages:", error);
    }
  }

  /**
   * Show a local notification using the browser's Notification API
   * with platform-specific optimizations
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @returns {Notification|undefined} Notification object or undefined if not supported/permitted
   */
  showLocalNotification(title, body) {
    if (!("Notification" in window) || Notification.permission !== "granted")
      return;

    const options = {
      body,
      icon: "/img/ModernIcon.svg",
      badge: "/img/ModernIcon.svg",
      tag: "energy-club",
      requireInteraction: false,
      silent: false,
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1,
      },
    };

    // Añadir vibración para móviles
    if (this.isIOS || this.isAndroid) {
      options.vibrate = [200, 100, 200];
    }

    const notification = new Notification(title, options);

    // En iOS, cerrar más rápido para mejorar la experiencia
    const timeout = this.isIOS ? 3000 : 4000;
    setTimeout(() => notification.close(), timeout);

    return notification;
  }

  /**
   * Show a welcome notification when notifications are enabled
   * @returns {Notification|undefined} Notification object or undefined if not supported/permitted
   */
  async showWelcomeNotification() {
    return this.showLocalNotification(
      "🎉 ¡Notificaciones activadas!",
      "Ahora recibirás notificaciones sobre eventos y promociones exclusivas."
    );
  }

  /**
   * Get the current notification permission status
   * @returns {Promise<string>} Permission status: "granted", "denied", or "default"
   */
  async getNotificationPermission() {
    return "Notification" in window ? Notification.permission : "default";
  }

  /**
   * Check if push notifications are enabled with platform-specific handling
   * @returns {Promise<boolean>} True if notifications are enabled and token exists
   */
  async isPushNotificationsEnabled() {
    // Para iOS, solo verificar el permiso ya que no usamos FCM
    if (this.isIOS) {
      return Notification.permission === "granted";
    }

    // Para otras plataformas, verificar permiso y token
    return Notification.permission === "granted" && !!this.token;
  }

  /**
   * Register a callback for subscription changes
   * @param {Function} callback - Function to call when subscription status changes
   */
  onSubscriptionChange(callback) {
    // This is a placeholder for the actual implementation
    // In a real implementation, you would set up a listener for subscription changes
    // eslint-disable-next-line no-console
    console.log("Subscription change callback registered", callback);
  }
}

export default new NotificationService();
