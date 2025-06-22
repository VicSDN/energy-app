const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  pwa: {
    name: "Energy Disco",
    short_name: "Energy",
    description: "La mejor discoteca de Cangas Del Narcea con eventos exclusivos",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0d0d0d",
    theme_color: "#8b5cf6",
    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/sw.js",
      swDest: "service-worker.js",
    },
    manifestOptions: {
      icons: [
        {
          src: "/img/icons/app-icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
        {
          src: "/img/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
  },
  devServer: {
    https: true, // Necesario para muchas APIs en móviles
    port: 8080,
    host: '0.0.0.0', // Permite acceso desde otros dispositivos en la red
  },
});
