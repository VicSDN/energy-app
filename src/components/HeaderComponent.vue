<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left-placeholder"></div>
      <div class="logo-container">
        <img src="/img/ModernIcon.svg" alt="Energy Logo" class="logo" />
      </div>
      <SocialButtons class="header-social-links" />
    </div>
  </header>
</template>

<script>
import SocialButtons from "./SocialButtons.vue";

export default {
  name: "HeaderComponent",
  components: {
    SocialButtons,
  },
};
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.75) 60%,
    rgba(0, 0, 0, 0) 100%
  );
  padding: 15px 0;
  box-sizing: border-box;
  transition: all 0.4s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  animation: fadeInDown 0.5s ease-out forwards;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 25px;
  box-sizing: border-box;
  position: relative;
}

.header-left-placeholder {
  flex: 1;
  min-width: 80px;
  visibility: hidden;
}

.header-social-links {
  flex: 1;
  min-width: 80px;
  display: flex;
  justify-content: flex-end;
}

.logo-container {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  z-index: 2;
}

.logo {
  display: block;
  height: 48px;
  width: auto;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
  animation: pulse 2s infinite;
}

.logo:hover {
  transform: scale(1.05);
  filter: drop-shadow(0 2px 10px rgba(100, 255, 218, 0.4));
}

@keyframes pulse {
  0% {
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
  }
  50% {
    filter: drop-shadow(0 2px 8px rgba(100, 255, 218, 0.2));
  }
  100% {
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.3));
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 10px 0;
  }
  .header-content {
    padding: 0 15px;
  }
  .logo {
    height: 38px;
  }
  .header-left-placeholder,
  .header-social-links {
    min-width: 60px;
  }
}

@media (max-width: 480px) {
  .logo {
    height: 32px;
  }
  .header-left-placeholder {
    min-width: 40px;
  }
  .header-social-links {
    min-width: 40px;
  }
  /* Keep the logo centered by maintaining the absolute positioning */
  .logo-container {
    left: 50%;
    transform: translateX(-50%);
  }
}
</style>
