<template>
  <transition name="toast-fade">
    <div v-if="showToast" class="install-toast">
      <div class="toast-content">
        <div class="toast-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="24"
            height="24"
          >
            <path
              d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"
            />
          </svg>
        </div>
        <div class="toast-text">
          <h4>¡Añade la app a tu pantalla de inicio!</h4>
          <p>Accede fácilmente desde tu móvil</p>
        </div>
        <div class="toast-actions">
          <button @click="onInstall" class="toast-btn toast-btn-primary">
            Añadir
          </button>
          <button @click="onDismiss" class="toast-btn toast-btn-secondary">
            Ahora no
          </button>
        </div>
        <button @click="onClose" class="toast-close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="20"
            height="20"
          >
            <path
              d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "InstallToast",
  props: {
    installPromptEvent: {
      type: Object,
      default: null,
    },
    isPwaInstalled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showToast: false,
      toastDismissed: false,
    };
  },
  watch: {
    installPromptEvent: {
      handler() {
        this.checkToastVisibility();
      },
      immediate: true,
    },
    isPwaInstalled: {
      handler() {
        this.checkToastVisibility();
      },
      immediate: true,
    },
  },
  methods: {
    checkToastVisibility() {
      const lastDismissed = localStorage.getItem("installToastDismissed");
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (lastDismissed && now - parseInt(lastDismissed) < oneDayMs) {
        this.showToast = false;
        return;
      }

      this.showToast =
        this.installPromptEvent && !this.isPwaInstalled && !this.toastDismissed;
    },
    onInstall() {
      this.$emit("install");
      this.showToast = false;
    },
    onDismiss() {
      localStorage.setItem("installToastDismissed", Date.now().toString());
      this.toastDismissed = true;
      this.showToast = false;
      this.$emit("dismiss");
    },
    onClose() {
      this.showToast = false;
      this.$emit("close");
    },
    autoShow() {
      setTimeout(() => {
        this.checkToastVisibility();
      }, 3000);
    },
  },
  mounted() {
    this.autoShow();
  },
};
</script>

<style scoped lang="scss">
.install-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: 400px;
  width: calc(100% - 40px);

  @media (max-width: 480px) {
    bottom: 10px;
    width: calc(100% - 20px);
  }
}

.toast-content {
  background: linear-gradient(145deg, #1f2937, #111827);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #f0f0f0;
}

.toast-icon {
  color: #8b5cf6;
  flex-shrink: 0;

  svg {
    display: block;
  }
}

.toast-text {
  flex: 1;

  h4 {
    margin: 0 0 4px 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: #f9fafb;
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    color: #d1d5db;
    opacity: 0.9;
  }
}

.toast-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.toast-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &-primary {
    background: linear-gradient(145deg, #8b5cf6, #7c3aed);
    color: white;

    &:hover {
      background: linear-gradient(145deg, #7c3aed, #6d28d9);
      transform: translateY(-1px);
    }
  }

  &-secondary {
    background: rgba(255, 255, 255, 0.1);
    color: #d1d5db;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  &:active {
    transform: scale(0.95);
  }
}

.toast-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #f3f4f6;
    background: rgba(255, 255, 255, 0.1);
  }
}

// Animaciones
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100px) scale(0.8);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(100px) scale(0.8);
}

.toast-fade-enter-to,
.toast-fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

// Efectos adicionales para pantallas pequeñas
@media (max-width: 480px) {
  .toast-content {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .toast-text {
    h4 {
      font-size: 0.9rem;
    }

    p {
      font-size: 0.75rem;
    }
  }

  .toast-actions {
    width: 100%;
    justify-content: center;
  }

  .toast-btn {
    flex: 1;
    max-width: 120px;
  }
}
</style>
