<template>
  <div v-if="showPermissions" class="permissions-modal">
    <div class="permissions-content">
      <h3>🔔 Activar Funciones Avanzadas</h3>
      <p>Para disfrutar de la mejor experiencia, activa estas funciones:</p>
      
      <div class="permission-item">
        <div class="permission-icon">🔔</div>
        <div class="permission-text">
          <h4>Notificaciones</h4>
          <p>Recibe alertas sobre eventos y promociones</p>
        </div>
        <button 
          @click="requestNotifications" 
          :class="['btn', notificationStatus]"
          :disabled="notificationStatus === 'granted'"
        >
          {{ notificationStatus === 'granted' ? '✓ Activado' : 'Activar' }}
        </button>
      </div>

      <div class="permission-item">
        <div class="permission-icon">📍</div>
        <div class="permission-text">
          <h4>Ubicación</h4>
          <p>Encuentra eventos cerca de ti</p>
        </div>
        <button 
          @click="requestLocation" 
          :class="['btn', locationStatus]"
          :disabled="locationStatus === 'granted'"
        >
          {{ locationStatus === 'granted' ? '✓ Activado' : 'Activar' }}
        </button>
      </div>

      <div class="permission-item">
        <div class="permission-icon">📱</div>
        <div class="permission-text">
          <h4>Instalar App</h4>
          <p>Accede rápidamente desde tu pantalla de inicio</p>
        </div>
        <button 
          @click="installApp" 
          :class="['btn', installStatus]"
          :disabled="!canInstall"
        >
          {{ installStatus === 'installed' ? '✓ Instalada' : 'Instalar' }}
        </button>
      </div>

      <div class="actions">
        <button @click="closeModal" class="btn-secondary">Cerrar</button>
        <button @click="skipAll" class="btn-primary">Continuar</button>
      </div>
    </div>
  </div>
</template>

<script>
import { notificationService } from '../services/notifications';

export default {
  name: 'PWAPermissions',
  data() {
    return {
      showPermissions: false,
      notificationStatus: 'default',
      locationStatus: 'default',
      installStatus: 'default',
      canInstall: false,
      deferredPrompt: null
    };
  },
  mounted() {
    this.checkInitialStatus();
    this.setupInstallPrompt();
    
    // Mostrar modal después de 3 segundos si es necesario
    setTimeout(() => {
      if (this.needsPermissions()) {
        this.showPermissions = true;
      }
    }, 3000);
  },
  methods: {
    checkInitialStatus() {
      // Verificar estado de notificaciones
      if (Notification.permission === 'granted') {
        this.notificationStatus = 'granted';
      } else if (Notification.permission === 'denied') {
        this.notificationStatus = 'denied';
      }

      // Verificar si puede instalar
      this.canInstall = notificationService.isInstallable();

      // Verificar si ya está instalada (aproximación)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        this.installStatus = 'installed';
      }
    },
    
    setupInstallPrompt() {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.canInstall = true;
      });
    },

    async requestNotifications() {
      try {
        const token = await notificationService.requestPermission();
        if (token) {
          this.notificationStatus = 'granted';
          // Aquí puedes enviar el token a tu servidor
          console.log('Token FCM:', token);
        } else {
          this.notificationStatus = 'denied';
        }
      } catch (error) {
        console.error('Error al solicitar notificaciones:', error);
        this.notificationStatus = 'denied';
      }
    },

    async requestLocation() {
      try {
        const position = await notificationService.requestLocationPermission();
        this.locationStatus = 'granted';
        console.log('Ubicación obtenida:', position);
        // Aquí puedes usar la ubicación
      } catch (error) {
        console.error('Error al obtener ubicación:', error);
        this.locationStatus = 'denied';
      }
    },

    async installApp() {
      if (this.deferredPrompt) {
        try {
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            this.installStatus = 'installed';
          }
          this.deferredPrompt = null;
        } catch (error) {
          console.error('Error al instalar:', error);
        }
      }
    },

    needsPermissions() {
      return (
        Notification.permission === 'default' ||
        (this.canInstall && this.installStatus !== 'installed')
      );
    },

    closeModal() {
      this.showPermissions = false;
    },

    skipAll() {
      this.showPermissions = false;
      // Guardar en localStorage que el usuario ya vio este modal
      localStorage.setItem('pwa-permissions-shown', 'true');
    }
  }
};
</script>

<style scoped>
.permissions-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.permissions-content {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid #8b5cf6;
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.3);
}

.permissions-content h3 {
  color: #8b5cf6;
  text-align: center;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.permissions-content p {
  color: #ccc;
  text-align: center;
  margin-bottom: 25px;
}

.permission-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(139, 92, 246, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.permission-icon {
  font-size: 2rem;
  margin-right: 15px;
  min-width: 50px;
}

.permission-text {
  flex: 1;
  margin-right: 15px;
}

.permission-text h4 {
  color: #fff;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.permission-text p {
  color: #aaa;
  margin: 0;
  font-size: 0.9rem;
  text-align: left;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 80px;
}

.btn.default {
  background: #8b5cf6;
  color: white;
}

.btn.default:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

.btn.granted {
  background: #10b981;
  color: white;
}

.btn.denied {
  background: #ef4444;
  color: white;
}

.btn.installed {
  background: #10b981;
  color: white;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  gap: 10px;
}

.btn-secondary {
  padding: 12px 24px;
  background: transparent;
  color: #8b5cf6;
  border: 2px solid #8b5cf6;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #8b5cf6;
  color: white;
}

.btn-primary {
  padding: 12px 24px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}

/* Responsive */
@media (max-width: 600px) {
  .permissions-content {
    padding: 20px;
    margin: 20px;
  }
  
  .permission-item {
    flex-direction: column;
    text-align: center;
  }
  
  .permission-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .permission-text {
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .actions {
    flex-direction: column;
  }
}
</style>
