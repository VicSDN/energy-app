<template>
  <SetupWizard v-if="showSetup" @setup-complete="onSetupComplete" />
  <router-view v-if="!showSetup" />
</template>

<script>
import SetupWizard from "./components/SetupWizard.vue";

export default {
  name: "App",
  components: {
    SetupWizard,
  },
  data() {
    return {
      showSetup: true,
    };
  },
  methods: {
    onSetupComplete() {
      this.showSetup = false;
    },
  },
  async mounted() {
    // Import notification service
    const notificationService = await import(
      "./services/notificationService.js"
    ).then((m) => m.default);

    // Check if setup is already complete
    const setupComplete = localStorage.getItem("setup-complete");
    const notificationsSetup = notificationService.isSetupComplete();

    if (setupComplete === "true" && notificationsSetup) {
      this.showSetup = false;
    } else {
      // Clear any partial setups to ensure clean state
      localStorage.removeItem("setup-complete");
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
