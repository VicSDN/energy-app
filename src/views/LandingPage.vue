<template>
  <div class="landing-container">
    <div class="logo-section">
      <ThreeDLogo />
    </div>

    <div class="cta-section">
      <div class="taglines-wrapper">
        <p class="tagline main-tagline">
          Tu cuerpo lo pide. Tu noche lo merece.
        </p>
        <p class="tagline secondary-tagline">Libérate</p>
      </div>

      <div class="actions">
        <!-- Paso 1: Instalación (OBLIGATORIO) -->
        <button
          type="button"
          v-if="shouldShowInstallButton"
          @click="promptPWAInstall"
          class="btn btn-primary btn-install pulse-animation"
          aria-label="Anclar aplicación al inicio"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              d="M12 15.0006L7.75732 10.758L9.17154 9.34375L11 11.1722V4H13V11.1722L14.8284 9.34375L16.2426 10.758L12 15.0006ZM18.364 17.3645C17.6536 18.0749 16.8048 18.6384 15.8647 19.0125C14.9246 19.3866 13.9114 19.5634 12.8647 19.5271C10.2913 19.4283 8.00696 18.0267 6.56686 15.7537C5.12676 13.4807 5.06019 10.7047 6.38671 8.35824C7.71322 6.01179 10.0577 4.57176 12.6311 4.57176C13.6195 4.57176 14.581 4.75053 15.4627 5.09337C16.3445 5.43621 17.1294 5.93451 17.7782 6.55901L19.1924 5.1448C18.2215 4.17385 17.0628 3.41196 15.7904 2.92398C14.5181 2.436 13.1609 2.23596 11.8056 2.34009C8.35417 2.62937 5.38575 4.70775 3.70095 7.80503C2.01614 10.9023 2.0463 14.5711 3.79155 17.6366C5.5368 20.7022 8.58077 22.6953 12.1353 22.9271C12.4819 22.9502 12.8291 22.9618 13.1768 22.9618C14.9142 22.9618 16.5801 22.4247 18.0076 21.4328L19.4218 22.847L18.364 17.3645Z"
            ></path>
          </svg>
          📱 Instalar Energy Club
        </button>

        <!-- Paso 2: Notificaciones (OBLIGATORIO después de instalar) -->
        <button
          type="button"
          v-if="shouldShowNotifyButton"
          @click="enableNotifications"
          class="btn btn-secondary btn-notify pulse-animation"
          aria-label="Activar notificaciones"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              d="M18 16.5V11.5C18 7.47715 16.0697 4.16333 12.75 3.25995V3C12.75 2.30964 12.1904 1.75 11.5 1.75C10.8096 1.75 10.25 2.30964 10.25 3V3.25995C6.93025 4.16333 5 7.47715 5 11.5V16.5L3 18.5V19.5H20V18.5L18 16.5ZM19.5 9.5C19.5 10.0523 19.0523 10.5 18.5 10.5C17.9477 10.5 17.5 10.0523 17.5 9.5C17.5 8.94772 17.9477 8.5 18.5 8.5C19.0523 8.5 19.5 8.94772 19.5 9.5ZM21.5 12.5C21.5 13.0523 21.0523 13.5 20.5 13.5C19.9477 13.5 19.5 13.0523 19.5 12.5C19.5 11.9477 19.9477 11.5 20.5 11.5C21.0523 11.5 21.5 11.9477 21.5 12.5ZM11.5 21.5C12.6046 21.5 13.5 20.6046 13.5 19.5H9.5C9.5 20.6046 10.3954 21.5 11.5 21.5Z"
            ></path>
          </svg>
          🔔 Activar Notificaciones
        </button>

        <!-- Paso 3: Entrar a la app (Solo disponible cuando está todo listo) -->
        <button
          type="button"
          v-if="shouldShowEnterButton"
          @click="goToApp"
          class="btn btn-primary btn-enter success-glow"
          aria-label="Entrar a la aplicación"
        >
          ✨ Entrar a Energy Club ✨
        </button>
      </div>

      <!-- Mensaje de bloqueo -->
      <div v-if="!canAccessApp" class="requirement-message">
        <h3>🔒 Acceso Restringido</h3>
        <p>Para acceder a Energy Club necesitas:</p>
        <div class="requirements-list">
          <div class="requirement" :class="{ completed: isPWAInstalled }">
            <span class="req-icon">{{ isPWAInstalled ? "✓" : "📱" }}</span>
            Instalar la aplicación
          </div>
          <div class="requirement" :class="{ completed: notificationsEnabled }">
            <span class="req-icon">{{
              notificationsEnabled ? "✓" : "🔔"
            }}</span>
            Activar las notificaciones
          </div>
        </div>
      </div>
      <p v-if="pwaMessage" class="status-message">{{ pwaMessage }}</p>
    </div>
  </div>
</template>

<script>
import ThreeDLogo from "../components/ThreeLogo.vue";
import notificationService from "../services/notificationService.js";

