<template>
  <div class="initial-check">
    <h2 class="title">Configuración inicial</h2>

    <!-- Installation Step -->
    <div
      v-if="currentStep === 'installation' && installationRequired"
      class="check-step"
    >
      <div
        class="check-icon"
        :class="{ completed: checks.installation.completed }"
      >
        <i class="fas fa-mobile-alt"></i>
      </div>
      <div class="check-content">
        <h3>Instalación de la App</h3>
        <p>{{ checks.installation.message }}</p>
        <button
          v-if="!checks.installation.completed && installPromptEvent"
          @click="promptInstall"
          :disabled="isProcessing"
          class="action-button"
        >
          Instalar App
        </button>
      </div>
    </div>

    <!-- Location Step -->
    <div v-if="currentStep === 'location'" class="check-step">
      <div class="check-icon" :class="{ completed: checks.location.completed }">
        <i class="fas fa-map-marker-alt"></i>
      </div>
      <div class="check-content">
        <h3>Ubicación</h3>
        <p>{{ checks.location.message }}</p>
        <button
          v-if="!checks.location.completed"
          @click="requestLocation"
          :disabled="isProcessing"
          class="action-button"
        >
          Permitir ubicación
        </button>
      </div>
    </div>

    <!-- Notifications Step -->
    <div v-if="currentStep === 'notifications'" class="check-step">
      <div
        class="check-icon"
        :class="{ completed: checks.notifications.completed }"
      >
        <i class="fas fa-bell"></i>
      </div>
      <div class="check-content">
        <h3>Notificaciones</h3>
        <p>{{ checks.notifications.message }}</p>
        <button
          v-if="!checks.notifications.completed"
          @click="requestNotifications"
          :disabled="isProcessing"
          class="action-button"
        >
          Activar notificaciones
        </button>
      </div>
    </div>

    <!-- Continue Button -->
    <div class="actions">
      <button
        @click="completeCheck"
        :disabled="!canProceed"
        class="continue-button"
        :class="{ active: canProceed }"
      >
        Continuar
      </button>
    </div>
  </div>
</template>

<script>
import notificationService from "@/services/notificationService";

