<template>
  <HeaderComponent />
  <div class="home-page" :style="homePageStyle">
    <div class="content-container">
      <DiscoPresentation class="content-card" />
      <SpotifyPlaylist class="content-card" />
      <DistanceCounter class="content-card" />
    </div>
    <p class="back-to-landing">
      <router-link to="/">Volver a la Landing</router-link>
    </p>
  </div>
</template>

<script>
import HeaderComponent from "../components/HeaderComponent.vue";
import DiscoPresentation from "../components/DiscoPresentation.vue";
import SpotifyPlaylist from "../components/SpotifyPlaylist.vue";
import DistanceCounter from "../components/DistanceCounter.vue";

export default {
  name: "HomeView",
  components: {
    HeaderComponent,
    DiscoPresentation,
    SpotifyPlaylist,
    DistanceCounter,
  },
  computed: {
    homePageStyle() {
      const baseUrl = process.env.BASE_URL;
      const imageName = "Fondo.webp";
      let imageUrl = `${baseUrl}${imageName}`;
      if (baseUrl && !baseUrl.endsWith("/")) {
        imageUrl = `${baseUrl}/${imageName}`;
      } else {
        imageUrl = `${baseUrl || "/"}${imageName}`; // Si BASE_URL es vacío, asume raíz
      }
      imageUrl = imageUrl.replace(/\/\//g, "/"); // Limpia dobles slashes

      return {
        backgroundImage: `url(${imageUrl})`,
        // Asegúrate que la imagen cubra todo pero no se repita
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed", // Opcional, para efecto parallax-like
      };
    },
  },
};
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  padding: 80px 20px 20px; /* Increased top padding to separate from header */
  text-align: center;
  position: relative;
  animation: fadeIn 1s ease-out;
  margin-top: 20px; /* Additional margin from the header */
}

.home-page::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.85) 0%,
    rgba(0, 0, 0, 0.7) 100%
  );
  backdrop-filter: blur(10px);
  z-index: -1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.content-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1400px;
  margin-bottom: 40px;
  perspective: 1200px;
}

.content-card {
  background: rgba(16, 18, 27, 0.75);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 32px;
  color: #e6f1ff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-style: preserve-3d;
  min-height: 400px;
  animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  position: relative;
  overflow: hidden;
}

/* Improved animated gradient border */
.content-card::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #64ffda, #6e56cf, #8b5cf6, #64ffda);
  background-size: 300% 300%;
  border-radius: 26px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.5s ease;
  animation: borderGradient 6s ease infinite;
  filter: blur(0.5px);
}

.content-card:hover::before {
  opacity: 0.8;
}

.content-card:hover {
  transform: translateY(-8px) rotateX(2deg);
  box-shadow: 0 22px 40px rgba(0, 0, 0, 0.25), 0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Glass reflection effect */
.content-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: -50%;
  width: 200%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  transform: rotate(30deg);
  transition: transform 0.7s ease;
  pointer-events: none;
}

.content-card:hover::after {
  transform: rotate(30deg) translateX(100px);
}

.back-to-landing {
  margin-top: 40px;
  perspective: 1000px;
  animation: fadeInUp 0.8s ease-out forwards;
  animation-delay: 0.8s;
  opacity: 0;
  animation-fill-mode: forwards;
}

.back-to-landing a {
  color: #64ffda;
  text-decoration: none;
  font-weight: 700;
  padding: 14px 28px;
  border: 2px solid rgba(100, 255, 218, 0.3);
  border-radius: 18px;
  background: rgba(100, 255, 218, 0.07);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: inline-block;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  font-size: 0.9em;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.back-to-landing a:hover {
  background: rgba(100, 255, 218, 0.15);
  border-color: rgba(100, 255, 218, 0.6);
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1);
  letter-spacing: 1px;
}

.back-to-landing a:active {
  transform: translateY(-1px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.1s;
}

/* Improved responsive styles */
@media (max-width: 768px) {
  .content-container {
    grid-template-columns: 1fr;
    padding: 15px;
    gap: 25px;
  }

  .content-card {
    padding: 25px;
    min-height: 350px;
  }

  .back-to-landing a {
    padding: 12px 24px;
    font-size: 0.85em;
  }
}

@media (max-width: 480px) {
  .home-page {
    padding: 15px 10px;
  }

  .content-container {
    gap: 20px;
  }

  .content-card {
    padding: 20px;
    min-height: 320px;
    border-radius: 20px;
  }

  .content-card::before {
    border-radius: 22px;
  }

  .back-to-landing {
    margin-top: 30px;
  }

  .back-to-landing a {
    padding: 10px 20px;
    font-size: 0.8em;
  }
}
/* Enhanced animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes borderGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(100, 255, 218, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(100, 255, 218, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(100, 255, 218, 0);
  }
}

/* Stagger the animation of cards */
.content-card:nth-child(1) {
  animation-delay: 0.1s;
}
.content-card:nth-child(2) {
  animation-delay: 0.3s;
}
.content-card:nth-child(3) {
  animation-delay: 0.5s;
}

/* Update spotify embed styling */
.spotify-embed-container {
  position: relative;
  background: linear-gradient(
    45deg,
    rgba(29, 185, 84, 0.12),
    rgba(30, 215, 96, 0.12)
  );
  overflow: visible;
  transition: all 0.4s ease;
}

.spotify-embed-container::before {
  content: "";
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #1db954, #1ed760, #1db954);
  background-size: 200% 200%;
  border-radius: 18px;
  z-index: -1;
  opacity: 0.35;
  transition: all 0.5s ease;
  animation: gradientFlow 4s ease infinite;
  filter: blur(0.5px);
}

.spotify-embed-container:hover::before {
  opacity: 0.6;
  filter: blur(0);
}

@keyframes gradientFlow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.back-to-landing a {
  position: relative;
  overflow: hidden;
}

.back-to-landing a::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(100, 255, 218, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.back-to-landing a:hover::before {
  width: 300px;
  height: 300px;
}

/* Add subtle animation to icons in DiscoPresentation */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
}

.icon {
  animation: float 3s ease-in-out infinite;
}

.icon:nth-child(1) {
  animation-delay: 0s;
}
.icon:nth-child(2) {
  animation-delay: 0.2s;
}
.icon:nth-child(3) {
  animation-delay: 0.4s;
}

/* Add smooth scrolling to the page */
html {
  scroll-behavior: smooth;
}

/* Improved custom scrollbar */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  background: rgba(100, 255, 218, 0.3);
  border-radius: 8px;
  border: 3px solid rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 255, 218, 0.5);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

a:focus,
button:focus {
  outline: 3px solid rgba(100, 255, 218, 0.6);
  outline-offset: 3px;
}

.content-card {
  color: #e6f1ff;
}
</style>
