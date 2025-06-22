import { getMessaging, getToken, onMessage } from 'firebase/messaging';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.token = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return true;

    try {
      // Inicializar Firebase Messaging
      this.messaging = getMessaging();
      console.log("✅ Firebase Messaging inicializado correctamente");
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("❌ Error inicializando Firebase Messaging:", error);
      return false;
    }
  }

  async requestPermission() {
    try {
      await this.init();
      
      // Solicitar permisos de notificación
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          // Obtener token FCM
          this.token = await this.getOrGenerateToken();
          
          // Configurar manejo de mensajes en primer plano
          this.setupForegroundMessages();
          
          return {
            success: true,
            permission: "granted"
          };
        } else {
          return {
            success: false,
            permission: permission,
            userDenied: permission === "denied"
          };
        }
      } else {
        return {
          success: false,
          error: "Las notificaciones no están soportadas en este navegador"
        };
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getOrGenerateToken() {
    try {
      // VAPID Key obtenida de la consola de Firebase
      const vapidKey = 'BJbqZGiIYyyU1MvKmejZFgsAluhSLJE164pHT_mwVzWGzl707SwK_h01W7OUD5R0yLvUxElwtoHNP7wej3-bwQU';
      
      const currentToken = await getToken(this.messaging, {
        vapidKey: vapidKey
      });
      
      if (currentToken) {
        console.log('Token FCM obtenido:', currentToken.substring(0, 10) + '...');
        return currentToken;
      } else {
        console.warn('No se pudo obtener el token FCM');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  setupForegroundMessages() {
    if (!this.messaging) return;
    
    onMessage(this.messaging, (payload) => {
      console.log('Mensaje recibido en primer plano:', payload);
      
      // Mostrar notificación cuando la app está en primer plano
      if (payload.notification) {
        const { title, body } = payload.notification;
        this.showLocalNotification(title, body);
      }
    });
  }

  showLocalNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/img/ModernIcon.svg",
        badge: "/img/ModernIcon.svg",
        tag: "energy-club",
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

  async showWelcomeNotification() {
    return this.showLocalNotification(
      "🎉 ¡Notificaciones activadas!",
      "Ahora recibirás notificaciones sobre eventos y promociones exclusivas."
    );
  }

  async getNotificationPermission() {
    if ("Notification" in window) {
      return Notification.permission;
    }
    return "default";
  }

  async isPushNotificationsEnabled() {
    const permission = await this.getNotificationPermission();
    return permission === "granted" && this.token !== null;
  }

  async getDebugInfo() {
    await this.init();

    const permission = await this.getNotificationPermission();
    const subscribed = await this.isPushNotificationsEnabled();
    
    return {
      initialized: this.initialized,
      permission,
      subscribed,
      token: this.token ? this.token.substring(0, 10) + '...' : null,
      notificationSupported: "Notification" in window,
      serviceWorkerSupported: "serviceWorker" in navigator,
      isSecureContext: window.isSecureContext,
      userAgent: navigator.userAgent,
    };
  }
}

export default new NotificationService();
