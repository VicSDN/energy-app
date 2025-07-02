import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { notificationService } from "./services/notifications";
import "./registerServiceWorker";

const app = createApp(App);
app.use(router);
app.mount("#app");

// Inicializar servicios PWA después de montar la app
// Manejar instalación de PWA
notificationService.handleInstallPrompt();

// Configurar listener de mensajes si ya están las notificaciones activadas
if (Notification.permission === 'granted') {
  notificationService.setupMessageListener();
}
