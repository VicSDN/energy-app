// notificationHelper.js
// Utilidades para trabajar con OneSignal y notificaciones

/**
 * Solicita permisos de notificaciones al usuario
 * @returns {Promise<Object>} Resultado de la solicitud
 */
export const requestNotificationPermission = async () => {
  try {
    if (!window.OneSignal) {
      return { success: false, error: 'OneSignal no está disponible' };
    }
    
    // Esperar a que OneSignal esté inicializado
    await waitForOneSignalInitialization();
    
    // Solicitar permiso mediante el slidedown de OneSignal
    await window.OneSignal.showSlidedownPrompt();
    
    // Verificar si el usuario aceptó las notificaciones
    const permission = await window.OneSignal.Notifications.permission;
    
    return { 
      success: permission,
      permission: permission ? 'granted' : 'denied' 
    };
  } catch (error) {
    console.error('Error al solicitar permisos de notificación:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica si las notificaciones están habilitadas
 * @returns {Promise<boolean>} true si están habilitadas
 */
export const areNotificationsEnabled = async () => {
  try {
    if (!window.OneSignal) return false;
    
    await waitForOneSignalInitialization();
    return await window.OneSignal.Notifications.permission;
  } catch (error) {
    console.error('Error al verificar estado de notificaciones:', error);
    return false;
  }
};

/**
 * Añade una etiqueta (tag) al usuario actual
 * @param {string} key Nombre de la etiqueta
 * @param {string|number} value Valor de la etiqueta
 * @returns {Promise<Object>} Resultado de la operación
 */
export const addUserTag = async (key, value) => {
  try {
    if (!window.OneSignal) {
      return { success: false, error: 'OneSignal no está disponible' };
    }
    
    await waitForOneSignalInitialization();
    
    await window.OneSignal.User.addTag(key, value);
    return { success: true };
  } catch (error) {
    console.error('Error al añadir etiqueta:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Espera a que OneSignal esté inicializado
 * @param {number} timeout Tiempo máximo de espera en ms
 * @returns {Promise<void>}
 */
const waitForOneSignalInitialization = (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (window.OneSignal && window.OneSignal.initialized) {
      resolve();
      return;
    }
    
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      if (window.OneSignal && window.OneSignal.initialized) {
        clearInterval(checkInterval);
        resolve();
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Tiempo de espera agotado para inicialización de OneSignal'));
      }
    }, 200);
  });
};

export default {
  requestNotificationPermission,
  areNotificationsEnabled,
  addUserTag
};
