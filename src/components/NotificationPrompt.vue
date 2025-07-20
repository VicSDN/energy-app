<template>
  <div class="notification-prompt" v-if="showPrompt">
    <div class="notification-card">
      <div class="notification-icon">
        <span class="icon-bell">🔔</span>
      </div>
      <div class="notification-content">
        <h3>Mantente informado</h3>
        <p>
          Recibe notificaciones sobre eventos, promociones y ofertas exclusivas
          de Energy Club.
        </p>
      </div>
      <div class="notification-actions">
        <button @click="requestPermission" class="allow-btn">Permitir</button>
        <button @click="dismissPrompt" class="dismiss-btn">Ahora no</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  requestNotificationPermission,
  areNotificationsEnabled,
} from "../services/notificationHelper";

export default {
  name: "NotificationPrompt",
  data() {
    return {
      showPrompt: false,
      hasRequested: false,
    };
  },
  methods: {
    async requestPermission() {
      this.showPrompt = false;
      this.hasRequested = true;
      localStorage.setItem("notificationRequested", "true");

      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          await requestNotificationPermission();
          console.log("Permisos de notificación concedidos");
        } else {
          console.log("Permisos de notificación denegados");
        }
      } else {
        console.error("Las notificaciones no son soportadas en este navegador");
      }
    },
    dismissPrompt() {
      this.showPrompt = false;

      // Guardar timestamp para no volver a mostrar en 3 días
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem(
        "notificationPromptDismissed",
        Date.now() + threeDaysMs
      );
    },
    async checkNotificationStatus() {
      // No mostrar si ya se ha solicitado antes
      if (localStorage.getItem("notificationRequested") === "true") {
        return;
      }

      // No mostrar si se ha descartado recientemente
      const dismissedUntil = localStorage.getItem(
        "notificationPromptDismissed"
      );
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil)) {
        return;
      }

      // Comprobar si ya tiene permisos
      const enabled = await areNotificationsEnabled();
      if (enabled) {
        return;
      }

      // Mostrar después de 5 segundos
      setTimeout(() => {
        this.showPrompt = true;
      }, 5000);
    },
  },
  mounted() {
    // Verificar estado de notificaciones cuando el componente se monte
    this.checkNotificationStatus();
  },
};
</script>

<style scoped>
.notification-prompt {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  animation: slideIn 0.5s forwards;
}

@keyframes slideIn {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.notification-card {
  background: rgba(20, 20, 30, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  width: 320px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.3);
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 5px;
}

.icon-bell {
  font-size: 2rem;
  display: inline-block;
  animation: ring 4s ease-in-out infinite;
  transform-origin: 50% 0;
}

@keyframes ring {
  0%,
  100% {
    transform: rotate(0);
  }
  5%,
  15% {
    transform: rotate(15deg);
  }
  10%,
  20% {
    transform: rotate(-15deg);
  }
  25% {
    transform: rotate(0);
  }
}

.notification-content h3 {
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 1.2rem;
}

.notification-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.allow-btn,
.dismiss-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.allow-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  flex-grow: 1;
  margin-right: 10px;
}

.allow-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
}

.dismiss-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 480px) {
  .notification-prompt {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }

  .notification-card {
    width: 100%;
  }
}
</style>