export default {
  name: "InitialCheck",
  data() {
    return {
      checks: {
        installation: {
          required: false, // Se determina en mounted
          completed: false,
          message: "",
        },
        location: {
          required: true,
          completed: false,
          message: "",
        },
        notifications: {
          required: true,
          completed: false,
          message: "",
        },
      },
      currentStep: "installation",
      installPromptEvent: null,
      isProcessing: false,
      isMobile: false,
      isInstalled: false,
      locationPermissionGranted: false,
      notificationPermissionGranted: false,
      errorMessages: {
        location: "",
        notification: "",
        installation: "",
      },
    };
  },

  computed: {
    canProceed() {
      // En móviles, requerir todo
      if (this.isMobile) {
        return (
          this.isInstalled &&
          this.locationPermissionGranted &&
          this.notificationPermissionGranted
        );
      }
      // En desktop, solo requerir permisos
      return (
        this.locationPermissionGranted && this.notificationPermissionGranted
      );
    },

    installationRequired() {
      return this.checks.installation.required;
    },
  },

  methods: {
    async getLocationPermission() {
      try {
        // Verificar si el navegador soporta geolocalización
        if (!navigator.geolocation) {
          return "unsupported";
        }

        // Verificar el estado actual del permiso
        if (navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: "geolocation",
          });
          return permission.state;
        } else {
          // Fallback para navegadores que no soportan permissions API
          return localStorage.getItem("userLocation") ? "granted" : "prompt";
        }
      } catch (error) {
        console.error("Error al verificar permiso de ubicación:", error);
        return "prompt";
      }
    },

    async checkInstallationStatus() {
      // Verificar si es móvil
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobile =
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );

      // Solo requerir instalación en móviles
      this.checks.installation.required = isMobile;

      // Verificar si ya está instalada
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone
      ) {
        this.isInstalled = true;
        this.checks.installation.completed = true;
        this.checks.installation.message = "App instalada correctamente";
        this.currentStep = "location";
      } else if (isMobile) {
        this.isInstalled = false;
        this.checks.installation.completed = false;
        this.checks.installation.message =
          "Por favor, instala la app para continuar";
        this.listenForInstallPrompt();
      } else {
        this.isInstalled = true;
        this.checks.installation.completed = true;
        this.currentStep = "location";
      }
    },

    async checkLocationStatus() {
      try {
        const permission = await this.getLocationPermission();
        if (permission === "granted") {
          this.locationPermissionGranted = true;
          this.checks.location.completed = true;
          this.checks.location.message = "Ubicación permitida";
          this.currentStep = "notifications";
          return;
        }

        if (permission === "denied") {
          this.checks.location.message = "Necesitamos acceso a tu ubicación";
        } else {
          this.checks.location.message =
            "Permita el acceso a su ubicación para continuar";
        }
      } catch (error) {
        console.error("Error verificando ubicación:", error);
        this.checks.location.message = "Error al verificar la ubicación";
      }
    },

    async checkNotificationStatus() {
      try {
        const isEnabled =
          await notificationService.isPushNotificationsEnabled();
        if (isEnabled) {
          this.notificationPermissionGranted = true;
          this.checks.notifications.completed = true;
          this.checks.notifications.message = "Notificaciones activadas";
          return;
        }

        this.checks.notifications.message =
          "Activa las notificaciones para recibir ofertas";
      } catch (error) {
        console.error("Error verificando notificaciones:", error);
        this.checks.notifications.message = "Error al verificar notificaciones";
      }
    },

    async requestLocation() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        localStorage.setItem(
          "userLocation",
          JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        );

        this.locationPermissionGranted = true;
        this.checks.location.completed = true;
        this.checks.location.message = "Ubicación permitida";
        this.currentStep = "notifications";
      } catch (error) {
        this.checks.location.message =
          "Error al obtener ubicación. Inténtalo de nuevo.";
      } finally {
        this.isProcessing = false;
      }
    },

    async requestNotifications() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        const result = await notificationService.requestPermission();
        if (result.success) {
          this.notificationPermissionGranted = true;
          this.checks.notifications.completed = true;
          this.checks.notifications.message = "Notificaciones activadas";
          await notificationService.showWelcomeNotification();
        } else {
          this.checks.notifications.message = result.userDenied
            ? "Por favor, permite las notificaciones desde la configuración del navegador"
            : "Error al activar notificaciones";
        }
      } catch (error) {
        this.checks.notifications.message = "Error al activar notificaciones";
      } finally {
        this.isProcessing = false;
      }
    },

    listenForInstallPrompt() {
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        this.installPromptEvent = e;
      });

      window.addEventListener("appinstalled", () => {
        this.isInstalled = true;
        this.checks.installation.completed = true;
        this.checks.installation.message = "App instalada correctamente";
        this.currentStep = "location";
        this.installPromptEvent = null;
      });
    },

    async promptInstall() {
      if (!this.installPromptEvent) {
        this.checks.installation.message =
          "No se puede instalar en este momento";
        return;
      }

      try {
        await this.installPromptEvent.prompt();
        const { outcome } = await this.installPromptEvent.userChoice;

        if (outcome === "accepted") {
          this.checks.installation.message = "Instalando...";
        } else {
          this.checks.installation.message = "Instalación cancelada";
        }
      } catch (error) {
        this.checks.installation.message = "Error al instalar";
      }
    },

    async completeCheck() {
      // En móviles, requerir instalación y permisos
      if (this.isMobile) {
        if (!this.isInstalled) {
          this.errorMessages.installation =
            "Debes instalar la app para continuar";
          return;
        }

        if (!this.locationPermissionGranted) {
          this.errorMessages.location =
            "Debes permitir el acceso a la ubicación";
          return;
        }

        if (!this.notificationPermissionGranted) {
          this.errorMessages.notification = "Debes activar las notificaciones";
          return;
        }
      }
      // En desktop, solo requerir permisos
      else {
        if (!this.locationPermissionGranted) {
          this.errorMessages.location =
            "Debes permitir el acceso a la ubicación";
          return;
        }

        if (!this.notificationPermissionGranted) {
          this.errorMessages.notification = "Debes activar las notificaciones";
          return;
        }
      }

      localStorage.setItem("initialCheckComplete", "true");
      this.$emit("check-complete");
    },
  },

  async mounted() {
    // Verificar si ya completó el check inicial
    const initialCheckComplete = localStorage.getItem("initialCheckComplete");
    if (initialCheckComplete === "true" && !this.$route.query.recheck) {
      this.$emit("check-complete");
      return;
    }

    // Iniciar verificaciones en orden
    await this.checkInstallationStatus();
    await this.checkLocationStatus();
    await this.checkNotificationStatus();
  },
};
</script>

<style scoped>
.initial-check {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--primary-color, #1976d2);
  text-align: center;
}

.check-step {
  display: flex;
  width: 100%;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--surface-color, #f5f5f5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--accent-color, #ff9800);
  color: white;
  margin-right: 1rem;
  flex-shrink: 0;
}

