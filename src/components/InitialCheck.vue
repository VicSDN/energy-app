<template>
  <div v-if="showOverlay" class="initial-check-overlay">
    <div class="initial-check-content">
      <div class="initial-check-logo">
        <img src="/img/ModernIcon.svg" alt="Energy Logo" />
      </div>
      <h2>¡Bienvenido a Energy Club!</h2>

      <div class="steps-container">
        <div class="step" :class="{ 'step-completed': deviceCheckComplete }">
          <div class="step-number">1</div>
          <div class="step-text">
            <h3>Verificación de dispositivo</h3>
            <p v-if="isMobile && !isInstalled">
              <strong>Añade la app a tu pantalla de inicio</strong> para acceder
              a todas las funcionalidades.
            </p>
            <p v-else>Dispositivo verificado</p>
          </div>
          <div class="step-status">
            <span v-if="deviceCheckComplete" class="check-icon">✓</span>
            <span v-else class="loading-icon"></span>
          </div>
        </div>

        <div
          class="step"
          :class="{ 'step-completed': locationPermissionGranted }"
        >
          <div class="step-number">2</div>
          <div class="step-text">
            <h3>Ubicación</h3>
            <p>
              Necesitamos tu ubicación para mostrarte distancias y eventos
              cercanos.
            </p>
          </div>
          <div class="step-status">
            <span v-if="locationPermissionGranted" class="check-icon">✓</span>
            <button
              v-else-if="locationPermissionDenied"
              @click="requestLocationPermission"
              class="permission-btn"
            >
              Permitir
            </button>
            <span v-else class="loading-icon"></span>
          </div>
        </div>

        <div
          class="step"
          :class="{ 'step-completed': notificationPermissionGranted }"
        >
          <div class="step-number">3</div>
          <div class="step-text">
            <h3>Notificaciones</h3>
            <p>
              Recibe alertas sobre eventos, promociones y ofertas exclusivas.
            </p>
          </div>
          <div class="step-status">
            <span v-if="notificationPermissionGranted" class="check-icon"
              >✓</span
            >
            <button
              v-else-if="notificationPermissionDenied"
              @click="requestNotificationPermission"
              class="permission-btn"
            >
              Permitir
            </button>
            <span v-else class="loading-icon"></span>
          </div>
        </div>
      </div>

      <div v-if="isMobile && !isInstalled" class="install-instructions">
        <h3>¡Importante! Instala esta app</h3>
        <p class="install-text">
          Para acceder a todas las funcionalidades, debes añadir esta app a tu
          pantalla de inicio.
        </p>
        <button @click="showInstallInstructions" class="install-help-btn">
          ¿Cómo instalar?
        </button>
      </div>

      <div class="action-buttons">
        <button
          v-if="allComplete || !isMobile || isInstalled"
          @click="continueToApp"
          class="continue-btn"
        >
          Continuar a la app
        </button>
        <div v-else-if="isMobile && !isInstalled" class="install-action">
          <p class="requirement-message">
            Por favor, instala la app para continuar
          </p>
          <button
            v-if="installPromptEvent"
            @click="handleInstall"
            class="install-btn"
          >
            Instalar ahora
          </button>
        </div>
      </div>
    </div>
  </div>
  <InstallToast
    v-if="!isInstalled && installPromptEvent"
    :install-prompt-event="installPromptEvent"
    :is-pwa-installed="isInstalled"
    @install="handleInstall"
  />
</template>

<script>
import InstallToast from "./InstallToast.vue";

