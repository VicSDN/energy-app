<template>
  <div v-if="showDebug" class="debug-panel">
    <div class="debug-header">
      <h3>OneSignal Debug Panel</h3>
      <button @click="toggleDebug" class="close-btn">&times;</button>
    </div>

    <div class="debug-content">
      <div class="status-section">
        <h4>Estado del Servicio</h4>
        <div class="status-grid">
          <div class="status-item">
            <span class="label">Inicializado:</span>
            <span
              :class="['value', debugInfo.initialized ? 'success' : 'error']"
            >
              {{ debugInfo.initialized ? "Sí" : "No" }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Permisos:</span>
            <span :class="['value', getPermissionClass(debugInfo.permission)]">
              {{ debugInfo.permission || "Desconocido" }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Suscrito:</span>
            <span
              :class="['value', debugInfo.subscribed ? 'success' : 'warning']"
            >
              {{ debugInfo.subscribed ? "Sí" : "No" }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">HTTPS:</span>
            <span
              :class="[
                'value',
                debugInfo.isSecureContext ? 'success' : 'error',
              ]"
            >
              {{ debugInfo.isSecureContext ? "Sí" : "No" }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Service Worker:</span>
            <span
              :class="[
                'value',
                debugInfo.serviceWorkerSupported ? 'success' : 'error',
              ]"
            >
              {{
                debugInfo.serviceWorkerSupported ? "Soportado" : "No soportado"
              }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Notifications API:</span>
            <span
              :class="[
                'value',
                debugInfo.notificationSupported ? 'success' : 'error',
              ]"
            >
              {{
                debugInfo.notificationSupported ? "Soportado" : "No soportado"
              }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="debugInfo.error" class="error-section">
        <h4>Error</h4>
        <p class="error-message">{{ debugInfo.error }}</p>
      </div>

      <div class="actions-section">
        <h4>Acciones de Prueba</h4>
        <div class="action-buttons">
          <button
            @click="testNotificationPrompt"
            :disabled="loading"
            class="debug-btn primary"
          >
            {{ loading ? "Probando..." : "Probar Prompt" }}
          </button>
          <button
            @click="refreshDebugInfo"
            :disabled="loading"
            class="debug-btn secondary"
          >
            Actualizar Info
          </button>
          <button
            @click="testNotificationPermission"
            :disabled="loading"
            class="debug-btn secondary"
          >
            Verificar Permisos
          </button>
        </div>
      </div>

      <div v-if="testResults.length" class="results-section">
        <h4>Resultados de Pruebas</h4>
        <div class="results-list">
          <div
            v-for="(result, index) in testResults"
            :key="index"
            :class="['result-item', result.type]"
          >
            <span class="timestamp">{{ formatTime(result.timestamp) }}</span>
            <span class="message">{{ result.message }}</span>
          </div>
        </div>
      </div>

      <div v-if="oneSignalDebugInfo.length" class="onesignal-debug-section">
        <h4>Debug OneSignal Detallado</h4>
        <div class="debug-list">
          <div
            v-for="(info, index) in oneSignalDebugInfo"
            :key="index"
            class="debug-item"
          >
            {{ info }}
          </div>
        </div>
      </div>

      <div class="browser-info">
        <h4>Info del Navegador</h4>
        <p class="user-agent">{{ debugInfo.userAgent || "No disponible" }}</p>
      </div>
    </div>
  </div>

  <!-- Botón flotante para abrir debug -->
  <button
    v-if="!showDebug && isDevelopment"
    @click="toggleDebug"
    class="debug-trigger"
  >
    🐛
  </button>
</template>

<script>
import notificationService from "../services/notificationService.js";

export default {
  name: "OneSignalDebug",
  data() {
    return {
      showDebug: false,
      debugInfo: {},
      loading: false,
      testResults: [],
      isDevelopment: process.env.NODE_ENV === "development",
    };
  },
  computed: {
    oneSignalDebugInfo() {
      if (window.OneSignalState && window.OneSignalState.debugInfo) {
        return window.OneSignalState.debugInfo;
      }
      return [];
    },
  },
  methods: {
    async toggleDebug() {
      this.showDebug = !this.showDebug;
      if (this.showDebug) {
        await this.refreshDebugInfo();
      }
    },

    async refreshDebugInfo() {
      this.loading = true;
      try {
        this.debugInfo = await notificationService.getDebugInfo();
        this.addTestResult("info", "Información actualizada correctamente");
      } catch (error) {
        this.addTestResult(
          "error",
          `Error actualizando información: ${error.message}`
        );
      } finally {
        this.loading = false;
      }
    },

    async testNotificationPrompt() {
      this.loading = true;
      this.addTestResult(
        "info",
        "Iniciando prueba de prompt de notificaciones..."
      );

      try {
        const result = await notificationService.showNotificationPrompt();

        if (result.success) {
          if (result.alreadySubscribed) {
            this.addTestResult("info", "Usuario ya estaba suscrito");
          } else if (result.native) {
            this.addTestResult("success", "Notificaciones nativas activadas");
          } else if (result.autoSubscribed) {
            this.addTestResult(
              "success",
              "Auto-suscrito con permisos existentes"
            );
          } else if (result.justSubscribed || result.justGranted) {
            this.addTestResult(
              "success",
              "Suscripción exitosa después de permisos"
            );
          } else {
            this.addTestResult("success", "Prompt exitoso - Usuario suscrito");
          }
        } else {
          if (result.userDenied) {
            this.addTestResult(
              "warning",
              "Usuario denegó permisos de notificación"
            );
          } else if (result.fallback) {
            this.addTestResult("warning", "Usando modo fallback nativo");
          } else if (result.error) {
            this.addTestResult("error", `Error: ${result.error}`);
          } else {
            this.addTestResult(
              "warning",
              `Prompt falló - Permisos: ${result.permission}, Suscrito: ${result.subscribed}`
            );
          }
        }

        // Actualizar info después de la prueba
        await this.refreshDebugInfo();
      } catch (error) {
        this.addTestResult(
          "error",
          `Error en prueba de prompt: ${error.message}`
        );
      } finally {
        this.loading = false;
      }
    },

    async testNotificationPermission() {
      this.loading = true;
      this.addTestResult("info", "Verificando permisos de notificación...");

      try {
        const permission =
          await notificationService.getNotificationPermission();
        const subscribed =
          await notificationService.isPushNotificationsEnabled();

        this.addTestResult(
          "info",
          `Permiso: ${permission}, Suscrito: ${subscribed}`
        );

        // Actualizar info
        await this.refreshDebugInfo();
      } catch (error) {
        this.addTestResult(
          "error",
          `Error verificando permisos: ${error.message}`
        );
      } finally {
        this.loading = false;
      }
    },

    getPermissionClass(permission) {
      switch (permission) {
        case "granted":
          return "success";
        case "denied":
          return "error";
        case "default":
          return "warning";
        default:
          return "error";
      }
    },

    addTestResult(type, message) {
      this.testResults.unshift({
        type,
        message,
        timestamp: new Date(),
      });

      // Mantener solo los últimos 10 resultados
      if (this.testResults.length > 10) {
        this.testResults = this.testResults.slice(0, 10);
      }
    },

    formatTime(timestamp) {
      return timestamp.toLocaleTimeString();
    },
  },

  async mounted() {
    // Auto-abrir en desarrollo si hay errores
    if (this.isDevelopment) {
      try {
        this.debugInfo = await notificationService.getDebugInfo();
        if (this.debugInfo.error || !this.debugInfo.initialized) {
          this.showDebug = true;
        }
      } catch (error) {
        console.error("Error initializing debug panel:", error);
      }
    }
  },
};
</script>

<style scoped lang="scss">
.debug-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #333;
  border-radius: 8px;
  z-index: 9999;
  font-family: "Courier New", monospace;
  font-size: 12px;
  color: #f0f0f0;
  overflow: hidden;
  backdrop-filter: blur(10px);

  @media (max-width: 480px) {
    width: calc(100% - 20px);
    right: 10px;
    left: 10px;
  }
}

.debug-header {
  background: #1a1a1a;
  padding: 10px 15px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 14px;
    color: #8b5cf6;
  }
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;

  &:hover {
    color: #f0f0f0;
  }
}

.debug-content {
  padding: 15px;
  max-height: calc(80vh - 60px);
  overflow-y: auto;

  h4 {
    margin: 0 0 10px 0;
    font-size: 13px;
    color: #ccc;
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
  }
}

.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;

  .label {
    font-size: 11px;
    color: #999;
  }

  .value {
    font-weight: bold;
    font-size: 11px;

    &.success {
      color: #10b981;
    }
    &.warning {
      color: #f59e0b;
    }
    &.error {
      color: #ef4444;
    }
  }
}

