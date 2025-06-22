<template>
  <div class="disco-presentation">
    <div class="hero-title-container">
      <span class="hero-title-script">La leyenda de</span>
      <div class="hero-title-main">ENERGY</div>
      <div class="hero-title-underline"></div>
    </div>

    <p>
      Nadie conoce la fórmula exacta para forjar un mito. Quizás sea una mezcla
      de momentos fortuitos, esfuerzo incansable y una visión que desafía el
      tiempo. Desde su nacimiento en <strong>2005</strong>, Energy no solo se ha
      erigido como el epicentro de la noche, sino, para muchos, en la
      <strong>auténtica meca de los cangueses</strong>.
    </p>
    <p>
      Más que un discoteca, somos un santuario para quienes buscan sentir la
      libertad en estado puro, la energía vibrante de una experiencia que
      redefine la noche. Aquí, cada rincón respira vanguardia, desde nuestra
      iluminación inmersiva hasta un sistema de sonido que no solo escuchas,
      sino que sientes en el alma.
    </p>
    <p>
      La banda sonora de esta travesía es una selecta y potente fusión de
      <strong>oro para tus oídos</strong>, orquestada por DJs residentes e
      invitados, artífices de noches que se graban en la memoria.
    </p>
    <div class="icon-container">
      <span class="icon">🎶</span>
      <span class="icon">💡</span>
      <span class="icon">🔊</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "DiscoPresentation",
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Kaushan+Script&family=Bebas+Neue&family=Roboto:wght@400;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Anton&display=swap");

.disco-presentation {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  align-items: center;
}

.hero-title-container {
  position: relative;
  text-align: center;
  margin-bottom: 35px;
  padding-top: 30px;
  width: 100%;
}

.hero-title-script {
  font-family: "Kaushan Script", cursive;
  font-size: 2.6em;
  color: #88c0d0;
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-60%) translateY(-5%);
  white-space: nowrap;
  z-index: 1;
  font-weight: normal;
}

.hero-title-main {
  font-family: "Anton", sans-serif;
  color: white;
  text-transform: uppercase;
  font-size: 4.2em;
  line-height: 0.9;
  letter-spacing: 0.12em;
  margin: 10px;
  padding: 10px;
  text-align: center;
}

.hero-title-underline {
  width: 90px;
  height: 3px;
  background-color: white;
  margin: 15px auto 0 auto;
  border-radius: 1px;
}

.disco-presentation p {
  line-height: 1.8;
  margin-bottom: 20px;
  color: #ccd6f6;
  font-size: 1.05em;
  opacity: 0.95;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
}

.disco-presentation strong {
  color: #88c0d0;
  font-weight: 700;
  position: relative;
  white-space: nowrap;
}

.disco-presentation strong::after {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: rgba(100, 255, 218, 0.3);
  transform: scaleX(0);
  transform-origin: bottom right;
  transition: transform 0.4s cubic-bezier(0.86, 0, 0.07, 1);
}

.disco-presentation strong:hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}

.icon-container {
  margin-top: auto;
  padding-top: 30px;
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 30px;
}

.icon {
  font-size: 2.6em;
  opacity: 0.8;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: inline-block;
  filter: drop-shadow(0 0 10px rgba(100, 255, 218, 0.3));
  transform-origin: center bottom;
  animation: float 5s ease-in-out infinite;
}

.icon:nth-child(1) {
  animation-delay: 0s;
}
.icon:nth-child(2) {
  animation-delay: 0.3s;
}
.icon:nth-child(3) {
  animation-delay: 0.6s;
}

.icon:hover {
  opacity: 1;
  transform: translateY(-8px) scale(1.1);
  filter: drop-shadow(0 0 15px rgba(100, 255, 218, 0.6));
  animation-play-state: paused;
}

@keyframes float {
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-12px) rotate(3deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
}

@media (max-width: 768px) {
  .hero-title-script {
    font-size: 2em;
    top: 5px;
    transform: translateX(-58%) translateY(-5%);
  }
  .hero-title-main {
    font-size: 4em;
  }
  .hero-title-secondary {
    font-size: 3.2em;
  }
  .hero-title-underline {
    width: 70px;
    margin-top: 12px;
  }
  .disco-presentation p {
    font-size: 1em;
  }
}

@media (max-width: 480px) {
  .hero-title-container {
    margin-bottom: 25px;
    padding-top: 20px;
  }
  .hero-title-script {
    font-size: 1.6em;
    top: 2px;
  }
  .hero-title-main {
    font-size: 3em;
  }

  .hero-title-underline {
    width: 60px;
    height: 2px;
    margin-top: 10px;
  }
  .disco-presentation p {
    font-size: 0.9em;
    line-height: 1.7;
  }
  .icon-container {
    padding-top: 20px;
    gap: 20px;
  }
  .icon {
    font-size: 2.2em;
  }
}
</style>
