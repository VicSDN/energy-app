class OneSignalService {
  constructor() {
    this.initialized = false;
    this.instance = null;
    this.initPromise = null;
    this.events = new EventTarget();
  }

  // Inicializar OneSignal con retry logic
  async init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeOneSignal();
    return this.initPromise;
  }

  async _initializeOneSignal() {
    return new Promise((resolve, reject) => {
      // Verificar si OneSignal ya está disponible globalmente
      if (
        window.OneSignalState?.initialized &&
        window.OneSignalState?.instance
      ) {
        this.instance = window.OneSignalState.instance;
        this.initialized = true;
        resolve(this.instance);
        return;
      }

      // Escuchar evento de inicialización exitosa
      const onReady = (event) => {
        console.log("OneSignal service: Recibido evento onesignal-ready");
        this.instance = event.detail.instance;
        this.initialized = true;
        this.events.dispatchEvent(
          new CustomEvent("ready", { detail: event.detail })
        );
        cleanup();
        resolve(this.instance);
      };

      // Escuchar evento de error
      const onError = (event) => {
        console.error(
          "OneSignal service: Recibido evento onesignal-error",
          event.detail.error
        );
        this.events.dispatchEvent(
          new CustomEvent("error", { detail: event.detail })
        );
        cleanup();
        reject(event.detail.error);
      };

      const cleanup = () => {
        window.removeEventListener("onesignal-ready", onReady);
        window.removeEventListener("onesignal-error", onError);
        clearTimeout(timeout);
      };

      // Timeout de 15 segundos
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("OneSignal initialization timeout after 15 seconds"));
      }, 15000);

      window.addEventListener("onesignal-ready", onReady);
      window.addEventListener("onesignal-error", onError);

      // Si OneSignal no está disponible después de 2 segundos, intentar carga manual
      setTimeout(() => {
        if (!window.OneSignalDeferred && !this.initialized) {
          console.warn(
            "OneSignal no detectado, posible problema de red o bloqueo"
          );
          cleanup();
          reject(
            new Error(
              "OneSignal SDK not loaded - check network connection or ad blockers"
            )
          );
        }
      }, 2000);
    });
  }

  // Verificar permisos de notificación
  async getNotificationPermission() {
    try {
      await this.init();
      return await this.instance.getNotificationPermission();
    } catch (error) {
      console.error("Error getting notification permission:", error);
      return "default";
    }
  }

  // Verificar si está suscrito
  async isPushNotificationsEnabled() {
    try {
      await this.init();
      return await this.instance.isPushNotificationsEnabled();
    } catch (error) {
      console.error("Error checking push notifications status:", error);
      return false;
    }
  }

  // Mostrar prompt de notificaciones
  async showNotificationPrompt() {
    try {
      await this.init();

      const currentPermission = await this.getNotificationPermission();
      console.log("Current permission before prompt:", currentPermission);

      if (currentPermission === "granted") {
        const isSubscribed = await this.isPushNotificationsEnabled();
        if (isSubscribed) {
          return { success: true, alreadySubscribed: true };
        } else {
          // Permisos concedidos pero no suscrito, intentar suscribir
          console.log("Permisos concedidos, intentando suscribir...");
          try {
            await this.instance.setSubscription(true);
            // Esperar un momento para que se complete la suscripción
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const isNowSubscribed = await this.isPushNotificationsEnabled();
            return {
              success: isNowSubscribed,
              permission: "granted",
              subscribed: isNowSubscribed,
              autoSubscribed: true,
            };
          } catch (subError) {
            console.error("Error al intentar suscribir:", subError);
          }
        }
      }

      // Si no tiene permisos, mostrar el slidedown prompt
      console.log("Mostrando slidedown prompt...");
      await this.instance.showSlidedownPrompt();

      // Esperar a que el usuario interactúe
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const finalPermission = await this.getNotificationPermission();
      console.log("Permisos después del prompt:", finalPermission);

      if (finalPermission === "granted") {
        // Intentar suscribir después de obtener permisos
        console.log("Permisos concedidos, intentando suscribir...");
        try {
          await this.instance.setSubscription(true);
          // Esperar para verificar suscripción
          await new Promise((resolve) => setTimeout(resolve, 1500));
          const isSubscribed = await this.isPushNotificationsEnabled();

          return {
            success: isSubscribed,
            permission: finalPermission,
            subscribed: isSubscribed,
            justSubscribed: isSubscribed,
          };
        } catch (subError) {
          console.error(
            "Error al suscribir después de obtener permisos:",
            subError
          );
          return {
            success: false,
            permission: finalPermission,
            subscribed: false,
            error: "Failed to subscribe after permission granted",
          };
        }
      } else {
        return {
          success: false,
          permission: finalPermission,
          subscribed: false,
          userDenied: finalPermission === "denied",
        };
      }
    } catch (error) {
      console.error("Error showing notification prompt:", error);
      return { success: false, error: error.message };
    }
  }

  // Registrar listener para cambios de suscripción
  onSubscriptionChange(callback) {
    this.init()
      .then(() => {
        this.instance.on("subscriptionChange", callback);
      })
      .catch((error) => {
        console.error("Error registering subscription change listener:", error);
      });
  }

  // Agregar listener para eventos del servicio
  addEventListener(event, callback) {
    this.events.addEventListener(event, callback);
  }

  removeEventListener(event, callback) {
    this.events.removeEventListener(event, callback);
  }

  // Obtener información de debugging
  async getDebugInfo() {
    try {
      await this.init();

      const permission = await this.getNotificationPermission();
      const subscribed = await this.isPushNotificationsEnabled();

      return {
        initialized: this.initialized,
        permission,
        subscribed,
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        serviceWorkerSupported: "serviceWorker" in navigator,
        notificationSupported: "Notification" in window,
      };
    } catch (error) {
      return {
        initialized: false,
        error: error.message,
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        serviceWorkerSupported: "serviceWorker" in navigator,
        notificationSupported: "Notification" in window,
      };
    }
  }
}

// Exportar instancia singleton
export default new OneSignalService();
