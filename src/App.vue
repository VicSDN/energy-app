<template>
  <InitialCheck v-if="showInitialCheck" @check-complete="onCheckComplete" />
  <router-view v-if="!showInitialCheck || !isMobile || isPwaInstalled" />
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
      this.showInitialCheck = false;
    },
    checkDeviceAndInstallation() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      this.isMobile =
        /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );

      this.isPwaInstalled =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone;

      if (!this.isMobile || this.isPwaInstalled) {
        const initialCheckComplete = localStorage.getItem(
          "initialCheckComplete"
        );
        if (initialCheckComplete === "true") {
          this.showInitialCheck = false;
        }
      }

      window
        .matchMedia("(display-mode: standalone)")
        .addEventListener("change", (e) => {
          this.isPwaInstalled = e.matches;
        });
    },
  },
  mounted() {
    this.checkDeviceAndInstallation();
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
