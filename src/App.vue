<template>
  <InitialCheck v-if="showInitialCheck" @check-complete="onCheckComplete" />
  <router-view
    v-if="
      !showInitialCheck && // Only show if passed initial check AND
      (!isMobile || // is desktop OR
        isPwaInstalled) // is installed on mobile
    "
  />
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
      isMobile: false,
      isPwaInstalled: false,
    };
  },
  methods: {
    onCheckComplete() {
      // Only allow continuing if:
      // 1. Is desktop, OR
      // 2. Is mobile AND is installed
      if (!this.isMobile || (this.isMobile && this.isPwaInstalled)) {
        this.showInitialCheck = false;
      }
    },
    checkDeviceAndInstallation() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      this.isMobile =
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );

      // Verify if it's installed as PWA
      this.isPwaInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone;

      // In desktop, allow access if already completed the check
      if (!this.isMobile) {
        const initialCheckComplete = localStorage.getItem(
          "initialCheckComplete"
        );
        if (initialCheckComplete === "true") {
          this.showInitialCheck = false;
        }
        return;
      }

      // In mobile, always show check initial if not installed
      if (!this.isPwaInstalled) {
        this.showInitialCheck = true;
        localStorage.removeItem("initialCheckComplete"); // Force verification
      }
    },
  },
  mounted() {
    this.checkDeviceAndInstallation();

    // Listen for changes in display mode
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", (e) => {
        this.isPwaInstalled = e.matches;
        if (!e.matches && this.isMobile) {
          // If uninstalled on mobile, force showing initial check
          this.showInitialCheck = true;
          localStorage.removeItem("initialCheckComplete");
        }
      });
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
