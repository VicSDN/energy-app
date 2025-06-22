<template>
  <div class="distance-counter">
    <h2>¿Qué tan cerca estás?</h2>

    <div
      class="map-container"
      v-if="discoCoords.latitude && discoCoords.longitude"
    >
      <iframe
        :src="googleMapsEmbedUrl"
        width="100%"
        height="300"
        style="border: 0"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>

    <div v-if="loading && !distance" class="status-message">
      Calculando tu ubicación... <span class="loader"></span>
    </div>
    <div v-if="error" class="status-message error-message">{{ error }}</div>

    <div v-if="distance !== null && !error" class="distance-display">
      <p class="distance-info">
        Estás a <span class="distance-value">{{ formattedDistance }}</span>
        <span class="distance-unit">{{ distanceUnit }}</span> de Energy Club
      </p>
    </div>

    <div
      v-if="!loading && distance === null && !error && !initialMessageHidden"
      class="status-message"
    >
      Permite el acceso a tu ubicación para calcular la distancia.
    </div>

    <div class="actions-container">
      <button
        @click="getLocationAndHideInitialMessage"
        class="action-button"
        :disabled="loading"
        title="Actualizar tu ubicación y calcular distancia"
      >
        <span v-if="loading && !distance">Calculando...</span>
        <span v-else>📍 Calcular Distancia</span>
      </button>
      <a
        :href="directionsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="action-button directions-button"
        title="Obtener ruta en Google Maps"
        v-if="discoCoords.latitude && discoCoords.longitude"
      >
        🗺️ Cómo llegar
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: "DistanceCounter",
  data() {
    return {
      discoCoords: {
        latitude: 43.176861,
        longitude: -6.549333,
      },
      discoAddressForMapQuery:
        "Energy Disco, C. Suárez Cantón, 33800 Cangas del Narcea, Asturias", // !!! REEMPLAZA ESTO !!!
      userCoords: null,
      distance: null,
      loading: false,
      error: null,
      initialMessageHidden: false,
    };
  },
  computed: {
    formattedDistance() {
      if (this.distance === null) return "";
      if (this.distance < 1000) {
        return this.distance.toFixed(0);
      }
      return (this.distance / 1000).toFixed(1);
    },
    distanceUnit() {
      if (this.distance === null) return "";
      return this.distance < 1000 ? "metros" : "kilómetros";
    },
    googleMapsEmbedUrl() {
      const lat = this.discoCoords.latitude;
      const lng = this.discoCoords.longitude;
      const query = this.discoAddressForMapQuery
        ? encodeURIComponent(this.discoAddressForMapQuery)
        : `${lat},${lng}`;
      return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    },
    directionsUrl() {
      // Construye la URL para obtener direcciones en Google Maps
      const destination = this.discoAddressForMapQuery
        ? encodeURIComponent(this.discoAddressForMapQuery)
        : `${this.discoCoords.latitude},${this.discoCoords.longitude}`;

      let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

      if (this.userCoords) {
        url += `&origin=${this.userCoords.latitude},${this.userCoords.longitude}`;
      }

      url += `&travelmode=driving`;
      return url;
    },
  },

  methods: {
    getLocationAndHideInitialMessage() {
      this.initialMessageHidden = true;
      this.getLocation();
    },
    getLocation() {
      this.loading = true;
      this.error = null;
      this.distance = null;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          this.handleSuccess,
          this.handleError,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        this.error = "La geolocalización no es soportada por tu navegador.";
        this.loading = false;
      }
    },
    handleSuccess(position) {
      this.userCoords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      this.calculateDistance();
      this.loading = false;
    },
    handleError(geoError) {
      switch (geoError.code) {
        case geoError.PERMISSION_DENIED:
          this.error = "Permiso de ubicación denegado.";
          break;
        case geoError.POSITION_UNAVAILABLE:
          this.error = "Información de ubicación no disponible.";
          break;
        case geoError.TIMEOUT:
          this.error = "Se agotó el tiempo para obtener la ubicación.";
          break;
        default:
          this.error = "Error al obtener la ubicación.";
          break;
      }
      this.loading = false;
    },
    calculateDistance() {
      if (
        !this.userCoords ||
        !this.discoCoords.latitude ||
        !this.discoCoords.longitude
      ) {
        this.error = "Faltan coordenadas para calcular la distancia.";
        return;
      }

      const R = 6371e3;
      const phi1 = (this.userCoords.latitude * Math.PI) / 180;
      const phi2 = (this.discoCoords.latitude * Math.PI) / 180;
      const deltaPhi =
        ((this.discoCoords.latitude - this.userCoords.latitude) * Math.PI) /
        180;
      const deltaLambda =
        ((this.discoCoords.longitude - this.userCoords.longitude) * Math.PI) /
        180;

      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) *
          Math.cos(phi2) *
          Math.sin(deltaLambda / 2) *
          Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      this.distance = R * c;
    },
  },
};
</script>