export default {
  name: "InitialCheck",
  components: {
    InstallToast,
  },
  data() {
    return {
      showOverlay: true,
      isMobile: false,
      isIOS: false,
      isAndroid: false,
      isInstalled: false,
      deviceCheckComplete: false,
      locationPermissionGranted: false,
      locationPermissionDenied: false,
      notificationPermissionGranted: false,
      notificationPermissionDenied: false,
      installPromptEvent: null,
      checkInterval: null,
    };
  },
  computed: {
    allComplete() {
      // En móviles, se requiere instalación + permisos
      if (this.isMobile) {
        return (
          this.isInstalled &&
          this.locationPermissionGranted &&
          this.notificationPermissionGranted
        );
      }
      // En desktop, solo se requieren permisos
      return (
        this.locationPermissionGranted && this.notificationPermissionGranted
      );
    },
  },
  methods: {
    checkDeviceType() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      this.isMobile =
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );
      this.isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
      this.isAndroid = /android/i.test(userAgent.toLowerCase());

      // Verificar si la app está instalada
      this.checkInstallation();

      this.deviceCheckComplete = true;
    },

    checkInstallation() {
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone
      ) {
        this.isInstalled = true;
      }
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        this.installPromptEvent = e;
      });
      window.addEventListener("appinstalled", () => {
        this.isInstalled = true;
      });
    },

    async requestLocationPermission() {
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });
          this.locationPermissionGranted = true;
          this.locationPermissionDenied = false;
          localStorage.setItem(
            "userLocation",
            JSON.stringify({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          );
        }
      } catch (error) {
        console.error("Error al solicitar ubicación:", error);
        this.locationPermissionDenied = true;
      }
    },

    async checkLocationPermission() {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: "geolocation",
          });

          if (result.state === "granted") {
            this.locationPermissionGranted = true;
          } else if (result.state === "denied") {
            this.locationPermissionDenied = true;
          } else {
            // Solicitar permiso automáticamente
            this.requestLocationPermission();
          }

          // Escuchar cambios en el permiso
          result.onchange = () => {
            this.locationPermissionGranted = result.state === "granted";
            this.locationPermissionDenied = result.state === "denied";
          };
        } else {
          // Si la API de permisos no está disponible, intentamos obtener ubicación directamente
          this.requestLocationPermission();
        }
      } catch (error) {
        console.error("Error al verificar permisos de ubicación:", error);
        this.requestLocationPermission();
      }
    },

    async requestNotificationPermission() {
      if (!window.OneSignal) {
        console.error("OneSignal no está disponible");
        return;
      }

      try {
        // Usar OneSignal para solicitar permisos
        const result = await window.OneSignal.Notifications.requestPermission();
        this.notificationPermissionGranted = result;
        this.notificationPermissionDenied = !result;
      } catch (error) {
        console.error("Error al solicitar permiso de notificaciones:", error);
        this.notificationPermissionDenied = true;
      }
    },

    showInstallInstructions() {
      let message = "";
      if (this.isIOS) {
        message =
          '1. Pulsa el botón "Compartir" (cuadrado con flecha hacia arriba)\n2. Desplázate hacia abajo y selecciona "Añadir a pantalla de inicio"\n3. Confirma pulsando "Añadir"';
      } else if (this.isAndroid) {
        message =
          '1. Pulsa los tres puntos del menú\n2. Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio"\n3. Confirma la instalación';
      } else {
        message =
          "Para instalar la aplicación, busca la opción de instalación en el menú de tu navegador.";
      }
      alert(message);
    },

    async checkNotificationPermission() {
      if (!window.OneSignal) {
        window.addEventListener("onesignal-ready", async () => {
          try {
            const permission = await window.OneSignal.Notifications.permission;
            this.notificationPermissionGranted = permission;
            this.notificationPermissionDenied = !permission;
            if (
              !permission &&
              this.deviceCheckComplete &&
              this.locationPermissionGranted
            ) {
              this.requestNotificationPermission();
            }
          } catch (error) {
            console.error(
              "Error al verificar permisos de notificación:",
              error
            );
          }
        });
      } else {
        try {
          const permission = await window.OneSignal.Notifications.permission;
          this.notificationPermissionGranted = permission;
          this.notificationPermissionDenied = !permission;
          if (
            !permission &&
            this.deviceCheckComplete &&
            this.locationPermissionGranted
          ) {
            this.requestNotificationPermission();
          }
        } catch (error) {
          console.error("Error al verificar permisos de notificación:", error);
        }
      }
    },

    handleInstall() {
      if (this.installPromptEvent) {
        this.installPromptEvent.prompt();
        this.installPromptEvent.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("Usuario aceptó la instalación");
            this.isInstalled = true;
          }
          this.installPromptEvent = null;
        });
      }
    },

    continueToApp() {
      // Guardar en localStorage que el usuario ha completado la verificación inicial
      localStorage.setItem("initialCheckComplete", "true");

      // Cerrar el overlay
      this.showOverlay = false;

      // Emitir evento para informar que se ha completado la verificación
      this.$emit("check-complete");
    },

    // Verificar regularmente si la app ha sido instalada
    startInstallationCheck() {
      this.checkInterval = setInterval(() => {
        if (
          window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone
        ) {
          this.isInstalled = true;
          clearInterval(this.checkInterval);
        }
      }, 1000);
    },
  },
  mounted() {
    // Verificar si el usuario ya ha completado la verificación inicial
    const initialCheckComplete = localStorage.getItem("initialCheckComplete");
    if (initialCheckComplete === "true" && !this.$route.query.recheck) {
      this.showOverlay = false;
      this.$emit("check-complete");
      return;
    }

    // Realizar verificaciones iniciales
    this.checkDeviceType();
    this.checkLocationPermission();
    this.checkNotificationPermission();
    this.startInstallationCheck();
  },
  beforeUnmount() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  },
};
</script>

