const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  // Disable source maps in production to reduce bundle size
  productionSourceMap: false,

  // Performance optimizations
  configureWebpack: (config) => {
    // Code splitting optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          firebase: {
            name: "firebase",
            test: /[/]node_modules[/](@firebase|firebase)[/]/,
            chunks: "all",
            priority: 20,
          },
          three: {
            name: "three",
            test: /[/]node_modules[/]three[/]/,
            chunks: "all",
            priority: 15,
          },
          vendor: {
            name: "chunk-vendors",
            test: /[/]node_modules[/]/,
            chunks: "all",
            priority: 10,
          },
        },
      },
    };

    // Performance hints for production
    if (process.env.NODE_ENV === "production") {
      config.performance = {
        // Increase limits for lazy-loaded chunks
        maxAssetSize: 800000, // 800kb - allows for Three.js lazy chunk
        maxEntrypointSize: 300000, // 300kb - for initial bundle
        hints: "warning",
        // Only warn about initial chunks, not lazy-loaded ones
        assetFilter: function (assetFilename) {
          // Don't warn about lazy-loaded chunks
          if (
            assetFilename.includes("three.") ||
            assetFilename.includes("firebase.")
          ) {
            return false;
          }
          return true;
        },
      };
    }
  },
  pwa: {
    name: "Energy Club",
    short_name: "EnergyClub",
    description:
      "La mejor discoteca de Cangas Del Narcea con eventos exclusivos y la mejor música",
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0d0d0d",
    theme_color: "#8b5cf6",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black-translucent",
    categories: ["entertainment", "music", "lifestyle"],
    lang: "es",
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
      scope: "/",
      start_url: "/",
      display: "standalone",
      orientation: "any",
      background_color: "#0d0d0d",
      theme_color: "#8b5cf6",
      lang: "es",
      categories: ["entertainment", "music", "lifestyle"],
      shortcuts: [
        {
          name: "Eventos",
          short_name: "Eventos",
          description: "Ver próximos eventos",
          url: "/home",
          icons: [{ src: "/img/icons/icon-96x96.png", sizes: "96x96" }],
        },
      ],
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
    host: "0.0.0.0", // Permite acceso desde otros dispositivos en la red
  },
});
