<template>
  <div v-if="showWizard" class="setup-wizard">
    <div class="wizard-content">
      <!-- Header con logo -->
      <div class="header">
        <div class="logo">
          <img src="/img/ModernIcon.svg" alt="Energy Club" />
        </div>
        <h1>🎉 ¡Bienvenido a Energy Club!</h1>
        <p class="subtitle">Configura tu experiencia perfecta en 2 pasos</p>
      </div>

      <!-- Progress bar -->
      <div class="progress-bar">
        <div
          class="progress"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>

      <!-- Paso 1: PWA Installation -->
      <div v-if="currentStep === 1" class="step">
        <h2>📱 Instalar la App</h2>
        <p>Para la mejor experiencia, instala Energy Club en tu dispositivo:</p>

        <div v-if="canInstallPWA" class="install-section">
          <button
            @click="installPWA"
            class="btn-primary"
            :disabled="installing"
          >
            <span v-if="installing">⏳ Instalando...</span>
            <span v-else>⬇️ Instalar Energy Club</span>
          </button>
        </div>

        <div v-else-if="isMobile" class="manual-install">
          <h3>📖 Instalación Manual:</h3>
          <div v-if="isIOS" class="instructions">
            <p>1. Toca el botón <strong>Compartir</strong> 🔗</p>
            <p>2. Selecciona <strong>"Añadir a pantalla inicio"</strong></p>
            <p>3. Confirma tocando <strong>"Añadir"</strong></p>
          </div>
          <div v-else class="instructions">
            <p>1. Toca el menú <strong>⋮</strong> (tres puntos)</p>
            <p>2. Selecciona <strong>"Instalar app"</strong></p>
            <p>3. Confirma la instalación</p>
          </div>
        </div>

        <div v-else class="desktop-install">
          <p>
            ✅ En escritorio, puedes usar la app directamente en el navegador.
          </p>
          <button @click="skipInstall" class="btn-secondary">
            ➡️ Continuar sin instalar
          </button>
        </div>

        <!-- Skip button for mobile if installation doesn't work -->
        <div v-if="isMobile" class="skip-option">
          <button @click="skipInstall" class="btn-text">
            Continuar sin instalar (no recomendado)
          </button>
        </div>
      </div>

      <!-- Paso 2: Notifications -->
      <div v-if="currentStep === 2" class="step">
        <h2>🔔 Activar Notificaciones</h2>
        <p>
          <strong>¡Obligatorio!</strong> Necesitas recibir notificaciones para:
        </p>

        <div class="features-list">
          <div class="feature">🎉 Eventos exclusivos</div>
          <div class="feature">💰 Ofertas especiales</div>
          <div class="feature">🎵 Nuevas canciones</div>
          <div class="feature">📣 Anuncios importantes</div>
        </div>

        <div class="notification-section">
          <button
            @click="requestNotifications"
            class="btn-primary"
            :disabled="requestingNotifications"
          >
            <span v-if="requestingNotifications">⏳ Configurando...</span>
            <span v-else>🔔 Permitir Notificaciones</span>
          </button>

          <div v-if="notificationError" class="error-message">
            ⚠️ {{ notificationError }}
            <button @click="requestNotifications" class="btn-retry">
              🔄 Reintentar
            </button>
          </div>
        </div>

        <div class="warning-box">
          <p>⚠️ <strong>Sin notificaciones no podrás continuar.</strong></p>
          <p>Son necesarias para el funcionamiento de la app.</p>
        </div>
      </div>

      <!-- Paso 3: Completado -->
      <div v-if="currentStep === 3" class="step completion">
        <div class="success-icon">✅</div>
        <h2>¡Todo Listo!</h2>
        <p>Energy Club está configurado y listo para usar.</p>

        <div class="summary">
          <div class="summary-item">
            <span class="icon">📱</span>
            <span>App {{ isInstalled ? "instalada" : "lista" }}</span>
          </div>
          <div class="summary-item">
            <span class="icon">🔔</span>
            <span>Notificaciones activadas</span>
          </div>
          <div class="summary-item">
            <span class="icon">📱</span>
            <span>Token FCM guardado</span>
          </div>
        </div>

        <button @click="completeSetup" class="btn-primary btn-large">
          🚀 Ir a Energy Club
        </button>
      </div>

      <!-- Navigation -->
      <div class="navigation">
        <div class="step-indicator">{{ currentStep }} de {{ totalSteps }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import notificationService from "../services/notificationService";

export default {
  name: "SetupWizard",
  data() {
    return {
      showWizard: true,
      currentStep: 1,
      totalSteps: 3,

      // Installation state
      canInstallPWA: false,
      installPrompt: null,
      installing: false,
      isInstalled: false,

      // Device detection
      isMobile: false,
      isIOS: false,

      // Notification state
      requestingNotifications: false,
      notificationError: null,
      notificationsEnabled: false,
    };
  },

  computed: {
    progressPercentage() {
      return (this.currentStep / this.totalSteps) * 100;
    },
  },

  mounted() {
    this.checkIfSetupNeeded();
    this.detectDevice();
    this.setupPWAListeners();
    this.checkPWAInstalled();
    this.handleInitialFlow();
  },

  methods: {
    // === SETUP VERIFICATION ===
    checkIfSetupNeeded() {
      const setupComplete = localStorage.getItem("setup-complete");
      const notificationsSetup = notificationService.isSetupComplete();

      if (setupComplete === "true" && notificationsSetup) {
        this.showWizard = false;
        this.$emit("setup-complete");
        return;
      }

      // Clear any partial setups
      localStorage.removeItem("setup-complete");
    },

    // === DEVICE DETECTION ===
    detectDevice() {
      const ua = navigator.userAgent.toLowerCase();
      this.isMobile =
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
      this.isIOS = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    },

    // === PWA INSTALLATION ===
    setupPWAListeners() {
      window.addEventListener("beforeinstallprompt", (e) => {
        // eslint-disable-next-line no-console
        console.log("📦 PWA install prompt detected!");
        e.preventDefault();
        this.installPrompt = e;
        this.canInstallPWA = true;
      });

      window.addEventListener("appinstalled", () => {
        // eslint-disable-next-line no-console
        console.log("✅ PWA installed successfully!");
        this.isInstalled = true;
        this.canInstallPWA = false;
        this.installPrompt = null;
        this.nextStep();
      });
    },

    checkPWAInstalled() {
      this.isInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
    },

    async installPWA() {
      if (!this.installPrompt) return;

      this.installing = true;

      try {
        this.installPrompt.prompt();
        const result = await this.installPrompt.userChoice;

        if (result.outcome === "accepted") {
          this.isInstalled = true;
          this.nextStep();
        } else {
          // User declined, offer to continue
          this.skipInstall();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error during PWA installation:", error);
        this.skipInstall();
      } finally {
        this.installing = false;
        this.installPrompt = null;
      }
    },

    skipInstall() {
      // For desktop or when installation fails
      if (!this.isMobile) {
        this.isInstalled = true; // Consider desktop as "installed"
      }
      this.nextStep();
    },

    // === NOTIFICATIONS ===
    async requestNotifications() {
      if (this.requestingNotifications) return;

      this.requestingNotifications = true;
      this.notificationError = null;

      try {
        // eslint-disable-next-line no-console
        console.log("🔔 Solicitando permisos de notificación...");

        const result = await notificationService.requestPermission();

        if (result.success) {
          this.notificationsEnabled = true;
          // eslint-disable-next-line no-console
          console.log("✅ Notificaciones configuradas");
          // eslint-disable-next-line no-console
          console.log("📱 Token FCM:", result.token);

          // Small delay for better UX
          setTimeout(() => {
            this.nextStep();
          }, 1500);
        } else {
          this.notificationError =
            result.error || "Error al configurar notificaciones";
          // eslint-disable-next-line no-console
          console.error("❌ Error:", result);
        }
      } catch (error) {
        this.notificationError = "Error inesperado. Inténtalo de nuevo.";
        // eslint-disable-next-line no-console
        console.error("❌ Error inesperado:", error);
      } finally {
        this.requestingNotifications = false;
      }
    },

    // === NAVIGATION ===
    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    },

    // === INITIAL FLOW HANDLER ===
    handleInitialFlow() {
      // eslint-disable-next-line no-console
      console.log("🔍 Setup Wizard Debug Info:");
      // eslint-disable-next-line no-console
      console.log("  - isMobile:", this.isMobile);
      // eslint-disable-next-line no-console
      console.log("  - canInstallPWA:", this.canInstallPWA);
      // eslint-disable-next-line no-console
      console.log("  - isInstalled:", this.isInstalled);
      // eslint-disable-next-line no-console
      console.log("  - currentStep:", this.currentStep);

      // For desktop: wait a bit for beforeinstallprompt event, then auto-advance
      if (!this.isMobile) {
        // eslint-disable-next-line no-console
        console.log(
          "🖥️ Desktop detected, waiting for PWA prompt or auto-advancing..."
        );

        setTimeout(() => {
          // If after 2 seconds we still don't have PWA prompt, consider desktop as "installed"
          if (!this.canInstallPWA && !this.isInstalled) {
            // eslint-disable-next-line no-console
            console.log(
              "⏭️ No PWA prompt available, treating as installed and advancing..."
            );
            this.isInstalled = true;
            this.nextStep();
          }
        }, 2000);
      }
    },

    completeSetup() {
      // Mark setup as complete
      localStorage.setItem("setup-complete", "true");

      // Hide wizard
      this.showWizard = false;

      // Emit completion
      this.$emit("setup-complete");

      // Show welcome notification after a delay
      setTimeout(() => {
        if (this.notificationsEnabled) {
          notificationService.showWelcomeNotification();
        }
      }, 2000);
    },
  },
};
</script>

<style scoped>
.setup-wizard {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
  overflow-y: auto;
}

.wizard-content {
  max-width: 460px;
  width: 100%;
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(139, 92, 246, 0.3);
  color: white;
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
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
    filter: drop-shadow(0 0 15px rgba(139, 92, 246, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 25px rgba(139, 92, 246, 1));
  }
}

.header h1 {
  font-size: 1.8rem;
  margin: 0 0 10px 0;
  font-weight: bold;
}

.subtitle {
  color: #bbb;
  font-size: 1rem;
  margin: 0;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(139, 92, 246, 0.2);
  border-radius: 2px;
  margin-bottom: 30px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #7c3aed);
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* Steps */
.step {
  text-align: center;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.step h2 {
  font-size: 1.5rem;
  margin: 0 0 15px 0;
  color: #64ffda;
}

.step p {
  color: #ccc;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin: 10px 0;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
  border: 2px solid rgba(139, 92, 246, 0.4);
  padding: 14px 28px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin: 10px 0;
}

.btn-secondary:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: translateY(-1px);
}

.btn-text {
  background: none;
  color: #999;
  border: none;
  padding: 10px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.3s;
}

.btn-text:hover {
  color: #ccc;
  text-decoration: underline;
}

.btn-large {
  padding: 20px 40px;
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
  }
}

.btn-retry {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.4);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.3s;
}