.check-icon.completed {
  background-color: var(--success-color, #4caf50);
}

.check-content {
  flex: 1;
}

.check-content h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.check-content p {
  margin-bottom: 1rem;
  color: var(--text-secondary, #666);
}

.action-button {
  background-color: var(--primary-color, #1976d2);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover {
  background-color: var(--primary-dark, #1565c0);
}

.action-button:disabled {
  background-color: var(--disabled-color, #bdbdbd);
  cursor: not-allowed;
}

.actions {
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.continue-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  text-transform: uppercase;
  background-color: var(--disabled-color, #bdbdbd);
  color: white;
  cursor: not-allowed;
  transition: background-color 0.3s;
}

.continue-button.active {
  background-color: var(--primary-color, #1976d2);
  cursor: pointer;
}

.continue-button.active:hover {
  background-color: var(--primary-dark, #1565c0);
}

@media (max-width: 480px) {
  .check-step {
    flex-direction: column;
  }

  .check-icon {
    margin: 0 auto 1rem;
  }

  .check-content {
    text-align: center;
  }
}
</style>

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
            <span v-else-if="errorMessages.installation" class="error-icon"
              >!</span
            >
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
            <p v-if="errorMessages.location" class="error-message">
              {{ errorMessages.location }}
            </p>
            <p v-else>
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
              :disabled="isProcessing"
            >
              Permitir
            </button>
            <span v-else-if="errorMessages.location" class="error-icon">!</span>
            <span v-else-if="isProcessing" class="loading-icon fast"></span>
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
            <p v-if="errorMessages.notification" class="error-message">
              {{ errorMessages.notification }}
            </p>
            <p v-else>
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
              :disabled="isProcessing"
            >
              Permitir
            </button>
            <span v-else-if="errorMessages.notification" class="error-icon"
              >!</span
            >
            <span v-else-if="isProcessing" class="loading-icon fast"></span>
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
import notificationService from "@/services/notificationService";

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
      isProcessing: false,
      timeouts: {
        location: null,
        notification: null,
        installation: null,
      },
      errorMessages: {
        location: "",
        notification: "",
        installation: "",
      },
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
    async checkDeviceType() {
      try {
        const userAgent =
          navigator.userAgent || navigator.vendor || window.opera;
        this.isMobile =
          /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
            userAgent.toLowerCase()
          );
        this.isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
        this.isAndroid = /android/i.test(userAgent.toLowerCase());

        // Si no es móvil, saltar paso de instalación
        if (!this.isMobile) {
          this.deviceCheckComplete = true;
          this.isInstalled = true;
          return;
        }

        // En móvil, verificar instalación
        if (
          window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone
        ) {
          this.isInstalled = true;
          this.deviceCheckComplete = true;
          return;
        }

        // Iniciar verificación de instalación
        this.startInstallationCheck();
        this.deviceCheckComplete = true;
      } catch (error) {
        console.error("Error en verificación de dispositivo:", error);
        this.errorMessages.installation = "Error al verificar el dispositivo";
      }
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
      if (this.isProcessing) return;
      this.isProcessing = true;
      this.errorMessages.location = "";

      try {
        // Establecer timeout para la solicitud
        const locationPromise = new Promise((resolve, reject) => {
          this.timeouts.location = setTimeout(() => {
            reject(new Error("Timeout al solicitar ubicación"));
          }, 10000);

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const position = await locationPromise;

        this.locationPermissionGranted = true;
        this.locationPermissionDenied = false;
        localStorage.setItem(
          "userLocation",
          JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        );

        // Proceder con notificaciones si la ubicación está concedida
        if (this.locationPermissionGranted) {
          await this.checkNotificationPermission();
        }
      } catch (error) {
        console.error("Error al solicitar ubicación:", error);
        this.locationPermissionDenied = true;
        this.errorMessages.location = this.showPermissionError("location");
      } finally {
        this.isProcessing = false;
        if (this.timeouts.location) {
          clearTimeout(this.timeouts.location);
        }
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
            // Mostrar mensaje específico para la plataforma
            const errorMessage = this.showPermissionError("location");
            console.log(errorMessage); // O usar para mostrar en la interfaz
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
      if (this.isProcessing) return;
      this.isProcessing = true;
      this.errorMessages.notification = "";

      try {
        // Establecer timeout para la solicitud
        const notificationPromise = new Promise(async (resolve, reject) => {
          this.timeouts.notification = setTimeout(() => {
            reject(new Error("Timeout al solicitar notificaciones"));
          }, 10000);

          try {
            await notificationService.init();
            const result = await notificationService.requestPermission();
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });

        const result = await notificationPromise;
        this.notificationPermissionGranted = result.success;
        this.notificationPermissionDenied = !result.success;

        if (result.success) {
          notificationService.showWelcomeNotification();
        } else {
          this.errorMessages.notification =
            this.showPermissionError("notification");
        }
      } catch (error) {
        console.error("Error al solicitar permiso de notificaciones:", error);
        this.notificationPermissionDenied = true;
        this.errorMessages.notification =
          this.showPermissionError("notification");
      } finally {
        this.isProcessing = false;
        if (this.timeouts.notification) {
          clearTimeout(this.timeouts.notification);
        }
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

    async checkAllPermissions() {
      // Si es móvil y no está instalado, no proceder con los permisos
      if (this.isMobile && !this.isInstalled) {
        return;
      }

      // Verificar ubicación primero
      await this.checkLocationPermission();

      // Si la ubicación está concedida, verificar notificaciones
      if (this.locationPermissionGranted) {
        await this.checkNotificationPermission();
      }
    },

    showPermissionError(type) {
      const messages = {
        location: {
          ios: "Ve a Ajustes > Privacidad > Ubicación para permitir el acceso",
          android:
            "Ve a Ajustes > Aplicaciones > Energy Club > Permisos para permitir la ubicación",
          default:
            "Necesitamos acceso a tu ubicación para mostrarte eventos cercanos",
        },
        notification: {
          ios: "Ve a Ajustes > Notificaciones > Energy Club para activar las notificaciones",
          android:
            "Ve a Ajustes > Aplicaciones > Energy Club > Notificaciones para activarlas",
          default: "Activa las notificaciones para no perderte ningún evento",
        },
      };

      return this.isIOS
        ? messages[type].ios
        : this.isAndroid
        ? messages[type].android
        : messages[type].default;
    },

    async checkNotificationPermission() {
      try {
        // Solo proceder si la ubicación ya está concedida
        if (!this.locationPermissionGranted) {
          return;
        }

        await notificationService.init();
        const permission =
          await notificationService.getNotificationPermission();

        if (permission === "granted") {
          this.notificationPermissionGranted = true;
          this.notificationPermissionDenied = false;
          return;
        }

        // Solicitar automáticamente si la ubicación está concedida
        const result = await notificationService.requestPermission();
        this.notificationPermissionGranted = result.success;
        this.notificationPermissionDenied = !result.success;

        if (result.success) {
          notificationService.showWelcomeNotification();
        } else {
          // Mostrar mensaje específico para la plataforma
          const errorMessage = this.showPermissionError("notification");
          console.log(errorMessage); // O usar para mostrar en la interfaz
        }
      } catch (error) {
        console.error("Error al verificar permisos de notificación:", error);
        this.notificationPermissionDenied = true;
      }
    },

    handleInstall() {
      if (this.installPromptEvent) {
        this.installPromptEvent.prompt();
        this.installPromptEvent.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("Usuario aceptó la instalación");
            this.isInstalled = true;

            // Una vez instalada, proceder con los permisos
            this.checkAllPermissions();
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
      // Establecer un timeout máximo para la espera de instalación (2 minutos)
      this.timeouts.installation = setTimeout(() => {
        if (this.checkInterval) {
          clearInterval(this.checkInterval);
        }
        if (!this.isInstalled) {
          console.log(
            "Timeout de espera de instalación, procediendo con verificaciones"
          );
          this.errorMessages.installation =
            "No se detectó instalación, puede instalar más tarde";
          // Proceder con los permisos de todos modos después del timeout
          this.checkAllPermissions();
        }
      }, 120000); // 2 minutos

      this.checkInterval = setInterval(() => {
        if (
          window.matchMedia("(display-mode: standalone)").matches ||
          window.navigator.standalone
        ) {
          this.isInstalled = true;
          clearInterval(this.checkInterval);
          if (this.timeouts.installation) {
            clearTimeout(this.timeouts.installation);
          }

          // Una vez instalada, proceder con los permisos
          this.checkAllPermissions();
        }
      }, 1000);
    },
  },
  async mounted() {
    // Verificar si el usuario ya ha completado la verificación inicial
    const initialCheckComplete = localStorage.getItem("initialCheckComplete");
    if (initialCheckComplete === "true" && !this.$route.query.recheck) {
      this.showOverlay = false;
      this.$emit("check-complete");
      return;
    }

    // Iniciar verificaciones
    await this.checkDeviceType();

    // Si es móvil, esperar instalación antes de continuar
    if (this.isMobile && !this.isInstalled) {
      this.startInstallationCheck();
    } else {
      await this.checkAllPermissions();
    }
  },
  beforeUnmount() {
    // Limpiar todos los timeouts
    Object.values(this.timeouts).forEach((timeout) => {
      if (timeout) clearTimeout(timeout);
    });

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

.step-text .error-message {
  color: #f87171;
  font-weight: 500;
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

.loading-icon.fast {
  animation: spin 0.5s linear infinite;
}

.error-icon {
  color: #f87171;
  font-size: 1.2rem;
  font-weight: bold;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
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
