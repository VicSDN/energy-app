<template>
  <div class="spotify-playlist">
    <h2>Nuestra Playlist</h2>
    <p>¡Siente la vibra de Energy donde sea! Síguenos en Spotify:</p>
    <div class="spotify-embed-container">
      <iframe
        style="border-radius: 12px"
        src="https://open.spotify.com/embed/playlist/2bYojgQLi28sM5BUZSeveY?utm_source=generator"
        width="100%"
        height="415"
        frameBorder="0"
        allowfullscreen=""
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
    <a
      href="https://open.spotify.com/playlist/2bYojgQLi28sM5BUZSeveY?si=fgon7MHdTDaCLkmh6nVrcQ&pi=az6bAW7gRoWRg"
      target="_blank"
      rel="noopener noreferrer"
      class="spotify-button"
    >
      Abrir en Spotify
    </a>
  </div>
</template>

<script>
export default {
  name: "SpotifyPlaylist",
};
</script>

<style scoped>
.spotify-playlist {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.spotify-playlist h2 {
  color: #88c0d0;
  margin-bottom: 15px;
  font-size: 2em;
  font-weight: 700;
  position: relative;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;
}

.spotify-playlist h2::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 25%;
  width: 50%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #88c0d0, transparent);
  border-radius: 2px;
}

.spotify-playlist p {
  margin-bottom: 25px;
  color: #ccd6f6;
  font-size: 1.1em;
  opacity: 0.9;
}

.spotify-embed-container {
  width: 100%;
  margin: 0 auto 25px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.3);
  height: 415px;
}

.spotify-embed-container iframe {
  display: block;
  border-radius: 16px;
  transition: transform 0.3s ease;
}

.spotify-button {
  display: inline-block;
  background: linear-gradient(45deg, #1db954, #1ed760);
  color: white;
  padding: 14px 28px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1em;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(29, 185, 84, 0.3);
  margin-top: auto;
  margin-bottom: 45px;
}

.spotify-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(29, 185, 84, 0.4);
  background: linear-gradient(45deg, #1ed760, #1db954);
}

@media (max-width: 768px) {
  .spotify-playlist h2 {
    font-size: 1.8em;
  }

  .spotify-playlist p {
    font-size: 1em;
  }

  .spotify-button {
    padding: 12px 24px;
    font-size: 1em;
  }
}
</style>