export default {
  name: "LandingPage",
  components: {
    ThreeDLogo,
  },
  data() {
    return {
      installPromptEvent: null,
      isPWAInstalled: false,
      notificationsEnabled: false,
      pwaMessage: "",
    };
  },
  computed: {
    shouldShowInstallButton() {
      // Mostrar siempre el botón de instalación si no está instalada
      return !this.isPWAInstalled;
    },
    shouldShowNotifyButton() {
      // Mostrar botón de notificaciones solo si la app ya está instalada
      return this.isPWAInstalled && !this.notificationsEnabled;
    },
    shouldShowEnterButton() {
      // Solo mostrar botón de entrar si está instalada Y tiene notificaciones
      return this.isPWAInstalled && this.notificationsEnabled;
    },
    canAccessApp() {
      // Solo puede acceder si está instalada Y tiene notificaciones activadas
      return this.isPWAInstalled && this.notificationsEnabled;
    },
  },
  methods: {
    // Métodos de inicialización
    checkPWAStatus() {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone;
      if (standalone) {
        this.isPWAInstalled = true;
      }
    },
    async checkNotificationStatus() {
      try {
        const [permission, isSubscribed] = await Promise.all([
          notificationService.getNotificationPermission(),
          notificationService.isPushNotificationsEnabled(),
        ]);

        this.notificationsEnabled = permission === "granted" && isSubscribed;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al verificar estado de notificaciones:", {
          error,
          message: error.message,
          code: error.code,
        });
        this.notificationsEnabled = false;
      }
    },
    performInitialRedirectLogic() {
      if (!this.isPWAInstalled) {
        this.pwaMessage =
          "Disfruta la experiencia completa instalando nuestra app.";
        return;
      }

      if (this.notificationsEnabled) {
        this.goToApp();
      } else {
        this.pwaMessage =
          "¡Bienvenido de nuevo! Considera activar las notificaciones.";
      }
    },

    // Métodos de acción
    async promptPWAInstall() {
      if (!this.installPromptEvent) {
        // Fallback para navegadores sin beforeinstallprompt o Safari
        this.pwaMessage = "Para instalar en tu dispositivo:";

        if (
          navigator.userAgent.includes("iPhone") ||
          navigator.userAgent.includes("iPad")
        ) {
          this.pwaMessage +=
            " Toca el icono 'Compartir' y selecciona 'Añadir a pantalla de inicio'";
        } else if (navigator.userAgent.includes("Android")) {
          this.pwaMessage +=
            " Ve al menú del navegador y selecciona 'Añadir a pantalla de inicio' o 'Instalar app'";
        } else {
          this.pwaMessage +=
            " Busca la opción 'Instalar' en el menú de tu navegador o en la barra de direcciones";
        }
        return;
      }

      try {
        this.pwaMessage = "Preparando instalación...";
        this.installPromptEvent.prompt();
        const { outcome } = await this.installPromptEvent.userChoice;

        this.pwaMessage =
          outcome === "accepted"
            ? "¡Instalando app! Espera un momento..."
            : "Instalación cancelada. Puedes intentarlo más tarde.";

        if (outcome === "accepted") {
          // Forzar actualización del estado después de un delay
          setTimeout(() => {
            this.checkPWAStatus();
          }, 1000);
        }

        this.installPromptEvent = null;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error durante la instalación:", error);
        this.pwaMessage =
          "Hubo un problema durante la instalación. Intenta usar el menú de tu navegador.";
      }
    },
    async enableNotifications() {
      this.pwaMessage = "Solicitando permiso para notificaciones...";

      try {
        const isAlreadyEnabled =
          await notificationService.isPushNotificationsEnabled();
        if (isAlreadyEnabled) {
          this.notificationsEnabled = true;
          this.pwaMessage = "¡Las notificaciones ya están activadas!";
          if (this.isPWAInstalled) this.goToApp();
          return;
        }

        const result = await notificationService.requestPermission();
        if (result.success) {
          this.notificationsEnabled = true;
          this.pwaMessage = "¡Notificaciones activadas con éxito!";
          if (this.isPWAInstalled) this.goToApp();
        } else {
          this.pwaMessage = result.userDenied
            ? "Permisos denegados. Puedes habilitarlos desde configuración del navegador."
            : "Error al activar notificaciones. Inténtalo de nuevo.";
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error al activar notificaciones:", error);
        this.pwaMessage = "Hubo un problema al activar las notificaciones.";
      }
    },
    goToApp() {
      const presentationSeen = localStorage.getItem(
        "energyAppPresentationSeen"
      );
      if (presentationSeen) {
        this.$router.push("/home");
      } else {
        this.$router.push("/presentacion");
      }
    },
  },
  async mounted() {
    this.checkPWAStatus();
    await this.checkNotificationStatus();
    this.performInitialRedirectLogic();

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.installPromptEvent = e;
      this.isPWAInstalled = false;
    });

    window.addEventListener("appinstalled", () => {
      this.isPWAInstalled = true;
      this.installPromptEvent = null;
      this.pwaMessage = "¡App instalada! Preparando todo...";
      localStorage.removeItem("energyAppPresentationSeen");
      this.$router.push("/presentacion");
    });
  },
};
</script>

