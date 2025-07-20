<template>
  <InitialCheck v-if="showInitialCheck" @check-complete="onCheckComplete" />
  <router-view v-if="!showInitialCheck" />
</template>

<script>
import InitialCheck from "./components/InitialCheck.vue";

export default {
  name: "App",
  components: {
    InitialCheck,
  },
  data() {
    return {
      showInitialCheck: true,
    };
  },
  methods: {
    onCheckComplete() {
      this.showInitialCheck = false;
    },
  },
  async mounted() {
    // Importar servicio de notificaciones
    const notificationService = await import(
      "./services/notificationService.js"
    ).then((m) => m.default);

    // Verificar si ya completó el setup inicial
    const initialCheckComplete = localStorage.getItem("initialCheckComplete");
    const notificationsSetup = notificationService.isSetupComplete();

    if (initialCheckComplete === "true" && notificationsSetup) {
      this.showInitialCheck = false;
    } else if (initialCheckComplete === "true" && !notificationsSetup) {
      // Si la app está configurada pero las notificaciones no, resetear
      localStorage.removeItem("initialCheckComplete");
    }
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #0d0d0d;
  color: #f0f0f0;
}
</style>
