<template>
  <div class="test-notification">
    <h3>Enviar Notificación de Prueba</h3>
    <div class="form-group">
      <label for="title">Título:</label>
      <input 
        type="text" 
        id="title" 
        v-model="notificationTitle" 
        placeholder="Título de la notificación" 
        class="form-input"
      >
    </div>
    <div class="form-group">
      <label for="message">Mensaje:</label>
      <textarea 
        id="message" 
        v-model="notificationMessage" 
        placeholder="Mensaje de la notificación" 
        class="form-input"
      ></textarea>
    </div>
    <div class="button-group">
      <button @click="sendTestNotification" class="test-btn" :disabled="sending">
        {{ sending ? 'Enviando...' : 'Enviar Notificación' }}
      </button>
      <div class="status-message" v-if="statusMessage">{{ statusMessage }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestNotification',
  data() {
    return {
      notificationTitle: 'Prueba de Notificación',
      notificationMessage: '¡Esta es una notificación de prueba!',
      sending: false,
      statusMessage: ''
    };
  },
  methods: {
    async sendTestNotification() {
      if (!this.notificationTitle || !this.notificationMessage) {
        this.statusMessage = 'Por favor, completa todos los campos';
        return;
      }

      this.sending = true;
      this.statusMessage = '';

      try {
        // Esta parte necesita que se implemente una función de backend
        // para enviar notificaciones, ya que no es seguro incluir la REST API Key
        // directamente en el frontend.
        //
        // En un entorno real, crearías una Cloud Function o un endpoint en tu backend
        if (window.OneSignal) {
          // Opción 1: Usar OneSignal para mostrar una notificación local
          await window.OneSignal.Notifications.requestPermission();
          
          // Puedes elegir entre enviar una notificación local o a través de la API REST
          // Descomentar la línea que prefieras usar:
          
          // await this.sendNotificationViaClientAPI(); // Notificación local
          await this.sendNotificationViaAPI(); // Notificación usando la API REST
        } else {
          throw new Error('OneSignal no está disponible');
        }
      } catch (error) {
        console.error('Error al enviar notificación:', error);
        this.statusMessage = `Error: ${error.message || 'No se pudo enviar la notificación'}`;
      } finally {
        this.sending = false;
      }
    },

    async sendNotificationViaClientAPI() {
      // Este método es una alternativa segura para testing que muestra
      // una notificación local sin necesidad de la REST API Key

      try {
        // Verificar si estamos suscritos
        const isPushSupported = await window.OneSignal.Notifications.isPushSupported();
        if (!isPushSupported) {
          throw new Error('Las notificaciones push no están soportadas en este navegador');
        }

        const permission = await window.OneSignal.Notifications.permission;
        if (!permission) {
          const result = await window.OneSignal.Notifications.requestPermission();
          if (!result) {
            throw new Error('Permiso de notificaciones denegado');
          }
        }

        // Para testing local, podemos usar la función slidedown
        window.OneSignal.Slidedown.promptPush({
          force: true,
          forceSlidedownOverNative: true
        });

        this.statusMessage = '¡Notificación mostrada correctamente!';
      } catch (error) {
        console.error('Error mostrando notificación:', error);
        throw error;
      }
    },

    async sendNotificationViaAPI() {
      const appId = '04bdf268-6549-4aff-85e0-4d5c973069d5';
      const restApiKey = 'o3uuaq5tpub6fjp3zqhjkrazw';
      
      const data = {
        app_id: appId,
        included_segments: ['Total Subscribed Users'],
        headings: {
          'en': this.notificationTitle,
          'es': this.notificationTitle
        },
        contents: {
          'en': this.notificationMessage,
          'es': this.notificationMessage
        }
      };

      try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${restApiKey}`
          },
          body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.errors) {
          throw new Error(result.errors[0]);
        }
        
        this.statusMessage = '¡Notificación enviada correctamente!';
        return result;
      } catch (error) {
        console.error('Error al enviar notificación:', error);
        throw error;
      }
    }
  }
};
</script>

<style scoped>
.test-notification {
  max-width: 500px;
  margin: 40px auto;
  padding: 25px;
  background: rgba(25, 25, 35, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
}

h3 {
  color: #64ffda;
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.4rem;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #e6f1ff;
}

.form-input {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: rgba(139, 92, 246, 0.5);
  outline: none;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.3);
}

textarea.form-input {
  min-height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.test-btn {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  min-width: 200px;
}

.test-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.test-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #9e9e9e, #757575);
}

.status-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.2);
  text-align: center;
}
</style>
