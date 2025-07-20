<template>
  <div v-if="showWelcome" class="welcome-modal">
    <div class="welcome-content">
      <h2>🎉 ¡Bienvenido a Energy Club!</h2>
      <p>Para la mejor experiencia, necesitamos activar las notificaciones.</p>

      <div class="notification-card">
        <div class="notification-icon">🔔</div>
        <div class="notification-text">
          <h3>Notificaciones</h3>
          <p>
            Recibe alertas sobre eventos exclusivos, promociones especiales y
            novedades del club.
          </p>
        </div>
      </div>

      <div class="actions">
        <button @click="skipNotifications" class="btn-skip">Ahora no</button>
        <button @click="enableNotifications" class="btn-enable">
          Activar Notificaciones
        </button>
      </div>

      <p class="small-text">
        Puedes cambiar esto más tarde en la configuración de tu navegador
      </p>
    </div>
  </div>
</template>

<script>
import notificationService from "../services/notificationService";

export default {
  name: "PWAPermissions",
  data() {
    return {
      showWelcome: false,
    };
  },
  mounted() {
    // Solo mostrar si nunca se configuró antes
    setTimeout(() => {
      if (this.shouldShowWelcome()) {
        this.showWelcome = true;
      }
    }, 4000); // Esperar 4 segundos para mejor UX
  },
  methods: {
    shouldShowWelcome() {
      // No mostrar si ya se configuró antes
      const alreadyConfigured = localStorage.getItem(
        "notifications-configured"
      );
      if (alreadyConfigured) {
        return false;
      }

      // No mostrar si ya están activadas las notificaciones
      if (Notification.permission === "granted") {
        localStorage.setItem("notifications-configured", "true");
        return false;
      }

      // No mostrar si ya fueron rechazadas recientemente
      if (Notification.permission === "denied") {
        const deniedDate = localStorage.getItem("notifications-denied-date");
        if (deniedDate) {
          const daysSinceDenied =
            (Date.now() - parseInt(deniedDate)) / (1000 * 60 * 60 * 24);
          if (daysSinceDenied < 30) {
            // No preguntar por 30 días
            return false;
          }
        }
      }

      return true;
    },

    async enableNotifications() {
      try {
        const result = await notificationService.requestPermission();
        if (result.success) {
          localStorage.setItem("notifications-configured", "true");
          localStorage.removeItem("notifications-denied-date");
          this.showWelcome = false;
          // Configurar listener de mensajes
          notificationService.setupForegroundMessages();
          // Mostrar notificación de bienvenida
          await notificationService.showWelcomeNotification();
        } else {
          // eslint-disable-next-line no-console
          console.warn("Notificaciones rechazadas:", result);
          this.skipNotifications();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al configurar notificaciones:", error);
        this.skipNotifications();
      }
    },

    skipNotifications() {
      localStorage.setItem("notifications-configured", "true");
      if (Notification.permission === "denied") {
        localStorage.setItem(
          "notifications-denied-date",
          Date.now().toString()
        );
      }
      this.showWelcome = false;
    },
  },
};
</script>

<style scoped>
.welcome-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.5s ease-out;
}

.welcome-content {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d1b69 50%, #1a1a1a 100%);
  border-radius: 24px;
  padding: 40px;
  max-width: 480px;
  width: 90%;
  border: 2px solid #8b5cf6;
  box-shadow: 0 25px 50px rgba(139, 92, 246, 0.4);
  text-align: center;
}

.welcome-content h2 {
  color: #fff;
  margin-bottom: 20px;
  font-size: 1.8rem;
  font-weight: bold;
}

.welcome-content > p {
  color: #ccc;
  margin-bottom: 30px;
  font-size: 1.1rem;
  line-height: 1.5;
}

.notification-card {
  background: rgba(139, 92, 246, 0.15);
  border-radius: 16px;
  padding: 25px;
  margin: 25px 0;
  border: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  align-items: center;
  text-align: left;
}

.notification-icon {
  font-size: 3rem;
  margin-right: 20px;
  min-width: 60px;
}

.notification-text h3 {
  color: #fff;
  margin: 0 0 10px 0;
  font-size: 1.3rem;
}

.notification-text p {
  color: #bbb;
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-skip {
  flex: 1;
  padding: 14px 20px;
  background: transparent;
  color: #8b5cf6;
  border: 2px solid #8b5cf6;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-skip:hover {
  background: rgba(139, 92, 246, 0.1);
  transform: translateY(-2px);
}

.btn-enable {
  flex: 2;
  padding: 14px 20px;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-enable:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
}

.small-text {
  color: #888;
  font-size: 0.85rem;
  margin-top: 20px;
  font-style: italic;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .welcome-content {
    padding: 30px 25px;
    margin: 20px;
  }

  .welcome-content h2 {
    font-size: 1.5rem;
  }

  .notification-card {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .notification-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .actions {
    flex-direction: column;
  }

  .btn-skip,
  .btn-enable {
    flex: none;
  }
}
</style>