<style scoped>
.initial-check-overlay {
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

.initial-check-content {
  max-width: 500px;
  width: 100%;
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.3);
  text-align: center;
  color: #fff;
}

.initial-check-logo {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  animation: pulse 2s infinite;
}

.initial-check-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    filter: drop-shadow(0 0 5px rgba(139, 92, 246, 0.5));
  }
  50% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.8));
  }
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 5px rgba(139, 92, 246, 0.5));
  }
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 25px;
  color: #fff;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
}

.steps-container {
  margin: 30px 0;
  text-align: left;
}

.step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

.step-completed {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.step-number {
  width: 30px;
  height: 30px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 15px;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
}

.step-text h3 {
  margin: 0 0 5px;
  font-size: 1.1rem;
}

.step-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
  line-height: 1.4;
}

.step-status {
  margin-left: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.check-icon {
  color: #64ffda;
  font-size: 1.5rem;
  font-weight: bold;
}

.loading-icon {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(139, 92, 246, 0.3);
  border-top: 2px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.permission-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.permission-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-1px);
}

.permission-btn:active {
  transform: scale(0.95);
}

.install-instructions {
  margin: 30px 0;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.install-instructions h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #64ffda;
}

.install-text {
  margin-bottom: 20px;
  font-size: 1rem;
  line-height: 1.5;
  color: #fff;
}

.install-help-btn {
  background: rgba(139, 92, 246, 0.2);
  color: #fff;
  border: 1px solid rgba(139, 92, 246, 0.4);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.install-help-btn:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
}

.install-btn {
  background: linear-gradient(135deg, #64ffda, #4fd1c5);
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s ease;
}

.install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(100, 255, 218, 0.3);
}

.install-action {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.action-buttons {
  margin-top: 30px;
}

.continue-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.continue-btn:hover {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.continue-btn:active {
  transform: scale(0.98);
}

.requirement-message {
  color: #f87171;
  font-size: 0.9rem;
  margin: 10px 0;
}

/* Responsive styles */
@media (max-width: 480px) {
  .initial-check-content {
    padding: 20px;
  }

  .initial-check-logo {
    width: 100px;
    height: 100px;
  }

  h2 {
    font-size: 1.5rem;
  }

  .install-steps {
    flex-direction: column;
    align-items: center;
  }

  .install-step {
    max-width: 100%;
  }
}
</style>
