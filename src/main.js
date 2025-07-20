import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import notificationService from "./services/notificationService";
import "./registerServiceWorker";

const app = createApp(App);
app.use(router);
app.mount("#app");

// Configurar notificaciones si ya están permitidas
if (notificationService.isSetupComplete()) {
  notificationService.init().then(() => {
    notificationService.setupForegroundMessages();
    // eslint-disable-next-line no-console
    console.log("🔔 Servicio de notificaciones inicializado");
  });
}
