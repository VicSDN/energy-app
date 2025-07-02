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
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    // Use default GenerateSW mode instead of InjectManifest
    workboxPluginMode: "GenerateSW",
    workboxOptions: {
      // Cache strategies
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts",
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "images",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
      ],
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
          src: "/img/icons/icon-72x72.png",
          sizes: "72x72",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/icon-96x96.png",
          sizes: "96x96",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/icon-128x128.png",
          sizes: "128x128",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/icon-152x152.png",
          sizes: "152x152",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/img/icons/icon-384x384.png",
          sizes: "384x384",
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
    https: true, // Habilitado para desarrollo PWA
    port: 8080,
    host: '0.0.0.0', // Permite acceso desde otros dispositivos en la red
  },
});
