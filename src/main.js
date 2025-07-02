import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { notificationService } from "./services/notifications";
import "./registerServiceWorker";

const app = createApp(App);
app.use(router);
app.mount("#app");

// Inicializar servicios PWA después de montar la app
if (process.env.NODE_ENV === 'production') {
  // Manejar instalación de PWA
  notificationService.handleInstallPrompt();
  
  // Configurar listener de mensajes
  notificationService.setupMessageListener();
  
  // Solicitar permisos de notificación al cargar
  setTimeout(() => {
    notificationService.requestPermission();
  }, 2000); // Esperar 2 segundos para mejor UX
}