.btn-retry:hover {
  background: rgba(245, 158, 11, 0.3);
}

/* Features List */
.features-list {
  margin: 20px 0;
  text-align: left;
}

.feature {
  padding: 8px 0;
  color: #ccc;
  font-size: 1rem;
}

/* Manual Install */
.manual-install {
  background: rgba(139, 92, 246, 0.1);
  border: 2px dashed rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.manual-install h3 {
  color: #8b5cf6;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
}

.instructions p {
  text-align: left;
  margin: 8px 0;
  color: #ddd;
}

/* Warning Box */
.warning-box {
  background: rgba(245, 158, 11, 0.1);
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 12px;
  padding: 15px;
  margin: 20px 0;
}

.warning-box p {
  margin: 5px 0;
  color: #f59e0b;
  font-size: 0.95rem;
}

/* Error Message */
.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 15px;
  margin: 15px 0;
  color: #ef4444;
  font-size: 0.95rem;
}

/* Completion Step */
.completion {
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.summary {
  background: rgba(16, 185, 129, 0.1);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 8px 0;
  color: #10b981;
  font-weight: 500;
}

.summary-item .icon {
  margin-right: 10px;
  font-size: 1.2rem;
}

/* Navigation */
.navigation {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.step-indicator {
  color: #999;
  font-size: 0.9rem;
}

/* Skip Option */
.skip-option {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Responsive */
@media (max-width: 480px) {
  .wizard-content {
    padding: 30px 20px;
    margin: 10px;
  }

  .logo {
    width: 60px;
    height: 60px;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .step {
    min-height: 250px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 14px 24px;
    font-size: 1rem;
  }
}
</style>
