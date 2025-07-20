import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import notificationService from "./services/notificationService";
import "./registerServiceWorker";

const app = createApp(App);
app.use(router);
app.mount("#app");

// Inicializar servicios PWA después de montar la app
// Configurar listener de mensajes si ya están las notificaciones activadas
if (Notification.permission === "granted") {
  notificationService.setupForegroundMessages();
}
