<template>
  <div v-if="showOverlay" class="pwa-setup-overlay">
    <div class="pwa-setup-content">
      <div class="logo">
        <img src="/img/ModernIcon.svg" alt="Energy Logo" />
      </div>
      <h2>🎉 ¡Instala Energy Club!</h2>

      <!-- Paso 1: Instalar PWA -->
      <div v-if="!isInstalled" class="setup-step">
        <h3>📱 Añadir a pantalla de inicio</h3>
        <p>Para la mejor experiencia, instala nuestra app:</p>

        <button
          v-if="installPromptEvent"
          @click="handleInstall"
          class="install-btn-big"
        >
          ⬇️ Instalar App
        </button>

        <div v-else class="manual-install">
          <p class="help-text">
            No aparece el botón automático? Instálala manualmente:
          </p>
          <button @click="showInstallInstructions" class="help-btn">
            📖 ¿Cómo instalar?
          </button>
        </div>
      </div>

      <!-- Paso 2: Permitir notificaciones -->
      <div v-else-if="!notificationsAllowed" class="setup-step">
        <h3>🔔 Activar notificaciones</h3>
        <p>
          <strong>¡Obligatorio!</strong> Necesitas activar las notificaciones
          para recibir avisos de eventos y ofertas exclusivas.
        </p>

        <button @click="requestNotifications" class="notification-btn-big">
          🔔 Permitir notificaciones
        </button>

        <p class="required-note">
          ⚠️ No podrás continuar sin activar las notificaciones
        </p>
      </div>

      <!-- Paso 3: Todo listo -->
      <div v-else class="setup-complete">
        <h3>✅ ¡Todo listo!</h3>
        <p>La app está instalada y las notificaciones activadas.</p>

        <button @click="goToApp" class="go-to-app-btn">🚀 Ir a la app</button>
      </div>

      <!-- Estado actual -->
      <div class="status">
        <div class="status-item" :class="{ completed: isInstalled }">
          📱 App instalada: {{ isInstalled ? "✅" : "❌" }}
        </div>
        <div class="status-item" :class="{ completed: notificationsAllowed }">
          🔔 Notificaciones: {{ notificationsAllowed ? "✅" : "❌" }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "InitialCheck",
  data() {
    return {
      showOverlay: true,
      isMobile: false,
      isInstalled: false,
      notificationsAllowed: false,
      installPromptEvent: null,
    };
  },
  computed: {},
  methods: {
    // Detectar si es móvil
    checkMobile() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      this.isMobile =
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );

      // En desktop, considerar como "instalado" pero aún pedir notificaciones
      if (!this.isMobile) {
        this.isInstalled = true;
        // No saltarse las notificaciones en desktop, son importantes
      }
    },

    // Verificar si la PWA está instalada
    checkPWAInstalled() {
      this.isInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
    },

    // Verificar estado de notificaciones
    checkNotifications() {
      this.notificationsAllowed = Notification.permission === "granted";
    },

    // Configurar listener para instalación PWA
    setupPWAListener() {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        this.installPromptEvent = e;
      });
      window.addEventListener("appinstalled", () => {
        this.isInstalled = true;
      });
    },

    // Manejar instalación PWA
    async handleInstall() {
      if (this.installPromptEvent) {
        this.installPromptEvent.prompt();
        const choiceResult = await this.installPromptEvent.userChoice;
        if (choiceResult.outcome === "accepted") {
          this.isInstalled = true;
        }
        this.installPromptEvent = null;
      }
    },

    // Mostrar instrucciones de instalación manual
    showInstallInstructions() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
      const isAndroid = /android/i.test(userAgent.toLowerCase());
      let message = "";
      if (isIOS) {
        message =
          '1. Pulsa el botón "Compartir" (🔗)\n2. Selecciona "Añadir a pantalla de inicio"\n3. Pulsa "Añadir"';
      } else if (isAndroid) {
        message =
          '1. Pulsa los tres puntos del menú (⋮)\n2. Selecciona "Instalar aplicación"\n3. Confirma la instalación';
      } else {
        message = "Busca la opción de instalación en el menú de tu navegador.";
      }
      alert(message);
    },

    // Solicitar permisos de notificaciones
    async requestNotifications() {
      try {
        const permission = await Notification.requestPermission();
        this.notificationsAllowed = permission === "granted";
        if (this.notificationsAllowed) {
          // Mostrar notificación de bienvenida
          new Notification("¡Bienvenido a Energy Club!", {
            body: "Ya estás listo para recibir todas las novedades.",
            icon: "/img/icons/icon-192x192.png",
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al solicitar notificaciones:", error);
      }
    },

    // Ir a la app principal
    goToApp() {
      localStorage.setItem("initialCheckComplete", "true");
      this.showOverlay = false;
      this.$emit("check-complete");
      // Si es PWA instalada, abrir en modo standalone
      if (this.isInstalled && this.isMobile) {
        // Esto causará que la PWA se abra en modo standalone
        window.location.href = window.location.origin;
      }
    },
  },
  mounted() {
    // Verificar si ya completó el setup
    const initialCheckComplete = localStorage.getItem("initialCheckComplete");
    if (initialCheckComplete === "true") {
      this.showOverlay = false;
      this.$emit("check-complete");
      return;
    }

    // Iniciar verificaciones
    this.checkMobile();
    this.checkPWAInstalled();
    this.checkNotifications();
    this.setupPWAListener();
  },
};
</script>

<style scoped>
/* Overlay principal */
.pwa-setup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

/* Contenido principal */
.pwa-setup-content {
  max-width: 400px;
  width: 100%;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(139, 92, 246, 0.3);
  text-align: center;
  color: #fff;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo */
.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 30px;
  animation: glow 3s ease-in-out infinite;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@keyframes glow {
  0%,
  100% {
    filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(139, 92, 246, 1));
  }
}

/* Títulos */
h2 {
  font-size: 1.6rem;
  margin-bottom: 30px;
  color: #fff;
  font-weight: bold;
}

h3 {
  font-size: 1.3rem;
  margin-bottom: 15px;
  color: #64ffda;
}

/* Pasos del setup */
.setup-step {
  margin-bottom: 30px;
}

.setup-step p {
  margin-bottom: 20px;
  color: #ccc;
  line-height: 1.5;
}

/* Botones principales */
.install-btn-big {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-bottom: 15px;
}

.install-btn-big:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.notification-btn-big {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-bottom: 15px;
}

.notification-btn-big:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.go-to-app-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 12px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  animation: pulse-btn 2s infinite;
}

@keyframes pulse-btn {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
  }
}

.go-to-app-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
}

/* Botones secundarios */
.help-btn {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.4);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.help-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: translateY(-1px);
}

/* Instalación manual */
.manual-install {
  margin-top: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px dashed rgba(139, 92, 246, 0.3);
}

.help-text {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 15px;
}

/* Estado del setup completo */
.setup-complete {
  text-align: center;
}

.setup-complete h3 {
  color: #10b981;
  margin-bottom: 20px;
}

/* Estado actual */
.status {
  margin-top: 30px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #ccc;
  transition: color 0.3s ease;
}

.status-item.completed {
  color: #10b981;
}

/* Nota de requerido */
.required-note {
  color: #f59e0b;
  font-size: 0.9rem;
  font-weight: bold;
  background: rgba(245, 158, 11, 0.1);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  margin-top: 15px;
}

/* Responsive */
@media (max-width: 480px) {
  .pwa-setup-content {
    padding: 30px 20px;
  }

  .logo {
    width: 60px;
    height: 60px;
  }

  h2 {
    font-size: 1.4rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  .install-btn-big,
  .notification-btn-big,
  .go-to-app-btn {
    padding: 12px 20px;
    font-size: 1rem;
  }
}
</style>
