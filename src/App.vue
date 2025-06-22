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
  mounted() {
    // Verificar si ya completó el setup inicial
    const initialCheckComplete = localStorage.getItem('initialCheckComplete');
    if (initialCheckComplete === 'true') {
      this.showInitialCheck = false;
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
