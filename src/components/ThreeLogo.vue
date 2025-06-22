<template>
  <div ref="container" class="three-logo-container"></div>
</template>

<script>
import { markRaw } from "vue";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: "ThreeDLogo",
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      logoGroup: null,
      animationFrameId: null,
      baseCameraZ: 200,
      svgMarkup: `
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
          width="300.000000pt" height="136.000000pt" viewBox="0 0 300.000000 136.000000"
          preserveAspectRatio="xMidYMid meet">
        <g transform="translate(0.000000,136.000000) scale(0.100000,-0.100000)"
          fill="#000000" stroke="none">
        <path d="M723 1156 c-60 -27 -90 -131 -74 -252 6 -39 13 -78 16 -86 5 -12 -9 -19 -62 -32 -95 -24 -188 -71 -217 -109 -20 -26 -24 -44 -24 -94 0 -74 15 -93 74 -92 21 1 73 -11 115 -26 l76 -27 -14 -51 c-17 -67 -17 -209 1 -250 51 -120 181 -106 330 36 33 31 61 57 62 57 1 0 0 -8 -3 -19 -5 -21 31 -53 53 -44 7 2 28 -7 46 -20 44 -34 125 -73 166 -81 85 -15 141 53 142 172 0 52 -3 62 -17 62 -15 0 -18 -10 -19 -58 -1 -100 -29 -142 -94 -142 -59 0 -190 76 -190 110 0 23 -20 40 -49 40 l-24 0 23 25 c22 24 22 25 4 25 -11 0 -25 -5 -31 -11 -8 -8 -13 -8 -17 0 -4 6 -19 11 -34 11 l-26 0 22 -16 c12 -8 22 -21 22 -29 0 -19 -126 -124 -175 -146 -79 -36 -140 -19 -165 47 -14 35 -12 148 2 218 l11 58 39 -6 c21 -3 56 -9 78 -12 32 -5 40 -3 40 8 0 11 -16 17 -52 22 -105 14 -100 7 -66 93 16 42 31 80 34 85 3 5 19 -18 34 -50 15 -33 33 -63 39 -66 21 -13 11 33 -20 97 l-32 64 39 65 39 66 80 4 c44 2 126 2 183 0 100 -4 103 -5 119 -33 21 -36 78 -42 88 -10 6 19 7 19 73 0 37 -10 83 -19 102 -19 l35 1 -35 15 c-19 8 -63 22 -98 31 -57 14 -63 18 -58 37 38 135 28 256 -25 301 -53 44 -156 24 -252 -50 l-34 -25 -23 26 c-31 32 -134 82 -185 89 -24 3 -53 0 -72 -9z m155 -50 c26 -14 61 -35 79 -49 l32 -24 -32 -31 c-20 -20 -43 -32 -60 -32 -31 0 -58 -34 -55 -71 1 -13 -6 -36 -15 -50 -14 -21 -28 -28 -69 -32 -29 -4 -54 -5 -56 -3 -10 11 -22 88 -22 149 0 71 19 133 47 155 27 20 99 14 151 -12z m387 -8 c36 -32 47 -90 35 -180 -14 -100 -18 -108 -45 -108 -28 0 -49 18 -112 100 -28 36 -63 76 -77 89 -14 14 -26 28 -26 33 0 12 73 58 117 74 54 19 78 17 108 -8z m-214 -125 c39 -42 119 -139 119 -144 0 -2 -72 -4 -160 -4 -88 0 -160 2 -160 5 1 16 19 26 49 26 45 -1 79 40 61 74 -10 19 -8 26 16 51 15 16 30 29 34 29 3 0 22 -17 41 -37z m-271 -187 c0 -2 -11 -23 -24 -46 l-24 -42 -12 37 c-10 31 -10 39 1 46 14 9 59 13 59 5z m490 -10 c0 -24 -18 -28 -30 -6 -9 17 -8 20 10 20 11 0 20 -6 20 -14z m-586 -181 c-18 -39 -36 -83 -39 -98 -9 -32 -17 -32 -117 5 -52 18 -58 23 -58 49 0 30 -23 49 -60 49 -17 0 -20 4 -15 23 17 55 89 100 220 137 l60 17 20 -56 21 -56 -32 -70z"/>
        <path d="M820 680 l0 -45 122 3 123 3 0 39 0 39 -123 3 -122 3 0 -45z"/>
        <path d="M1709 725 c0 0 -1 -19 -2 -42 l-2 -42 80 -3 c78 -3 80 -4 80 -28 0 -24 -2 -25 -80 -28 l-80 -3 1 -42 1 -42 67 3 c87 5 96 -3 96 -84 l0 -64 50 0 50 0 0 64 c0 53 -4 69 -24 93 l-24 28 24 28 c28 32 29 45 11 90 -23 53 -41 62 -149 67 -54 3 -98 5 -99 5z m201 -74 c5 -11 10 -28 9 -38 0 -14 -2 -15 -6 -3 -3 8 -15 25 -26 38 -17 19 -18 22 -4 22 9 0 21 -9 27 -19z"/>
        <path d="M2210 721 c-97 -7 -133 -26 -172 -89 -34 -55 -32 -144 4 -199 34 -51 97 -83 164 -83 89 0 94 4 94 71 l0 59 -32 -20 c-48 -29 -94 -26 -129 9 -41 42 -41 98 2 140 28 28 36 31 95 31 l64 0 0 45 c0 25 -1 44 -2 43 -2 0 -41 -4 -88 -7z m-124 -113 c-25 -35 -21 -108 9 -148 14 -19 31 -37 37 -42 7 -4 9 -8 3 -8 -36 1 -75 65 -75 123 0 45 25 115 37 104 3 -3 -2 -16 -11 -29z"/>
        <path d="M2340 648 c0 -72 2 -80 30 -112 54 -61 146 -72 212 -25 43 31 58 69 58 146 l0 68 -50 -3 -50 -4 0 -57 c0 -64 -11 -81 -51 -81 -43 0 -59 24 -59 88 l0 57 -45 0 -45 0 0 -77z m91 -84 c18 -19 27 -34 20 -34 -7 0 -26 13 -42 29 -23 23 -29 38 -28 68 l1 38 8 -33 c4 -19 23 -49 41 -68z m159 36 c0 -21 -33 -60 -51 -60 -6 0 1 14 15 31 14 17 26 35 26 40 0 5 2 9 5 9 3 0 5 -9 5 -20z"/>
        <path d="M1090 535 l0 -185 55 0 55 0 0 141 0 140 43 -3 42 -3 3 -137 3 -138 49 0 50 0 0 156 0 156 -29 29 c-29 29 -30 29 -150 29 l-121 0 0 -185z m91 116 c-18 -25 -21 -44 -21 -124 0 -99 -6 -131 -21 -121 -10 6 -12 257 -2 267 3 4 19 7 35 7 l29 0 -20 -29z m149 9 c18 -18 20 -33 20 -135 0 -70 -4 -115 -10 -115 -6 0 -10 41 -10 103 0 95 -2 104 -25 129 -14 15 -25 30 -25 33 0 13 32 3 50 -15z"/>
        <path d="M1430 680 l0 -40 120 0 120 0 0 40 0 40 -120 0 -120 0 0 -40z"/>
        <path d="M820 465 l0 -115 123 0 122 0 0 45 0 45 -77 0 -78 0 0 31 0 31 76 -3 77 -4 1 43 1 42 -122 0 -123 0 0 -115z m80 68 c0 -5 -9 -19 -20 -33 l-20 -25 0 26 c0 14 3 29 7 32 9 9 33 9 33 0z m10 -135 c0 -5 -10 -8 -22 -6 -17 2 -24 11 -26 33 l-4 30 26 -24 c14 -14 26 -29 26 -33z"/>
        <path d="M1430 465 l0 -115 120 0 120 0 0 45 0 45 -78 0 -79 0 5 31 5 32 73 -7 74 -6 0 45 0 45 -120 0 -120 0 0 -115z m72 -42 c24 -22 23 -35 -4 -31 -15 2 -24 11 -26 26 -4 26 5 28 30 5z"/>
        <path d="M2190 536 l0 -44 55 2 55 1 0 43 0 42 -55 0 -55 0 0 -44z"/>
        <path d="M2395 395 l0 -45 90 0 90 0 0 45 0 45 -90 0 -90 0 0 -45z"/>
        </g>
        </svg>
      `,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
      if (this.scene && this.renderer && this.$refs.container.clientWidth > 0) {
        this.createLogoFromSVG();
        this.animate();
      }
    });
    window.addEventListener("resize", this.onWindowResize);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.onWindowResize);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.disposeThreeObjects();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(
          this.renderer.domElement
        );
      }
    }
  },
  methods: {
    init() {
      const container = this.$refs.container;
      if (
        !container ||
        container.clientWidth === 0 ||
        container.clientHeight === 0
      )
        return;
      const scene = new THREE.Scene();
      this.scene = markRaw(scene);
      const aspect = container.clientWidth / container.clientHeight;
      const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 5000);
      this.camera = markRaw(camera);
      try {
        const renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        this.renderer = markRaw(renderer);
      } catch (e) {
        console.error("Error WebGLRenderer:", e);
        return;
      }
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
      this.scene.add(ambientLight);
      const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight1.position.set(20, 30, 20);
      this.scene.add(directionalLight1);
    },

    createLogoFromSVG() {
      if (
        !this.scene ||
        !this.$refs.container ||
        this.$refs.container.clientWidth === 0
      )
        return;
      const loader = new SVGLoader();
      const data = loader.parse(this.svgMarkup);
      const group = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({
        color: 0xececec,
        metalness: 0.05,
        roughness: 0.8,
        side: THREE.DoubleSide,
      });
      const extrudeSettings = {
        steps: 1,
        depth: 25,
        bevelEnabled: true,
        bevelThickness: 0.7,
        bevelSize: 0.7,
        bevelOffset: 0,
        bevelSegments: 2,
      };
      data.paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path);
        shapes.forEach((shape) => {
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        });
      });
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      group.position.sub(center);
      group.rotation.x = Math.PI;
      group.scale.set(10, 10, 10);
      this.logoGroup = markRaw(group);
      this.scene.add(this.logoGroup);
      const finalBox = new THREE.Box3().setFromObject(this.logoGroup);
      const finalSize = finalBox.getSize(new THREE.Vector3());
      const finalCenter = finalBox.getCenter(new THREE.Vector3());
      if (this.camera) {
        const maxDim = Math.max(finalSize.x, finalSize.y);
        const fovInRadians = this.camera.fov * (Math.PI / 180);
        this.baseCameraZ = (maxDim / (2 * Math.tan(fovInRadians / 2))) * 1.3; // Un poco más cerca que antes
        this.baseCameraZ = Math.max(this.baseCameraZ, finalSize.z * 1.5); // Asegurar espacio para el grosor
        if (isNaN(this.baseCameraZ) || !isFinite(this.baseCameraZ))
          this.baseCameraZ = 200;
        this.camera.position.set(
          finalCenter.x,
          finalCenter.y,
          this.baseCameraZ
        );
        this.camera.lookAt(finalCenter);
      }
    },

    animate() {
      this.animationFrameId = requestAnimationFrame(this.animate);
      const time = Date.now() * 0.00115;

      if (this.logoGroup && this.camera && this.baseCameraZ > 0) {
        this.logoGroup.rotation.y += 0.006;
        this.logoGroup.rotation.x =
          Math.PI + Math.sin(time * 1.5) * (Math.PI / 32);

        const zoomFactor = 0.1;
        const normalizedZoomOscillation = (1 + Math.cos(time)) / 2;
        this.camera.position.z =
          this.baseCameraZ -
          normalizedZoomOscillation * this.baseCameraZ * zoomFactor;
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    },

    onWindowResize() {
      const container = this.$refs.container;
      if (
        !container ||
        container.clientWidth === 0 ||
        container.clientHeight === 0
      )
        return;
      if (this.camera) {
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
      }
      if (this.renderer) {
        this.renderer.setSize(container.clientWidth, container.clientHeight);
      }
    },

    disposeThreeObjects() {
      if (this.logoGroup) {
        this.logoGroup.traverse((object) => {
          if (object.isMesh) {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((m) => m.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
        if (this.scene && this.logoGroup.parent === this.scene) {
          this.scene.remove(this.logoGroup);
        }
      }
      this.logoGroup = null;
    },
  },
};
</script>

<style scoped>
.three-logo-container {
  width: 100%;
  height: 100%;
  display: block;
  overflow: hidden;
}
.three-logo-container > canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
