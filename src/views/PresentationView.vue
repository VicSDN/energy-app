<template>
  <div class="presentation-page">
    <h2>¡Gracias por instalar la App Energy!</h2>
    <p>Prepárate para una experiencia única.</p>
    <button @click="goToHome" class="btn btn-primary">
      Continuar a la App
    </button>
  </div>
</template>

<script>
export default {
  name: "PresentationView",
  methods: {
    goToHome() {
      localStorage.setItem("energyAppPresentationSeen", "true");
      this.$router.push("/home");
    },
  },
};
</script>

<style scoped>
.presentation-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  text-align: center;
}
.btn {
  padding: 15px 35px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  background: linear-gradient(145deg, #8b5cf6, #7c3aed);
  color: white;
  margin-top: 30px;
}
</style>