<style scoped lang="scss">
@use "sass:color";
.landing-container {
  min-height: 100vh;
  background-color: #0d0d0d;
  color: #f0f0f0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
}

.logo-section {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
}

.cta-section {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 700px;
  padding-top: 40vh;
}

.taglines-wrapper {
  margin-bottom: 45px;
}

.tagline {
  font-size: clamp(1.2rem, 4vw, 1.6rem);
  color: #b0b0b0;
  font-weight: 300;
  line-height: 1.4;
  margin-bottom: 12px;
  text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.3),
    0px 4px 8px rgba(124, 58, 237, 0.1);

  &.secondary-tagline {
    font-size: clamp(1.6rem, 5vw, 2.2rem);
    color: #e0e0e0;
    font-weight: 600;
    margin-bottom: 0;
    text-shadow: 0px 3px 6px rgba(0, 0, 0, 0.4),
      0px 6px 12px rgba(168, 85, 247, 0.15);
  }
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  margin-bottom: 25px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
}

.btn {
  padding: 15px 35px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
    box-shadow 0.25s ease-out, background-color 0.2s;
  min-width: 240px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    fill: currentColor;
  }

  &:hover {
    transform: translateY(-4px) scale(1.03);
    box-shadow: 0 8px 25px rgba(128, 90, 213, 0.4);
  }
  &:active {
    transform: translateY(-1px) scale(0.98);
  }
  &:focus-visible {
    outline: 2px solid #64ffda;
    outline-offset: 2px;
  }

  &-primary {
    background: linear-gradient(145deg, #8b5cf6, #7c3aed);
    color: white;
    box-shadow: 0 6px 20px rgba(128, 90, 213, 0.3);
    &:hover {
      background: linear-gradient(
        145deg,
        color.adjust(#8b5cf6, $lightness: -5%),
        color.adjust(#7c3aed, $lightness: -5%)
      );
    }
  }

  &-secondary {
    background-color: rgba(255, 255, 255, 0.08);
    color: #e0e0e0;
    border: 1px solid rgba(255, 255, 255, 0.15);
    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }
  }
}
.status-message {
  margin-top: 20px;
  font-size: 0.9rem;
  color: #9ca3af;
  min-height: 1.3em;
  font-style: italic;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animaciones para llamar la atención */
.pulse-animation {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0% {
    box-shadow: 0 6px 20px rgba(128, 90, 213, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 8px 25px rgba(128, 90, 213, 0.6);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 6px 20px rgba(128, 90, 213, 0.3);
    transform: scale(1);
  }
}

.success-glow {
  animation: success-pulse 1.5s ease-in-out infinite;
}

@keyframes success-pulse {
  0% {
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.7);
  }
  100% {
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
  }
}

/* Mensaje de requisitos */
.requirement-message {
  background: rgba(220, 38, 38, 0.1);
  border: 2px solid rgba(220, 38, 38, 0.3);
  border-radius: 16px;
  padding: 25px;
  margin-top: 30px;
  max-width: 400px;
  backdrop-filter: blur(10px);
}

.requirement-message h3 {
  color: #fca5a5;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
}

.requirement-message p {
  color: #f3f4f6;
  margin-bottom: 20px;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(220, 38, 38, 0.2);
  transition: all 0.3s ease;
}

.requirement.completed {
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.req-icon {
  font-size: 1.2rem;
  min-width: 24px;
  text-align: center;
}

.requirement.completed .req-icon {
  color: #22c55e;
}

/* Botones mejorados */
.btn-install {
  background: linear-gradient(145deg, #dc2626, #991b1b) !important;
  border: 2px solid #dc2626;
}

.btn-install:hover {
  background: linear-gradient(145deg, #b91c1c, #7f1d1d) !important;
  transform: translateY(-4px) scale(1.05);
}

.btn-notify {
  background: linear-gradient(145deg, #f59e0b, #d97706) !important;
  color: white !important;
  border: 2px solid #f59e0b;
}

.btn-notify:hover {
  background: linear-gradient(145deg, #d97706, #b45309) !important;
  border-color: #f59e0b;
}

.btn-enter {
  background: linear-gradient(145deg, #22c55e, #16a34a) !important;
  border: 2px solid #22c55e;
}

.btn-enter:hover {
  background: linear-gradient(145deg, #16a34a, #15803d) !important;
}

@media (max-width: 767px) {
  .cta-section {
    padding-top: 30vh;
  }

  .btn {
    width: 100%;
    max-width: 300px;
  }

  .requirement-message {
    margin: 20px;
    padding: 20px;
  }

  .requirements-list {
    gap: 10px;
  }

  .requirement {
    padding: 10px;
  }
}
</style>