.error-section {
  margin-bottom: 20px;

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 4px;
    padding: 8px;
    color: #fca5a5;
    font-size: 11px;
    margin: 0;
  }
}

.actions-section {
  margin-bottom: 20px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.debug-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;

  &.primary {
    background: #8b5cf6;
    color: white;

    &:hover:not(:disabled) {
      background: #7c3aed;
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #ccc;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.results-section {
  margin-bottom: 20px;
}

.results-list {
  max-height: 150px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  gap: 8px;
  padding: 4px 8px;
  margin-bottom: 4px;
  border-radius: 4px;
  font-size: 11px;

  &.success {
    background: rgba(16, 185, 129, 0.1);
  }
  &.warning {
    background: rgba(245, 158, 11, 0.1);
  }
  &.error {
    background: rgba(239, 68, 68, 0.1);
  }
  &.info {
    background: rgba(59, 130, 246, 0.1);
  }

  .timestamp {
    color: #999;
    min-width: 60px;
  }

  .message {
    flex: 1;
  }
}

.onesignal-debug-section {
  margin-bottom: 20px;
}

.debug-list {
  max-height: 120px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  padding: 8px;
}

.debug-item {
  font-size: 10px;
  color: #ccc;
  margin-bottom: 2px;
  padding: 2px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
}

.browser-info {
  .user-agent {
    font-size: 10px;
    color: #666;
    word-break: break-all;
    margin: 0;
    padding: 8px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 4px;
  }
}

.debug-trigger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #8b5cf6;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 9998;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
    background: #7c3aed;
  }
}
</style>
