<template>
  <div class="notification-test">
    <h3>Estado de Notificaciones</h3>
    <div class="status-container">
      <p>Estado: {{ status }}</p>
      <button 
        @click="requestPermission" 
        class="permission-btn"
        :disabled="isGranted"
      >
        {{ isGranted ? 'Notificaciones Activadas' : 'Activar Notificaciones' }}
      </button>
    </div>
    
    <div v-if="isGranted" class="test-container">
      <button @click="sendTestNotification" class="test-btn">
        Enviar Notificación de Prueba
      </button>
    </div>
  </div>
</template>

<script>
import notificationService from '@/services/notificationService';

export default {
  name: 'NotificationTest',
  data() {
    return {
      status: 'Verificando...',
      isGranted: false
    };
  },
  async mounted() {
    await this.checkStatus();
  },
  methods: {
    async checkStatus() {
      const permission = await notificationService.getNotificationPermission();
      this.isGranted = permission === 'granted';
      this.status = this.isGranted ? 'Notificaciones Activadas' : 'Notificaciones Desactivadas';
    },
    async requestPermission() {
      const result = await notificationService.requestPermission();
      if (result.success) {
        this.isGranted = true;
        this.status = 'Notificaciones Activadas';
        notificationService.showWelcomeNotification();
      } else {
        this.status = result.error || 'Error al activar notificaciones';
      }
    },
    async sendTestNotification() {
      await notificationService.showLocalNotification(
        '🎉 Prueba de Notificación',
        'Esta es una notificación de prueba de Energy Club'
      );
    }
  }
};
</script>

<style scoped>
.notification-test {
  background: rgba(16, 18, 27, 0.75);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  margin: 20px;
  color: #e6f1ff;
}

h3 {
  color: #64ffda;
  margin-top: 0;
}

.status-container {
  margin: 15px 0;
}

.permission-btn, .test-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.permission-btn:disabled {
  background: linear-gradient(135deg, #64ffda, #4fd1c5);
  cursor: not-allowed;
}

.test-btn {
  background: linear-gradient(135deg, #64ffda, #4fd1c5);
}

.test-container {
  margin-top: 20px;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}
</style>