<style scoped>
.distance-counter {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 15px; /* Añadido padding general */
  box-sizing: border-box;
}

.distance-counter h2 {
  color: #88c0d0; /* Color principal para títulos */
  margin-bottom: 20px;
  font-size: 1.8em; /* Ajustado */
  font-weight: 700;
  position: relative;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;
}

.distance-counter h2::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%); /* Centrado correcto */
  width: 60%; /* Ancho ajustado */
  height: 3px;
  background: linear-gradient(90deg, transparent, #88c0d0, transparent);
  border-radius: 2px;
}

.map-container {
  width: 100%;
  max-width: 500px; /* Limita el ancho máximo del mapa */
  margin: 0 auto 25px auto; /* Centrado y margen inferior */
  border-radius: 12px;
  overflow: hidden; /* Para que el iframe respete el border-radius */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.map-container iframe {
  display: block; /* Elimina espacio extra debajo del iframe */
}

.status-message {
  font-size: 1.1em; /* Ajustado */
  color: #ccd6f6;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px; /* Ajustado */
  padding: 10px;
}

.error-message {
  color: #ff6b6b;
  font-weight: 500; /* Ajustado */
  background: rgba(255, 107, 107, 0.1);
  padding: 12px 18px; /* Ajustado */
  border-radius: 8px; /* Ajustado */
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.distance-display {
  margin-top: 15px; /* Ajustado */
  margin-bottom: 25px;
}

.distance-info {
  font-size: 1.2em;
  color: #a8b2d1; /* Un color suave para el texto general */
  margin: 0;
}

.distance-value {
  font-size: 2.5em; /* Reducido para mejor integración con el texto */
  font-weight: 700;
  color: #88c0d0; /* Color principal */
  margin: 0 5px;
  line-height: 1;
}

.distance-unit {
  font-size: 1em; /* Relativo al .distance-info */
  color: #8892b0;
  font-weight: 500;
}

.actions-container {
  margin-top: auto; /* Empuja los botones hacia abajo si hay espacio */
  padding-top: 15px; /* Espacio antes de los botones */
  display: flex;
  flex-direction: column; /* Botones en columna en móviles por defecto */
  align-items: center;
  gap: 15px; /* Espacio entre botones */
}

.action-button {
  background: rgba(100, 255, 218, 0.1);
  color: #88c0d0;
  border: 2px solid rgba(100, 255, 218, 0.3);
  padding: 12px 24px;
  border-radius: 8px; /* Reducido para un look más moderno */
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease-out;
  text-decoration: none; /* Para el <a> tag */
  display: inline-flex; /* Para alinear ícono y texto */
  align-items: center;
  justify-content: center;
  min-width: 200px; /* Ancho mínimo para los botones */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-button:hover:not(:disabled) {
  background: rgba(100, 255, 218, 0.2);
  border-color: #64ffda; /* Más brillante al hacer hover */
  color: #64ffda;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(100, 255, 218, 0.1);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.directions-button {
  background: rgba(136, 192, 208, 0.15); /* Tono azulado */
  border-color: rgba(136, 192, 208, 0.4);
}

.directions-button:hover:not(:disabled) {
  background: rgba(136, 192, 208, 0.25);
  border-color: #88c0d0;
  box-shadow: 0 6px 12px rgba(136, 192, 208, 0.1);
}

.loader {
  width: 22px; /* Ajustado */
  height: 22px; /* Ajustado */
  border: 3px solid rgba(100, 255, 218, 0.3);
  border-top-color: #64ffda;
  border-radius: 50%;
  display: inline-block;
  margin-left: 10px;
  animation: rotation 0.8s linear infinite; /* Más rápido */
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (min-width: 600px) {
  .actions-container {
    justify-content: start;
  }
  .distance-counter h2 {
    font-size: 2em;
  }
  .distance-info {
    font-size: 1.3em;
  }
}
</style>
