<template>
  <div class="social-buttons">
    <a
      href="https://www.instagram.com/energydisco/?hl=es"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
    >
      <img src="/img/icons/instagram.svg" alt="Instagram" class="social-icon" />
    </a>
    <a
      href="https://www.facebook.com/p/Energy-Cangas-100051459441656/?locale=es_ES"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
    >
      <img src="/img/icons/facebook.svg" alt="Facebook" class="social-icon" />
    </a>
  </div>
</template>

<script>
export default {
  name: "SocialButtons",
};
</script>

<style scoped>
.social-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.social-icon {
  display: block;
  height: 42px;
  width: 42px;
  opacity: 0.85;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  position: relative;
}

.social-icon:after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: rgba(100, 255, 218, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  z-index: -1;
  transition: all 0.4s ease;
}

.social-icon:hover {
  opacity: 1;
  transform: scale(1.15) rotate(5deg);
  filter: drop-shadow(0 4px 8px rgba(100, 255, 218, 0.3));
}

.social-icon:hover:after {
  transform: translate(-50%, -50%) scale(1.5);
  opacity: 0.4;
}

.social-icon:active {
  transform: scale(0.95);
  transition: all 0.1s;
}

@media (max-width: 768px) {
  .social-buttons {
    gap: 15px;
  }
  .social-icon {
    height: 36px;
    width: 36px;
  }
}
</style>
