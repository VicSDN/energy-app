class NotificationService {
  constructor() {
    this.useOneSignal = true;
    this.oneSignalService = null;
    this.initialized = false;
    this.fallbackMode = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Intentar cargar OneSignal
      const oneSignalService = await import("./oneSignalService.js");
      this.oneSignalService = oneSignalService.default;

      // Dar tiempo para que OneSignal se inicialice
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const debugInfo = await this.oneSignalService.getDebugInfo();

      if (debugInfo.initialized) {
        console.log("✅ Usando OneSignal como servicio principal");
        this.useOneSignal = true;
        this.fallbackMode = false;
      } else {
        console.log("⚠️ OneSignal falló, usando notificaciones nativas");
        this.useOneSignal = false;
        this.fallbackMode = true;
      }
    } catch (error) {
      console.log("⚠️ Error cargando OneSignal, usando notificaciones nativas");
      this.useOneSignal = false;
      this.fallbackMode = true;
    }

    this.initialized = true;
  }

  async getNotificationPermission() {
    await this.init();

    if (this.useOneSignal && this.oneSignalService) {
      try {
        return await this.oneSignalService.getNotificationPermission();
      } catch (error) {
        console.warn("Error con OneSignal, usando fallback:", error);
        this.fallbackMode = true;
      }
    }

    // Fallback a API nativa
    if ("Notification" in window) {
      return Notification.permission;
    }
    return "default";
  }

  async isPushNotificationsEnabled() {
    await this.init();

    if (this.useOneSignal && this.oneSignalService && !this.fallbackMode) {
      try {
        return await this.oneSignalService.isPushNotificationsEnabled();
      } catch (error) {
        console.warn("Error con OneSignal, usando fallback:", error);
        this.fallbackMode = true;
      }
    }

    // Fallback: verificar permisos nativos
    return this.getNotificationPermission().then(
      (permission) => permission === "granted"
    );
  }

  async showNotificationPrompt() {
    await this.init();

    if (this.useOneSignal && this.oneSignalService && !this.fallbackMode) {
      try {
        const result = await this.oneSignalService.showNotificationPrompt();
        if (result.success || result.alreadySubscribed) {
          return result;
        }
        // Si OneSignal falla, intentar fallback
        console.log("OneSignal prompt falló, intentando fallback nativo");
      } catch (error) {
        console.warn("Error con OneSignal prompt, usando fallback:", error);
      }
    }

    // Fallback a API nativa
    return this.showNativeNotificationPrompt();
  }

  async showNativeNotificationPrompt() {
    try {
      if (!("Notification" in window)) {
        return {
          success: false,
          error: "Notifications not supported in this browser",
          fallback: true,
        };
      }

      const currentPermission = Notification.permission;

      if (currentPermission === "granted") {
        // Mostrar notificación de prueba
        this.showTestNotification();
        return {
          success: true,
          permission: "granted",
          subscribed: true,
          fallback: true,
          native: true,
        };
      }

      if (currentPermission === "denied") {
        return {
          success: false,
          permission: "denied",
          userDenied: true,
          fallback: true,
        };
      }

      // Solicitar permisos
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        // Mostrar notificación de bienvenida
        this.showTestNotification();
        return {
          success: true,
          permission: "granted",
          subscribed: true,
          fallback: true,
          native: true,
          justGranted: true,
        };
      }

      return {
        success: false,
        permission,
        userDenied: permission === "denied",
        fallback: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        fallback: true,
      };
    }
  }

  showTestNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("🎉 ¡Notificaciones activadas!", {
        body: "Ya recibirás notificaciones de eventos especiales",
        icon: "/img/ColorIcon.jpeg",
        badge: "/img/ColorIcon.jpeg",
        tag: "welcome",
        requireInteraction: false,
        silent: false,
      });

      // Auto-cerrar después de 4 segundos
      setTimeout(() => {
        notification.close();
      }, 4000);

      return notification;
    }
  }

  async getDebugInfo() {
    await this.init();

    const baseInfo = {
      notificationSupported: "Notification" in window,
      serviceWorkerSupported: "serviceWorker" in navigator,
      isSecureContext: window.isSecureContext,
      userAgent: navigator.userAgent,
      fallbackMode: this.fallbackMode,
      useOneSignal: this.useOneSignal,
    };

    if (this.useOneSignal && this.oneSignalService) {
      try {
        const oneSignalInfo = await this.oneSignalService.getDebugInfo();
        return {
          ...baseInfo,
          oneSignal: oneSignalInfo,
          initialized: oneSignalInfo.initialized,
          permission: oneSignalInfo.permission,
          subscribed: oneSignalInfo.subscribed,
        };
      } catch (error) {
        return {
          ...baseInfo,
          oneSignal: { error: error.message },
          initialized: false,
          permission: await this.getNotificationPermission(),
          subscribed: await this.isPushNotificationsEnabled(),
        };
      }
    }

    // Solo información nativa
    const permission = await this.getNotificationPermission();
    return {
      ...baseInfo,
      initialized: true,
      permission,
      subscribed: permission === "granted",
      nativeOnly: true,
    };
  }

  onSubscriptionChange(callback) {
    if (this.useOneSignal && this.oneSignalService && !this.fallbackMode) {
      this.oneSignalService.onSubscriptionChange(callback);
    } else {
      // Para modo fallback, podríamos escuchar cambios de permisos
      // pero la API nativa no tiene eventos específicos para esto
      console.log(
        "Subscription change listener not available in fallback mode"
      );
    }
  }
}

export default new NotificationService();
