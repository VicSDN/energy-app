import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
  authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VUE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VUE_APP_FIREBASE_APP_ID,
  measurementId: process.env.VUE_APP_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export class NotificationService {
  constructor() {
    this.vapidKey = 'BDMr-1XzQOqI7-KJMR4j4JnmrCOz7iJzYZ_VgWtXbzMRCKVvO_RHhNGW4oYKb6IqA-1KxEtJZPNYJjqZ-zB9hPw'; // Tu VAPID key aquí
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        return await this.getToken();
      } else {
        console.log('Unable to get permission to notify.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      return null;
    }
  }

  async getToken() {
    try {
      const currentToken = await getToken(messaging, { vapidKey: this.vapidKey });
      if (currentToken) {
        console.log('Registration token:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('An error occurred while retrieving token. ', error);
      return null;
    }
  }

  setupMessageListener() {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      
      // Mostrar notificación personalizada
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/img/icons/icon-192x192.png',
          badge: '/img/icons/icon-96x96.png',
          vibrate: [200, 100, 200],
          data: payload.data
        });
      }
    });
  }

  // Solicitar permisos de ubicación
  async requestLocationPermission() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  // Verificar si la app puede ser instalada
  isInstallable() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Manejar evento de instalación
  handleInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Mostrar botón de instalación personalizado
      this.showInstallButton(deferredPrompt);
    });
  }

  showInstallButton(deferredPrompt) {
    // Crear botón de instalación dinámicamente
    const installButton = document.createElement('button');
    installButton.textContent = 'Instalar App';
    installButton.className = 'install-button';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #8b5cf6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 25px;
      font-weight: bold;
      cursor: pointer;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    `;

    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        installButton.remove();
      }
    });

    document.body.appendChild(installButton);

    // Remover el botón después de 10 segundos si no se usa
    setTimeout(() => {
      if (installButton && installButton.parentNode) {
        installButton.remove();
      }
    }, 10000);
  }
}

export const notificationService = new NotificationService();
